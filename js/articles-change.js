/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function loadChangeLog() {
    fetch('/articles-change.json')
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.json();
        })
        .then(function (data) {
            renderChangeLog(data.articles);
        })
        .catch(function (err) {
            console.error('加载更新日志时出错:', err);
            var container = document.getElementById('change-container');
            if (container) {
                container.innerHTML = '<p class="error-message">无法加载更新日志，请稍后重试。</p>';
            }
        });
}

function renderChangeLog(articles) {
    var container = document.getElementById('change-container');
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
        container.appendChild(createChangeLogEntry(entry));
    });
}

function createChangeLogEntry(entry) {
    var el = document.createElement('div');
    el.className = 'change-entry fade-in';

    var contentHtml = typeof marked !== 'undefined' && marked.parse
        ? marked.parse(entry.content)
        : '<pre>' + escapeHtml(entry.content) + '</pre>';

    el.innerHTML = [
        '<div class="change-entry-header">',
        '  <span class="change-entry-date"><i class="far fa-calendar"></i> ' + entry.date + '</span>',
        '  <h3 class="change-entry-title"><span class="change-badge change-badge-' + escapeHtml(entry.type || 'other') + '">' + escapeHtml(entry.type || 'other') + '</span>' + escapeHtml(entry.title) + '</h3>',
        '</div>',
        '<div class="change-entry-body">' + contentHtml + '</div>'
    ].join('\n');

    return el;
}
