import {GeoJsonLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';

import {getConfig} from '../common';

const _regions = require("../../data/gen/us_records_by_state");

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
    style: 'mapbox://styles/daretodave/ck8nwrz8o2n3s1jmuscar6vlg',
});

map.on('load', () => {
    var zoomThreshold = 4;

    map.addSource('us_regions', {
        'type': 'geojson',
        'data': _regions,
    });


// Last value is the default, used where there is no data
// Add layer from the vector tile source with data-driven style
    map.addLayer({
        'id': 'regions-fill',
        'type': 'fill',
        'source': 'us_regions',
        'paint': {
            'fill-color': 'rgb(103,104,105)',
            'fill-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                1,
                0.5
            ]
        }
    });

    let hoveredStateId = null;

    map.on('mousemove', 'regions-fill', function (e) {
        if (e.features.length > 0) {
            if (hoveredStateId) {
                map.setFeatureState(
                    {source: 'us_regions', id: hoveredStateId},
                    {hover: false}
                );
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState(
                {source: 'us_regions', id: hoveredStateId},
                {hover: true}
            );
        }
    });

// When the mouse leaves the state-fill layer, update the feature state of the
// previously hovered feature.
    map.on('mouseleave', 'regions-fill', function () {
        if (hoveredStateId) {
            map.setFeatureState(
                {source: 'us_regions', id: hoveredStateId},
                {hover: false}
            );
        }
        hoveredStateId = null;
    });

    // map.addLayer(
    //     {
    //         'id': 'labels',
    //         'type': 'symbol',
    //         'source': 'us_regions',
    //         'layout': {
    //             'text-field': ['get', 'NAME'],
    //             'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    //             'text-radial-offset': 1,
    //             'text-justify': 'auto',
    //         }
    //     });


    // map.addLayer(new MapboxLayer({
    //     type: GeoJsonLayer,
    //     id: 'us_records',
    //     data: _regions,
    //     opacity: 0.5,
    //     stroked: true,
    //     filled: true,
    //     extruded: true,
    //     wireframe: true,
    //     fp64: true,
    //     getLineColor: f => {
    //         const stateIdx = Number(f.properties["STATEFP"] || 1) / 60;
    //
    //         return [stateIdx * 255, 255, 255]
    //     },
    //     getElevation: f => {
    //         if (!f.properties.result) {
    //             return 0;
    //         }
    //
    //         return Math.sqrt(f.properties.result.confirmed_latest_count) * 50;
    //     },
    // }))
});