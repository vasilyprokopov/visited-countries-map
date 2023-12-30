// Initialize the map with constraints
var map = L.map('map', {
    minZoom: 2,
    maxBounds: [
        [-85, -180], // South-west corner
        [85, 180]    // North-east corner
    ],
    maxBoundsViscosity: 1.0
}).setView([52, 5], 3);

// Add Stadia Alidade Smooth Dark tile layer to the map
var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 2,
    maxZoom: 7,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; ' +
                 '<a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; ' +
                 '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png',
    noWrap: true // Prevent the map from wrapping horizontally
}).addTo(map);

// Remove default Leaflet attribution
map.attributionControl.setPrefix('');

// Function to select a random color from a predefined palette

function getRandomColor() {
    var colors = ['#615e85', '#9c8dc2', '#d9a3cd', '#ebc3a7', '#e0e0dc', '#a3d1af', '#90b4de', '#717fb0']; // https://lospec.com/palette-list/sweethope
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to define the style of each country feature
function style(feature) {
    return {
        fillColor: getRandomColor(), // Fill color is set to a random color from the palette
        weight: 0, // Set border weight to 0 to remove borders
        opacity: 0, // Set opacity to 0 for no border
        color: '', // Empty color string for no border
        dashArray: '', // No dash array for borders
        fillOpacity: 0.7 // Set the fill opacity
    };
}

// Parse the visited countries CSV file
Papa.parse('countries/visited-countries.csv', {
    download: true, // Download the file
    header: true, // Treat the first row as headers
    complete: function(results) {
        var visitedCountries = results.data
            .filter(row => row.Country && row.Country.trim() !== '') // Filter out empty rows
            .map(row => row.Country.trim());
        console.log('Visited Countries:', visitedCountries); // Log the visited countries for debugging

        // Fetch the GeoJSON file containing country data
        // https://mapshaper.org/
        // https://datahub.io/core/geo-countries
        fetch('countries/countries.geojson')
            .then(function(response) {
                return response.json(); // Parse the response as JSON
            })
            .then(function(data) {
                // Map country names from GeoJSON data
                var geoJsonCountries = data.features.map(feature => feature.properties.ADMIN);

                // Check each visited country against the GeoJSON data
                visitedCountries.forEach(country => {
                    if (!geoJsonCountries.includes(country)) {
                        console.log('Country not found in GeoJSON data:', country);
                    }
                });

                var filteredGeoJson = {
                    ...data,
                    features: data.features.filter(feature => visitedCountries.includes(feature.properties.ADMIN))
                };

                // Add the filtered GeoJSON data to the map with the defined style
                L.geoJSON(filteredGeoJson, {
                    style: style
                }).addTo(map);
            });
    }
});
