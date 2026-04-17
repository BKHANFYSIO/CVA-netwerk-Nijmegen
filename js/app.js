/* ============================================
   CVA Netwerk Nijmegen – Main Application Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initDropdowns();
    initMobileMenu();
    initScrollAnimations();
    initAccordions();
    renderLinks();
    renderArticles();
});

/* ── Navbar scroll effect ── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('section[id]');

    // Add scrolled class on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkSection = link.getAttribute('data-section');
            if (linkSection === current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                // Close mobile menu if open
                closeMobileMenu();
                // Close dropdowns
                closeAllDropdowns();

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ── Dropdown menus ── */
function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isOpen = dropdown.classList.contains('open');
            closeAllDropdowns();

            if (!isOpen) {
                dropdown.classList.add('open');
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            closeAllDropdowns();
        }
    });
}

function closeAllDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
}

/* ── Mobile menu ── */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const overlay = document.getElementById('mobileOverlay');

    toggle.addEventListener('click', () => {
        const isOpen = menu.classList.contains('open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            menu.classList.add('open');
            toggle.classList.add('active');
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    });

    overlay.addEventListener('click', closeMobileMenu);
}

function closeMobileMenu() {
    const menu = document.getElementById('navMenu');
    const toggle = document.getElementById('navToggle');
    const overlay = document.getElementById('mobileOverlay');

    menu.classList.remove('open');
    toggle.classList.remove('active');
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
}

/* ── Scroll animations (Intersection Observer) ── */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

/* ── Accordion ── */
function handleAccordionClick(event) {
    const trigger = event.currentTarget;
    const item = trigger.closest('.accordion-item');
    if (!item) {
        return;
    }

    const content = item.querySelector('.accordion-content');
    if (!content) {
        return;
    }

    const isOpen = item.classList.contains('open');
    const parent = item.parentElement;
    if (!parent) {
        return;
    }

    parent.querySelectorAll('.accordion-item').forEach(sibling => {
        sibling.classList.remove('open');
        const siblingTrigger = sibling.querySelector('.accordion-trigger');
        const siblingContent = sibling.querySelector('.accordion-content');
        if (siblingTrigger) {
            siblingTrigger.setAttribute('aria-expanded', 'false');
        }
        if (siblingContent) {
            siblingContent.style.maxHeight = '0';
        }
    });

    if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => {
            content.style.maxHeight = `${content.scrollHeight}px`;
        });
    }
}

/** Bindt alleen triggers die nog geen listener hebben (voorkomt dubbele init na renderArticles). */
function initAccordions(root = document) {
    root.querySelectorAll('.accordion-trigger:not([data-accordion-bound])').forEach(trigger => {
        trigger.setAttribute('data-accordion-bound', 'true');
        trigger.addEventListener('click', handleAccordionClick);
    });
}

/* ── Render Links ── */
function renderLinks() {
    const verwijzersList = document.getElementById('verwijzersLinksList');
    const cvaList = document.getElementById('cvaLinksList');

    if (verwijzersList && typeof linksVerwijzers !== 'undefined') {
        verwijzersList.innerHTML = linksVerwijzers.map(link => createLinkItem(link)).join('');
    }

    if (cvaList && typeof linksCVA !== 'undefined') {
        cvaList.innerHTML = linksCVA.map(link => createLinkItem(link)).join('');
    }
}

function createLinkItem(link) {
    return `
    <a href="${link.url}" class="link-item" target="_blank" rel="noopener noreferrer">
      <div class="link-item-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </div>
      <div class="link-item-content">
        <h4>${link.titel}</h4>
        <p>${link.beschrijving}</p>
      </div>
    </a>
  `;
}

/* ── Render Articles ── */
function renderArticles() {
    const container = document.getElementById('articlesContainer');
    if (!container || typeof articles === 'undefined') return;

    container.innerHTML = articles.map((article, index) => `
    <div class="accordion-item ${index === 0 ? 'open' : ''}">
      <button class="accordion-trigger" aria-expanded="${index === 0 ? 'true' : 'false'}">
        ${article.titel}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="accordion-content" ${index === 0 ? 'style="max-height: 1000px;"' : ''}>
        <div class="accordion-content-inner">
          ${article.inhoud}
        </div>
      </div>
    </div>
  `).join('');

    initAccordions(container);
}
