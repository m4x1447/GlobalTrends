// Initialiserer kartet og setter senter og zoom-nivå
const map = L.map('map').setView([60.472, 8.4689], 5); // Sentrert på Norge for enkelhets skyld

// Legger til et lag med kartdata fra OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Legger til markører for land på kartet
const norwayMarker = L.marker([60.472, 8.4689]).addTo(map).bindPopup("Norway");
norwayMarker.on('click', () => fetchTrends('norway'));

const usaMarker = L.marker([37.0902, -95.7129]).addTo(map).bindPopup("United States");
usaMarker.on('click', () => fetchTrends('united_states'));

const brazilMarker = L.marker([-14.2350, -51.9253]).addTo(map).bindPopup("Brazil");
brazilMarker.on('click', () => fetchTrends('brazil'));

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


function hoverFunction() {
    fetchTrends('norway'); 
}