
function setupMap(){

    var map_123 = L.map("map_123", {
        center: [49.8, 6.3],
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

var route2data;
var route3data;
var routedata;

loadJSON("route2.geojson", (e) => {
	route2data = JSON.parse(e);
    // displayFeatureList(route2data, "semois");
});
loadJSON("route3.geojson", (e) => {
	route3data = JSON.parse(e);
    // displayFeatureList(route3data, "semois");
});
loadJSON("map(1).geojson", (e) => {
	routedata = JSON.parse(e);
    // displayFeatureList(routedata);
});

map_123.on('click', function(e){
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;
    console.log("You clicked the map at latitude: " + lat + " and longitude: " + lng);
    });