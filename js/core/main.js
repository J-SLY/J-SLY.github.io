/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initDarkMode();
    initSettings();
    initNavScroll();
    initMobileMenu();
    initBackToTop();
    initKeyboardShortcuts();
    loadArticlesFromJSON();
    window.addEventListener('scroll', updateNavOnScroll);
});

window.addEventListener('scroll', fadeInOnScroll);
