/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesData = [];

function loadArticlesFromJSON() {
    var lang = (window.__currentLang || 'zh').split('-')[0];
    var url = '/data/articles-' + lang + '.json';
    return fetch(url).then(function (resp) {
        if (!resp.ok) return fetch('/data/articles-zh.json');
        return resp;
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response not ok');
            return response.json();
        })
        .then(data => {
            articlesData = data.articles;
            renderAllArticles();
            openArticleFromHash();
            if (typeof initSearch === 'function') {
                initSearch({ dataSource: articlesData });
            }
        })
        .catch(error => {
            console.error('加载文章数据时出错:', error);
            document.getElementById('articles-container').innerHTML =
                '<p class="error-message">' + t('article.loadError') + '</p>';
        });
}

function renderAllArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    const sorted = [...articlesData].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });
    renderArticlesToContainer(sorted, container);
}

function renderArticlesToContainer(articles, container) {
    if (!container) return;
    if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">' + t('article.empty') + '</p>';
        return;
    }
    articles.forEach(article => {
        container.appendChild(createArticleElement(article));
    });
    addArticleClickEvents();
}

function createArticleElement(article) {
    const articleCard = document.createElement('article');
    articleCard.className = 'article-card fade-in';
    articleCard.setAttribute('data-article-id', article.id);

    var pinnedText = t('article.pinned');
    const pinnedBadge = article.pinned ? '<span class="pinned-badge"><i class="fas fa-thumbtack"></i> ' + pinnedText + '</span>' : '';
    var safeTitle = escapeHtml(article.title);
    var imageHtml = article.image
        ? `<div class="article-image">${pinnedBadge}<img src="${article.image}" alt="${safeTitle}" loading="lazy"></div>`
        : `<div class="article-image article-image-placeholder">${pinnedBadge}<span>${safeTitle}</span></div>`;
    var tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${article.tags.map(function(tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join('')}</div>`
        : '';
    articleCard.innerHTML = [
        imageHtml,
        '<div class="article-content">',
        '  <h3>' + safeTitle + '</h3>',
        '  ' + tagsHtml,
        '  <p>' + escapeHtml(article.excerpt) + '</p>',
        '  <div class="article-meta">',
        '    <span><i class="far fa-calendar"></i> ' + escapeHtml(article.date) + '</span>',
        '    <span><i class="far fa-clock"></i> ' + (article.readTimeMinutes ? t('article.readTime', {minutes: article.readTimeMinutes}) : escapeHtml(article.readTime)) + '</span>',
        '    <span><i class="far fa-eye"></i> ' + escapeHtml('' + article.views) + '</span>',
        '  </div>',
        '</div>'
    ].join('\n');

    return articleCard;
}

function addArticleClickEvents() {
    document.querySelectorAll('.article-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article-id');
            const article = articlesData.find(a => a.id === Number(articleId));
            if (article) openArticle(article);
        });
    });
}
