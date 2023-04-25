// Add all scripts to the JS folder

// name global variables
var map;
var dataStats = {};

// function to create map
function createMap() {
map = L.map('map').setView([22, 0], 2); //define the map
// define the basemap
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 5,
    minZoom: 2,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);
//add another basemap to draw country boundaries
var Stamen_TonerLines = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 2,
	maxZoom: 5,
	ext: 'png'
}).addTo(map);

// call getData function
    getData(map);
};

//find the minimum, max and mean values and ignore zero values
function calcStats(data){
    var allValues = [];
//loop through each country
    for(var Country of data.features){
        for(var yearStart = 1996; yearStart <= 2020; yearStart += 3){
            for(var yearEnd = 1999; yearEnd <= 2023; yearEnd += 3){
            //get population for current year
            var value = Country.properties["Publications_" + String(yearStart) + "_" + String(yearEnd)];
            if(value > 0){ //this part makes sure that only values greater than zero are pushed into the array
                allValues.push(value)  
            }
         }
        
        }
    }

    //get minimum, max, mean stats for the array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //console.log(dataStats.max) //yes working
    //calculate mean
    var sum = allValues.reduce(function(a, b){ return a+b;});
    dataStats.mean = sum/allValues.length;
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    if(attValue > 0){ 
        var minRadius = 3;
        minValue =1;
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
        return radius;
    }
    else {
        return 3; // can change size for zero data here, will change color later
    }
}

// Resize proportional symbols according to attribute values
function updatePropSymbols(attribute){
    var year = attribute.split("_")[1] + " to " + attribute.split("_")[2]; 
    console.log(year);
    document.querySelector("span.year").innerHTML = year;
    map.eachLayer(function(layer){
        //console.log("here!");
        if (layer.feature && layer.feature.properties[attribute] > -1 ) { //filters out basemap but also another conditional here to deal with zero values, it is saying that if the attribute is present then make that popup, a value of zero gets filtered out
            //access feature properties
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            var popupContent = new PopupContent(props, attribute);
            //update popup with new content
            popup = layer.getPopup();
            popup.setContent(popupContent.formatted).update();
        };
    });
};

//create an object called PopupContent
function PopupContent(properties, attribute){ //"this" references the value of the object's property that is being created
    this.properties = properties;
    this.attribute = attribute;
    this.yearStart = attribute.split("_")[1];
    this.yearEnd = attribute.split("_")[2];
    this.publicatoins = this.properties[attribute];
    this.formatted = "<p><b>Country: </b>" + properties.Country + "</p>";
    if(this.properties[attribute]> 0){
        this.formatted += "<p><b>Publications from " + this.yearStart + " to " + this.yearEnd + ": </b>" + properties[attribute] + "</p>";
    } else {
        this.formatted += "<p><b>Publications from " + this.yearStart + " to " + this.yearEnd + ": </b>" + "No publications for these years!" + "</p>";
    }
    return this.formatted
}

//convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[0] 
    var options = {
        fillColor: "#ce7018",
        color: "#000000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);
    var layer = L.circleMarker(latlng, options);
    var popup = new PopupContent(feature.properties, attribute) //creating a new instance of the object Popup content
    //bind popup to the layer by calling the format of the object
    layer.bindPopup(popup.formatted, {
        offset: new L.Point(0,-options.radius)
    });
    // return the circle marker to the L.geojson pointToLayer option
    return layer;
};

//Determine which attribute to visualize with prop symbols
function createPropSymbols(data, attributes){
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes)
        }
    }).addTo(map);

};

//build an array from the data
function processData(data){
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        if(attribute.indexOf("Publications") > -1){
            attributes.push(attribute);
        };
    };
    //check result
    console.log(attributes); //yes working
    return attributes;
};

//Create new sequence controls
function createSequenceControls(attributes){
    var SequenceControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function () {
            //create control container div with a class name
            var container = L.DomUtil.create('div', 'sequence-control-container');
            //create slider
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
            //add buttons
            container.insertAdjacentHTML('beforeend', '<button class = "step" id = "reverse"><img src="img/reverse.png"></img></button>');
            container.insertAdjacentHTML('beforeend', '<button class = "step" id = "forward"><img src="img/forward.png"></img></button>');
            //disable mouse event listeners for the container
            L.DomEvent.disableClickPropagation(container);

            return container;

        }
    });
    map.addControl(new SequenceControl());

    //add listeners after adding the control
    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    var steps = document.querySelectorAll('.step');
    steps.forEach(function(step){
        step.addEventListener("click", function(){
            var index = document.querySelector('.range-slider').value;

            if(step.id == 'forward'){
                index++;
                index = index > 6 ? 0 : index;
            } else if (step.id == 'reverse'){
                index--;
                index = index < 0 ? 6 : index;
            };

            document.querySelector('.range-slider').value = index;

           updatePropSymbols(attributes[index]);
            
        })
    })

    //input listener for slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        
        updatePropSymbols(attributes[index]);
    });
};

//create legend
function createLegend(attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomleft'
        },

        onAdd: function() {
            //create the control container with a class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            //add script to create the temporal legend here
            container.innerHTML = '<p class ="temporalLegend"> Publications from <span class="year"> 1996 to 1999 </span></p>';

            //add attribute legend svg string
            var svg = '<svg id= "attribute-legend" width = "200px" height = "150px">';

            //array of circle names to base loop on
            var circles = ["max", "mean", "min"];

            //loop to add each circle and text to svg string
            for (var i=0; i < circles.length; i++) {
                var radius = calcPropRadius(dataStats[circles[i]]);
                var cy = 140 - radius;
                //circle string
                svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy + '" fill="#ce7018" fill-opacity="0.8" stroke="#000000" cx="65"/>';
            //evenly space out labels            
            var textY = i * 50 + 35;            

            //text string            
            svg += '<text id="' + circles[i] + '-text" x="140" y="' + textY + '">' + Math.round(dataStats[circles[i]]*100)/100 + '</text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            container.insertAdjacentHTML('beforeend', svg)

            return container;
        }
    });

    map.addControl(new LegendControl());
}

// Import GeoJSON data
function getData(map){
    fetch('data/ActivityFour.geojson')
    .then(function(response){
        return response.json();
    })
    .then(function(json){
        //create an attributes array
        var attributes = processData(json);
        calcStats(json);
        createPropSymbols(json, attributes);
        createSequenceControls(attributes);
        createLegend(attributes);
    })
};

// call createMap function when DOM content is loaded
document.addEventListener('DOMContentLoaded', createMap)