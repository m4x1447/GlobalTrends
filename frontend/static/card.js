document.addEventListener("DOMContentLoaded", function () {
    fetchTrends("NO"); // Hent trender for Norge

    function fetchTrends(countryCode) {
        fetch(`/trending?country=${countryCode}`)
            .then(response => response.json())
            .then(data => {
                const trendList = document.getElementById("trend-list");
                trendList.innerHTML = "";

                data.slice(0, 5).forEach((trend, index) => {
                    const trendItem = document.createElement("li");
                    trendItem.textContent = `${index + 1}. ${trend}`;
                    trendList.appendChild(trendItem);
                });
            })
            .catch(error => console.error("Error fetching trends:", error));
    }
});
