var map = L.map('map').setView([50.5039, 4.4699], 8); // Centered on Belgium

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Load the GeoJSON from an external file

//let filename = "municipalityShapes.geojson"
let filename = "municipalityMerge.geojson"
fetch(filename)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        L.geoJson(data, {
            style: function (feature) {
                return {color: 'blue', weight: 1};
            },
            onEachFeature: function(feature, layer) {
                layer.on('click', function() {
                    alert('Clicked on ' + feature.properties.ADMUNADU);
                });
            }
        }).addTo(map);
    });
