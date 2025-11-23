document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Init Data & State ---
    let favorites = JSON.parse(localStorage.getItem('bloomFavorites')) || [];
    
    // --- 2. Menu Navigation ---
    const menuIcon = document.querySelector('.menu-icon');
    const nav = document.querySelector('.nav');
    if (menuIcon && nav) {
        menuIcon.addEventListener('click', function() {
            nav.classList.toggle('open');
            document.body.classList.toggle('menu-active'); 
        });
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                document.body.classList.remove('menu-active');
            });
        });
    }

    // --- 3. Sections Switching ---
    const sections = {
        // Removed about-hero and about-section references
        home: [document.querySelector('.hero'), document.getElementById('tour-hero'), document.getElementById('restaurant-hero'), document.getElementById('contact-hero')],
        tour: document.getElementById('location-section-tour'),
        dining: document.getElementById('location-section-restaurant'),
        contact: document.getElementById('contact-section'),
        // Removed 'about: document.getElementById('about-section')'
    };

    function hideAll() { Object.values(sections).flat().forEach(el => { if(el) el.style.display = 'none'; }); }
    function showHomePage() { hideAll(); sections.home.forEach(el => { if(el) el.style.display = 'flex'; }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    function showSection(section) { if (!section) return; hideAll(); section.style.display = 'flex'; window.scrollTo({ top: 0, behavior: 'smooth' }); }

    // Navigation Listeners
    document.querySelectorAll('.back-to-home-btn').forEach(btn => { btn.addEventListener('click', (e) => { e.preventDefault(); showHomePage(); }); });
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (this.classList.contains('back-to-home-btn')) return;
            if (id === '#location-section-tour') { e.preventDefault(); showSection(sections.tour); }
            else if (id === '#location-section-restaurant') { e.preventDefault(); showSection(sections.dining); }
            else if (id === '#contact-section') { e.preventDefault(); showSection(sections.contact); }
            // Removed About section logic
            else {
                const target = document.querySelector(id);
                if (target && sections.home[0].style.display !== 'none') { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
            }
        });
    });

    // --- 4. FAVORITES SYSTEM ---
    function toggleFavorite(title, btn) {
        const index = favorites.indexOf(title);
        const icon = btn.querySelector('i');
        
        if (index === -1) {
            favorites.push(title); // Add
            btn.classList.add('active');
            icon.classList.remove('fa-regular');
            icon.classList.add('fa-solid');
        } else {
            favorites.splice(index, 1); // Remove
            btn.classList.remove('active');
            icon.classList.remove('fa-solid');
            icon.classList.add('fa-regular');
        }
        localStorage.setItem('bloomFavorites', JSON.stringify(favorites));
    }

    function updateFavoriteUI() {
        document.querySelectorAll('.location-card').forEach(card => {
            const title = card.getAttribute('data-title');
            const btn = card.querySelector('.favorite-btn');
            if(btn) {
                const icon = btn.querySelector('i');
                if (favorites.includes(title)) {
                    btn.classList.add('active');
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else {
                    btn.classList.remove('active');
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }
            }
        });
    }
    updateFavoriteUI();

    // --- 5. Filters System ---
    function setupFilters(containerId, gridId) {
        const container = document.getElementById(containerId);
        const grid = document.getElementById(gridId);
        if (!container || !grid) return;
        const buttons = container.querySelectorAll('.filter-btn');
        const cards = grid.querySelectorAll('.location-card');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                
                cards.forEach(card => {
                    const tags = card.getAttribute('data-tags');
                    const title = card.getAttribute('data-title');
                    
                    let isMatch = false;
                    if (filter === 'all') {
                        isMatch = true;
                    } else if (filter === 'favorites') {
                        isMatch = favorites.includes(title);
                    } else {
                        isMatch = (tags && tags.includes(filter));
                    }

                    if (isMatch) card.style.display = 'block'; 
                    else card.style.display = 'none'; 
                });
            });
        });
    }
    setupFilters('tourFilters', 'locationList');
    setupFilters('diningFilters', 'restaurantList');

    // --- 6. Modal System ---
    const detailModal = document.getElementById('detailModal');
    const detailClose = document.querySelector('.detail-close-btn');
    
    function updateGallery(imageString) {
        const nav = document.getElementById('thumbnailNav'); const main = document.getElementById('modalImage');
        if (!main || !nav) return;
        nav.innerHTML = ''; main.src = ''; 
        if (!imageString) { nav.style.display = 'none'; return; }
        const urls = imageString.split(',');
        urls.forEach((url, i) => {
            const img = document.createElement('img'); img.src = url.trim();
            if (i === 0) { img.classList.add('active'); main.src = url.trim(); }
            img.addEventListener('click', function() { main.src = url.trim(); nav.querySelectorAll('img').forEach(t => t.classList.remove('active')); this.classList.add('active'); });
            nav.appendChild(img);
        });
        nav.style.display = urls.length <= 1 ? 'none' : 'flex';
    }

    function openDetail(data) {
        if(!detailModal) return;
        document.getElementById('modalTitle').textContent = data.title || '';
        document.getElementById('modalDetails').textContent = data.details || '';
        document.getElementById('modalBudget').textContent = data.price ? `Price: ${data.price}` : ''; // Changed data.budget to data.price and updated the label
        
        // The following lines for highlight, hours, phone, and parking were removed

        updateGallery(data.images);
        
        const tagBox = document.getElementById('modalTags'); tagBox.innerHTML = '';
        if(data.tags) data.tags.split(' ').forEach(t => {
            if(t.startsWith('#')) { const s = document.createElement('span'); s.className='modal-tag'; s.textContent=t; tagBox.appendChild(s); }
        });

        // Map button logic was removed
        // const mapBtn = document.getElementById('googleMapBtn');
        // if(mapBtn) {
        //     mapBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.title)}`;
        // }

        detailModal.style.display = 'flex'; 
        document.body.style.overflow = 'hidden';
    }

    document.querySelectorAll('.location-card').forEach(card => {
        // Heart Click
        const favBtn = card.querySelector('.favorite-btn');
        if(favBtn) {
            favBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const title = card.getAttribute('data-title');
                toggleFavorite(title, this);
            });
        }

        // Card Click
        card.addEventListener('click', function(e) {
            if(e.target.closest('.favorite-btn')) return;
            openDetail({
                title: this.getAttribute('data-title'),
                details: this.getAttribute('data-details'),
                price: this.getAttribute('data-price'), 
                highlight: this.getAttribute('data-highlight'),
                hours: this.getAttribute('data-hours'),
                phone: this.getAttribute('data-phone'),
                parking: this.getAttribute('data-parking'),
                tags: this.getAttribute('data-tags'),
                images: this.getAttribute('data-images')
            });
        });
    });

    function closeModal(m) { if(m) m.style.display='none'; document.body.style.overflow='auto'; }
    if(detailClose) detailClose.addEventListener('click', () => closeModal(detailModal));
    window.addEventListener('click', (e) => { 
        if(e.target === detailModal) closeModal(detailModal); 
    });

    showHomePage();
});