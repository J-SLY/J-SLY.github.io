/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function loadChangelog() {
    fetch('/articles-changelog.json')
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.json();
        })
        .then(function (data) {
            renderChangelog(data.articles);
        })
        .catch(function (err) {
            console.error('加载更新日志时出错:', err);
            var container = document.getElementById('changelog-container');
            if (container) {
                container.innerHTML = '<p class="error-message">无法加载更新日志，请稍后重试。</p>';
            }
        });
}

function renderChangelog(articles) {
    var container = document.getElementById('changelog-container');
    if (!container) return;

    if (!articles || articles.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无更新日志。</p>';
        return;
    }

    var sorted = articles.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    container.innerHTML = '';
    sorted.forEach(function (entry) {
        container.appendChild(createChangelogEntry(entry));
    });
}

function createChangelogEntry(entry) {
    var el = document.createElement('div');
    el.className = 'changelog-entry fade-in';

    var contentHtml = marked.parse
        ? marked.parse(entry.content)
        : '<pre>' + escapeHtml(entry.content) + '</pre>';

    el.innerHTML = [
        '<div class="changelog-entry-header">',
        '  <span class="changelog-entry-date"><i class="far fa-calendar"></i> ' + entry.date + '</span>',
        '  <h3 class="changelog-entry-title">' + escapeHtml(entry.title) + '</h3>',
        '</div>',
        '<div class="changelog-entry-body">' + contentHtml + '</div>'
    ].join('\n');

    return el;
}
