/* =========================================
   1. ATTRACTIONS GRID (For index.html & attractions.html)
========================================= */
const attractionsGrid = document.getElementById('attractions-grid');
const featuredGrid = document.getElementById('featured-grid');
const cacheVersion = '202606121816';

if (attractionsGrid || featuredGrid) {
    fetch(`attractions.json?v=${cacheVersion}`)
        .then(response => response.json())
        .then(data => {
            const buildCards = (items) => {
                let htmlOutput = '';
                items.forEach(item => {
                    // Using the proven URL pattern
                    let displayImage = `assets/vmc_logo.png?v=${cacheVersion}`; 
                    if (item.image && item.image.includes('drive.google.com/file/d/')) {
                        const fileId = item.image.split('/file/d/')[1].split('/')[0];
                        displayImage = `https://lh3.googleusercontent.com/d/${fileId}`;
                    } else if (item.image && item.image !== '') {
                        displayImage = item.image;
                    }

                    htmlOutput += `
                        <article class="grid-card">
                            <div style="background-color: ${item.themeColor || '#ccc'}; text-align: center; border-bottom: 3px solid var(--primary-color);">
                                <img src="${displayImage}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover;">
                            </div>
                            <div class="card-content">
                                <p style="font-size: 0.8rem; color: #718096; margin-bottom: 2px; text-transform: uppercase; font-weight: 600;">${item.town || 'Marion County'}</p>
                                <h3 style="margin-top: 0; margin-bottom: 0.5rem; font-weight: 800;">${item.name}</h3>
                                <p style="color: #4a5568; margin-bottom: 1rem;">${item.description}</p>
                                <a class="card-link" href="${item.link}" target="_blank" rel="noopener noreferrer">Learn More →</a>
                            </div>
                        </article>
                    `;
                });
                return htmlOutput;
            };

            if (attractionsGrid) attractionsGrid.innerHTML = buildCards(data);
            if (featuredGrid) featuredGrid.innerHTML = buildCards(data.filter(item => item.featured === true));
        })
        .catch(error => console.error('Error loading attractions:', error));
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
                    
                    let posterUrl = `assets/vmc_logo.png?v=${cacheVersion}`; 
                    if (event.image && event.image.includes('drive.google.com/file/d/')) {
                        const fileId = event.image.split('/file/d/')[1].split('/')[0];
                        posterUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
                    } else if (event.image && event.image !== '') {
                        posterUrl = event.image;
                    }

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
