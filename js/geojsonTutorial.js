// Tutorial
var map = L.map('map').setView([40, -105], 5); //define the map
//why here do we say lat then long but lower its long then lat??

// define the basemap
//Basemaps use WGS1984/Web mercator projection - all Leaflet 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href = "http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// creating a featureGroup
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Boring Stadium",
        "popupContent": "This is where a boring game is played!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

// L.geoJSON creates a GeoJSON layer and .addTo adds it to our map
L.geoJSON(geojsonFeature).addTo(map)

//making some lines
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115,  55]]
}];

// adding a style to the lines
var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

// create GeoJSON layer and add it to the map
L.geoJSON(myLines, {
    style: myStyle
}).addTo(map);

// Adding polygons with their own styles

var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]] //why are there so many brackets here?
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00],
        ]]
    }
}];

// setting the style based on some parameter in the FeatureGroup
L.geoJSON(states, {
    style: function(feature) {
        switch(feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat': return {color: "#0000ff"}
        }
    }
}).addTo(map)

// pointToLayer to create a CircleMarker

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);

// I think it's saying that if the feature group has properties and those properties include popup content
// then add a popup to the layer with the value of the popupContent
function onEachFeature(feature, layer) {
    if(feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
};

// onEachFeature is a function to be called on each created Feature
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(map);


// filter to control visability of GeoJSON features

var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];


// the filter function will be used to decide whether to include a feature or not based on true or false in above code.
/*
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(map);
*/
// why does it not work if I turn off the comment on the above code?
