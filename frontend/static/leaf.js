// Initialiserer kartet og setter senter og zoom-nivå
const map = L.map('map').setView([60.472, 8.4689], 5); // Sentrert på Norge for enkelhets skyld

// Legger til et lag med kartdata fra OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Legger til markører for land på kartet
const argentinaMarker = L.marker([-38.4161, -63.6167]).addTo(map).bindPopup("Argentina");
argentinaMarker.on('click', () => fetchTrends('argentina'));

const australiaMarker = L.marker([-25.2744, 133.7751]).addTo(map).bindPopup("Australia");
australiaMarker.on('click', () => fetchTrends('australia'));

const brazilMarker = L.marker([-14.2350, -51.9253]).addTo(map).bindPopup("Brazil");
brazilMarker.on('click', () => fetchTrends('brazil'));

const canadaMarker = L.marker([56.1304, -106.3468]).addTo(map).bindPopup("Canada");
canadaMarker.on('click', () => fetchTrends('canada'));

const franceMarker = L.marker([46.6034, 1.8883]).addTo(map).bindPopup("France");
franceMarker.on('click', () => fetchTrends('france'));

const germanyMarker = L.marker([51.1657, 10.4515]).addTo(map).bindPopup("Germany");
germanyMarker.on('click', () => fetchTrends('germany'));

const indiaMarker = L.marker([20.5937, 78.9629]).addTo(map).bindPopup("India");
indiaMarker.on('click', () => fetchTrends('india'));

const italyMarker = L.marker([41.8719, 12.5674]).addTo(map).bindPopup("Italy");
italyMarker.on('click', () => fetchTrends('italy'));

const japanMarker = L.marker([36.2048, 138.2529]).addTo(map).bindPopup("Japan");
japanMarker.on('click', () => fetchTrends('japan'));

const mexicoMarker = L.marker([23.6345, -102.5528]).addTo(map).bindPopup("Mexico");
mexicoMarker.on('click', () => fetchTrends('mexico'));

const netherlandsMarker = L.marker([52.3676, 4.9041]).addTo(map).bindPopup("Netherlands");
netherlandsMarker.on('click', () => fetchTrends('netherlands'));

const newZealandMarker = L.marker([-40.9006, 174.8860]).addTo(map).bindPopup("New Zealand");
newZealandMarker.on('click', () => fetchTrends('new_zealand'));

const norwayMarker = L.marker([60.4720, 8.4689]).addTo(map).bindPopup("Norway");
norwayMarker.on('click', () => fetchTrends('norway'));

const spainMarker = L.marker([40.4637, -3.7492]).addTo(map).bindPopup("Spain");
spainMarker.on('click', () => fetchTrends('spain'));

const swedenMarker = L.marker([60.1282, 18.6435]).addTo(map).bindPopup("Sweden");
swedenMarker.on('click', () => fetchTrends('sweden'));

const unitedKingdomMarker = L.marker([55.3781, -3.4360]).addTo(map).bindPopup("United Kingdom");
unitedKingdomMarker.on('click', () => fetchTrends('united_kingdom'));

const unitedStatesMarker = L.marker([37.0902, -95.7129]).addTo(map).bindPopup("United States");
unitedStatesMarker.on('click', () => fetchTrends('united_states'));


// Funksjon for å hente trender fra API-et
function fetchTrends(country) {
    fetch(`/api/get-trends?country=${country}`) // Henter data fra APIet for et spesifikt land
        .then(response => response.json()) // Konverterer svar til JSON
        .then(data => {
            if (data.error) {
                console.error(data.error); // Vist feilmelding i konsollen hvis det skjer en feil
                alert("Failed to fetch trends."); // Vist feilmelding til brukeren
            } else {
                const trendsResults = document.getElementById('trendsResults');
                trendsResults.innerHTML = `
                    <h2>Trending Searches in ${country.charAt(0).toUpperCase() + country.slice(1)}</h2>
                    <ul>
                        ${data.trends.map(trend => `<li>${trend}</li>`).join('')} <!-- Vist trender som liste -->
                    </ul>
                `;
            }
        })
        .catch(err => console.error('Error fetching trends:', err)); // Håndterer eventuelle feil som skjer under henting av trender
}

// Funksjon for å bytte mellom Map og Menu
function showTab(tabId) {
    // Skjuler alle tab-innhold
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Vist valgt tab
    document.getElementById(tabId).style.display = 'block';
    
    // Aktivere riktig knapp
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));
    event.target.classList.add('active');
}

// norwayMarker.on('click', () => fetchTrends('norway'));

function hoverFunction() {
    fetchTrends('norway');
}