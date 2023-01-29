function setupMap() {
	var map_123 = L.map("map_123", {
		center: [51.145, 4.49],
		crs: L.CRS.EPSG3857,
		zoom: 14,
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

	return map_123;
}
var map_123 = setupMap();

function loadJSON(file_name, callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open("GET", file_name, true);
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}
function addPopUp(feature, layer) {
	if (feature.properties && feature.properties.name) {
		layer.bindTooltip(feature.properties.name);
	}
}

function displayFeatureList(data) {
	for (let i = 0; i < data.features.length; i++) {
		let feature = data.features[i]
        let style = {
            fillColor: feature.properties.fill,
            weight: 2,
            opacity: 1,
            color: feature.properties.stroke,
            fillOpacity: 0.5
        }
		L.geoJSON(data.features[i], {
			style: style,
			onEachFeature: addPopUp,
		}).addTo(map_123);
	}
}

var hoveData;
loadJSON("hove.geojson", (e) => {
	hoveData = JSON.parse(e);
	displayFeatureList(hoveData);
});
