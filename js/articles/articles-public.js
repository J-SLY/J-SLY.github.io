/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesPublicData = [];

function loadPublicArticles() {
    var lang = (window.__currentLang || 'zh').split('-')[0];
    var url = '/data/articles-public-' + lang + '.yaml';
    return fetch(url).then(function (resp) {
        if (!resp.ok) return fetch('/data/articles-public-zh.yaml');
        return resp;
    })
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.text().then(function (text) { return jsyaml.load(text); });
        })
        .then(function (data) {
            articlesPublicData = data.articles;
            window.seriesMap = buildSeriesMap(articlesPublicData);
            renderPublicArticles();
            if (typeof initSearch === 'function') {
                initSearch({ dataSource: articlesPublicData, onOpenArticle: openPublicArticle });
            }
        })
        .catch(function (err) {
            console.error('加载投稿文章时出错:', err);
            var container = document.getElementById('public-articles-container');
            if (container) {
                container.innerHTML = '<p class="error-message">' + t('public.loadError') + '</p>';
            }
        });
}

function renderPublicArticles() {
    var container = document.getElementById('public-articles-container');
    if (!container) return;

    if (!articlesPublicData || articlesPublicData.length === 0) {
        container.innerHTML = '<p class="no-articles">' + t('public.empty') + '</p>';
        return;
    }

    var standalone = [];
    var seriesGroups = {};
    articlesPublicData.forEach(function (a) {
        if (a.series && a.series.name && window.seriesMap && window.seriesMap[a.series.name] && window.seriesMap[a.series.name].length > 1) {
            var name = a.series.name;
            if (!seriesGroups[name]) seriesGroups[name] = [];
            seriesGroups[name].push(a);
        } else {
            standalone.push(a);
        }
    });

    var combined = [];
    standalone.forEach(function (a) { combined.push({ type: 'article', article: a, date: a.date }); });
    Object.keys(seriesGroups).forEach(function (name) {
        var arts = seriesGroups[name];
        var latestDate = '';
        arts.forEach(function (a) { if (a.date > latestDate) latestDate = a.date; });
        combined.push({ type: 'series', seriesName: name, articles: arts, date: latestDate });
    });
    combined.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

    container.innerHTML = '';
    combined.forEach(function (item) {
        container.appendChild(item.type === 'series' ? createPublicSeriesCardElement(item.seriesName, item.articles) : createPublicArticleCard(item.article));
    });
    addPublicArticleClickEvents();
}

function createPublicSeriesCardElement(seriesName, articles) {
    var card = document.createElement('article');
    card.className = 'article-card public-card series-card fade-in';
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
    var authors = {};
    articles.forEach(function (a) { if (a.author) authors[a.author] = true; });
    var authorNames = Object.keys(authors);
    var authorHtml = authorNames.length === 1
        ? escapeHtml(authorNames[0])
        : authorNames.length + ' ' + t('public.author');
    card.setAttribute('data-series-name', seriesName);
    card.setAttribute('data-series-public', '1');
    card.innerHTML = [
        imageHtml,
        '<div class="article-content">',
        '  <div class="author-badge"><i class="fas fa-feather-alt"></i> ' + authorHtml + '</div>',
        '  <h3>' + safeName + '</h3>',
        '  <div class="article-meta">',
        '    <span><i class="far fa-calendar"></i> ' + escapeHtml(latestDate) + '</span>',
        '  </div>',
        '</div>'
    ].join('\n');
    return card;
}

function createPublicArticleCard(article) {
    var card = document.createElement('article');
    card.className = 'article-card public-card fade-in';
    card.setAttribute('data-article-id', article.id);

    var safeLink = sanitizeAuthorLink(article.authorLink);
    var authorHtml = safeLink
        ? '<a href="' + encodeURI(safeLink) + '" target="_blank" rel="noopener">' + escapeHtml(article.author) + '</a>'
        : escapeHtml(article.author);

    var safeCardImage = article.image && isSafeUrl(article.image) ? article.image : '';
    var imageHtml = article.image
        ? '<div class="article-image"><img src="' + safeCardImage + '" alt="' + escapeHtml(article.title) + '" loading="lazy"></div>'
        : '<div class="article-image article-image-placeholder"><span>' + escapeHtml(article.title) + '</span></div>';

    var tagsHtml = article.tags && article.tags.length
        ? '<div class="article-tags">' + article.tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>'
        : '';

    card.innerHTML = [
        imageHtml,
        '<div class="article-content">',
        '  <div class="author-badge"><i class="fas fa-feather-alt"></i> ' + authorHtml + '</div>',
        '  <h3>' + escapeHtml(article.title) + '</h3>',
        '  ' + tagsHtml,
        '  <p>' + escapeHtml(article.excerpt) + '</p>',
        '  <div class="article-meta">',
    '    <span><i class="far fa-calendar"></i> ' + escapeHtml(article.date) + '</span>',
    '    <span><i class="far fa-clock"></i> ' + (article.readTimeMinutes ? t('article.readTime', {minutes: article.readTimeMinutes}) : escapeHtml(article.readTime)) + '</span>',
    '    <span><i class="far fa-eye"></i> ' + escapeHtml('' + article.views) + '</span>',
        '  </div>',
        '</div>'
    ].join('\n');

    return card;
}

function addPublicArticleClickEvents() {
    document.querySelectorAll('#public-articles-container .article-card:not(.series-card)').forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            var id = Number(this.getAttribute('data-article-id'));
            var article = articlesPublicData.find(function (a) { return Number(a.id) === id; });
            if (article) openPublicArticle(article);
        });
    });
    document.querySelectorAll('#public-articles-container .series-card').forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            var name = this.getAttribute('data-series-name');
            if (name && window.seriesMap && window.seriesMap[name] && window.seriesMap[name].length > 0) {
                openPublicArticle(window.seriesMap[name][0]);
            }
        });
    });
}

function openPublicArticle(article) {
    var mode = getArticleDisplayMode();
    if (mode === 'page') {
        window.open('/public/article/' + article.id, '_blank');
    } else if (mode === 'legacy') {
        window.open('/article.html?id=pub-' + article.id, '_blank');
    } else {
        showPublicArticleDetail(article);
    }
}

function seriesOpenPublicArticle(id) {
    var article = (window.articlesPublicData || []).find(function (a) { return Number(a.id) === Number(id); });
    if (article) openPublicArticle(article);
}

var origReload = window.__reloadContent;
window.__reloadContent = function () {
    if (typeof origReload === 'function') origReload();
    if (typeof loadPublicArticles === 'function') {
        loadPublicArticles();
    }
};

function showPublicArticleDetail(article) {
    var safeLink = sanitizeAuthorLink(article.authorLink);
    var authorHtml = safeLink
        ? '<a href="' + encodeURI(safeLink) + '" target="_blank" rel="noopener">' + escapeHtml(article.author) + '</a>'
        : escapeHtml(article.author);

    var authorSectionHtml = [
        '<div class="article-author-info">',
        '  <i class="fas fa-feather-alt"></i>',
        '  <div>',
        '    <div class="author-label">' + t('public.author') + '</div>',
        '    <div class="author-name">' + authorHtml + '</div>',
        '  </div>',
        '</div>'
    ].join('\n');

    var series = null;
    if (article.series && article.series.name && window.seriesMap) {
        series = window.seriesMap[article.series.name];
    }
    var mode = getArticleDisplayMode();
    var seriesMode = mode === 'legacy' ? 'public-legacy' : mode === 'page' ? 'public-page' : 'public-modal';
    showArticleModal(article, {
        giscusIdPrefix: 'public-',
        authorSectionHtml: authorSectionHtml,
        seriesArticles: series,
        seriesMode: seriesMode,
        isPublic: true
    });
}


