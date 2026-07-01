/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesData = [];
var activeCategory = 'all';

function getCategories() {
    var cats = {};
    if (!articlesData) return [];
    articlesData.forEach(function (a) {
        var c = a.category || 'Uncategorized';
        cats[c] = true;
    });
    return Object.keys(cats).sort();
}

function renderCategoryFilter() {
    var existing = document.querySelector('.category-filter-bar');
    if (existing) existing.remove();

    var categories = getCategories();
    if (categories.length < 2) return;

    var bar = document.createElement('div');
    bar.className = 'category-filter-bar';

    var allBtn = document.createElement('button');
    allBtn.className = 'category-btn' + (activeCategory === 'all' ? ' active' : '');
    allBtn.textContent = t('category.all') || '全部';
    allBtn.setAttribute('data-cat', 'all');
    bar.appendChild(allBtn);

    categories.forEach(function (cat) {
        var btn = document.createElement('button');
        btn.className = 'category-btn' + (activeCategory === cat ? ' active' : '');
        btn.textContent = cat;
        btn.setAttribute('data-cat', cat);
        bar.appendChild(btn);
    });

    bar.addEventListener('click', function (e) {
        var btn = e.target.closest('.category-btn');
        if (!btn) return;
        activeCategory = btn.getAttribute('data-cat');
        renderAllArticles();
    });

    var sectionTitle = document.querySelector('.section-title');
    if (sectionTitle && sectionTitle.parentNode) {
        sectionTitle.parentNode.insertBefore(bar, sectionTitle.nextSibling);
    }
}

function loadArticlesFromJSON() {
    var lang = (window.__currentLang || 'zh').split('-')[0];
    var url = '/data/articles-' + lang + '.yaml';
    return fetch(url).then(function (resp) {
        if (!resp.ok) return fetch('/data/articles-zh.yaml');
        return resp;
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response not ok');
            return response.text().then(function (text) { return jsyaml.load(text); });
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
    renderCategoryFilter();
    if (!articlesData || articlesData.length === 0) {
        container.innerHTML = '<p class="no-articles">' + t('article.empty') + '</p>';
        return;
    }
    var filtered = articlesData;
    if (activeCategory !== 'all') {
        filtered = articlesData.filter(function (a) { return (a.category || 'Uncategorized') === activeCategory; });
    }
    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-articles">' + t('article.empty') + '</p>';
        return;
    }
    var standalone = [];
    var seriesGroups = {};
    filtered.forEach(function (a) {
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
    var safeImageUrl = imageUrl && isSafeUrl(imageUrl) ? imageUrl : '';
    var imageHtml = imageUrl
        ? '<div class="article-image"><span class="series-card-badge"><i class="fas fa-layer-group"></i> ' + total + t('series.parts') + '</span><img src="' + safeImageUrl + '" alt="' + safeName + '" loading="lazy"></div>'
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
    var safeCardImage = article.image && isSafeUrl(article.image) ? article.image : '';
    var imageHtml = article.image
        ? `<div class="article-image">${pinnedBadge}<img src="${safeCardImage}" alt="${safeTitle}" loading="lazy"></div>`
        : `<div class="article-image article-image-placeholder">${pinnedBadge}<span>${safeTitle}</span></div>`;
    var cat = article.category;
    var categoryBadge = cat ? '<span class="category-badge"><i class="fas fa-folder"></i> ' + escapeHtml(cat) + '</span>' : '';
    var tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${categoryBadge}${article.tags.map(function(tag) { return '<span class="tag">' + escapeHtml(tag) + '</span>'; }).join('')}</div>`
        : (categoryBadge ? '<div class="article-tags">' + categoryBadge + '</div>' : '');
    articleCard.innerHTML = [
        imageHtml,
        '<div class="article-content">',
        '  <h3>' + safeTitle + '</h3>',
        '  ' + tagsHtml,
        '  <p>' + escapeHtml(article.excerpt) + '</p>',
        '  <div class="article-meta">',
        '    <span><i class="far fa-calendar"></i> ' + escapeHtml(article.date) + '</span>',
        '    <span><i class="far fa-clock"></i> ' + t('article.readTime', {minutes: calculateReadTime(article)}) + '</span>',
        '    <span><i class="far fa-eye"></i> ' + escapeHtml('' + article.views) + '</span>',
        '  </div>',
        '</div>'
    ].join('\n');

    return articleCard;
}

window.__reloadContent = function () {
    if (typeof loadArticlesFromJSON === 'function') {
        loadArticlesFromJSON();
    }
};

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
