/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

var allArticles = [];
var currentFilter = 'all';
var viewMode = localStorage.getItem('change-view-mode') || 'user';

function loadChangeLog() {
    var lang = (window.__currentLang || 'zh').split('-')[0];
    var url = '/data/articles-change-' + lang + '.json';
    fetch(url).then(function (resp) {
        if (!resp.ok) return fetch('/data/articles-change-zh.json');
        return resp;
    })
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.json();
        })
        .then(function (data) {
            allArticles = data.articles;
            initViewMode();
            renderFilters();
            renderChangeLog('all');
        })
        .catch(function (err) {
            console.error('加载更新日志时出错:', err);
            var container = document.getElementById('change-container');
            if (container) {
                container.innerHTML = '<p class="error-message">' + t('change.loadError') + '</p>';
            }
        });
}

function initViewMode() {
    var container = document.getElementById('change-mode-bar');
    if (!container) return;
    var btns = container.querySelectorAll('.change-mode-btn');
    btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.mode === viewMode);
        btn.addEventListener('click', function () {
            toggleViewMode(btn.dataset.mode);
        });
    });
}

function toggleViewMode(mode) {
    if (mode === viewMode) return;
    viewMode = mode;
    localStorage.setItem('change-view-mode', mode);
    var btns = document.querySelectorAll('.change-mode-btn');
    btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    var filterType = currentFilter;
    if (mode === 'user' && filterType === 'chore') {
        filterType = 'all';
    }
    currentFilter = filterType;
    renderFilters();
    renderChangeLog(filterType);
}

function renderFilters() {
    var container = document.getElementById('change-filters');
    if (!container) return;

    var labels = {
        all: t('change.all'),
        feat: t('change.feat'),
        fix: t('change.fix'),
        chore: t('change.chore')
    };

    var types = ['all', 'feat', 'fix', 'chore'].filter(function (t) {
        if (t === 'all') return true;
        if (viewMode === 'user' && t === 'chore') return false;
        return allArticles.some(function (e) { return e.type === t; });
    });

    container.innerHTML = '';
    types.forEach(function (type) {
        var btn = document.createElement('button');
        btn.className = 'change-filter-btn' + (type === currentFilter ? ' active' : '');
        btn.textContent = labels[type] || type;
        btn.dataset.type = type;
        btn.addEventListener('click', function () {
            filterChangeLog(type);
        });
        container.appendChild(btn);
    });
}

function filterChangeLog(type) {
    currentFilter = type;
    renderChangeLog(type);
    var btns = document.querySelectorAll('.change-filter-btn');
    btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
}

function renderChangeLog(filterType) {
    var container = document.getElementById('change-container');
    if (!container) return;

    var filtered = allArticles;
    if (viewMode === 'user') {
        filtered = filtered.filter(function (entry) {
            return entry.type !== 'chore';
        });
    }
    if (filterType && filterType !== 'all') {
        filtered = filtered.filter(function (entry) {
            return entry.type === filterType;
        });
    }

    if (!filtered || filtered.length === 0) {
        container.innerHTML = '<p class="no-articles">' + t('change.empty') + '</p>';
        return;
    }

    var sorted = filtered.slice().sort(function (a, b) {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return 0;
    });

    container.innerHTML = '';
    sorted.forEach(function (entry) {
        container.appendChild(createChangeLogEntry(entry));
    });
}

function formatDate(dateStr) {
    var parts = dateStr.split(' ');
    var datePart = parts[0];
    var timePart = parts[1];
    var icon = timePart
        ? '<i class="far fa-calendar-alt"></i> ' + datePart + ' <i class="far fa-clock"></i> ' + timePart
        : '<i class="far fa-calendar"></i> ' + datePart;
    return icon;
}

function createChangeLogEntry(entry) {
    var el = document.createElement('div');
    el.className = 'change-entry fade-in';

    var contentHtml = typeof marked !== 'undefined' && marked.parse
        ? marked.parse(entry.content)
        : '<pre>' + escapeHtml(entry.content) + '</pre>';

    el.innerHTML = [
        '<div class="change-entry-header">',
        '  <span class="change-entry-date">' + formatDate(entry.date) + '</span>',
        '  <h3 class="change-entry-title"><span class="change-badge change-badge-' + escapeHtml(entry.type || 'other') + '">' + escapeHtml(entry.type || 'other') + '</span>' + escapeHtml(entry.title) + '</h3>',
        '</div>',
        '<div class="change-entry-body">' + contentHtml + '</div>'
    ].join('\n');

    return el;
}
