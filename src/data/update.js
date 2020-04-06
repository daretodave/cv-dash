const path = require("path");
const root = require('app-root-path');
const fetch = require("node-fetch");
const moment = require("moment");
const {get, flatten, flattenDeep} = require("lodash");
const csv = require('csvtojson');
const fs = require("fs");

const {getConfig} = require("../common");

const target = path.join(`${root}`, "data", "COVID_19_DS.json");

async function print(resultList) {
    const data = flattenDeep(resultList).reduce((out, entry) => {
        if (!out[entry.label]) {
            out[entry.label] = {
                records: {},
            };
        }
        if (!out[entry.label].records[entry.date]) {
            out[entry.label].records[entry.date] = [];
        }

        out[entry.label].records[entry.date].push(entry);

        if (!out[entry.label].recent
            || moment(out[entry.label].recent, "YYYY-MM-DD").isBefore(moment(entry.date, "YYYY-MM-DD"))) {
            out[entry.label].recent = entry.date;
        }

        return out;
    }, {
    });

    const labels = Object.keys(data);

    labels.forEach(label => {
        const records = data[label].records[data[label].recent];

        data[label].latest = {
            count: records.reduce((count, record) => count + Number(record.count), 0),
            records
        };
    });

    const result = {
        labels,
        data
    };

    fs.writeFileSync(target, JSON.stringify(result, null, 2), "utf8");

}

async function grab(source) {
    const {
        url,
        path_region,
        path_location,
        path_description,
        path_count,
        path_label
    } = source;

    const records = await fetch(url).then(request => request.text());
    const data = await csv().fromString(records);

    const result = [...data].map(record => {
        const _ = (path, target) => {
            if (path.startsWith("#")) {
                return path.slice(1);
            }

            if (path.startsWith("@")) {
                path = (target || moment()).format(
                    path.slice(1)
                );
            }

            let result = get(record, path);
            if (!result) {
                return result;
            }
            result = `${result}`;

            return result;
        };

        const expander = path_count;
        const result = {
            date: moment().format("YYYY-MM-DD"),
            label: _(path_label),
            description: _(path_description),
            region: _(path_region),
            location: {
                latitude: Number(_(path_location.latitude)),
                longitude: Number(_(path_location.longitude)),
                region: _(path_location.region),
                province: _(path_location.province),
                county: _(path_location.county)
            }
        };
        if (typeof expander !== "object") {
            return {
                count: Number(_(expander)),
                ...result
            };
        }


        const {
            start,
            offset,
            current
        } = expander;

        const dateStarts = moment(start, "YYYY-MM-DD");
        const dateLatest = moment().subtract('day', offset || 0);

        const resultList = [];

        while (dateStarts.add(1, 'days').diff(dateLatest) < 0) {
            const format = current.slice(1);
            const key = dateStarts.format(format);

            resultList.push({
                ...result,
                date: dateStarts.format("YYYY-MM-DD"),
                count: Number(_(key)),
            })
        }

        return resultList;

    });

    return flatten(result);
}

Promise
    .all([...getConfig("DATASETS")].map(grab))
    .then(print)
    .catch(console.error);
