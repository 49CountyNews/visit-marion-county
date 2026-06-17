/* =========================================
   1. ATTRACTIONS GRID (For index.html & attractions.html)
========================================= */
const attractionsGrid = document.getElementById('attractions-grid');
const featuredGrid = document.getElementById('featured-grid');
const communitiesGrid = document.getElementById('communities-grid');
const cacheVersion = '202606122225';

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        menuToggle.classList.toggle('open', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });
}

const getDisplayImage = (image) => {
    let displayImage = `assets/vmc_logo.png?v=${cacheVersion}`;
    if (image && image.includes('drive.google.com/file/d/')) {
        const fileId = image.split('/file/d/')[1].split('/')[0];
        displayImage = `https://lh3.googleusercontent.com/d/${fileId}`;
    } else if (image && image !== '') {
        displayImage = image;
    }

    return displayImage;
};

const escapeAttribute = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const getMapQuery = (item) => {
    const town = item.town || 'Marion County';
    return `${item.name}, ${town}, Alabama`;
};

const buildCards = (items, options = {}) => {
    let htmlOutput = '';
    items.forEach(item => {
        const displayImage = getDisplayImage(item.image);
        const label = item.town || item.communityType || 'Marion County';
        const buttonText = item.buttonText || 'Learn More';
        const isCommunityCard = item.websiteLink || item.historyLink;
        const imageStyle = isCommunityCard
            ? 'width: 100%; aspect-ratio: 1 / 1; height: auto; object-fit: contain; padding: 1rem;'
            : 'width: 100%; height: 200px; object-fit: cover;';
        const imageBackground = isCommunityCard ? '#000000' : item.themeColor || '#ccc';
        const cardLinks = item.websiteLink || item.historyLink
            ? `
                <div class="card-actions">
                    ${item.websiteLink ? `<a class="card-link" href="${item.websiteLink}" target="_blank" rel="noopener noreferrer">Website &rarr;</a>` : ''}
                    ${item.historyLink ? `<a class="card-link" href="${item.historyLink}" target="_blank" rel="noopener noreferrer">History &rarr;</a>` : ''}
                </div>
            `
            : `<a class="card-link" href="${item.link}" target="_blank" rel="noopener noreferrer">${buttonText} &rarr;</a>`;
        const mapAttributes = options.enableMapLinks
            ? ` tabindex="0" data-map-query="${escapeAttribute(getMapQuery(item))}" data-map-name="${escapeAttribute(item.name)}"`
            : '';

        htmlOutput += `
            <article class="grid-card${isCommunityCard ? ' community-card' : ''}"${mapAttributes}>
                <div style="background-color: ${imageBackground}; text-align: center; border-bottom: 3px solid var(--primary-color);">
                    <img src="${displayImage}" alt="${item.name}" style="${imageStyle}">
                </div>
                <div class="card-content">
                    <p style="font-size: 0.8rem; color: #718096; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">${label}</p>
                    <h3 style="margin-top: 0; margin-bottom: 0.5rem;">${item.name}</h3>
                    <p style="color: #4a5568; margin-bottom: 1rem;">${item.description}</p>
                    ${cardLinks}
                </div>
            </article>
        `;
    });
    return htmlOutput;
};

const buildAttractionGroups = (items) => {
    const sortedItems = [...items].sort((a, b) => {
        const townCompare = (a.town || 'Marion County').localeCompare(b.town || 'Marion County');
        if (townCompare !== 0) return townCompare;
        return a.name.localeCompare(b.name);
    });

    const groupedItems = sortedItems.reduce((groups, item) => {
        const town = item.town || 'Marion County';
        if (!groups[town]) groups[town] = [];
        groups[town].push(item);
        return groups;
    }, {});

    return Object.entries(groupedItems).map(([town, townItems]) => `
        <section class="attraction-city-group" aria-labelledby="attractions-${town.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">
            <h3 class="city-group-title" id="attractions-${town.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">${town}</h3>
            <div class="city-group-grid">
                ${buildCards(townItems, { enableMapLinks: true })}
            </div>
        </section>
    `).join('');
};

const setupAttractionsMap = () => {
    const mapFrame = document.getElementById('attractions-map');
    const resetButton = document.getElementById('map-reset-button');
    const mapStatus = document.getElementById('map-status');
    if (!mapFrame || !attractionsGrid) return;

    const fullMapSrc = mapFrame.getAttribute('src');
    let activeMapQuery = '';
    const showFullMap = () => {
        mapFrame.setAttribute('src', fullMapSrc);
        activeMapQuery = '';
        if (mapStatus) mapStatus.textContent = 'Showing the full Marion County attractions map.';
    };
    const showAttractionMap = (card) => {
        const mapQuery = card.dataset.mapQuery;
        if (!mapQuery) return;
        if (mapQuery === activeMapQuery) return;
        activeMapQuery = mapQuery;
        mapFrame.setAttribute('src', `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`);
        if (mapStatus) mapStatus.textContent = `Showing ${card.dataset.mapName || 'this attraction'} on the map.`;
    };

    attractionsGrid.addEventListener('mouseover', (event) => {
        const card = event.target.closest('.grid-card');
        if (card && attractionsGrid.contains(card)) showAttractionMap(card);
    });

    attractionsGrid.addEventListener('focusin', (event) => {
        const card = event.target.closest('.grid-card');
        if (card && attractionsGrid.contains(card)) showAttractionMap(card);
    });

    attractionsGrid.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        const card = event.target.closest('.grid-card');
        if (card && attractionsGrid.contains(card)) {
            showAttractionMap(card);
            mapFrame.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    resetButton?.addEventListener('click', showFullMap);
};

if (attractionsGrid || featuredGrid) {
    fetch(`attractions.json?v=${cacheVersion}`)
        .then(response => response.json())
        .then(data => {
            if (attractionsGrid) {
                attractionsGrid.innerHTML = buildAttractionGroups(data);
                setupAttractionsMap();
            }
            if (featuredGrid) featuredGrid.innerHTML = buildCards(data.filter(item => item.featured === true));
        })
        .catch(error => console.error('Error loading attractions:', error));
}

if (communitiesGrid) {
    fetch(`communities.json?v=${cacheVersion}`)
        .then(response => response.json())
        .then(data => {
            communitiesGrid.innerHTML = buildCards(data);
        })
        .catch(error => {
            console.error('Error loading communities:', error);
            communitiesGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Error loading the communities guide. Please check your console.</p>';
        });
}

/* =========================================
   2. 49 COUNTY NEWS EVENTS FEED (For events.html)
========================================= */
const eventsGrid = document.getElementById('events-grid');

if (eventsGrid) {
    const eventsUrl = 'https://www.49countynews.com/entertainment-events.json';

    fetch(eventsUrl)
        .then(response => response.json())
        .then(data => {
            const localEvents = data.events.filter(event => {
                const eventText = JSON.stringify(event).toLowerCase();
                return eventText.includes('marion county') || eventText.includes('hamilton') || 
                       eventText.includes('guin') || eventText.includes('winfield') || 
                       eventText.includes('hackleburg') || eventText.includes('brilliant') || 
                       eventText.includes('bear creek');
            });

            let htmlOutput = '';
            if (localEvents.length === 0) {
                htmlOutput = '<p style="grid-column: 1 / -1; text-align: center;">No upcoming events currently scheduled for Marion County.</p>';
            } else {
                localEvents.forEach(event => {
                    const title = event.title || event.name || 'Special Event';
                    const date = event.date || event.time || '';
                    const location = event.venue || event.city || 'Marion County';
                    const eventUrl = event.url || '#';
                    
                    const posterUrl = getDisplayImage(event.image);

                    htmlOutput += `
                        <article class="grid-card" style="display: flex; flex-direction: column;">
                            <div style="background-color: #f4f4f9; text-align: center; border-bottom: 3px solid var(--primary-color);">
                                <img src="${posterUrl}" alt="${title} Flyer" style="width: 100%; height: 300px; object-fit: contain; padding: 10px;">
                            </div>
                            <div class="card-content" style="flex-grow: 1;">
                                <h3>${title}</h3>
                                <p style="color: var(--secondary-color); font-weight: bold; margin-bottom: 5px;">${date}</p>
                                <p style="font-size: 0.95rem;"><strong>Location:</strong> ${location}</p>
                                <a class="card-link" href="${eventUrl}" target="_blank" rel="noopener noreferrer">Learn More →</a>
                            </div>
                        </article>
                    `;
                });
            }
            eventsGrid.innerHTML = htmlOutput;
        })
        .catch(error => {
            console.error('Error fetching live events:', error);
            eventsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Error loading the events feed. Please check your console.</p>';
        });
}
