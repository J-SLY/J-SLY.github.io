/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

let originalOGTags = [];

function buildArticleContent(article, showHero) {
    if (showHero === undefined) showHero = true;
    if (article.showImage === false) showHero = false;
    const contentHtml = marked.parse(article.content.join('\n'));

    const heroHtml = showHero
        ? (article.image
            ? `<div class="article-hero"><img src="${article.image}" alt="${article.title}"></div>`
            : `<div class="article-hero article-hero-placeholder"><span>${article.title}</span></div>`)
        : '';

    const tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
        : '';

    return `
        ${heroHtml}
        <div class="article-layout">
            <div class="article-toc-sidebar"></div>
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
                    <button class="btn share-btn">
                        <i class="fas fa-share"></i> 分享
                    </button>
                </div>
                <div class="article-comments giscus"></div>
            </div>
        </div>
    `;
}

function generateTOC(container, scrollRoot) {
    const markdownBody = container.querySelector('.markdown-body');
    if (!markdownBody) return;
    const headings = markdownBody.querySelectorAll('h1, h2, h3');
    if (headings.length <= 1) return;

    const toc = document.createElement('nav');
    toc.className = 'article-toc';
    const tocTitle = document.createElement('div');
    tocTitle.className = 'article-toc-title';
    tocTitle.innerHTML = '<i class="fas fa-list"></i> 目录';
    toc.appendChild(tocTitle);

    const tocList = document.createElement('ul');
    tocList.className = 'article-toc-list';

    const usedIds = {};
    headings.forEach(h => {
        let baseId = (h.id || h.textContent).toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '');
        if (!baseId) baseId = 'heading';
        if (usedIds[baseId]) {
            usedIds[baseId]++;
            h.id = baseId + '-' + usedIds[baseId];
        } else {
            usedIds[baseId] = 1;
            h.id = baseId;
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
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.appendChild(a);
        tocList.appendChild(li);
    });

    toc.appendChild(tocList);

    const tocSidebar = container.querySelector('.article-toc-sidebar');
    if (!tocSidebar) return;
    tocSidebar.appendChild(toc);

    if (!scrollRoot) scrollRoot = container;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocSidebar.querySelectorAll('.article-toc-item a').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { root: scrollRoot, rootMargin: '0px 0px -80% 0px', threshold: 0 });
    headings.forEach(h => observer.observe(h));
}

function initGiscus(container, articleId) {
    const commentsDiv = container.querySelector('.article-comments');
    if (!commentsDiv) return;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'J-SLY/J-SLY.github.io');
    script.setAttribute('data-repo-id', 'R_kgDOSmP4AQ');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOSmP4Ac4C_k-w');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', 'article-' + articleId);
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    const giscusTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
    script.setAttribute('data-theme', giscusTheme);
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    commentsDiv.appendChild(script);
}

function initShareButton(container, article) {
    const shareBtn = container.querySelector('.share-btn');
    if (!shareBtn) return;
    shareBtn.addEventListener('click', function() {
        // use clean path URL for standalone article
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

function initArticleHighlights(container) {
    if (typeof hljs === 'undefined') return;
    container.querySelectorAll('.markdown-body pre code').forEach((block) => {
        try { hljs.highlightElement(block); } catch (e) { /* skip failed block */ }
    });
}

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

    // Use clean article path as canonical URL for OG
    const fullUrl = window.location.origin + '/article/' + article.id;
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
