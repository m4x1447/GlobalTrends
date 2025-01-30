function fetchTrends(countryCode) {
    fetch(`/trending?country=${countryCode}`)
        .then(response => response.json())
        .then(data => {
            const trendsList = document.getElementById('trendsList');
            trendsList.innerHTML = ""; // Tøm tidligere trender

            data.forEach((trend, index) => {
                const trendItem = document.createElement('li');
                trendItem.textContent = `${index + 1}. ${trend}`;
                trendsList.appendChild(trendItem);
            });
        })
        .catch(error => console.error("Error fetching trends:", error));
}
