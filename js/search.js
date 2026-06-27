/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function findPinyinMatchRange(text, query) {
    if (window.pinyinPro && query.length >= 2 && /[\u4e00-\u9fff]/.test(text)) {
        const pinyinArr = pinyinPro.pinyin(text, { type: 'array', toneType: 'none' });
        const pinyinStr = pinyinArr.join('').toLowerCase();
        const pIdx = pinyinStr.indexOf(query);
        if (pIdx !== -1) {
            let pos = 0;
            let startChar = -1;
            let endChar = [...text].length;
            for (let i = 0; i < pinyinArr.length; i++) {
                const end = pos + pinyinArr[i].length;
                if (startChar === -1 && pIdx < end) {
                    startChar = i;
                }
                if (startChar !== -1 && pIdx + query.length <= end) {
                    endChar = i + 1;
                    break;
                }
                pos = end;
            }
            if (startChar !== -1) {
                return { start: startChar, end: endChar };
            }
        }
    }
    return null;
}

function initSearch(options) {
    options = options || {};
    var dataSource = options.dataSource || (typeof window !== 'undefined' ? window.articlesData : null) || [];
    var onOpenArticle = options.onOpenArticle || (typeof window !== 'undefined' ? window.openArticle : null) || function() {};

    var searchIcon = document.querySelector('.search-icon');
    searchIcon.style.cursor = 'pointer';

    searchIcon.addEventListener('click', function() {
        var existing = document.querySelector('.search-modal');
        if (existing) return;

        var modal = document.createElement('div');
        modal.className = 'search-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', '搜索');
        modal.innerHTML = [
            '<div class="search-modal-content">',
            '  <div class="search-modal-header">',
            '    <input type="text" class="search-input" placeholder="搜索文章标题、标签、内容..." autofocus>',
            '    <span class="search-close">&times;</span>',
            '  </div>',
            '  <div class="search-results"></div>',
            '  <div class="search-hint">输入关键词搜索，支持标题、标签、摘要和内容</div>',
            '</div>'
        ].join('\n');

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        var input = modal.querySelector('.search-input');
        var results = modal.querySelector('.search-results');
        var closeBtn = modal.querySelector('.search-close');

        input.focus();

        function closeSearch() {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        }

        closeBtn.addEventListener('click', closeSearch);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeSearch();
        });

        var selectedIndex = -1;

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSearch();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                var items = results.querySelectorAll('.search-result-item');
                if (items.length === 0) return;
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                items.forEach(function(el, i) { el.classList.toggle('selected', i === selectedIndex); });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                var items = results.querySelectorAll('.search-result-item');
                if (items.length === 0) return;
                selectedIndex = Math.max(selectedIndex - 1, 0);
                items.forEach(function(el, i) { el.classList.toggle('selected', i === selectedIndex); });
            } else if (e.key === 'Enter') {
                var items = results.querySelectorAll('.search-result-item');
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    items[selectedIndex].click();
                }
            }
        });

        function matchPinyin(text, query) {
            return findPinyinMatchRange(text, query) !== null;
        }

        input.addEventListener('input', function() {
            var q = this.value.trim().toLowerCase();
            if (!q) {
                results.innerHTML = '';
                return;
            }

            var matches = dataSource.filter(function(a) {
                return a.title.toLowerCase().includes(q) ||
                    matchPinyin(a.title, q) ||
                    (a.tags && a.tags.some(function(t) { return t.toLowerCase().includes(q) || matchPinyin(t, q); })) ||
                    a.excerpt.toLowerCase().includes(q) ||
                    matchPinyin(a.excerpt, q) ||
                    a.content.join('\n').toLowerCase().includes(q);
            });

            if (matches.length === 0) {
                results.innerHTML = '<div class="search-empty">未找到匹配的文章</div>';
                return;
            }

            results.innerHTML = matches.map(function(a) {
                var contentText = a.content.join('\n').replace(/[#*\-`]+/g, '').replace(/\s{2,}/g, ' ');
                var excerptText = contentText.slice(0, 120);
                return [
                    '<div class="search-result-item" data-id="' + a.id + '">',
                    '  <div class="search-result-title">' + highlight(a.title, q) + '</div>',
                    '  <div class="search-result-excerpt">' + highlight(excerptText, q) + '</div>',
                    '  <div class="search-result-meta">',
                    '    ' + (a.tags ? a.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') : ''),
                    '    <span>' + a.date + '</span>',
                    '  </div>',
                    '</div>'
                ].join('\n');
            }).join('');

            selectedIndex = -1;

            results.querySelectorAll('.search-result-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    var id = parseInt(this.dataset.id);
                    var article = dataSource.find(function(a) { return a.id === id; });
                    if (article) {
                        closeSearch();
                        onOpenArticle(article);
                    }
                });
            });
        });
    });
}

function highlight(text, query) {
    const idx = text.toLowerCase().indexOf(query);
    if (idx !== -1) {
        return text.slice(0, idx) + '<strong>' + text.slice(idx, idx + query.length) + '</strong>' + text.slice(idx + query.length);
    }

    const range = findPinyinMatchRange(text, query);
    if (range) {
        return text.slice(0, range.start) + '<strong>' + text.slice(range.start, range.end) + '</strong>' + text.slice(range.end);
    }

    return text;
}
