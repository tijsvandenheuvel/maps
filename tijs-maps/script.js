// SETUP MAP 
var map_123 = setupMap();



// SETUP DATA

 let listOfDataNames = ["stations","plekjes"];


function getLocation() {
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

function showPosition(position) {
    console.log('locating user')
    geojson_features = L.featureGroup().addTo(map_123);

    L.marker([position.coords.latitude,position.coords.longitude]).addTo(geojson_features);

    layercontrol.addOverlay(geojson_features,'user location')

    
}
