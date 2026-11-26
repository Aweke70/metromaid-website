document.addEventListener('DOMContentLoaded', () => {
    // --- Sticky Navigation Background Accent ---
    const header = document.querySelector('.main-header');

    const updateHeader = () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 50);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    // --- Mobile Navigation Drawer System ---
    const menuToggle = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const closeMenu = () => {
        if (!menuToggle || !navMenu) return;
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
        if (!menuToggle || !navMenu) return;
        const isOpen = navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
    };

    if (menuToggle && navMenu) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });

    // --- Dynamic Navigation Active Link Tracking ---
    const sections = document.querySelectorAll('section[id]');

    if ('IntersectionObserver' in window && sections.length) {
        const activeLinkObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const currentId = entry.target.getAttribute('id');

                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
                });
            });
        }, {
            rootMargin: '-30% 0px -60% 0px'
        });

        sections.forEach(section => activeLinkObserver.observe(section));
    }

    // --- FAQ Accordion System ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const faqHeader = item.querySelector('.faq-header');
        const faqBody = item.querySelector('.faq-body');

        if (!faqHeader || !faqBody) return;

        faqHeader.setAttribute('role', 'button');
        faqHeader.setAttribute('tabindex', '0');
        faqHeader.setAttribute('aria-expanded', 'false');

        const toggleFaq = () => {
            const isCurrentlyActive = item.classList.contains('active');

            faqItems.forEach(otherItem => {
                const otherHeader = otherItem.querySelector('.faq-header');
                const otherBody = otherItem.querySelector('.faq-body');

                otherItem.classList.remove('active');
                if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                if (otherBody) otherBody.style.maxHeight = null;
            });

            if (!isCurrentlyActive) {
                item.classList.add('active');
                faqHeader.setAttribute('aria-expanded', 'true');
                faqBody.style.maxHeight = `${faqBody.scrollHeight}px`;
            }
        };

        faqHeader.addEventListener('click', toggleFaq);

        faqHeader.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleFaq();
            }
        });
    });

    // Preserve campaign tags on public site links and include them in quote requests.
    const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign'];
    const pageUrl = new URL(window.location.href);
    const campaign = new URLSearchParams();
    const cleanSource = (value) => (value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120);

    campaignKeys.forEach((key) => {
        const value = cleanSource(pageUrl.searchParams.get(key));
        if (value) campaign.set(key, value);
    });

    const siteRoot = new URL('.', pageUrl);
    const publicPaths = new Set(
        ['./', 'index.html', 'valet-trash-service-dfw.html',
         'valet-trash-plano.html', 'for-property-managers.html']
            .map((path) => new URL(path, siteRoot).pathname)
    );

    if (campaign.size) {
        document.querySelectorAll('a[href]').forEach((link) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) return;
            const target = new URL(href, pageUrl);
            if (target.origin !== pageUrl.origin || !publicPaths.has(target.pathname)) return;

            // A destination with explicit campaign tags starts its own attribution.
            if (campaignKeys.some((key) => target.searchParams.has(key))) return;
            campaign.forEach((value, key) => target.searchParams.set(key, value));
            link.href = target.href;
        });
    }

    const quoteForm = document.getElementById('quoteForm');

    if (quoteForm) {
        const button = quoteForm.querySelector('button[type="submit"]');
        const status = document.getElementById('quote-status');

        quoteForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (button.disabled) return;

            const data = new FormData(quoteForm);
            campaign.forEach((value, key) => data.set(key, value));

            button.disabled = true;
            status.textContent = 'Sending your request…';

            try {
                const response = await fetch(quoteForm.action, {
                    method: 'POST',
                    body: data,
                    headers: { Accept: 'application/json' }
                });
                if (!response.ok) throw new Error('Quote request failed');

                quoteForm.reset();
                status.textContent = 'Thank you. Your quote request was sent.';
            } catch {
                status.textContent = 'We could not confirm your request. Please try again or call 972-891-5109.';
            } finally {
                button.disabled = false;
            }
        });
    }
});
