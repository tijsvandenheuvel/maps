document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([50.8503, 4.3517], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    fetch('villages.geojson')
        .then(response => response.json())
        .then(data => {
            console.log(data.features.length)
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.circle(latlng, {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: 0.5,
                        radius: 500
                    });
                },
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.name) {
                        layer.bindPopup(feature.properties.place + " : " + feature.properties.name);
                    } else {
                        layer.bindPopup('Unnamed');
                    }
                }
            }).addTo(map);
        })
        .catch(error => console.error('Error loading the GeoJSON data: ', error));

    // fetch("municipalities.geojson")
    //     .then(function (response) {
    //         return response.json();
    //     })
    //     .then(function (data) {
    //         L.geoJson(data, {
    //             style: function (feature) {
    //                 return { color: 'blue', weight: 1 };
    //             },
    //             onEachFeature: function (feature, layer) {
    //                 layer.on('click', function () {
    //                     alert('Clicked on ' + feature.properties.ADMUNADU);
    //                 });
    //             }
    //         }).addTo(map);
    //     });

});
