/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

document.addEventListener('DOMContentLoaded', function() {
    loadArticlesFromJSON();
    initNavigation();
    initSearch();

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (window.innerWidth <= 992) {
        navLinks.style.display = 'none';
    }

    menuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });

    // Reading progress bar
    const progressBar = document.getElementById('reading-progress-bar');
    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = progress + '%';
        } else {
            progressBar.style.width = '0%';
        }
    });

    window.addEventListener('scroll', updateNavOnScroll);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    });

    // Dark mode toggle
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const icon = darkModeToggle.querySelector('i');

    // Check saved preference
    const savedTheme = localStorage.getItem('theme');
    let initialDark = false;
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
        initialDark = true;
    } else if (savedTheme === 'light') {
        // do nothing, default light
    } else {
        // No saved preference, check system
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
            initialDark = true;
        }
    }
    updateProfileCardTheme(initialDark);

    function updateGiscusTheme(isDark) {
        const theme = isDark ? 'dark' : 'light';
        const giscusIframe = document.querySelector('giscus-widget iframe');
        if (giscusIframe) {
            giscusIframe.contentWindow.postMessage({ giscus: { setConfig: { theme: theme } } }, 'https://giscus.app');
        }
    }

    function updateProfileCardTheme(isDark) {
        const img = document.querySelector('.about-content img');
        if (img) {
            const base = 'https://www.cpoauth.com/api/users/JSLY/card.svg?lang=en';
            img.src = isDark ? base + '&theme=dark' : base;
        }
    }

    function applyDarkTheme(isDark) {
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
        updateGiscusTheme(isDark);
        updateProfileCardTheme(isDark);
    }

    darkModeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        applyDarkTheme(isDark);
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const isDark = e.matches;
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                document.documentElement.classList.remove('dark-mode');
                icon.classList.replace('fa-sun', 'fa-moon');
            }
            updateGiscusTheme(isDark);
            updateProfileCardTheme(isDark);
        }
    });
});

window.addEventListener('scroll', fadeInOnScroll);
