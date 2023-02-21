// Tutorial

var map = L.map('map').setView([51.505, -0.09], 13); // initialize the map and set the starting view and zoom level

// define the basemap with L.titleLayer
//Basemaps use WGS1984/Webmercator projection - all Leaflet 
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href = "http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//adding a marker
var marker = L.marker([51.5,-0.09]).addTo(map);

//adding a circle
var circle = L.circle([51.508, -0.11], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(map);

//adding polygons too
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);

//Working with popups
//Adding popup to map objects with dot syntax and bindPopup
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//stand alone popup
var popup = L.popup()
.setLatLng([51.513, -0.09])
.setContent("I am a standalone popup.")
.openOn(map);

/* Dealing with events
function onMapClick(e) {
    alert("You clicked the map at" + e.latlng)
}
map.on('click', onMapClick)
*/

//using a popup instead of an alert
var popup = L.popup();
function onMapClick(e) {
    popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(map);
};

map.on('click', onMapClick);

//Cool!


