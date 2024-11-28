// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13); // Center and zoom level

// Add a tile layer (required for Leaflet maps)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const countryICO = document.getElementById("countryICO");


// Add markers for different regions
const norwayMarker = L.marker([60.472, 8.4689]).addTo(map).bindPopup("Norway");
const germanyMarker = L.marker([51.1657, 10.4515]).addTo(map).bindPopup("Germany");
const franceMarker = L.marker([46.6034, 1.8883]).addTo(map).bindPopup('France');
const usaMarker = L.marker([37.0902, -95.7129]).addTo(map).bindPopup("United States");
const australiaMarker = L.marker([-25.2744, 133.7751]).addTo(map).bindPopup("Australia");
const argentinaMarker = L.marker([-38.4161, -63.6167]).addTo(map).bindPopup("Argentina");
const brazilMarker = L.marker([-14.2350, -51.9253]).addTo(map).bindPopup("Brazil");
const canadaMarker = L.marker([56.1304, -106.3468]).addTo(map).bindPopup("Canada");
const indiaMarker = L.marker([20.5937, 78.9629]).addTo(map).bindPopup("India");
const italyMarker = L.marker([41.9028, 12.4964]).addTo(map).bindPopup("Italy");


// Marker click handlers
norwayMarker.on('click', () => {
    showCountrySection();
    fetchTrends('norway');
})
germanyMarker.on('click', () => fetchTrends('germany'));
franceMarker.on('click', () => fetchTrends('france'));
usaMarker.on('click', () => fetchTrends('united_states'));
australiaMarker.on('click', () => fetchTrends('australia'));
argentinaMarker.on('click', () => fetchTrends('argentina'));
brazilMarker.on('click', () => fetchTrends('brazil'));
canadaMarker.on('click', () => fetchTrends('canada'));
indiaMarker.on('click', () => fetchTrends('india'));
italyMarker.on('click', () => fetchTrends('italy'));



// Function to fetch trends from the API
function fetchTrends(country) {
    fetch(`/api/get-trends?country=${country}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                alert("Failed to fetch trends.");
            } else {
                const trendsResults = document.getElementById('trendsResults');
                trendsResults.innerHTML = `
                    <h1 style="color: white;">Current Trending Searches in ${country.charAt(0).toUpperCase() + country.slice(1)}</h1>
                    <ul>
                        ${data.trends.map(trend => `<li>${trend}</li>`).join('')}
                    </ul>
                `;
            }
        })
        .catch(err => console.error('Error fetching trends:', err));
}


function showCountrySection() {
    const countrySection = document.getElementById('countryICO');
    countrySection.style.display = 'block'; // Show the section when the marker is clicked
}