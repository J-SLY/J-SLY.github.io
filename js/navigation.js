/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initNavigation() {
    document.querySelectorAll('.nav-links a, .footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href.startsWith('mailto:') || href.startsWith('http:') || href.startsWith('https:') || !href.startsWith('#')) return;
            e.preventDefault();

            const targetId = href.startsWith('#') ? href.substring(1) : href;
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                updateActiveNav(this);

                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function updateActiveNav(clickedLink) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    if (clickedLink.closest('.nav-links')) {
        clickedLink.classList.add('active');
    }
}

function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const headerHeight = document.querySelector('header').offsetHeight;

        if (scrollY >= (sectionTop - headerHeight - 50)) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}
