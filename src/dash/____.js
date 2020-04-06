import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {MapboxLayer} from '@deck.gl/mapbox';
import {Deck} from '@deck.gl/core';

import {getConfig} from '../common';

// const sourceData = require("../../data/COVID_19_DS");
//
// const getSource = label => sourceData.data[label];
//
// const _confirmed = getSource("confirmed");

const _regions = require("../../data/gen/us_records");


var infoWindow;
const $create = (tag, id) => {
    const $element = document.createElement(tag);

    $element.setAttribute("id", id);

    document.body.appendChild($element);

    return $element;
};

const $map = $create("div", "map");

window.initMap = () => {

    const $tooltip = $create("div", "tooltip");

    // const map = new google.maps.Map($map, {
    //     zoom: 5,
    //     disableDefaultUI: false
    // });

    // const x = {
    //     "properties": {
    //         "STATEFP": "12",
    //         "COUNTYFP": "033",
    //         "COUNTYNS": "00295737",
    //         "AFFGEOID": "0500000US12033",
    //         "GEOID": "12033",
    //         "NAME": "Escambia",
    //         "LSAD": "06",
    //         "ALAND": 1701544502,
    //         "AWATER": 563927612,
    //         "state": {
    //             "confirmed_latest_date": "2020-04-04",
    //             "confirmed_latest_count": 11544,
    //             "name": "Florida",
    //             "counties": ["Alachua", "Baker", "Bay", "Bradford", "Brevard", "Broward", "Calhoun", "Charlotte", "Citrus", "Clay", "Collier", "Columbia", "DeSoto", "Dixie", "Duval", "Escambia", "Flagler", "Franklin", "Gadsden", "Gilchrist", "Glades", "Gulf", "Hamilton", "Hardee", "Hendry", "Hernando", "Highlands", "Hillsborough", "Holmes", "Indian River", "Jackson", "Jefferson", "Lafayette", "Lake", "Lee", "Leon", "Levy", "Liberty", "Madison", "Manatee", "Marion", "Martin", "Miami-Dade", "Monroe", "Nassau", "Okaloosa", "Okeechobee", "Orange", "Osceola", "Palm Beach", "Pasco", "Pinellas", "Polk", "Putnam", "St. Johns", "St. Lucie", "Santa Rosa", "Sarasota", "Seminole", "Sumter", "Suwannee", "Taylor", "Union", "Volusia", "Wakulla", "Walton", "Washington"]
    //         },
    //         "result": {"confirmed_latest_date": "2020-04-04", "confirmed_latest_count": 118}
    //     }
    // }


    new Deck({
        mapboxApiAccessToken: getConfig("MAPBOX_API_TOKEN"),
        mapStyle: 'mapbox://styles/mapbox/light-v9',
        latitude: 49.254,
        longitude: -123.13,
        zoom: 11,
        maxZoom: 16,
        pitch: 45,
        layers: []
    });


    // const overlay = new GoogleMapsOverlay({
    //         layers: [
    //             // scatterplot(),
    //             // heatmap(),
    //             // new HeatmapLayer({
    //             //     id: 'heat',
    //             //     data: _confirmed.latest.records,
    //             //     getPosition: d => {
    //             //         return [Number(d.location.longitude), Number(d.location.latitude)]
    //             //     },
    //             //
    //             //     "colorRange": [
    //             //         [
    //             //             1,
    //             //             152,
    //             //             189
    //             //         ],
    //             //         [
    //             //             73,
    //             //             227,
    //             //             206
    //             //         ],
    //             //         [
    //             //             216,
    //             //             254,
    //             //             181
    //             //         ],
    //             //         [
    //             //             254,
    //             //             237,
    //             //             177
    //             //         ],
    //             //         [
    //             //             254,
    //             //             173,
    //             //             84
    //             //         ],
    //             //         [
    //             //             209,
    //             //             55,
    //             //             78
    //             //         ]
    //             //     ],
    //             //     getWeight: d => {
    //             //         const scale = (d.count/_confirmed.latest.count);
    //             //
    //             //         return scale;
    //             //     },
    //             //     getRadius: d => {
    //             //         const scale = (d.count/10000);
    //             //
    //             //         return (30000 * scale) + 2000;
    //             //     }
    //             // }),
    //             // new ScatterplotLayer({
    //             //     data: _confirmed.latest.records,
    //             //     getPosition: d => {
    //             //         return [Number(d.location.longitude), Number(d.location.latitude)]
    //             //     },
    //             //     getColor: d => [0, 0, (d.count/255) * 255, 60],
    //             //     getRadius: d => {
    //             //         return d.count + 2000;
    //             //     },
    //             //     pickable: true,
    //             //     onHover: ({object, x, y}) => {
    //             //         if (object) {
    //             //             const { description, count } = object;
    //             //             $tooltip.innerHTML = `<h1>${description} @ ${count}</h1>`
    //             //             $tooltip.style.display = 'block';
    //             //             $tooltip.style.opacity = 0.9;
    //             //             $tooltip.style.left = x + 'px';
    //             //             $tooltip.style.top = y + 'px';
    //             //         } else {
    //             //             $tooltip.style.opacity = 0.0;
    //             //         }
    //             //     },
    //             // }),
    //         ],
    //     });
    //
    //
    // overlay.setMap(map);
    //
    // infoWindow = new google.maps.InfoWindow;
    //
    // // Try HTML5 geolocation.
    // if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(function (position) {
    //         var pos = {
    //             lat: position.coords.latitude,
    //             lng: position.coords.longitude
    //         };
    //
    //         infoWindow.setPosition(pos);
    //         infoWindow.setContent('Location found.');
    //         infoWindow.open(map);
    //         map.setCenter(pos);
    //     }, function () {
    //         handleLocationError(true, infoWindow, map.getCenter());
    //     });
    // } else {
    //     // Browser doesn't support Geolocation
    //     handleLocationError(false, infoWindow, map.getCenter());
    // }
}


const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = getConfig("MAPBOX_API_TOKEN");

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
});

map.on('load', () => {
    map.addLayer(new MapboxLayer({
        type: GeoJsonLayer,
        id: 'us_records',
        data: _regions,
        opacity: 0.5,
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        fp64: true,
        colorRange: [
            [255, 255, 204],
            [255, 237, 160],
            [254, 217, 118],
            [254, 178, 76],
            [253, 141, 60],
            [252, 78, 42],
            [227, 26, 28],
            [189, 0, 38],
            [128, 0, 38]
        ],
        getElevation: f => {
            if (!f.properties.result) {
                return 0;
            }

            return f.properties.result.confirmed_latest_count * 10;
        },
        getLineColor: [255, 255, 255],
        pickable: true
    }))
});