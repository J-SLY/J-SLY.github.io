/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesChangelogData = [];

function loadChangelogArticles() {
    fetch('/articles-changelog.json')
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.json();
        })
        .then(function (data) {
            articlesChangelogData = data.articles;
            renderChangelogArticles();
        })
        .catch(function (err) {
            console.error('加载更新日志时出错:', err);
            var container = document.getElementById('changelog-articles-container');
            if (container) {
                container.innerHTML = '<p class="error-message">无法加载更新日志，请稍后重试。</p>';
            }
        });
}

function renderChangelogArticles() {
    var container = document.getElementById('changelog-articles-container');
    if (!container) return;

    if (!articlesChangelogData || articlesChangelogData.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无更新日志。</p>';
        return;
    }

    var sorted = articlesChangelogData.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    container.innerHTML = '';
    sorted.forEach(function (article) {
        container.appendChild(createChangelogCard(article));
    });
    addChangelogClickEvents();
}

function createChangelogCard(article) {
    var card = document.createElement('article');
    card.className = 'article-card changelog-card fade-in';
    card.setAttribute('data-article-id', article.id);

    var imageHtml = article.image
        ? '<div class="article-image"><img src="' + article.image + '" alt="' + escapeHtml(article.title) + '" loading="lazy"></div>'
        : '<div class="article-image changelog-image-placeholder"><i class="fas fa-clipboard-list"></i></div>';

    var tagsHtml = article.tags && article.tags.length
        ? '<div class="article-tags">' + article.tags.map(function (t) { return '<span class="tag changelog-tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>'
        : '';

    card.innerHTML = [
        imageHtml,
        '<div class="article-content">',
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

function addChangelogClickEvents() {
    document.querySelectorAll('#changelog-articles-container .article-card').forEach(function (card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            var id = Number(this.getAttribute('data-article-id'));
            var article = articlesChangelogData.find(function (a) { return Number(a.id) === id; });
            if (article) openChangelogArticle(article);
        });
    });
}

function openChangelogArticle(article) {
    var mode = getArticleDisplayMode();
    if (mode === 'page') {
        window.open('/changelog/article/' + article.id, '_blank');
    } else if (mode === 'legacy') {
        window.open('/article.html?id=ch-' + article.id, '_blank');
    } else {
        showArticleDetail(article);
    }
}
