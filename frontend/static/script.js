console.log("script loaded!")

function popupEventListener(t) {
    t.addEventListener("click", openPopup, false)
}

function openPopup(e) { window.open(e.target.href, "_blank", "width=786, height=786"); e.preventDefault() }

document.querySelectorAll("#popup").forEach(popupEventListener)


function showTrendInfo(event, trend) {
    event.preventDefault(); // Prevent default link behavior
  
    if (!trend) {
      alert('Trend data is missing!');
      return;
    }
  
    // Construct Google Search URL
    const searchQuery = encodeURIComponent(trend);
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
  
    // Open a pop-up window
    const popupWidth = 600;
    const popupHeight = 400;
    const left = (window.innerWidth - popupWidth) / 2;
    const top = (window.innerHeight - popupHeight) / 2;
  
    window.open(
      googleSearchUrl,
      '_blank',
      `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );
  }
  