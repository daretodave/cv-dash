const path = require("path");
const root = `${require('app-root-path')}`;
const fetch = require("node-fetch");
const moment = require("moment");
const {get, flatten, flattenDeep} = require("lodash");
const csv = require('csvtojson');

const {getConfig} = require("../common");
const fs = require("fs-extra");

async function load(iso) {
    const regions = await fs.readJSON(
        path.join(root, 'data', 'geo', `${iso}_features.json`)
    );

    const regionsAll = {};

    const regionsStateMap = regions.features.reduce((map, region) => {
        const stateId = Number(region.properties["STATEFP"]);

        map[stateId] = map[stateId] || {};

        return map;
    }, {});

    return {
        iso,
        geoJSON: regions,
        regionsAll,
        regionsStateMap,
        regionsMap: regions.features.reduce((map, region) => {
            const geoId = region.properties["GEOID"];

            map[Number(geoId)] = {
                regionsAll: regionsAll,
                regionState: regionsStateMap[Number(region.properties["STATEFP"])],
                region
            };

            return map;
        }, {})
    };
}

const print = geo => async () => {
        const dirGen = path.join(root, 'data', 'gen');
        const dirIso = path.join(dirGen, geo.iso);
        const dirStates = path.join(dirGen, `${geo.iso}-state`);

        await Promise.all([
            fs.ensureDir(dirGen),
            fs.ensureDir(dirIso),
            fs.ensureDir(dirStates),
        ]);

        geo.geoJSON.features.forEach(feature => delete feature.properties['state']);


        const tasks = [
            await fs.writeJSON(
                path.join(dirGen, `${geo.iso}_records.json`),
                geo.geoJSON
            ),

            await fs.writeJSON(
                path.join(dirGen, `${geo.iso}_records_by_state.json`),
                {
                    "type": "FeatureCollection",
                    "features": Object.values(geo.regionsStateMap)
                        .filter(state => !!state.counties)
                        .map(stateEntry => {
                                const points = stateEntry.counties.map(county => county.geometry.coordinates);

                                const entryAll = stateEntry.counties[0].properties.all;
                                const entryLabels = stateEntry.counties[0].properties.labels;

                                return {
                                    "type": "Feature",
                                    "geometry": {
                                        "type": "MultiPolygon",
                                        "coordinates": points
                                    },
                                    "id": Number(stateEntry.STATEFP),
                                    "properties": {
                                        name: stateEntry.name,
                                        iso: geo.iso,
                                        all: entryAll,
                                        labels: entryLabels,
                                        ...Object.keys(stateEntry)
                                            .filter(key => entryLabels.includes(key.split("_")[0]))
                                            .reduce((resultMap, resultEntry) => {
                                                resultMap[resultEntry] = stateEntry[resultEntry];
                                                return resultMap;
                                            }, {})
                                    },
                                }
                            }
                        )
                }
            ),

            ...Object.values(geo.regionsStateMap)
                .filter(state => !!state.counties)
                .map(stateEntry => {
                    const featureList = {
                        "type": "FeatureCollection",
                        "features": stateEntry.counties
                    };

                    return fs.writeJSON(
                        path.join(dirStates, `${geo.iso}_${stateEntry["STATEFP"]}_records.json`),
                        featureList
                    )
                }),
            ...geo.geoJSON.features.map(feature => {
                const featureList = {
                    "type": "FeatureCollection", "features": [
                        feature
                    ]
                };

                return fs.writeJSON(
                    path.join(dirIso, `${geo.iso}_${feature.properties["GEOID"]}_records.json`),
                    featureList
                );
            })
        ];

        await Promise.all(tasks);
    }
;

const grab = (regionsMap, regionsAll) => async source => {
    const {
        url,
        path_region,
        path_location,
        path_count,
        path_label
    } = source;

    const records = await fetch(url).then(request => request.text());
    const data = await csv().fromString(`${records}`);

    [...data].forEach(record => {
        const _ = key => key.startsWith("#") ? key.slice(1) : get(record, key);

        const regionFeature = regionsMap[Number(record[path_region])];
        if (!regionFeature) {
            return;
        }

        const target = moment().subtract(
            path_count.offset,
            'day'
        );

        const label = _(path_label);
        const labelCounty = _(path_location.county);
        const labelProvince = _(path_location.province);

        const keyCount = `result_${label}_count`;
        const keyDate = `result_${label}_when`;

        regionFeature.region.properties.all = regionsAll;
        regionFeature.region.properties.state = regionFeature.state || regionFeature.regionState;

        const date = target.format("YYYY-MM-DD");
        const count = Number(record[target.format("M/D/YY")]);

        regionsAll[keyCount] = regionsAll[keyCount] || 0;
        regionsAll[keyCount] += count;

        regionsAll[keyCount + '_highest'] = regionsAll[keyCount + '_highest'] || 0;
        regionsAll[keyCount + '_highest'] = Math.max(regionsAll[keyCount + '_highest'], count);

        regionsAll[keyDate] = regionsAll[keyDate] || date;

        regionFeature.region.id = regionFeature.region.id || Number(regionFeature.region.properties["GEOID"]);
        regionFeature.region.id_state = regionFeature.region.id_state || Number(regionFeature.region.properties["STATEFP"]);
        regionFeature.region.id_county = regionFeature.region.id_state || Number(regionFeature.region.properties["COUNTYFP"]);

        regionFeature.region.properties.labels = regionFeature.region.properties.labels || [];
        regionFeature.region.properties.labels.push(label);

        regionFeature.region.properties[keyDate] = regionFeature.region.properties[keyDate] || date;
        regionFeature.region.properties[keyCount] = regionFeature.region.properties[keyCount] || 0;
        regionFeature.region.properties[keyCount] += count;

        regionFeature.regionState[keyDate] = regionFeature.regionState[keyDate] || date;
        regionFeature.regionState[keyCount] = regionFeature.regionState[keyCount] || 0;
        regionFeature.regionState[keyCount] += count;

        regionFeature.regionState['name'] = regionFeature.regionState['name'] || labelProvince;
        regionFeature.regionState['STATEFP'] = regionFeature.regionState['STATEFP'] || regionFeature.region.properties['STATEFP'];
        regionFeature.regionState['counties'] = regionFeature.regionState['counties'] || [];
        regionFeature.regionState['counties'].push(regionFeature.region);

        regionsAll[keyCount + '_state_highest'] = regionsAll[keyCount + '_state_highest'] || 0;
        regionsAll[keyCount + '_state_highest'] = Math.max(regionsAll[keyCount + '_state_highest'], regionFeature.regionState[keyCount]);
    });
};

load("us").then((geoJSON) => {
    const regionsLoader = grab(geoJSON.regionsMap, geoJSON.regionsAll);
    const regionsWriter = print(geoJSON);

    Promise
        .all([...getConfig("DATASETS")].map(regionsLoader))
        .then(regionsWriter)
        .catch(console.error);
});

