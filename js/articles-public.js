/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesPublicData = [];

function loadPublicArticles() {
    return fetch('/articles-public.json')
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.json();
        })
        .then(function (data) {
            articlesPublicData = data.articles;
            renderPublicArticles();
            if (typeof initSearch === 'function') {
                initSearch({ dataSource: articlesPublicData, onOpenArticle: openPublicArticle });
            }
        })
        .catch(function (err) {
            console.error('加载投稿文章时出错:', err);
            var container = document.getElementById('public-articles-container');
            if (container) {
                container.innerHTML = '<p class="error-message">无法加载文章，请稍后重试。</p>';
            }
        });
}

function renderPublicArticles() {
    var container = document.getElementById('public-articles-container');
    if (!container) return;

    if (!articlesPublicData || articlesPublicData.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无投稿，期待你的第一篇贡献！</p>';
        return;
    }

    var sorted = articlesPublicData.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    container.innerHTML = '';
    sorted.forEach(function (article) {
        container.appendChild(createPublicArticleCard(article));
    });
    addPublicArticleClickEvents();
}

function createPublicArticleCard(article) {
    var card = document.createElement('article');
    card.className = 'article-card public-card fade-in';
    card.setAttribute('data-article-id', article.id);

    var authorHtml = article.authorLink
        ? '<a href="' + encodeURI(article.authorLink) + '" target="_blank" rel="noopener">' + escapeHtml(article.author) + '</a>'
        : escapeHtml(article.author);

    var imageHtml = article.image
        ? '<div class="article-image"><img src="' + article.image + '" alt="' + escapeHtml(article.title) + '" loading="lazy"></div>'
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
        '    <span><i class="far fa-calendar"></i> ' + article.date + '</span>',
        '    <span><i class="far fa-clock"></i> ' + article.readTime + '</span>',
        '    <span><i class="far fa-eye"></i> ' + article.views + '</span>',
        '  </div>',
        '</div>'
    ].join('\n');

    return card;
}

function addPublicArticleClickEvents() {
    document.querySelectorAll('#public-articles-container .article-card').forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            var id = Number(this.getAttribute('data-article-id'));
            var article = articlesPublicData.find(function (a) { return Number(a.id) === id; });
            if (article) openPublicArticle(article);
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

function showPublicArticleDetail(article) {
    var authorHtml = article.authorLink
        ? '<a href="' + encodeURI(article.authorLink) + '" target="_blank" rel="noopener">' + escapeHtml(article.author) + '</a>'
        : escapeHtml(article.author);

    var authorSectionHtml = [
        '<div class="article-author-info">',
        '  <i class="fas fa-feather-alt"></i>',
        '  <div>',
        '    <div class="author-label">投稿作者</div>',
        '    <div class="author-name">' + authorHtml + '</div>',
        '  </div>',
        '</div>'
    ].join('\n');

    showArticleModal(article, {
        giscusIdPrefix: 'public-',
        authorSectionHtml: authorSectionHtml
    });
}


