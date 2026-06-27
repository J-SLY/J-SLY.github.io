/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

var allArticles = [];
var currentFilter = 'all';

function loadChangeLog() {
    fetch('/articles-change.json')
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.json();
        })
        .then(function (data) {
            allArticles = data.articles;
            renderFilters();
            renderChangeLog('all');
        })
        .catch(function (err) {
            console.error('加载更新日志时出错:', err);
            var container = document.getElementById('change-container');
            if (container) {
                container.innerHTML = '<p class="error-message">无法加载更新日志，请稍后重试。</p>';
            }
        });
}

function renderFilters() {
    var container = document.getElementById('change-filters');
    if (!container) return;

    var labels = {
        all: '全部',
        feat: '功能更新',
        fix: 'Bug 修复',
        chore: '杂项'
    };

    var types = ['all', 'feat', 'fix', 'chore'].filter(function (t) {
        return t === 'all' || allArticles.some(function (e) { return e.type === t; });
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
    if (filterType && filterType !== 'all') {
        filtered = allArticles.filter(function (entry) {
            return entry.type === filterType;
        });
    }

    if (!filtered || filtered.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无更新日志。</p>';
        return;
    }

    function parseDate(str) {
        var iso = str.indexOf(' ') !== -1 ? str.replace(' ', 'T') : str + 'T00:00';
        return new Date(iso);
    }
    var sorted = filtered.slice().sort(function (a, b) {
        return parseDate(b.date) - parseDate(a.date);
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
