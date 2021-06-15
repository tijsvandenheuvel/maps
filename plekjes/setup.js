
function setupMap(){

    var map_123 = L.map("map_123", {
        center: [51.14698, 4.46655],
        crs: L.CRS.EPSG3857,
        zoom: 16,
        zoomControl: true,
        preferCanvas: false,
        drawControl:true
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

var stationdata;
var alleplekjesdata;

loadJSON("../data/alle_plekjes.geojson", (e) => {
    alleplekjesdata = JSON.parse(e);
    displayFeatureList(alleplekjesdata, "alleplekjes");
});


loadJSON("../data/stations.geojson", (e) => {
	stationdata = JSON.parse(e);
});

var fr = new FileReader();

fr.readAsText(document.getElementById('file').files[0]);

fr.onload = function(){console.log(fr.result);displayFeatureList(JSON.parse(fr.result), 'semois')};


