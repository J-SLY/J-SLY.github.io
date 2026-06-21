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

function initSearch() {
    const searchIcon = document.querySelector('.search-icon');
    searchIcon.style.cursor = 'pointer';

    searchIcon.addEventListener('click', function() {
        const existing = document.querySelector('.search-modal');
        if (existing) return;

        const modal = document.createElement('div');
        modal.className = 'search-modal';
        modal.innerHTML = `
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <input type="text" class="search-input" placeholder="搜索文章标题、标签、内容..." autofocus>
                    <span class="search-close">&times;</span>
                </div>
                <div class="search-results"></div>
                <div class="search-hint">输入关键词搜索，支持标题、标签、摘要和内容</div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const input = modal.querySelector('.search-input');
        const results = modal.querySelector('.search-results');
        const closeBtn = modal.querySelector('.search-close');

        input.focus();

        const closeSearch = () => {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        };

        closeBtn.addEventListener('click', closeSearch);
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeSearch();
        });

        let selectedIndex = -1;

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSearch();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const items = results.querySelectorAll('.search-result-item');
                if (items.length === 0) return;
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                items.forEach((el, i) => el.classList.toggle('selected', i === selectedIndex));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const items = results.querySelectorAll('.search-result-item');
                if (items.length === 0) return;
                selectedIndex = Math.max(selectedIndex - 1, 0);
                items.forEach((el, i) => el.classList.toggle('selected', i === selectedIndex));
            } else if (e.key === 'Enter') {
                const items = results.querySelectorAll('.search-result-item');
                if (selectedIndex >= 0 && selectedIndex < items.length) {
                    items[selectedIndex].click();
                }
            }
        });

        function matchPinyin(text, query) {
            return findPinyinMatchRange(text, query) !== null;
        }

        input.addEventListener('input', function() {
            const q = this.value.trim().toLowerCase();
            if (!q) {
                results.innerHTML = '';
                return;
            }

            const matches = articlesData.filter(a =>
                a.title.toLowerCase().includes(q) ||
                matchPinyin(a.title, q) ||
                (a.tags && a.tags.some(t => t.toLowerCase().includes(q) || matchPinyin(t, q))) ||
                a.excerpt.toLowerCase().includes(q) ||
                matchPinyin(a.excerpt, q) ||
                a.content.join('\n').toLowerCase().includes(q)
            );

            if (matches.length === 0) {
                results.innerHTML = '<div class="search-empty">未找到匹配的文章</div>';
                return;
            }

            results.innerHTML = matches.map(a => {
                const contentText = a.content.join('\n').replace(/[#*\-`]+/g, '').replace(/\s{2,}/g, ' ');
                const excerptText = contentText.slice(0, 120);
                return `
                <div class="search-result-item" data-id="${a.id}">
                    <div class="search-result-title">${highlight(a.title, q)}</div>
                    <div class="search-result-excerpt">${highlight(excerptText, q)}</div>
                    <div class="search-result-meta">
                        ${a.tags ? a.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
                        <span>${a.date}</span>
                    </div>
                </div>
            `}).join('');

            selectedIndex = -1;

            results.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    const article = articlesData.find(a => a.id === id);
                    if (article) {
                        closeSearch();
                        showArticleDetail(article);
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
