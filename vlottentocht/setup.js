
function setupMap(){

    var map_123 = L.map("map_123", {
        center: [49.79, 5.1],
        crs: L.CRS.EPSG3857,
        zoom: 11,
        zoomControl: true,
        preferCanvas: false,
    });
    
    var tile_layer_123 = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                'Data by \u0026copy; \u003ca href="http://openstreetmap.org"\u003eOpenStreetMap\u003c/a\u003e, under \u003ca href="http://www.openstreetmap.org/copyright"\u003eODbL\u003c/a\u003e.',
            detectRetina: false,
            maxNativeZoom: 18,
            maxZoom: 18,
            minZoom: 0,
            noWrap: false,
            opacity: 1,
            subdomains: "abc",
            tms: false,
        }
    ).addTo(map_123);
    
    L.control.scale().addTo(map_123);

    return map_123
}

var map_123 = setupMap();

var semoisdata;
var campingdata;
var stationdata;
var dorpdata;

loadJSON("semois.geojson", (e) => {
	semoisdata = JSON.parse(e);
    displayFeatureList(semoisdata, "semois");

});
loadJSON("semoiscampings.geojson", (e) => {
	campingdata = JSON.parse(e);
});
loadJSON("semoisdorpen.geojson", (e) => {
	dorpdata = JSON.parse(e);
});
loadJSON("stations.geojson", (e) => {
	stationdata = JSON.parse(e);
});


map_123.on('click', function(e){
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
    });