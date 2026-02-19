/* ============================================
   CVA Netwerk Nijmegen – Zorgverleners Zoekfunctie
   Met postcode-gebaseerde afstandsberekening (haversine)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initProviderSearch();
});

// Nederlandse postcode naar lat/lng mapping (subset voor demo)
// In productie zou dit via een API gaan
const postcodeCoords = {
    '6500': { lat: 51.8426, lng: 5.8580 },
    '6501': { lat: 51.8490, lng: 5.8620 },
    '6503': { lat: 51.8400, lng: 5.8530 },
    '6504': { lat: 51.8350, lng: 5.8480 },
    '6511': { lat: 51.8478, lng: 5.8620 },
    '6512': { lat: 51.8500, lng: 5.8700 },
    '6515': { lat: 51.8550, lng: 5.8500 },
    '6521': { lat: 51.8350, lng: 5.8600 },
    '6522': { lat: 51.8320, lng: 5.8650 },
    '6523': { lat: 51.8380, lng: 5.8700 },
    '6524': { lat: 51.8276, lng: 5.8518 },
    '6525': { lat: 51.8300, lng: 5.8680 },
    '6526': { lat: 51.8280, lng: 5.8750 },
    '6531': { lat: 51.8400, lng: 5.8800 },
    '6532': { lat: 51.8382, lng: 5.8824 },
    '6533': { lat: 51.8350, lng: 5.8900 },
    '6534': { lat: 51.8300, lng: 5.8950 },
    '6535': { lat: 51.8200, lng: 5.8400 },
    '6537': { lat: 51.8072, lng: 5.8100 },
    '6538': { lat: 51.8105, lng: 5.8235 },
    '6541': { lat: 51.8230, lng: 5.8110 },
    '6542': { lat: 51.8180, lng: 5.8050 },
    '6543': { lat: 51.8130, lng: 5.7980 },
    '6544': { lat: 51.8300, lng: 5.8200 },
    '6545': { lat: 51.8250, lng: 5.8150 },
    '6546': { lat: 51.8200, lng: 5.8100 },
    '6600': { lat: 51.8050, lng: 5.7250 },
    '6601': { lat: 51.8080, lng: 5.7300 },
    '6602': { lat: 51.8050, lng: 5.7250 },
    '6641': { lat: 51.8600, lng: 5.7700 },
    '6661': { lat: 51.9140, lng: 5.8400 },
    '6663': { lat: 51.8656, lng: 5.8590 },
};

function initProviderSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchName = document.getElementById('searchName');
    const searchPostcode = document.getElementById('searchPostcode');

    // Initial render – show all
    renderProviders(zorgverleners);

    // Search button click
    searchBtn.addEventListener('click', performSearch);

    // Enter key in inputs
    searchName.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });
    searchPostcode.addEventListener('keypress', e => {
        if (e.key === 'Enter') performSearch();
    });

    // Live search on name input
    searchName.addEventListener('input', performSearch);
}

function performSearch() {
    const nameQuery = document.getElementById('searchName').value.trim().toLowerCase();
    const postcodeQuery = document.getElementById('searchPostcode').value.trim().replace(/\s/g, '').toUpperCase();

    let results = [...zorgverleners];

    // Filter by name/specialisme
    if (nameQuery) {
        results = results.filter(z =>
            z.naam.toLowerCase().includes(nameQuery) ||
            z.specialisme.toLowerCase().includes(nameQuery) ||
            z.contactpersoon.toLowerCase().includes(nameQuery) ||
            z.plaats.toLowerCase().includes(nameQuery)
        );
    }

    // Filter by postcode (5km radius)
    if (postcodeQuery && postcodeQuery.length >= 4) {
        const postcodeNum = postcodeQuery.substring(0, 4);
        const userCoords = postcodeCoords[postcodeNum];

        if (userCoords) {
            results = results.map(z => ({
                ...z,
                distance: haversineDistance(userCoords.lat, userCoords.lng, z.lat, z.lng)
            }));

            results = results.filter(z => z.distance <= 5);
            results.sort((a, b) => a.distance - b.distance);
        }
    }

    renderProviders(results, postcodeQuery.length >= 4);
}

// Haversine formula to calculate distance between two points in km
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

function renderProviders(providers, showDistance = false) {
    const grid = document.getElementById('providersGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (providers.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.innerHTML = '';
        return;
    }

    noResults.style.display = 'none';
    grid.style.display = 'grid';
    resultsCount.innerHTML = `<strong>${providers.length}</strong> zorgverlener${providers.length !== 1 ? 's' : ''} gevonden`;

    grid.innerHTML = providers.map(z => {
        const initials = z.naam.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const distanceHtml = showDistance && z.distance !== undefined
            ? `<div class="provider-distance">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${z.distance.toFixed(1)} km
        </div>`
            : '';

        return `
      <div class="provider-card fade-up">
        <div class="provider-card-header">
          <div class="provider-avatar">${initials}</div>
          <div>
            <h4>${z.naam}</h4>
            <div class="provider-specialisme">${z.specialisme}</div>
          </div>
        </div>
        <div class="provider-details">
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${z.contactpersoon}
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${z.adres}, ${z.postcode} ${z.plaats}
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href="tel:${z.telefoon.replace(/[^+\d]/g, '')}">${z.telefoon}</a>
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <a href="mailto:${z.email}">${z.email}</a>
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <a href="${z.website}" target="_blank" rel="noopener noreferrer">Website bezoeken</a>
          </div>
          ${distanceHtml}
        </div>
      </div>
    `;
    }).join('');

    // Animate new cards
    requestAnimationFrame(() => {
        grid.querySelectorAll('.fade-up').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 50);
        });
    });
}
