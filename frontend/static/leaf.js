// Initialiserer kartet og setter senter og zoom-nivå
const map = L.map('map', {
    center: [20, 0], // Center the map (latitude, longitude)
    zoom: 2          // Set initial zoom level
});

  // Light mode tile layer
const lightMode = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
});

  // Dark mode tile layer
const darkMode = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.carto.com/">Carto</a>',
    subdomains: 'abcd'
});

  // Add the default layer (light mode)
lightMode.addTo(map);

  // Add a layer control to toggle between light and dark modes
const baseMaps = {
    "Light Mode": lightMode,
    "Dark Mode": darkMode
};

L.control.layers(baseMaps).addTo(map);

// dark map option idea
//L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
//    attribution: '&copy; <a href="https://www.carto.com/">Carto</a>',
//    subdomains: 'abcd',
//    maxZoom: 19
//  }).addTo(map); 
//

const countries = [
    'argentina', 'australia', 'brazil', 'canada', 'france', 'germany', 
    'india', 'italy', 'japan', 'mexico', 'netherlands', 'new_zealand', 
    'norway', 'spain', 'sweden', 'united_kingdom', 'united_states'
];

const progressLine = document.getElementById('progress-line');

let currentCountryIndex = 0;
let cycleInterval = null; // To store the interval ID for cycling countries


// Legger til markører for land på kartet
const markers = {
    'argentina': L.marker([-38.4161, -63.6167]).addTo(map).bindPopup("Argentina"),
    'australia': L.marker([-25.2744, 133.7751]).addTo(map).bindPopup("Australia"),
    'brazil': L.marker([-14.2350, -51.9253]).addTo(map).bindPopup("Brazil"),
    'canada': L.marker([56.1304, -106.3468]).addTo(map).bindPopup("Canada"),
    'france': L.marker([46.6034, 1.8883]).addTo(map).bindPopup("France"),
    'germany': L.marker([51.1657, 10.4515]).addTo(map).bindPopup("Germany"),
    'india': L.marker([20.5937, 78.9629]).addTo(map).bindPopup("India"),
    'italy': L.marker([41.8719, 12.5674]).addTo(map).bindPopup("Italy"),
    'japan': L.marker([36.2048, 138.2529]).addTo(map).bindPopup("Japan"),
    'mexico': L.marker([23.6345, -102.5528]).addTo(map).bindPopup("Mexico"),
    'netherlands': L.marker([52.3676, 4.9041]).addTo(map).bindPopup("Netherlands"),
    'new_zealand': L.marker([-40.9006, 174.8860]).addTo(map).bindPopup("New Zealand"),
    'norway': L.marker([60.4720, 8.4689]).addTo(map).bindPopup("Norway"),
    'spain': L.marker([40.4637, -3.7492]).addTo(map).bindPopup("Spain"),
    'sweden': L.marker([60.1282, 18.6435]).addTo(map).bindPopup("Sweden"),
    'united_kingdom': L.marker([55.3781, -3.4360]).addTo(map).bindPopup("United Kingdom"),
    'united_states': L.marker([37.0902, -95.7129]).addTo(map).bindPopup("United States")
};

// Add click event listeners for all markers
for (let country in markers) {
    const marker = markers[country];
    marker.on('click', () => fetchTrends(country));
}
  

// Funksjon for å hente trender fra API-et
function fetchTrends(country) {
    console.log(`Fetching trends for: ${country}`);
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
                        ${data.trends.map(trend => `
                            <li>
                                ${trend} 
                                <span class="info-icon" onclick="showTrendInfo(event, '${trend}')">🅘</span>
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
        })
        .catch(err => console.error('Error fetching trends:', err)); // Håndterer eventuelle feil som skjer under henting av trender
}

function showTrendInfo(event, trend) {
    // Prevent the event from bubbling up and causing unwanted behavior
    event.stopPropagation();

    // Create the info box element dynamically
    const infoBox = document.createElement('div');
    infoBox.classList.add('trend-info-box');
    infoBox.textContent = `Info about ${trend}: This is a trend in this country.`;  // Custom information for each trend

    // Position the info box near the mouse cursor
    infoBox.style.left = `${event.pageX + 10}px`;
    infoBox.style.top = `${event.pageY + 10}px`;

    // Append the info box to the body
    document.body.appendChild(infoBox);

    // Remove the info box when clicking anywhere else
    document.addEventListener('click', function removeInfoBox() {
        document.body.removeChild(infoBox);
        document.removeEventListener('click', removeInfoBox);
    });
}


function startCyclingCountries() {
    function cycleCountry() {
      // Hent nåværende land
      const country = countries[currentCountryIndex];
  
      // Hent trender for landet
      fetchTrends(country);
  
      // Reset linjen
      progressLine.style.transition = 'none'; // Deaktiver overgang for umiddelbar reset
      progressLine.style.width = '100%'; // Sett tilbake til full bredde
  
      // Start animasjonen
      setTimeout(() => {
        progressLine.style.transition = 'width 5s linear'; // Aktiver overgang
        progressLine.style.width = '0%'; // Krymp linjen til 0%
      }, 50); // Kort forsinkelse for å tillate reset
  
      // Oppdater indeks for neste land
      currentCountryIndex = (currentCountryIndex + 1) % countries.length; // Loop tilbake til starten
    }
    document.getElementById("progress-line").style.display = "block";
  
    // Kjør første bytte umiddelbart
    cycleCountry();
  
    // Sett opp intervall for påfølgende bytter
    cycleInterval = setInterval(cycleCountry, 5800); // Bytt land hvert 5. sekund
}
// Function to stop cycling through countries
function stopCyclingCountries() {
    document.getElementById("progress-line").style.display = "none";
    clearInterval(cycleInterval); // Stopp intervallet
    cycleInterval = null; // Tilbakestill intervallet
    currentCountryIndex = 0; // Tilbakestill til første land
  
    
}

// Event listener for the checkbox
document.getElementById('country-toggle').addEventListener('change', function() {
    if (this.checked) {
        startCyclingCountries(); // Start cycling countries when checkbox is checked
    } else {
        stopCyclingCountries(); // Stop cycling when checkbox is unchecked
    }
});

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

