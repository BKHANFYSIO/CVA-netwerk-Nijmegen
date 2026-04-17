/* ============================================
   CVA Netwerk Nijmegen – Zorgverleners Zoekfunctie
   Met postcode-gebaseerde hemelsbrede afstand
   ============================================ */

const DEFAULT_RADIUS_KM = 5;
const DEFAULT_MAP_CENTER = { lat: 51.8425, lng: 5.8528 };
const DEFAULT_MAP_ZOOM = 11;

let providersMap = null;
let mapLayerGroup = null;
let isMapAvailable = false;

document.addEventListener('DOMContentLoaded', () => {
    initProviderSearch();
});

// Nederlandse postcode naar lat/lng mapping (subset voor demo)
// In productie kan dit worden aangevuld met een geocode API.
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
    const searchRadius = document.getElementById('searchRadius');

    if (!searchBtn || !searchName || !searchPostcode || !searchRadius) {
        return;
    }

    initProvidersMap();

    searchBtn.addEventListener('click', performSearch);

    searchName.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    searchPostcode.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    searchName.addEventListener('input', performSearch);
    searchRadius.addEventListener('change', performSearch);

    performSearch();
}

function performSearch() {
    const nameQuery = document.getElementById('searchName').value.trim().toLowerCase();
    const rawPostcode = document.getElementById('searchPostcode').value.trim();
    const radiusKm = getSelectedRadiusKm();
    const postcodeInput = parsePostcode(rawPostcode);
    let userCoords = null;
    let shouldShowDistance = false;
    let results = [...zorgverleners];

    if (nameQuery) {
        results = results.filter(provider =>
            provider.naam.toLowerCase().includes(nameQuery) ||
            provider.specialisme.toLowerCase().includes(nameQuery) ||
            provider.contactpersoon.toLowerCase().includes(nameQuery) ||
            provider.plaats.toLowerCase().includes(nameQuery)
        );
    }

    if (postcodeInput.normalized.length > 0) {
        if (!postcodeInput.hasValidPrefix) {
            setSearchStatus('Voer een geldige postcode in (bijvoorbeeld 6511 of 6511AB).', true);
        } else {
            userCoords = resolvePostcodeCoordinates(postcodeInput.numericPart);
            if (!userCoords) {
                setSearchStatus('Deze postcode is nog niet beschikbaar in de prototype-dataset.', true);
            } else {
                shouldShowDistance = true;
                results = results
                    .map(provider => ({
                        ...provider,
                        distance: haversineDistance(userCoords.lat, userCoords.lng, provider.lat, provider.lng),
                    }))
                    .filter(provider => provider.distance <= radiusKm)
                    .sort((left, right) => left.distance - right.distance);

                setSearchStatus(`Afstand wordt hemelsbreed berekend binnen ${radiusKm} km rond postcode ${postcodeInput.numericPart}.`, false);
            }
        }
    } else {
        setSearchStatus('Afstand wordt hemelsbreed berekend vanaf het midden van de postcode.', false);
    }

    setSearchInfo(radiusKm);
    renderProviders(results, shouldShowDistance, radiusKm);
    updateProvidersMap(results, userCoords, shouldShowDistance ? radiusKm : null);
}

function getSelectedRadiusKm() {
    const radiusSelect = document.getElementById('searchRadius');
    const parsed = Number.parseInt(radiusSelect.value, 10);
    return Number.isNaN(parsed) ? DEFAULT_RADIUS_KM : parsed;
}

function parsePostcode(postcode) {
    const normalized = postcode.replace(/\s/g, '').toUpperCase();
    const hasValidPrefix = /^\d{4}[A-Z]{0,2}$/.test(normalized);
    return {
        normalized,
        hasValidPrefix,
        numericPart: normalized.substring(0, 4),
    };
}

function resolvePostcodeCoordinates(postcodeNumericPart) {
    return postcodeCoords[postcodeNumericPart] || null;
}

function setSearchInfo(radiusKm) {
    const info = document.getElementById('searchInfo');
    if (info) {
        info.textContent = `Zoekresultaten worden gefilterd op een straal van ${radiusKm} km rond de ingevoerde postcode`;
    }
}

function setSearchStatus(message, isWarning) {
    const status = document.getElementById('searchStatus');
    if (!status) {
        return;
    }

    status.textContent = message;
    status.style.color = isWarning ? '#8A3D1A' : '';
    status.style.background = isWarning ? 'rgba(240, 165, 0, 0.15)' : '';
}

// Haversine formula to calculate distance between two points in km.
function haversineDistance(lat1, lon1, lat2, lon2) {
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function initProvidersMap() {
    const mapElement = document.getElementById('providersMap');
    if (!mapElement) {
        return;
    }

    if (typeof L === 'undefined') {
        setMapStatus('De kaart is tijdelijk niet beschikbaar. Je kunt wel gewoon zoeken in de lijst hieronder.');
        return;
    }

    providersMap = L.map('providersMap').setView([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng], DEFAULT_MAP_ZOOM);

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(providersMap);

    mapLayerGroup = L.layerGroup().addTo(providersMap);
    isMapAvailable = true;
    setMapStatus('');

    tileLayer.on('tileerror', () => {
        isMapAvailable = false;
        setMapStatus('De kaart is tijdelijk niet beschikbaar. Je kunt wel gewoon zoeken in de lijst hieronder.');
    });

    tileLayer.on('load', () => {
        if (!isMapAvailable) {
            isMapAvailable = true;
            setMapStatus('');
        }
    });
}

function updateProvidersMap(providers, userCoords, radiusKm) {
    if (!providersMap || !mapLayerGroup || !isMapAvailable) {
        return;
    }

    mapLayerGroup.clearLayers();

    const mapBounds = [];

    if (userCoords) {
        const searchMarker = L.circleMarker([userCoords.lat, userCoords.lng], {
            radius: 8,
            color: '#1B6B93',
            fillColor: '#1B6B93',
            fillOpacity: 0.95,
            weight: 2,
        }).bindPopup('Ingevoerde postcode');
        searchMarker.addTo(mapLayerGroup);
        mapBounds.push([userCoords.lat, userCoords.lng]);

        if (radiusKm) {
            L.circle([userCoords.lat, userCoords.lng], {
                radius: radiusKm * 1000,
                color: '#1B6B93',
                fillColor: '#4FC0D0',
                fillOpacity: 0.12,
                weight: 1.5,
            }).addTo(mapLayerGroup);
        }
    }

    providers.forEach(provider => {
        const marker = L.marker([provider.lat, provider.lng]);
        const distanceText = provider.distance !== undefined ? `<br><strong>Afstand:</strong> ${provider.distance.toFixed(1)} km` : '';
        marker.bindPopup(`<strong>${provider.naam}</strong><br>${provider.adres}, ${provider.postcode} ${provider.plaats}${distanceText}`);
        marker.addTo(mapLayerGroup);
        mapBounds.push([provider.lat, provider.lng]);
    });

    if (mapBounds.length > 0) {
        providersMap.fitBounds(mapBounds, { padding: [32, 32], maxZoom: 14 });
    } else {
        providersMap.setView([DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng], DEFAULT_MAP_ZOOM);
    }
}

function setMapStatus(message) {
    const mapStatus = document.getElementById('mapStatus');
    if (!mapStatus) {
        return;
    }

    mapStatus.textContent = message;
    mapStatus.classList.toggle('visible', message.length > 0);
}

function renderProviders(providers, showDistance = false, radiusKm = DEFAULT_RADIUS_KM) {
    const grid = document.getElementById('providersGrid');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (providers.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        noResults.style.display = 'block';
        resultsCount.innerHTML = `<strong>0</strong> zorgverleners gevonden binnen ${radiusKm} km`;
        return;
    }

    noResults.style.display = 'none';
    grid.style.display = 'grid';
    resultsCount.innerHTML = `<strong>${providers.length}</strong> zorgverlener${providers.length !== 1 ? 's' : ''} gevonden`;

    grid.innerHTML = providers.map(provider => {
        const initials = provider.naam
            .split(' ')
            .filter(word => word.length > 2)
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const distanceHtml = showDistance && provider.distance !== undefined
            ? `<div class="provider-distance">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${provider.distance.toFixed(1)} km
        </div>`
            : '';

        return `
      <div class="provider-card fade-up">
        <div class="provider-card-header">
          <div class="provider-avatar">${initials}</div>
          <div>
            <h4>${provider.naam}</h4>
            <div class="provider-specialisme">${provider.specialisme}</div>
          </div>
        </div>
        <div class="provider-details">
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${provider.contactpersoon}
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${provider.adres}, ${provider.postcode} ${provider.plaats}
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <a href="tel:${provider.telefoon.replace(/[^+\d]/g, '')}">${provider.telefoon}</a>
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <a href="mailto:${provider.email}">${provider.email}</a>
          </div>
          <div class="provider-detail">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <a href="${provider.website}" target="_blank" rel="noopener noreferrer">Website bezoeken</a>
          </div>
          ${distanceHtml}
        </div>
      </div>
    `;
    }).join('');

    requestAnimationFrame(() => {
        grid.querySelectorAll('.fade-up').forEach((element, index) => {
            setTimeout(() => element.classList.add('visible'), index * 50);
        });
    });
}
