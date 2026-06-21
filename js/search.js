/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

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

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSearch();
        });

        function matchPinyin(text, query) {
            if (window.pinyinPro && /[\u4e00-\u9fff]/.test(text)) {
                return pinyinPro.match(text, query) !== null;
            }
            return false;
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

            results.innerHTML = matches.map(a => `
                <div class="search-result-item" data-id="${a.id}">
                    <div class="search-result-title">${highlight(a.title, q)}</div>
                    <div class="search-result-meta">
                        ${a.tags ? a.tags.map(t => `<span class="tag">${t}</span>`).join('') : ''}
                        <span>${a.date}</span>
                    </div>
                </div>
            `).join('');

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

    if (window.pinyinPro && /[\u4e00-\u9fff]/.test(text)) {
        const matches = pinyinPro.match(text, query);
        if (matches && matches.length > 0) {
            let result = '';
            let lastEnd = 0;
            matches.forEach(m => {
                result += text.slice(lastEnd, m.start);
                result += '<strong>' + text.slice(m.start, m.end) + '</strong>';
                lastEnd = m.end;
            });
            result += text.slice(lastEnd);
            return result;
        }
    }

    return text;
}
