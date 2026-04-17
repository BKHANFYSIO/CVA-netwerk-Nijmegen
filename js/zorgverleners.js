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

// Nederlandse postcode (vier cijfers) naar benaderingspunt lat/lng — Nijmegen en ruime regio.
// Coördinaten zijn benaderingen per postcodegebied; later uit te breiden met een geocode-service.
const postcodeCoords = {
    '5341': { lat: 51.7680, lng: 5.5280 },
    '5342': { lat: 51.7650, lng: 5.5180 },
    '5343': { lat: 51.7580, lng: 5.5050 },
    '5344': { lat: 51.7720, lng: 5.5280 },
    '5345': { lat: 51.7480, lng: 5.5120 },
    '5346': { lat: 51.7380, lng: 5.4980 },
    '5347': { lat: 51.7280, lng: 5.4850 },
    '5348': { lat: 51.7180, lng: 5.4720 },
    '5349': { lat: 51.7080, lng: 5.4580 },
    '5361': { lat: 51.7590, lng: 5.7380 },
    '5363': { lat: 51.7680, lng: 5.7520 },
    '5364': { lat: 51.7520, lng: 5.7280 },
    '5431': { lat: 51.7300, lng: 5.8720 },
    '5432': { lat: 51.7240, lng: 5.8880 },
    '5433': { lat: 51.7180, lng: 5.8580 },
    '5434': { lat: 51.7120, lng: 5.8980 },
    '5435': { lat: 51.7380, lng: 5.8480 },
    '5437': { lat: 51.7050, lng: 5.9150 },
    '5439': { lat: 51.6920, lng: 5.8950 },
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
    '6561': { lat: 51.7780, lng: 5.9420 },
    '6562': { lat: 51.7720, lng: 5.9280 },
    '6563': { lat: 51.7680, lng: 5.9550 },
    '6564': { lat: 51.7850, lng: 5.9180 },
    '6566': { lat: 51.8680, lng: 5.7780 },
    '6571': { lat: 51.7820, lng: 5.9150 },
    '6573': { lat: 51.8080, lng: 5.9250 },
    '6574': { lat: 51.8350, lng: 5.9050 },
    '6575': { lat: 51.8180, lng: 5.9380 },
    '6581': { lat: 51.7380, lng: 5.8520 },
    '6582': { lat: 51.7550, lng: 5.8680 },
    '6584': { lat: 51.7350, lng: 5.8950 },
    '6585': { lat: 51.7520, lng: 5.8850 },
    '6591': { lat: 51.6940, lng: 5.9720 },
    '6594': { lat: 51.7120, lng: 5.9480 },
    '6596': { lat: 51.7520, lng: 5.9280 },
    '6598': { lat: 51.7220, lng: 5.9820 },
    '6600': { lat: 51.8050, lng: 5.7250 },
    '6601': { lat: 51.8080, lng: 5.7300 },
    '6602': { lat: 51.8050, lng: 5.7250 },
    '6603': { lat: 51.7980, lng: 5.7380 },
    '6604': { lat: 51.7920, lng: 5.7120 },
    '6605': { lat: 51.8150, lng: 5.7080 },
    '6606': { lat: 51.8220, lng: 5.6950 },
    '6641': { lat: 51.8600, lng: 5.7700 },
    '6642': { lat: 51.8480, lng: 5.7480 },
    '6644': { lat: 51.8720, lng: 5.7380 },
    '6645': { lat: 51.8380, lng: 5.7280 },
    '6651': { lat: 51.8880, lng: 5.6050 },
    '6652': { lat: 51.8950, lng: 5.6180 },
    '6653': { lat: 51.9020, lng: 5.5920 },
    '6654': { lat: 51.8780, lng: 5.6280 },
    '6655': { lat: 51.8680, lng: 5.6150 },
    '6656': { lat: 51.8580, lng: 5.6280 },
    '6657': { lat: 51.9120, lng: 5.5780 },
    '6658': { lat: 51.9220, lng: 5.5650 },
    '6659': { lat: 51.9320, lng: 5.5520 },
    '6661': { lat: 51.9140, lng: 5.8400 },
    '6662': { lat: 51.9020, lng: 5.8280 },
    '6663': { lat: 51.8656, lng: 5.8590 },
    '6664': { lat: 51.8780, lng: 5.8220 },
    '6665': { lat: 51.8920, lng: 5.8120 },
    '6666': { lat: 51.7610, lng: 5.7850 },
    '6668': { lat: 51.8480, lng: 5.7980 },
    '6669': { lat: 51.8320, lng: 5.7880 },
    '6684': { lat: 51.8910, lng: 5.8920 },
    '6685': { lat: 51.8850, lng: 5.9350 },
    '6686': { lat: 51.8900, lng: 5.9150 },
    '6687': { lat: 51.8780, lng: 5.9720 },
    '6688': { lat: 51.8980, lng: 5.8680 },
    '6701': { lat: 51.9740, lng: 5.6610 },
    '6702': { lat: 51.9680, lng: 5.6480 },
    '6703': { lat: 51.9820, lng: 5.6720 },
    '6704': { lat: 51.9580, lng: 5.6780 },
    '6705': { lat: 51.9520, lng: 5.6550 },
    '6706': { lat: 51.9880, lng: 5.6380 },
    '6707': { lat: 51.9420, lng: 5.6880 },
    '6708': { lat: 51.9360, lng: 5.7020 },
    '6709': { lat: 51.9280, lng: 5.7180 },
    '6711': { lat: 52.0330, lng: 5.6580 },
    '6712': { lat: 52.0280, lng: 5.6420 },
    '6713': { lat: 52.0380, lng: 5.6720 },
    '6714': { lat: 52.0220, lng: 5.6880 },
    '6715': { lat: 52.0180, lng: 5.6250 },
    '6716': { lat: 52.0080, lng: 5.6980 },
    '6717': { lat: 52.0450, lng: 5.6350 },
    '6718': { lat: 52.0120, lng: 5.7120 },
    '6811': { lat: 51.9850, lng: 5.9110 },
    '6812': { lat: 51.9820, lng: 5.9180 },
    '6813': { lat: 51.9790, lng: 5.9020 },
    '6814': { lat: 51.9750, lng: 5.9150 },
    '6815': { lat: 51.9880, lng: 5.8980 },
    '6816': { lat: 51.9720, lng: 5.9250 },
    '6821': { lat: 51.9650, lng: 5.9050 },
    '6822': { lat: 51.9580, lng: 5.9180 },
    '6823': { lat: 51.9520, lng: 5.9020 },
    '6824': { lat: 51.9480, lng: 5.9280 },
    '6825': { lat: 51.9380, lng: 5.9120 },
    '6827': { lat: 51.9620, lng: 5.9710 },
    '6828': { lat: 51.9820, lng: 5.8420 },
    '6831': { lat: 51.9420, lng: 5.9780 },
    '6832': { lat: 51.9350, lng: 5.9850 },
    '6833': { lat: 51.9280, lng: 5.9680 },
    '6834': { lat: 51.9220, lng: 5.9820 },
    '6836': { lat: 51.9250, lng: 5.9950 },
    '6841': { lat: 51.9960, lng: 5.9760 },
    '6842': { lat: 51.9900, lng: 5.9680 },
    '6843': { lat: 51.9840, lng: 5.9880 },
    '6844': { lat: 51.9780, lng: 5.9620 },
    '6845': { lat: 51.9720, lng: 5.9880 },
    '6846': { lat: 51.9660, lng: 5.9520 },
    '6851': { lat: 51.9390, lng: 5.9420 },
    '6852': { lat: 51.9320, lng: 5.9480 },
    '6901': { lat: 51.9300, lng: 6.0770 },
    '6902': { lat: 51.9250, lng: 6.0650 },
    '6903': { lat: 51.9380, lng: 6.0850 },
    '6909': { lat: 51.9180, lng: 6.0480 },
    '6921': { lat: 51.9480, lng: 5.9680 },
    '6922': { lat: 51.9520, lng: 5.9580 },
    '6941': { lat: 51.9340, lng: 6.0720 },
    '6942': { lat: 51.9280, lng: 6.0880 },
    '6981': { lat: 52.0170, lng: 6.1380 },
    '6982': { lat: 52.0080, lng: 6.1250 },
    '6983': { lat: 52.0250, lng: 6.1520 },
    '6984': { lat: 52.0120, lng: 6.1650 },
    '6986': { lat: 52.0280, lng: 6.1180 },
    '6987': { lat: 52.0050, lng: 6.0950 },
    '6988': { lat: 51.9980, lng: 6.0820 },
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
    let postcodeSearchState = 'none';
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
            postcodeSearchState = 'invalid';
        } else {
            userCoords = resolvePostcodeCoordinates(postcodeInput.numericPart);
            if (!userCoords) {
                postcodeSearchState = 'unknown';
            } else {
                postcodeSearchState = 'active';
                shouldShowDistance = true;
                results = results
                    .map(provider => ({
                        ...provider,
                        distance: haversineDistance(userCoords.lat, userCoords.lng, provider.lat, provider.lng),
                    }))
                    .filter(provider => provider.distance <= radiusKm)
                    .sort((left, right) => left.distance - right.distance);
            }
        }
    }

    updateSearchGuidance(radiusKm, postcodeInput, postcodeSearchState);
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

function updateSearchGuidance(radiusKm, postcodeInput, postcodeSearchState) {
    const info = document.getElementById('searchInfo');
    if (!info) {
        return;
    }

    info.classList.remove('search-info--warning');

    if (postcodeSearchState === 'invalid') {
        info.classList.add('search-info--warning');
        info.textContent =
            'Dit is geen geldige postcode. Gebruik vier cijfers, eventueel met twee letters (bijvoorbeeld 6511 of 6511AB). ' +
            'Daarna filteren we op de gekozen straal.';
        return;
    }

    if (postcodeSearchState === 'unknown') {
        info.classList.add('search-info--warning');
        info.textContent =
            'Dit postcodegebied (vier cijfers) staat nog niet in onze zoeker. ' +
            'Probeer een postcode uit de regio Nijmegen–Arnhem e.o. (bijvoorbeeld 6511, 6524 of 6811) of wis het veld om alle zorgverleners te tonen.';
        return;
    }

    if (postcodeSearchState === 'active') {
        info.textContent =
            `Resultaten binnen ${radiusKm} km van postcode ${postcodeInput.numericPart}. ` +
            'Alleen zorgverleners binnen die straal, gesorteerd van dichtbij naar ver. Afstand is hemelsbreed (rechte lijn).';
        return;
    }

    info.textContent =
        `Vul een postcode in om te filteren op afstand. Kies de straal hieronder (${radiusKm} km is de standaard). ` +
        'Zonder postcode zie je alle zorgverleners (eventueel gefilterd op naam). Afstand wordt hemelsbreed berekend.';
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
        const zeroNote = showDistance
            ? `<span class="results-count-note">Geen resultaten binnen ${radiusKm} km. Probeer een grotere straal of een andere postcode.</span>`
            : '';
        resultsCount.innerHTML = `<strong>0</strong> zorgverleners gevonden${zeroNote}`;
        return;
    }

    noResults.style.display = 'none';
    grid.style.display = 'grid';
    const sortNote = showDistance
        ? `<span class="results-count-note">Gesorteerd op afstand: dichtbij eerst · binnen ${radiusKm} km</span>`
        : '';
    resultsCount.innerHTML =
        `<strong>${providers.length}</strong> zorgverlener${providers.length !== 1 ? 's' : ''} gevonden${sortNote}`;

    grid.innerHTML = providers.map(provider => {
        const initials = provider.naam
            .split(' ')
            .filter(word => word.length > 2)
            .map(word => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

        const distanceBadge =
            showDistance && provider.distance !== undefined
                ? `<div class="provider-distance-badge" title="Afstand hemelsbreed tot het postcodegebied">
          <span class="provider-distance-badge-km">${provider.distance.toFixed(1)} km</span>
          <span class="provider-distance-badge-hint">hemelsbreed</span>
        </div>`
                : '';

        return `
      <div class="provider-card fade-up">
        <div class="provider-card-header">
          <div class="provider-card-header-left">
            <div class="provider-avatar">${initials}</div>
            <div class="provider-card-titles">
              <h4>${provider.naam}</h4>
              <div class="provider-specialisme">${provider.specialisme}</div>
            </div>
          </div>
          ${distanceBadge}
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
