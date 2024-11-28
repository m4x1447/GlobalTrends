// Initialiserer kartet og setter senter og zoom-nivå
const map = L.map('map').setView([51.505, -0.09], 13); // Sentralisert på [latitude, longitude] og zoom-nivå 13

// Legger til et lag med kartdata fra OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, // Maks zoom-nivå
    attribution: '© OpenStreetMap contributors' // Åndsverksmerking for OpenStreetMap
}).addTo(map);

// Henter elementet for å vise det norske flagget
const countryICO = document.getElementById("countryICO");

// Legger til markører for forskjellige land på kartet med pop-up informasjon
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
norwayMarker.on('click', () => fetchTrends('norway'));
germanyMarker.on('click', () => fetchTrends('germany'));
franceMarker.on('click', () => fetchTrends('france'));
usaMarker.on('click', () => fetchTrends('united_states'));
australiaMarker.on('click', () => fetchTrends('australia'));
argentinaMarker.on('click', () => fetchTrends('argentina'));
brazilMarker.on('click', () => fetchTrends('brazil'));
canadaMarker.on('click', () => fetchTrends('canada'));
indiaMarker.on('click', () => fetchTrends('india'));
italyMarker.on('click', () => fetchTrends('italy'));

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
                    <h1 style="color: white;">Current Trending Searches in ${country.charAt(0).toUpperCase() + country.slice(1)}</h1>
                    <ul>
                        ${data.trends.map(trend => `<li>${trend}</li>`).join('')} <!-- Vist trender som liste -->
                    </ul>
                `;
            }
        })
        .catch(err => console.error('Error fetching trends:', err)); // Håndterer eventuelle feil som skjer under henting av trender
}

// Funksjon som viser flagget til det valgte landet
function showCountrySection() {
    const countrySection = document.getElementById('countryICO');
    countrySection.style.display = 'block'; // Vist flagget når en markør er klikket
}
