/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesData = [];

function loadArticlesFromJSON() {
    fetch('articles.json')
        .then(response => {
            if (!response.ok) throw new Error('网络响应不正常');
            return response.json();
        })
        .then(data => {
            articlesData = data.articles;
            renderAllArticles();
            openArticleFromHash();
        })
        .catch(error => {
            console.error('加载文章数据时出错:', error);
            document.getElementById('articles-container').innerHTML =
                '<p class="error-message">无法加载文章，请检查网络连接或刷新页面重试。</p>';
        });
}

function renderAllArticles() {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';
    const sorted = [...articlesData].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });
    renderArticlesToContainer(sorted, container);
}

function renderArticlesToContainer(articles, container) {
    if (!container) return;
    if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
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

    const pinnedBadge = article.pinned ? '<span class="pinned-badge"><i class="fas fa-thumbtack"></i> 置顶</span>' : '';
    const imageHtml = article.image
        ? `<div class="article-image">${pinnedBadge}<img src="${article.image}" alt="${article.title}" loading="lazy"></div>`
        : `<div class="article-image article-image-placeholder">${pinnedBadge}<span>${article.title}</span></div>`;
    const tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';
    const isLiked = getLikedArticles().has(Number(article.id));
    const likedClass = isLiked ? ' class="liked"' : '';
    const displayLikes = article.likes + (isLiked ? 1 : 0);

    articleCard.innerHTML = `
        ${imageHtml}
        <div class="article-content">
            <h3>${article.title}</h3>
            ${tagsHtml}
            <p>${article.excerpt}</p>
            <div class="article-meta">
                <span><i class="far fa-calendar"></i> ${article.date}</span>
                <span><i class="far fa-clock"></i> ${article.readTime}</span>
                <span><i class="far fa-eye"></i> ${article.views}</span>
                <span${likedClass}><i class="${isLiked ? 'fas' : 'far'} fa-heart"></i> ${displayLikes}</span>
            </div>
        </div>
    `;

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
