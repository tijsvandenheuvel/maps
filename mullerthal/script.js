function addPopUp(feature, layer) {
	// does this feature have a property named popupContent?
	if (feature.properties && feature.properties.name) {
		layer.bindPopup(feature.properties.name);
	}
}

function displayFeatureList(featurelist) {
	var campingMarkerOptions = {
		radius: 5,
		fillColor: "green",
		color: "green",
		weight: 3,
		opacity: 1,
		fillOpacity: 0.2,
	};

    geojsonMarkerOptions = campingMarkerOptions;

	for (let i = 0; i < featurelist.features.length; i++) {
        console.log(featurelist.features[i].geometry.type)
        if(featurelist.features[i].geometry.type=="Point"){
            L.geoJSON(featurelist.features[i], {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: addPopUp,
            }).addTo(map_123);
        }else{
            console.log(featurelist.features[i])
            L.geoJSON(featurelist.features[i]).addTo(map_123);
        }
		
	}
}

function handleForm() {
	var route2bool = document.getElementById("route2").checked;
	var route3bool = document.getElementById("route3").checked;
    var routebool = document.getElementById("route").checked;

	map_123.off();
	map_123.remove();

	map_123 = setupMap();

	if (route2bool) {
		displayFeatureList(route2data);
	}
	if (route3bool) {
		displayFeatureList(route3data);
	}
    if (routebool) {
		displayFeatureList(routedata);
	}
}

// USER LOCATION FUNCTIONS
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition,e=>{console.log(e)});
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