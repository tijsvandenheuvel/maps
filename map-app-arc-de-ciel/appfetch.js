var map = L.map('map').setView([50.8503, 4.3517], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

function fetchDataFromOverpass() {
    console.log("fetching data")
    var overpassUrl = "https://overpass-api.de/api/interpreter";
    var query = `
    [out:json][timeout:50];
    area(3600053114)->.searchArea;
    (
        node["place"="town"](area.searchArea);
        node["place"="city"](area.searchArea);
        node["place"="village"](area.searchArea);
    );
    out center;
`;

// id belgium = 3600016895
// id antwerp = 3600053114

//node["place"="suburb"](area.searchArea); 
//node["place"="neighbourhood"](area.searchArea);
//node["place"="locality"](area.searchArea);
//node["place"="farm"](area.searchArea);
//node["place"="isolated_dwelling"](area.searchArea);

    fetch(overpassUrl, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        var geojsonData = convertToGeoJSON(data);
        console.log(JSON.stringify(geojsonData));
        
        displayVillagesOnMap(data);
    })
    .catch(error => console.error('Error fetching data: ', error));
}

function convertToGeoJSON(data) {
    return {
        type: "FeatureCollection",
        features: data.elements.map(element => ({
            type: "Feature",
            properties: {
                name: element.tags.name || "Unnamed",
                place: element.tags.place
            },
            geometry: {
                type: "Point",
                coordinates: [element.lon, element.lat]
            }
        }))
    };
}

function displayVillagesOnMap(data) {

    console.log(data.elements.length)

    data.elements.forEach(function(element) {
        if (element.type === 'node' && element.lat && element.lon) {
            var lat = element.lat;
            var lon = element.lon;
            var circle = L.circle([lat, lon], {
                color: 'red',      // Circle border color
                fillColor: '#f03', // Circle fill color
                fillOpacity: 0.5,  // Circle fill opacity
                radius: 500        // Radius in meters
            }).addTo(map);
            circle.bindPopup((element.tags.name || "Unnamed"));
        }
    });
    console.log("done");
}

fetchDataFromOverpass();