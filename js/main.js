// Add all scripts to the JS folder

//Steps:
//Step 1: Create leaflet map
//Step 2: Import GeoJson data
//Step 3: Add circle markers for point features to the map
//Step 4: Determine the attricute for scaling the proprotional symbols
//Step 5: For each feature, determine its value for the selected attribute
//Step 6: Give each feature's circle marker a radius based on its attribute



//step 1:
var map;
var minValue;

// function to create map
function createMap() {
map = L.map('map').setView([20, 0], 2); //define the map
// define the basemap
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 5,
    minZoom: 2,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);
// call getData function
    getData(map);
};

//find the minimum value, but also deal with having zeros in the data
function calculateMinValue(data){
    var allValues = [];
//loop through each country
    for(var Country of data.features){
        for(var yearStart = 1996; yearStart <= 2020; yearStart += 3){
            for(var yearEnd = 1999; yearEnd <= 2023; yearEnd += 3){
            //get population for current year
            var value = Country.properties["Publications_" + String(yearStart) + "_" + String(yearEnd)];
            if(value > 0){
                allValues.push(value)  
            }
         }
        
        }
    }

//get minimum value of our array
    
    var minValue = Math.min(...allValues)
console.log(minValue)
    return minValue;

};

//calculate the radius of each proportional symbol
//trying to deal with zeros in the data
//changed minRadius = 5 to minRadius = 2 because the symbols were huge

function calcPropRadius(attValue) {
    if(attValue > 0 && minValue > 0){
        var minRadius = 3;
        var radius = 1.0083 * Math.pow(attValue/minValue,0.5715) * minRadius
        return radius;
    }
    else {
        return 3; // can change size for zero data here, will change color later
    }
}

// Resize proportional symbols
function updatePropSymbols(attribute){
    map.eachLayer(function(layer){
        //console.log("here!");
        if (layer.feature && layer.feature.properties[attribute] > -1 ) {
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add country to popup content
            var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

            //add formatted attribute to panel content string
            var yearStart = attribute.split("_")[1];
            var yearEnd = attribute.split("_")[2]
            if(props[attribute] > 0){
            popupContent += "<p><b>Publications from " + yearStart + " to " + yearEnd + ": </b>" + layer.feature.properties[attribute] + "</p>";
            } else {
                popupContent += "No publications for these years!"
            }

            //update popup with new content
            popup = layer.getPopup();
            popup.setContent(popupContent).update();
        };
    });
};


//convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    var attribute = attributes[0] 
    var options = {
        fillColor: "#ED5565",
        color: "#DA4453",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var attValue = Number(feature.properties[attribute]);
    options.radius = calcPropRadius(attValue);
    var layer = L.circleMarker(latlng, options);
    var popupContent = "<p><b>Country: </b>" + feature.properties.Country + "</p>";
    
    //add formatted attribute to content string
    var yearStart = attribute.split("_")[1];
    var yearEnd = attribute.split("_")[2]
    popupContent += "<p><b>Publications from " + yearStart + " to " + yearEnd + ": </b>" + feature.properties[attribute] + "</p>";

    //bind popup to the circle marker
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius)
    });

    // return the circle marker to the L.geojson pointToLayer option
    return layer;
};

//Step 4: Determin which attribute to visualize with prop symbols
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

    //console.log(data.features[0].properties)
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

//Step1: Create new sequence controls
function createSequenceControls(attributes) {
    var slider = "<input class = 'range-slider' type = 'range'></input>";
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);

    //set slider attributes
    document.querySelector(".range-slider").max = 6;
    document.querySelector(".range-slider").min = 0;
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;

    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class="step" id="reverse"></button>');
    document.querySelector('#panel').insertAdjacentHTML('beforeend', '<button class ="step" id="forward"></button>');

    //replace button content with images
    document.querySelector('#reverse').insertAdjacentHTML('beforeend', "<img src='img/reverse.png'>")
    document.querySelector('#forward').insertAdjacentHTML('beforeend', "<img src='img/forward.png'>")

//click listener for buttons
    
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

    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value;
        
        updatePropSymbols(attributes[index]);
    });
};



//Step 2: Import GeoJSON data
function getData(map){
    fetch('data/ActivityFour.geojson')
    .then(function(response){
        return response.json();
    })
    .then(function(json){
        //create an attributes array
        var attributes = processData(json);
        minValue = calculateMinValue(json);
        createPropSymbols(json, attributes);
        createSequenceControls(attributes);
    })
};


document.addEventListener('DOMContentLoaded', createMap)