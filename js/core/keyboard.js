/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

        var key = e.key;

        if (key === '?') {
            e.preventDefault();
            toggleShortcutsHelp();
            return;
        }

        if (key === '/' || key === 's' || key === 'S') {
            e.preventDefault();
            var searchIcon = document.querySelector('.search-icon');
            if (searchIcon) searchIcon.click();
            return;
        }

        if (key === 'j' || key === 'k') {
            var modal = document.querySelector('.article-modal');
            if (!modal) return;
            e.preventDefault();
            navigateArticle(key === 'j' ? 1 : -1);
        }
    });
}

function navigateArticle(direction) {
    var data = window.articlesData || [];
    if (!data.length) return;

    var modal = document.querySelector('.article-modal');
    if (!modal) return;

    var currentId = null;
    var detailEl = modal.querySelector('.article-detail');
    if (detailEl && detailEl.dataset.articleId) {
        currentId = Number(detailEl.dataset.articleId);
    } else {
        var titleEl = modal.querySelector('h1');
        if (!titleEl) return;
        var currentTitle = titleEl.textContent;
        var found = false;
        for (var i = 0; i < data.length; i++) {
            if (data[i].title === currentTitle) {
                currentId = data[i].id;
                found = true;
                break;
            }
        }
        if (!found) return;
    }

    var idx = -1;
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === currentId) {
            idx = i;
            break;
        }
    }

    if (idx === -1) return;

    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= data.length) return;

    var nextArticle = data[newIdx];
    if (typeof showArticleDetail === 'function') {
        showArticleDetail(nextArticle);
    }
}

function toggleShortcutsHelp() {
    var existing = document.getElementById('shortcuts-help-modal');
    if (existing) {
        closeShortcutsHelp(existing);
        return;
    }

    var overlay = document.createElement('div');
    overlay.id = 'shortcuts-help-modal';
    overlay.className = 'shortcuts-help-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Keyboard shortcuts');

    var lang = typeof t === 'function';
    var shortcuts = [
        { key: '?', desc: lang ? t('shortcuts.help') || '显示此帮助' : '显示此帮助' },
        { key: 's / /', desc: lang ? t('shortcuts.search') || '打开搜索' : '打开搜索' },
        { key: 'j / k', desc: lang ? t('shortcuts.prevNext') || '上一篇/下一篇' : '上一篇/下一篇' },
        { key: 'Esc', desc: lang ? t('shortcuts.close') || '关闭弹窗' : '关闭弹窗' },
        { key: '\u2191\u2193', desc: lang ? t('shortcuts.navigate') || '搜索结果导航' : '搜索结果导航' },
        { key: 'Enter', desc: lang ? t('shortcuts.select') || '选中搜索结果' : '选中搜索结果' }
    ];

    overlay.innerHTML = [
        '<div class="shortcuts-help-content">',
        '  <span class="shortcuts-help-close">&times;</span>',
        '  <h3>' + (lang ? t('shortcuts.title') || '快捷键' : '快捷键') + '</h3>',
        '  <table class="shortcuts-table">',
        shortcuts.map(function (s) {
            return '    <tr><td><kbd>' + s.key + '</kbd></td><td>' + s.desc + '</td></tr>';
        }).join('\n'),
        '  </table>',
        '</div>'
    ].join('\n');

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.querySelector('.shortcuts-help-close').addEventListener('click', function () {
        closeShortcutsHelp(overlay);
    });
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closeShortcutsHelp(overlay);
    });
}

function closeShortcutsHelp(overlay) {
    if (overlay && overlay.parentNode) {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
    }
}
