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
            window.seriesMap = buildSeriesMap(articlesData);
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
    if (!articlesData || articlesData.length === 0) {
        container.innerHTML = '<p class="no-articles">' + t('article.empty') + '</p>';
        return;
    }
    var standalone = [];
    var seriesGroups = {};
    articlesData.forEach(function (a) {
        if (a.series && a.series.name && window.seriesMap && window.seriesMap[a.series.name] && window.seriesMap[a.series.name].length > 1) {
            var name = a.series.name;
            if (!seriesGroups[name]) seriesGroups[name] = [];
            seriesGroups[name].push(a);
        } else {
            standalone.push(a);
        }
    });
    var combined = [];
    standalone.forEach(function (a) { combined.push({ type: 'article', article: a, date: a.date, pinned: !!a.pinned }); });
    Object.keys(seriesGroups).forEach(function (name) {
        var arts = seriesGroups[name];
        var latestDate = '';
        var hasPinned = false;
        arts.forEach(function (a) { if (a.date > latestDate) latestDate = a.date; if (a.pinned) hasPinned = true; });
        combined.push({ type: 'series', seriesName: name, articles: arts, date: latestDate, pinned: hasPinned });
    });
    combined.sort(function (a, b) {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });
    combined.forEach(function (item) {
        container.appendChild(item.type === 'series' ? createSeriesCardElement(item.seriesName, item.articles) : createArticleElement(item.article));
    });
    addArticleClickEvents();
}

function createSeriesCardElement(seriesName, articles) {
    var card = document.createElement('article');
    card.className = 'article-card series-card fade-in';
    var firstArticle = articles[0];
    var safeName = escapeHtml(seriesName);
    var total = articles.length;
    var imageUrl = null;
    articles.some(function (a) { if (a.image) { imageUrl = a.image; return true; } return false; });
    var imageHtml = imageUrl
        ? '<div class="article-image"><span class="series-card-badge"><i class="fas fa-layer-group"></i> ' + total + t('series.parts') + '</span><img src="' + imageUrl + '" alt="' + safeName + '" loading="lazy"></div>'
        : '<div class="article-image article-image-placeholder article-image-placeholder-series"><span class="series-card-badge"><i class="fas fa-layer-group"></i> ' + total + t('series.parts') + '</span><span>' + safeName + '</span></div>';
    var latestDate = '';
    articles.forEach(function (a) { if (a.date > latestDate) latestDate = a.date; });
    card.setAttribute('data-series-name', seriesName);
    card.innerHTML = [
        imageHtml,
        '<div class="article-content">',
        '  <h3>' + safeName + '</h3>',
        '  <div class="article-meta">',
        '    <span><i class="far fa-calendar"></i> ' + escapeHtml(latestDate) + '</span>',
        '  </div>',
        '</div>'
    ].join('\n');
    return card;
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
    document.querySelectorAll('.article-card:not(.series-card)').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article-id');
            const article = articlesData.find(a => a.id === Number(articleId));
            if (article) openArticle(article);
        });
    });
    document.querySelectorAll('.series-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            var name = this.getAttribute('data-series-name');
            if (name && window.seriesMap && window.seriesMap[name] && window.seriesMap[name].length > 0) {
                openArticle(window.seriesMap[name][0]);
            }
        });
    });
}
