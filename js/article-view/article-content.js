/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function buildSeriesMap(articles) {
    var map = {};
    if (!articles) return map;
    articles.forEach(function (a) {
        if (a.series && a.series.name) {
            if (!map[a.series.name]) map[a.series.name] = [];
            map[a.series.name].push(a);
        }
    });
    Object.keys(map).forEach(function (name) {
        map[name].sort(function (a, b) { return (a.series.order || 0) - (b.series.order || 0); });
    });
    return map;
}

function buildSeriesNavHtml(article, seriesArticles, mode) {
    if (!article.series || !article.series.name || !seriesArticles || seriesArticles.length < 2) return null;
    var total = seriesArticles.length;
    var currentIdx = -1;
    seriesArticles.some(function (a, i) {
        if (Number(a.id) === Number(article.id)) { currentIdx = i; return true; }
        return false;
    });
    if (currentIdx === -1) return null;

    var seriesName = escapeHtml(article.series.name);
    var prevArticle = currentIdx > 0 ? seriesArticles[currentIdx - 1] : null;
    var nextArticle = currentIdx < total - 1 ? seriesArticles[currentIdx + 1] : null;

    function makeLink(a, text) {
        if (mode === 'main-page') return '<a href="/article/' + a.id + '">' + text + '</a>';
        if (mode === 'main-legacy') return '<a href="/article.html?id=' + a.id + '">' + text + '</a>';
        if (mode === 'public-page') return '<a href="/public/article/' + a.id + '">' + text + '</a>';
        if (mode === 'public-legacy') return '<a href="/article.html?id=pub-' + a.id + '">' + text + '</a>';
        if (mode === 'public-modal') return '<a href="#article-' + a.id + '" onclick="event.preventDefault(); seriesOpenPublicArticle(' + a.id + ')">' + text + '</a>';
        return '<a href="#article-' + a.id + '">' + text + '</a>';
    }

    function makeHref(a) {
        if (mode === 'main-page') return '/article/' + a.id;
        if (mode === 'main-legacy') return '/article.html?id=' + a.id;
        if (mode === 'public-page') return '/public/article/' + a.id;
        if (mode === 'public-legacy') return '/article.html?id=pub-' + a.id;
        if (mode === 'public-modal') return '#article-' + a.id;
        return '#article-' + a.id;
    }

    function makeClick(a) {
        if (mode === 'public-modal') return ' onclick="event.preventDefault(); seriesOpenPublicArticle(' + a.id + ')"';
        return '';
    }

    function makeLinkFull(a) {
        return makeLink(a, escapeHtml(a.title));
    }

    var listItems = seriesArticles.map(function (a, i) {
        var num = (i + 1) + '.';
        if (Number(a.id) === Number(article.id)) {
            return '<li class="current"><span class="series-num">' + num + '</span> ' + escapeHtml(a.title) + '</li>';
        }
        return '<li><span class="series-num">' + num + '</span> ' + makeLinkFull(a) + '</li>';
    }).join('');

    var topHtml = [
        '<div class="series-nav-top">',
        '  <div class="series-nav-header">',
        '    <i class="fas fa-layer-group"></i> <span class="series-nav-name">' + seriesName + '</span>',
        '    <span class="series-nav-count">' + t('series.count', { current: currentIdx + 1, total: total }) + '</span>',
        '  </div>',
        '  <div class="series-nav-list"><ol>' + listItems + '</ol></div>',
        '</div>'
    ].join('\n');

    var prevHtml = prevArticle
        ? '<a class="series-nav-prev" href="' + makeHref(prevArticle) + '"' + makeClick(prevArticle) + '><i class="fas fa-arrow-left"></i> ' + t('series.prev') + '：' + escapeHtml(prevArticle.title) + '</a>'
        : '<span></span>';
    var nextHtml = nextArticle
        ? '<a class="series-nav-next" href="' + makeHref(nextArticle) + '"' + makeClick(nextArticle) + '>' + t('series.next') + '：' + escapeHtml(nextArticle.title) + ' <i class="fas fa-arrow-right"></i></a>'
        : '<span></span>';
    var bottomHtml = (prevArticle || nextArticle)
        ? '<div class="series-nav-bottom"><div class="series-nav-bottom-inner">' + prevHtml + nextHtml + '</div></div>'
        : '';

    return { topHtml: topHtml, bottomHtml: bottomHtml };
}

function buildArticleContent(article, showHero, seriesNavOpts, authorSectionHtml) {
    if (showHero === undefined) showHero = true;
    if (article.showImage === false) showHero = false;
    const contentHtml = marked.parse(article.content.join('\n'));

    const heroImageSrc = article.image && isSafeUrl(article.image) ? article.image : '';
    const heroHtml = showHero
        ? (article.image
            ? `<div class="article-hero"><img src="${heroImageSrc}" alt="${escapeHtml(article.title)}"></div>`
            : `<div class="article-hero article-hero-placeholder"><span>${escapeHtml(article.title)}</span></div>`)
        : '';

    const seriesTopHtml = seriesNavOpts && seriesNavOpts.topHtml ? seriesNavOpts.topHtml : '';

    const tagsHtml = article.tags && article.tags.length
        ? `<div class="article-tags">${article.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`
        : '';

    const seriesBottomHtml = seriesNavOpts && seriesNavOpts.bottomHtml ? seriesNavOpts.bottomHtml : '';

    return `
        ${heroHtml}
        ${seriesTopHtml}
        <div class="article-layout">
            <div class="article-toc-sidebar"></div>
            <div class="article-body">
                ${authorSectionHtml || ''}
                <h2>${escapeHtml(article.title)}</h2>
                ${tagsHtml}
                <div class="article-meta">
                    <span><i class="far fa-calendar"></i> ${escapeHtml(article.date)}</span>
                    <span><i class="far fa-clock"></i> ${t('article.readTime', {minutes: calculateReadTime(article)})}</span>
                    <span><i class="far fa-eye"></i> ${escapeHtml('' + article.views)}</span>
                </div>
                <div class="article-content markdown-body">
                    ${contentHtml}
                </div>
                ${seriesBottomHtml}
                <div class="article-actions">
                    <div class="share-buttons"></div>
                </div>
                <div class="article-comments giscus"></div>
            </div>
        </div>
    `;
}

function findRelatedArticles(article, allArticles, maxCount) {
    if (!allArticles || !article) return [];
    if (maxCount === undefined) maxCount = 3;
    var articleTags = (article.tags || []).map(function (t) { return t.toLowerCase(); });
    if (articleTags.length === 0) return [];

    var scored = [];
    allArticles.forEach(function (a) {
        if (Number(a.id) === Number(article.id)) return;
        var aTags = (a.tags || []).map(function (t) { return t.toLowerCase(); });
        var overlap = 0;
        articleTags.forEach(function (t) { if (aTags.indexOf(t) !== -1) overlap++; });
        if (overlap > 0) {
            scored.push({ article: a, score: overlap });
        }
    });

    scored.sort(function (a, b) { return b.score - a.score || new Date(b.article.date) - new Date(a.article.date); });
    return scored.slice(0, maxCount).map(function (s) { return s.article; });
}

function renderRelatedArticles(articles, isPublic) {
    if (!articles || articles.length === 0) return '';
    var basePath = isPublic ? '/public/article/' : '/article/';
    var items = articles.map(function (a) {
        var imgHtml = a.image
            ? '<img src="' + (isSafeUrl(a.image) ? a.image : '') + '" alt="' + escapeHtml(a.title) + '" loading="lazy">'
            : '<div class="related-placeholder"><i class="fas fa-file-alt"></i></div>';
        return '<a class="related-article-card" href="' + basePath + a.id + '">' +
            '<div class="related-image">' + imgHtml + '</div>' +
            '<div class="related-info">' +
            '<div class="related-title">' + escapeHtml(a.title) + '</div>' +
            '<div class="related-tags">' + (a.tags || []).map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' +
            '</div></a>';
    }).join('');

    return '<div class="related-articles-section">' +
        '<h3 class="related-heading"><i class="fas fa-link"></i> ' +
        (typeof t === 'function' ? t('article.related') || '相关文章' : '相关文章') + '</h3>' +
        '<div class="related-articles-grid">' + items + '</div></div>';
}

function calculateReadTime(article) {
    if (article.readTimeMinutes) return article.readTimeMinutes;
    if (!article.content || !article.content.length) return 1;
    var text = article.content.join('\n');
    var charCount = text.replace(/\s/g, '').length;
    var cjkChars = (text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
    var readingTime = Math.max(1, Math.round(cjkChars / 300 + (charCount - cjkChars) / 500));
    return readingTime;
}

function initArticleHighlights(container) {
    if (typeof hljs === 'undefined') return;
    container.querySelectorAll('.markdown-body pre code').forEach((block) => {
        try { hljs.highlightElement(block); } catch (e) { /* skip failed block */ }
    });
}

function initImageLightbox(container) {
    container.querySelectorAll('.markdown-body img').forEach(function (img) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function (e) {
            e.stopPropagation();
            var overlay = document.createElement('div');
            overlay.className = 'lightbox-overlay';
            overlay.innerHTML = '<span class="lightbox-close">&times;</span><img src="' + this.src + '" alt="' + (this.alt || '') + '">';
            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';

            function closeLightbox() {
                overlay.classList.remove('active');
                setTimeout(function () {
                    if (overlay.parentNode) document.body.removeChild(overlay);
                    document.body.style.overflow = '';
                }, 300);
            }

            overlay.querySelector('.lightbox-close').addEventListener('click', function (e) {
                e.stopPropagation();
                closeLightbox();
            });

            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeLightbox();
            });

            document.addEventListener('keydown', function handler(e) {
                if (e.key === 'Escape' && overlay.parentNode) {
                    closeLightbox();
                    document.removeEventListener('keydown', handler);
                }
            });

            requestAnimationFrame(function () {
                overlay.classList.add('active');
            });
        });
    });
}

function initCodeCopyButtons(container) {
    container.querySelectorAll('.markdown-body pre').forEach(function (pre) {
        var btn = document.createElement('button');
        btn.className = 'code-copy-btn';
        btn.innerHTML = '<i class="far fa-copy"></i> ' + (typeof t === 'function' ? t('share.copyBtn') || '复制' : '复制');
        btn.addEventListener('click', function () {
            var code = pre.querySelector('code');
            var text = code ? code.textContent : pre.textContent;
            navigator.clipboard.writeText(text).then(function () {
                btn.innerHTML = '<i class="fas fa-check"></i> ' + (typeof t === 'function' ? t('share.copied') || '已复制' : '已复制');
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.innerHTML = '<i class="far fa-copy"></i> ' + (typeof t === 'function' ? t('share.copyBtn') || '复制' : '复制');
                    btn.classList.remove('copied');
                }, 2000);
            }).catch(function () {
                btn.innerHTML = '<i class="fas fa-times"></i> ' + (typeof t === 'function' ? t('share.copyFailed') || '复制失败' : '复制失败');
            });
        });
        pre.appendChild(btn);
    });
}
