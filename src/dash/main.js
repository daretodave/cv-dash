import {ColumnLayer, GeoJsonLayer, ScatterplotLayer, TextLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';

import {getConfig} from '../common';
import {HexagonLayer} from "@deck.gl/aggregation-layers";

const _counties = require("../../data/gen/us_records");
const {flattenDeep} = require("lodash/array");

const $create = (tag, id) => {
    const $element = document.createElement(tag);

    $element.setAttribute("id", id);

    document.body.appendChild($element);

    return $element;
};


const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = getConfig("MAPBOX_API_TOKEN");

const map = new mapboxgl.Map({
    container: $create("div", "map"),
    style: 'mapbox://styles/mapbox/dark-v9',
    zoom: 4,
    pitch: 20,
    center: [-90.961975, 36.368353]

});

map.on('load', () => {
    map.addLayer(new MapboxLayer({
        type: ScatterplotLayer,
        id: 'cv-scatter',
        data: _counties.features,
        getPosition: d => {
            const coords = flattenDeep(d.geometry.coordinates);

            return center(coords);
        },
        getColor: d => [255, 255, 255],
        getFillColor: d => [d.properties.result_confirmed_count, 0, 100],
        getRadius: d => 5000 + (10000 * Math.log(d.properties.result_confirmed_count)),
        opacity: 1
    }));

    map.addLayer(new MapboxLayer({
        type: TextLayer,
        id: 'cv-scatter-text',
        data: _counties.features,
        getText: d => `${d.properties.result_confirmed_count}`,
        getPosition: d => {
            const coords = flattenDeep(d.geometry.coordinates);

            return center(coords);
        },
        getSize: 32,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
    }));
    // map.addLayer(new MapboxLayer({
    //     type: HexagonLayer,
    //     id: 'cv-hex',
    //     data: _counties.features,
    //     getPosition: d => {
    //         const coords = flattenDeep(d.geometry.coordinates);
    //
    //         return center(coords);
    //     },
    //     colorRange: [
    //         [1, 152, 189],
    //         [73, 227, 206],
    //         [216, 254, 181],
    //         [254, 237, 177],
    //         [254, 173, 84],
    //         [209, 55, 78]
    //     ],
    //     // elevationRange: [0, 1000],
    //     // elevationScale: 250,
    //     extruded: true,
    //     radius: 25000,
    //     coverage: 1,
    //     upperPercentile: 100
    // }))

});

function center(points) {
    const pointList = [];

    points = flattenDeep(points);

    for (let index = 0; index < points.length; index += 2) {
        pointList.push(
            [points[index],
                points[index + 1]]
        )
    }

    var x = pointList.map(xy => xy[0]);
    var y = pointList.map(xy => xy[1]);
    var cx = (Math.min(...x) + Math.max(...x)) / 2;
    var cy = (Math.min(...y) + Math.max(...y)) / 2;
    return [cx, cy];
}