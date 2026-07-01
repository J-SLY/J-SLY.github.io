/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initSettings() {
    const settingsToggle = document.querySelector('.settings-toggle');
    const settingsDropdown = document.querySelector('.settings-dropdown');
    const settingsClose = document.querySelector('.settings-close');

    if (!settingsToggle || !settingsDropdown) return;

    const currentMode = getArticleDisplayMode();
    const checkedRadio = settingsDropdown.querySelector('input[value="' + currentMode + '"]');
    if (checkedRadio) checkedRadio.checked = true;

    settingsToggle.addEventListener('click', function() {
        settingsDropdown.classList.add('show');
        document.body.style.overflow = 'hidden';
    });

    const closeSettings = function() {
        settingsDropdown.classList.remove('show');
        document.body.style.overflow = '';
    };

    if (settingsClose) {
        settingsClose.addEventListener('click', closeSettings);
    }

    settingsDropdown.addEventListener('click', function(e) {
        if (e.target === settingsDropdown) closeSettings();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && settingsDropdown.classList.contains('show')) {
            closeSettings();
        }
    });

    settingsDropdown.querySelectorAll('input[name="display-mode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) setArticleDisplayMode(this.value);
        });
    });

    let lockToggle = settingsDropdown.querySelector('#nav-lock-toggle');
    if (lockToggle) {
        lockToggle.checked = localStorage.getItem('nav_locked') === 'true';
        lockToggle.addEventListener('change', function() {
            setNavLock(this.checked);
        });
    }

    var defaultPage = localStorage.getItem('default_page') || 'main';
    var defaultPageRadio = settingsDropdown.querySelector('input[name="default-page"][value="' + defaultPage + '"]');
    if (defaultPageRadio) defaultPageRadio.checked = true;

    settingsDropdown.querySelectorAll('input[name="default-page"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            if (this.checked) localStorage.setItem('default_page', this.value);
        });
    });

    var langToggle = document.querySelector('.lang-toggle');
    var langDropdown = document.querySelector('.lang-dropdown');
    if (langToggle && langDropdown) {
        langToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            langDropdown.classList.toggle('show');
        });
        langDropdown.querySelectorAll('[data-lang]').forEach(function (el) {
            el.addEventListener('click', function (e) {
                e.preventDefault();
                langDropdown.classList.remove('show');
                if (typeof setLanguage === 'function') {
                    var lang = this.getAttribute('data-lang');
                    setLanguage(lang, true);
                }
            });
        });
        document.addEventListener('click', function () {
            langDropdown.classList.remove('show');
        });
    }
}
