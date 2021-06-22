function setupMap() {
	var map_123 = L.map("map_123", {
		center: [51.11, 4.46],
		crs: L.CRS.EPSG3857,
		zoom: 11,
		zoomControl: true,
		preferCanvas: false,
	});

	var osm_layer = L.tileLayer(
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
	);

	L.control.scale().addTo(map_123);

	// DRAW
	drawnItems = L.featureGroup().addTo(map_123);

	layercontrol = L.control.layers(
        { osm: osm_layer.addTo(map_123) }, 
        { drawing: drawnItems })
		.addTo(map_123);

	map_123.addControl(
		new L.Control.Draw({
			edit: {
				featureGroup: drawnItems,
				poly: {
					allowIntersection: false,
				},
			},
			draw: {
				polygon: {
					allowIntersection: false,
					showArea: true,
				},
			},
		})
	);

	map_123.on(L.Draw.Event.CREATED, function (event) {
		var layer = event.layer;

		drawnItems.addLayer(layer);
	});

	return map_123;
}

var campingMarkerOptions = {
	radius: 2,
	fillColor: "green",
	color: "green",
	weight: 2,
	opacity: 0.5,
	fillOpacity: 0.2,
};

var stationMarkerOptions = {
	radius: 3,
	fillColor: "red",
	color: "red",
	weight: 3,
	opacity: 1,
	fillOpacity: 0.2,
};

var dorpMarkerOptions = {
	radius: 5,
	fillColor: "lightgray",
	color: "gray",
	weight: 3,
	opacity: 1,
	fillOpacity: 0.2,
};

function addPopUp(feature, layer) {
	if (feature.properties && feature.properties.name) {
		layer.bindPopup(feature.properties.name);
	}
}

function addToolTip(feature, layer) {
    console.log(feature.properties.NAME)
	if (feature.properties && feature.properties.NAME) {
		layer.bindTooltip(feature.properties.NAME);
	}
}

function displayFeatureList(featurelist, type) {
    // new featuregroup layer
    geojson_features = L.featureGroup().addTo(map_123);

	if (type == "alleplekjes") {
		var areas = new L.GeoJSON(featurelist, {
			style: campingMarkerOptions,
			onEachFeature: addPopUp,
		}).addTo(geojson_features);
	} else if (type == "stations") {
		for (let i = 0; i < featurelist.features.length; i++) {
			L.geoJSON(featurelist.features[i], {
				pointToLayer: function (feature, latlng) {
					return L.circleMarker(latlng, stationMarkerOptions);
				},
				onEachFeature: addPopUp,
			}).addTo(geojson_features);
		}
	} else if (type=='gr'){
        for (let i = 0; i < featurelist.features.length; i++) {
            L.geoJSON(featurelist.features[i],{
                onEachFeature: addToolTip,
            }).addTo(geojson_features);
        }
    }

    // add to control 
    layercontrol.addOverlay(geojson_features,type)
}

function clearMap() {
	map_123.off();
	map_123.remove();

	map_123 = setupMap();
}
