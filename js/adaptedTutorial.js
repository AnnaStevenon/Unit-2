var map;

// function to create map
function createMap() {
map = L.map('map').setView([20, 0], 2); //define the map
// define the basemap
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href = "http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);
// call getData function
    getData(map);
};

// it's very hard to tell from the intructions where to add this code
function onEachFeature(feature, layer) {
    var popupContent = "";
    if(feature.properties) {
        for (var property in feature.properties) {
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map

function getData(map){
    fetch('data/MegaCities.geojson')
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            L.geoJson(json, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: onEachFeature
            }).addTo(map);
        })
};

document.addEventListener('DOMContentLoaded', createMap)


