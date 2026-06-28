/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function buildArticleContent(article, showHero) {
    if (showHero === undefined) showHero = true;
    if (article.showImage === false) showHero = false;
    const contentHtml = marked.parse(article.content.join('\n'));

    const heroHtml = showHero
        ? (article.image
            ? `<div class="article-hero"><img src="${article.image}" alt="${escapeHtml(article.title)}"></div>`
            : `<div class="article-hero article-hero-placeholder"><span>${escapeHtml(article.title)}</span></div>`)
        : '';

    const tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`
        : '';

    return `
        ${heroHtml}
        <div class="article-layout">
            <div class="article-toc-sidebar"></div>
            <div class="article-body">
                <h2>${escapeHtml(article.title)}</h2>
                ${tagsHtml}
                <div class="article-meta">
                    <span><i class="far fa-calendar"></i> ${escapeHtml(article.date)}</span>
                    <span><i class="far fa-clock"></i> ${article.readTimeMinutes ? t('article.readTime', {minutes: article.readTimeMinutes}) : escapeHtml(article.readTime)}</span>
                    <span><i class="far fa-eye"></i> ${escapeHtml('' + article.views)}</span>
                </div>
                <div class="article-content markdown-body">
                    ${contentHtml}
                </div>
                <div class="article-actions">
                    <button class="btn share-btn">
                        <i class="fas fa-share"></i> ${t('share.button')}
                    </button>
                </div>
                <div class="article-comments giscus"></div>
            </div>
        </div>
    `;
}

function initArticleHighlights(container) {
    if (typeof hljs === 'undefined') return;
    container.querySelectorAll('.markdown-body pre code').forEach((block) => {
        try { hljs.highlightElement(block); } catch (e) { /* skip failed block */ }
    });
}
