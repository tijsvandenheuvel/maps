// Initialize the map
var map = L.map('map').setView([50.8503, 4.3517], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch data from the Overpass API
function fetchDataFromOverpass() {
    console.log('fetching data');
    var overpassUrl = 'https://overpass-api.de/api/interpreter';
    var query = `[out:json][timeout:90];
                  area["ISO3166-1"="BE"][admin_level=2]->.belgium;
                  (
                    relation["admin_level"="8"](area.belgium);
                  );
                  out body;
                  >;
                  out skel qt;`;

    fetch(overpassUrl, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query)
    })
    .then(response => response.json())
    .then(data => {
        processOverpassData(data);
    })
    .catch(error => {
        console.error('Error fetching or processing data: ', error);
    });
}

// Convert Overpass JSON to GeoJSON
function processOverpassData(data) {
    var features = [];
    var nodes = {}, ways = {};

    // Parse and store nodes and ways
    data.elements.forEach(el => {
        if (el.type === "node") {
            nodes[el.id] = {lat: el.lat, lon: el.lon};
        } else if (el.type === "way") {
            ways[el.id] = {nodes: el.nodes.map(nodeId => nodes[nodeId])};
        }
    });

    // Function to check and ensure polygon orientation for GeoJSON
    function ensurePolygonOrientation(ring, clockwise) {
        var area = 0;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            area += (ring[i][0] - ring[j][0]) * (ring[i][1] + ring[j][1]);
        }
        if (clockwise && area > 0) return ring.reverse();
        if (!clockwise && area < 0) return ring.reverse();
        return ring;
    }

    // Construct polygons from relations
    data.elements.filter(el => el.type === "relation").forEach(rel => {
        let polygon = [];

        rel.members.forEach(member => {
            if (member.type === "way" && ways[member.ref]) {
                let way = ways[member.ref];
                let coords = way.nodes.map(node => [node.lon, node.lat]);

                // Close the ring if it's not closed
                if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
                    coords.push([...coords[0]]);
                }

                if (member.role === "outer") {
                    coords = ensurePolygonOrientation(coords, false); // Outer rings must be counterclockwise
                } else if (member.role === "inner") {
                    coords = ensurePolygonOrientation(coords, true); // Inner rings must be clockwise
                }
                polygon.push(coords);  // Collect rings
            }
        });

        if (polygon.length > 0) {
            features.push({
                type: 'Feature',
                properties: rel.tags,
                geometry: {
                    type: 'Polygon',
                    coordinates: polygon  // Properly nested array of rings
                }
            });
        }
    });

    // Add the GeoJSON to the map
    if (features.length > 0) {
        L.geoJSON({ type: 'FeatureCollection', features: features }, {
            style: function(feature) {
                return {color: 'blue', weight: 2};
            },
            onEachFeature: function(feature, layer) {
                layer.on('click', function() {
                    alert('Clicked on ' + feature.properties.name);
                });
            }
        }).addTo(map);
    } else {
        console.log("No features to display");
    }
}

fetchDataFromOverpass();
