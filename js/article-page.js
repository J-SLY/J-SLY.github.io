/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    const container = document.getElementById('article-content');

    if (!id) {
        window.location.href = '/404.html';
        return;
    }

    fetch('/articles.json')
        .then(response => {
            if (!response.ok) throw new Error('网络响应不正常');
            return response.json();
        })
        .then(data => {
            const article = data.articles.find(a => a.id === id);
            if (!article) {
                window.location.href = '/404.html';
                return;
            }
            renderArticlePage(article);
        })
        .catch(error => {
            console.error('加载文章数据时出错:', error);
            container.innerHTML = '<p class="error-message">无法加载文章，请稍后重试。</p>';
        });

    initDarkMode();
    if (typeof initSearch === 'function') initSearch();

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (window.innerWidth <= 992) {
        navLinks.style.display = 'none';
    }

    menuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    window.addEventListener('resize', function() {
        navLinks.style.display = window.innerWidth > 992 ? 'flex' : 'none';
    });
});

function renderArticlePage(article) {
    document.title = article.title + ' - JSLY\'s Blog';

    const container = document.getElementById('article-content');
    container.innerHTML = buildArticleContent(article, false);

    initArticleHighlights(container);
    generateTOC(container);
    initGiscus(container, article.id);
    updateOGTags(article);

    container.querySelector('.share-btn').addEventListener('click', function() {
        // Use the clean /article/{id} URL as canonical share link
        const url = window.location.origin + '/article/' + article.id;
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: url,
            }).catch(error => console.log('分享出错:', error));
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i> 链接已复制';
            });
        }
    }, {once: true});
}
