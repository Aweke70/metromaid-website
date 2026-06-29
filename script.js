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

    // --- Quote Form Email Handler ---
    const quoteForm = document.getElementById('quoteForm');

    if (quoteForm) {
        quoteForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = document.getElementById('name')?.value.trim() || 'there';
            const email = document.getElementById('email')?.value.trim() || '';
            const phone = document.getElementById('phone')?.value.trim() || '';
            const community = document.getElementById('community')?.value.trim() || 'your apartment community';
            const message = document.getElementById('message')?.value.trim() || '';

            const subject = encodeURIComponent(`MetroMaid Quote Request - ${community}`);
            const body = encodeURIComponent(
`Hello MetroMaid,

I would like to request a free quote.

Name: ${name}
Email: ${email}
Phone: ${phone}
Community / Door Count: ${community}
Service Needs: ${message}

Thank you.`
            );

            const submitBtn = quoteForm.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : 'Submit Quote Request';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Opening Email...';
            }

            setTimeout(() => {
                window.location.href = `mailto:metromaiddfw@gmail.com?subject=${subject}&body=${body}`;

                alert(`Thank you, ${name}! Your quote request is ready. Please send the email that opens next.`);

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }, 600);
        });
    }
});
