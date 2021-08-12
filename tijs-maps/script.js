// SETUP MAP 
var map_123 = setupMap();



// SETUP DATA


// let listOfFileNames = ["../data/stations.geojson","../data/alle_plekjes.geojson"];
 let listOfDataNames = ["stations","plekjes"];

// var listOfGeoJsonFiles = loadData(listOfFileNames,listOfDataNames)

// console.log(listOfGeoJsonFiles)
// console.log(listOfGeoJsonFiles.length)

// console.log(typeof(listOfGeoJsonFiles))

// console.log(Object.getOwnPropertyNames(listOfGeoJsonFiles));

// console.log(Object.keys(listOfGeoJsonFiles));



// SETUP HTML

//makeList(listOfDataNames);

function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

function showPosition(position) {

    geojson_features = L.featureGroup().addTo(map_123);

    L.marker([position.coords.latitude,position.coords.longitude]).addTo(geojson_features);

    layercontrol.addOverlay(geojson_features,'user location')
}
