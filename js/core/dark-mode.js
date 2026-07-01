/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initDarkMode() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    if (!darkModeToggle) return;
    const icon = darkModeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    let initialDark = false;
    if (savedTheme === 'dark') {
        initialDark = true;
    } else if (savedTheme === 'light') {
        initialDark = false;
    } else {
        initialDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (initialDark) {
        document.documentElement.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
    }
    applyDarkTheme(initialDark);

    function updateHighlightTheme(isDark) {
        const link = document.getElementById('hljs-theme');
        if (link) {
            link.removeAttribute('integrity');
            link.href = isDark
                ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
                : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
        }
    }

    function updateGiscusTheme(isDark) {
        const theme = isDark ? 'dark' : 'light';
        const giscusWidget = document.querySelector('giscus-widget');
        if (giscusWidget && giscusWidget.shadowRoot) {
            const iframe = giscusWidget.shadowRoot.querySelector('iframe');
            if (iframe) {
                iframe.contentWindow.postMessage({ giscus: { setConfig: { theme: theme } } }, 'https://giscus.app');
            }
        }
    }

    function updateProfileCardTheme(isDark) {
        const img = document.querySelector('.about-content img');
        if (img) {
            const base = 'https://www.cpoauth.com/api/users/JSLY/card.svg?lang=en';
            img.src = isDark ? base + '&theme=dark' : base;
        }
    }

    function updateGithubRoastTheme(isDark) {
        const img = document.getElementById('github-roast-card');
        if (img) {
            const base = 'https://githubroast.dev/api/card/J-SLY';
            img.src = isDark ? base + '?theme=dark' : base + '?theme=light';
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
        updateHighlightTheme(isDark);
        updateGiscusTheme(isDark);
        updateProfileCardTheme(isDark);
        updateGithubRoastTheme(isDark);
    }

    darkModeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        applyDarkTheme(isDark);
    });

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
            updateHighlightTheme(isDark);
            updateGiscusTheme(isDark);
            updateProfileCardTheme(isDark);
            updateGithubRoastTheme(isDark);
        }
    });
}
