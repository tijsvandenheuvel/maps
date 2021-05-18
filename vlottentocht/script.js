function addPopUp(feature, layer) {
	// does this feature have a property named popupContent?
	if (feature.properties && feature.properties.name) {
		layer.bindPopup(feature.properties.name);
	}
}

function displayFeatureList(featurelist, type) {
	var campingMarkerOptions = {
		radius: 5,
		fillColor: "green",
		color: "green",
		weight: 3,
		opacity: 1,
		fillOpacity: 0.2,
	};

	var stationMarkerOptions = {
		radius: 5,
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

	switch (type) {
		case "campings":
			geojsonMarkerOptions = campingMarkerOptions;
			break;
		case "stations":
			geojsonMarkerOptions = stationMarkerOptions;
			break;
		case "dorpen":
			geojsonMarkerOptions = dorpMarkerOptions;
			break;
	}

	for (let i = 0; i < featurelist.features.length; i++) {

        if(type!='semois'){
            L.geoJSON(featurelist.features[i], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: addPopUp,
            }).addTo(map_123);
        }else{
            L.geoJSON(featurelist.features[i]).addTo(map_123);
        }
		
	}
}

function handleForm() {
	var semoisbool = document.getElementById("semois").checked;
	var campingsbool = document.getElementById("campings").checked;
	var stationsbool = document.getElementById("stations").checked;
	var dorpenbool = document.getElementById("dorpen").checked;

	map_123.off();
	map_123.remove();

	map_123 = setupMap();

	if (semoisbool) {
		displayFeatureList(semoisdata, "semois");
	}
	if (campingsbool) {
		displayFeatureList(campingdata, "campings");
	}
	if (stationsbool) {
		displayFeatureList(stationdata, "stations");
	}
	if (dorpenbool) {
		displayFeatureList(dorpdata, "dorpen");
	}
}