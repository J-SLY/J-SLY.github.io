/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let articlesData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadArticlesFromJSON();
    initNavigation();

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });

    window.addEventListener('scroll', updateNavOnScroll);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    });
});

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
            const article = articlesData.find(a => a.id == articleId);

            if (article) {
                showArticleDetail(article);
            }
        });
    });
}

function initNavigation() {
    document.querySelectorAll('.nav-links a, .footer-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                updateActiveNav(this);

                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function updateActiveNav(clickedLink) {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    if (clickedLink.closest('.nav-links')) {
        clickedLink.classList.add('active');
    }
}

function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const headerHeight = document.querySelector('header').offsetHeight;

        if (scrollY >= (sectionTop - headerHeight - 50)) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}

function showArticleDetail(article) {
    const existingModal = document.querySelector('.article-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }

    const modal = document.createElement('div');
    modal.className = 'article-modal';

    const contentHtml = marked.parse(article.content);

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

    document.body.appendChild(modal);

    document.body.style.overflow = 'hidden';

    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
        modal.removeEventListener('click', handleBackgroundClick);
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
        const url = window.location.href + '#article-' + article.id;
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

    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscapeKey);
        }
    };

    document.addEventListener('keydown', handleEscapeKey);
}

const fadeInOnScroll = function() {
    const fadeElements = document.querySelectorAll('.fade-in');

    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
};

window.addEventListener('scroll', fadeInOnScroll);
