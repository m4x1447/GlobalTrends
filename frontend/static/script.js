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
  // Toggling the hamburger menu
const themeSwitch = document.getElementById('theme-switch');

// Sjekk om brukeren har en tidligere valgt modus lagret
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeSwitch.checked = true;
}

// Legg til en event listener for å bytte modus
themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark'); // Lagre valg i localStorage
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light'); // Lagre valg i localStorage
    }
});





