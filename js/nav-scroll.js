/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function setFadeInState() {
    var elements = document.querySelectorAll('.fade-in');
    elements.forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    });
}

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

    setFadeInState();
    fadeInOnScroll();
}

function setNavLock(locked) {
    localStorage.setItem('nav_locked', locked);
    var header = document.querySelector('header');
    if (header && locked) {
        header.classList.remove('nav-hidden');
    }
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
