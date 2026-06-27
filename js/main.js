/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

document.addEventListener('DOMContentLoaded', function() {
    loadArticlesFromJSON();
    initNavigation();
    initSearch();
    initDarkMode();
    initSettings();
    initNavScroll();

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (window.innerWidth <= 992) {
        navLinks.style.display = 'none';
    }

    menuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    window.addEventListener('resize', function() {
        navLinks.style.display = window.innerWidth > 992 ? 'flex' : 'none';
    });

    window.addEventListener('scroll', updateNavOnScroll);
});

window.addEventListener('scroll', fadeInOnScroll);
