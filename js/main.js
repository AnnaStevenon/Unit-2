// Add all scripts to the JS folder

var map;

// function to create map
function createMap() {
map = L.map('map').setView([20, 0], 2.2); //define the map
// define the basemap
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);
// call getData function
    getData(map);
};


// Add data to the map
function getData(map){
    fetch('data/ActivityFour.geojson')
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ED5565",
                color: "#DA4453",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            L.geoJson(json, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded', createMap)