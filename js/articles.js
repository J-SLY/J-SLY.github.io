/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesData = [];

function loadArticlesFromJSON() {
    fetch('articles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            articlesData = data.articles;
            renderAllArticles();
            renderTagFilter();
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
    renderArticlesToContainer(articlesData, container);
}

function renderTagFilter() {
    const tagSet = new Set();
    articlesData.forEach(article => {
        if (article.tags && article.tags.length) {
            article.tags.forEach(tag => tagSet.add(tag));
        }
    });

    const filterContainer = document.getElementById('tag-filter');
    if (!filterContainer) return;

    filterContainer.innerHTML = '<button class="tag-filter-btn active" data-tag="all">全部</button>';

    const sortedTags = Array.from(tagSet).sort();
    sortedTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-filter-btn';
        btn.setAttribute('data-tag', tag);
        btn.textContent = tag;
        filterContainer.appendChild(btn);
    });

    filterContainer.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filterContainer.querySelectorAll('.tag-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const selectedTag = this.getAttribute('data-tag');
            filterArticles(selectedTag);
        });
    });
}

function filterArticles(tag) {
    const container = document.getElementById('articles-container');
    container.innerHTML = '';

    let filtered;
    if (tag === 'all') {
        filtered = articlesData;
    } else {
        filtered = articlesData.filter(a => a.tags && a.tags.includes(tag));
    }

    renderArticlesToContainer(filtered, container);
    container.querySelectorAll('.fade-in').forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
    });
    fadeInOnScroll();
}

function renderArticlesToContainer(articles, container) {
    if (!container) return;

    if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
        return;
    }

    articles.forEach(article => {
        const articleElement = createArticleElement(article);
        container.appendChild(articleElement);
    });

    addArticleClickEvents();
}

function createArticleElement(article) {
    const articleCard = document.createElement('article');
    articleCard.className = 'article-card fade-in';
    articleCard.setAttribute('data-article-id', article.id);

    const imageHtml = article.image
        ? `<div class="article-image"><img src="${article.image}" alt="${article.title}" loading="lazy"></div>`
        : `<div class="article-image article-image-placeholder"><span>${article.title}</span></div>`;

    const tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';

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

            if (article) {
                showArticleDetail(article);
            }
        });
    });
}

function showArticleDetail(article) {
    const existingModal = document.querySelector('.article-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    const modal = document.createElement('div');
    modal.className = 'article-modal';

    const contentHtml = marked.parse(article.content.join('\n'));

    const heroHtml = article.image
        ? `<div class="article-hero"><img src="${article.image}" alt="${article.title}"></div>`
        : `<div class="article-hero article-hero-placeholder"><span>${article.title}</span></div>`;

    const tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="article-detail">
                ${heroHtml}
                <div class="article-body">
                    <h2>${article.title}</h2>
                    ${tagsHtml}
                    <div class="article-meta">
                        <span><i class="far fa-calendar"></i> ${article.date}</span>
                        <span><i class="far fa-clock"></i> ${article.readTime}</span>
                        <span><i class="far fa-eye"></i> ${article.views}</span>
                    </div>
                    <div class="article-content markdown-body">
                        ${contentHtml}
                    </div>
                    <div class="article-actions">
                        <button class="btn like-btn">
                            <i class="far fa-heart"></i> 点赞
                        </button>
                        <button class="btn share-btn">
                            <i class="fas fa-share"></i> 分享
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    updateOGTags(article);

    document.body.appendChild(modal);

    modal.querySelectorAll('.markdown-body pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Generate TOC from markdown headings
    const markdownBody = modal.querySelector('.markdown-body');
    if (markdownBody) {
        const headings = markdownBody.querySelectorAll('h1, h2, h3');
        if (headings.length > 1) {
            const toc = document.createElement('nav');
            toc.className = 'article-toc';
            const tocTitle = document.createElement('div');
            tocTitle.className = 'article-toc-title';
            tocTitle.innerHTML = '<i class="fas fa-list"></i> 目录';
            toc.appendChild(tocTitle);

            const tocList = document.createElement('ul');
            tocList.className = 'article-toc-list';

            headings.forEach(h => {
                if (!h.id) {
                    h.id = h.textContent.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '');
                }

                const li = document.createElement('li');
                li.className = 'article-toc-item';
                li.style.paddingLeft = (parseInt(h.tagName[1]) - 1) * 16 + 'px';

                const a = document.createElement('a');
                a.href = '#' + h.id;
                a.textContent = h.textContent;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.getElementById(h.id);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });

                li.appendChild(a);
                tocList.appendChild(li);
            });

            toc.appendChild(tocList);

            const articleBody = modal.querySelector('.article-body');
            if (articleBody) {
                articleBody.insertBefore(toc, articleBody.firstChild);
            }
        }
    }

    document.body.style.overflow = 'hidden';

    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    };

    const closeModal = () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
        document.body.style.overflow = 'auto';
        restoreOGTags();
        modal.removeEventListener('click', handleBackgroundClick);
        document.removeEventListener('keydown', handleEscapeKey);
    };

    const handleBackgroundClick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal, {once: true});
    modal.addEventListener('click', handleBackgroundClick);

    modal.querySelector('.like-btn').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-heart"></i> 已点赞';
        this.style.background = '#e74c3c';
        this.disabled = true;
    }, {once: true});

    modal.querySelector('.share-btn').addEventListener('click', function() {
        const baseUrl = window.location.origin + window.location.pathname;
        const url = baseUrl + '#article-' + article.id;
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: url,
            })
            .catch(error => console.log('分享出错:', error));
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i> 链接已复制';
            });
        }
    }, {once: true});

    document.addEventListener('keydown', handleEscapeKey);
}

let originalOGTags = [];

function updateOGTags(article) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');

    if (!originalOGTags.length) {
        originalOGTags = [
            ogTitle ? {el: ogTitle, content: ogTitle.getAttribute('content')} : null,
            ogDesc ? {el: ogDesc, content: ogDesc.getAttribute('content')} : null,
            ogImage ? {el: ogImage, content: ogImage.getAttribute('content')} : null,
            ogUrl ? {el: ogUrl, content: ogUrl.getAttribute('content')} : null,
        ];
    }

    if (ogTitle) ogTitle.setAttribute('content', article.title + ' - JSLY\'s Blog');
    if (ogDesc) ogDesc.setAttribute('content', article.excerpt);

    const fullUrl = window.location.origin + window.location.pathname + '#article-' + article.id;
    if (ogUrl) ogUrl.setAttribute('content', fullUrl);

    if (!ogImage && article.image) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.setAttribute('content', window.location.origin + '/' + article.image.replace(/^\//, ''));
        document.head.appendChild(meta);
    } else if (ogImage && article.image) {
        ogImage.setAttribute('content', window.location.origin + '/' + article.image.replace(/^\//, ''));
    }
}

function restoreOGTags() {
    originalOGTags.forEach(item => {
        if (item && item.el) {
            item.el.setAttribute('content', item.content);
        }
    });
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && !originalOGTags[2]) {
        ogImage.parentNode.removeChild(ogImage);
    }
    originalOGTags = [];
}

function openArticleFromHash() {
    const match = window.location.hash.match(/^#article-(\d+)$/);
    if (!match) return;

    const articleId = parseInt(match[1], 10);
    const article = articlesData.find(a => a.id === articleId);

    if (article) {
        setTimeout(() => {
            showArticleDetail(article);
        }, 300);
    }
}

window.addEventListener('hashchange', function() {
    openArticleFromHash();
});
