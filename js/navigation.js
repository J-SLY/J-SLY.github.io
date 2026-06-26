/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initNavigation() {
    document.querySelectorAll('.nav-links a, .footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href.startsWith('mailto:') || href.startsWith('http:') || href.startsWith('https:')) return;
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
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}

const fadeInOnScroll = function() {
    const fadeElements = document.querySelectorAll('.fade-in');

    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
};

function initNavScroll() {
    var header = document.querySelector('header');
    if (!header) return;

    var lastScrollY = window.scrollY;
    var ticking = false;

    function isLocked() {
        return localStorage.getItem('nav_locked') === 'true';
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                var currentScrollY = window.scrollY;

                if (isLocked()) {
                    header.classList.remove('nav-hidden');
                } else if (currentScrollY < lastScrollY) {
                    header.classList.remove('nav-hidden');
                } else if (currentScrollY > header.offsetHeight && currentScrollY > lastScrollY + 10) {
                    header.classList.add('nav-hidden');
                }

                lastScrollY = currentScrollY;
                ticking = false;
            });
            ticking = true;
        }
    });
}

function setNavLock(locked) {
    localStorage.setItem('nav_locked', locked);
    var header = document.querySelector('header');
    if (header && locked) {
        header.classList.remove('nav-hidden');
    }
}
