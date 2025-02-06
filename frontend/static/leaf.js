// Initialiserer kartet og setter senter og zoom-nivå
const map = L.map('map', {
    center: [20, 0],
    zoom: 3,
    maxZoom: 5.5,
    minZoom: 1.5
});

// Light mode tile layer
const lightMode = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {});
const darkMode = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {subdomains: 'abcd'});
lightMode.addTo(map);

const baseMaps = {"Light Mode": lightMode, "Dark Mode": darkMode};
L.control.layers(baseMaps).addTo(map);

const countries = [
    'argentina', 'australia', 'brazil', 'canada', 'france', 'germany',
    'india', 'italy', 'japan', 'mexico', 'netherlands',
    'norway', 'sweden', 'united_kingdom', 'united_states',
    'syria', 'lebanon', 'egypt', 'saudi_arabia', 'uae', 'morocco',
    'algeria', 'iraq', 'jordan', 'qatar', 'kuwait', 'oman', 'tunisia', 'bahrain'
];

const markers = {};
const countryCoordinates = {};
const coordinatesData = {
    'argentina': [-38.4161, -63.6167],
    'australia': [-25.2744, 133.7751],
    'brazil': [-14.2350, -51.9253],
    'canada': [56.1304, -106.3468],
    'france': [46.6034, 1.8883],
    'germany': [51.1657, 10.4515],
    'india': [20.5937, 78.9629],
    'italy': [41.8719, 12.5674],
    'japan': [36.2048, 138.2529],
    'mexico': [23.6345, -102.5528],
    'netherlands': [52.3676, 4.9041],
    'norway': [60.4720, 8.4689],
    'sweden': [60.1282, 18.6435],
    'united_kingdom': [55.3781, -3.4360],
    'united_states': [37.0902, -95.7129],
    'syria': [34.8021, 38.9968],
    'lebanon': [33.8547, 35.8623],
    'egypt': [26.8206, 30.8025],
    'saudi_arabia': [23.8859, 45.0792],
    'uae': [23.4241, 53.8478],
    'morocco': [31.7917, -7.0926],
    'algeria': [28.0339, 1.6596],
    'iraq': [33.2232, 43.6793],
    'jordan': [30.5852, 36.2384],
    'qatar': [25.2769, 51.5200],
    'kuwait': [29.3759, 47.9774],
    'oman': [21.4735, 55.9754],
    'tunisia': [33.8869, 9.5375],
    'bahrain': [26.0667, 50.5577]
};

for (let country in coordinatesData) {
    const [lat, lon] = coordinatesData[country];
    markers[country] = L.marker([lat, lon]).addTo(map).bindPopup(country.charAt(0).toUpperCase() + country.slice(1));
    countryCoordinates[country] = { lat, lon, zoom: 5 };
    markers[country].on('click', () => {
        fetchTrends(country);
        updateMapLocation(country);
    });
}

function updateMapLocation(country) {
    if (countryCoordinates[country]) {
        const { lat, lon, zoom } = countryCoordinates[country];
        map.setView([lat, lon], zoom);
    }
}

function fetchTrends(country) {
    console.log(`Fetching trends for: ${country}`);
    fetch(`/api/get-trends?country=${country}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(data.error);
                alert("Failed to fetch trends.");
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
                    </ul>`;
            }
        })
        .catch(err => console.error('Error fetching trends:', err));
}

function showTrendInfo(event, trend) {
    event.stopPropagation();
    const infoBox = document.createElement('div');
    infoBox.classList.add('trend-info-box');
    infoBox.textContent = `Info about ${trend}: This is a trend in this country.`;
    infoBox.style.left = `${event.pageX + 10}px`;
    infoBox.style.top = `${event.pageY + 10}px`;
    document.body.appendChild(infoBox);
    document.addEventListener('click', function removeInfoBox() {
        document.body.removeChild(infoBox);
        document.removeEventListener('click', removeInfoBox);
    });
}
