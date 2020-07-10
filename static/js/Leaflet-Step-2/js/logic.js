// URL for earthquake data
const earthquakeData =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// URL for tectonic plates data
const tectonicData =
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Function to map magnitude values to colors
function getColor(m) {
  return m > 5
    ? "#B10026"
    : m > 4
    ? "#E31A1C"
    : m > 3
    ? "#FC4E2A"
    : m > 2
    ? "#FD8D3C"
    : m > 1
    ? "#FEB24C"
    : "#FED976";
}

// Create style function for circle markers
function style(feature) {
  return {
    color: getColor(feature.properties.mag),
    fillOpacity: 1.0,
    radius: 4.5 * feature.properties.mag,
    stroke: false,
  };
}

// Define style for fault lines
const faultLinesStyle = {
  color: "#ff7800",
  weight: 2,
  opacity: 0.85,
};

// Define options for toLocaleDateString (date/time formating)
const options = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZoneName: "short",
};

// Grab both datasets with d3
// ============================
d3.json(earthquakeData, function (earthquakeDataRes) {
  d3.json(tectonicData, function (faultLinesRes) {
    // Using the features array for each API create GeoJSON layers
    createFeatures(earthquakeDataRes, faultLinesRes);
  });
});

function createFeatures(earthquakeDataRes, faultLinesRes) {
  // Create earthquakes layer
  const earthquakes = L.geoJson(earthquakeDataRes, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, style(feature));
    },
    // Binding a pop-up to each layer
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h3>Magnitude: </b>" +
          feature.properties.mag +
          "</h3>" +
          "<hr><b>Place: </b>" +
          feature.properties.place +
          "<br><b>Date/Time: </b>" +
          new Date(feature.properties.time).toLocaleDateString("en-US", options)
      );
    },
  });

  // Create faultLines layer
  const faultLines = L.geoJSON(faultLinesRes, {
    style: faultLinesStyle,
  });

  // Sending our earthquakes and faultLines layers to the createMap function
  createMap(earthquakes, faultLines);
}

function createMap(earthquakes, faultLines) {
  // Define light map, satellite and outdors layers
  const lightmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      // var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
      // attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox/light-v10",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY,
    }
  );

  const outdoors = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/outdoors-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY,
    }
  );

  const satellite = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/satellite-streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: API_KEY,
    }
  );

  // Define a baseMaps object to hold our base layers
  const baseMaps = {
    Satellite: satellite,
    "Light Map": lightmap,
    Outdoors: outdoors,
  };

  // Create overlay object to hold our overlay layers
  const overlayMaps = {
    Earthquakes: earthquakes,
    "Fault Lines": faultLines,
  };

  // Creating map object
  const myMap = L.map("map", {
    center: [34.0522, -118.2437],
    zoom: 5,
    layers: [satellite, earthquakes],
  });

  // Create the legend
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");
    let grades = [0, 1, 2, 3, 4, 5];
    // let labels = [];

    div.innerHTML = "<b>Magnitude</b><br>";
    // loop through magnitude intervals and generate a label with a colored square for each interval
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' +
        getColor(grades[i] + 1) +
        '"></i> ' +
        grades[i] +
        (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Create a layer control containing our baseMaps and overlayMaps
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: true,
    })
    .addTo(myMap);

  // Make sure that earthquakes layer and its legend are added/removed together
  // On load, if layer earthquakes is on, add its legend
  if (myMap.hasLayer(earthquakes)) {
    legend.addTo(myMap);
  }

  // When earthquakes layer is on, keep it always on top
  // If we add earthquakes from layer control, add the legend
  myMap.on("overlayadd", function (eventLayer) {
    earthquakes.bringToFront();
    if (eventLayer.name === "Earthquakes") {
      legend.addTo(this);
    }
  });

  // If we remove earthquakes from layer control, remove the legend
  myMap.on("overlayremove", function (eventLayer) {
    if (eventLayer.name === "Earthquakes") {
      this.removeControl(legend);
    }
  });
}
