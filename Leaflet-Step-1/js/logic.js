
// URL for earthquake data
const earthquakeData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to map magnitude values to colors
function getColor(m) {
    return m > 5 ? '#B10026' :
        m > 4 ? '#E31A1C' :
            m > 3 ? '#FC4E2A' :
                m > 2 ? '#FD8D3C' :
                    m > 1 ? '#FEB24C' :
                        '#FED976';
}

// Create style function for circle markers
function style(feature) {
    return {
        color: getColor(feature.properties.mag),
        fillOpacity: 1.0,
        radius: 4.5 * feature.properties.mag,
        stroke: false
    };
}

// Define options for toLocaleDateString (date/time formating)
const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
}


// Grab a dataset with d3
// ============================
d3.json(earthquakeData, function (earthquakeDataRes) {
        // Using the features array for API create GeoJSON layer
        createFeatures(earthquakeDataRes);
});


function createFeatures(earthquakeDataRes) {
    // Create earthquakes layer
    const earthquakes = L.geoJson(earthquakeDataRes, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, style(feature));
        },
        // Binding a pop-up to each layer
        onEachFeature: function (feature, layer) {
            layer.bindPopup("<h3>Magnitude: </b>" + feature.properties.mag + "</h3>" +
                "<hr><b>Place: </b>" + feature.properties.place +
                "<br><b>Date/Time: </b>" + new Date(feature.properties.time).toLocaleDateString('en-US', options));
        }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define light map layer
    const lightmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        // var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        // attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/light-v10",
        tileSize: 512,
        zoomOffset: -1,
        accessToken: API_KEY
    });

    // Creating map object
    const myMap = L.map("map", {
        center: [34.0522, -118.2437],
        zoom: 5,
        layers: [lightmap, earthquakes]
    });

    // Create the legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let grades = [0, 1, 2, 3, 4, 5];
        // let labels = [];

        div.innerHTML = '<b>Magnitude</b><br>';
        // loop through magnitude intervals and generate a label with a colored square for each interval
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

}

