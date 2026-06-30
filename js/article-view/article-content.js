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
                    <span><i class="far fa-clock"></i> ${article.readTimeMinutes ? t('article.readTime', {minutes: article.readTimeMinutes}) : escapeHtml(article.readTime)}</span>
                    <span><i class="far fa-eye"></i> ${escapeHtml('' + article.views)}</span>
                </div>
                <div class="article-content markdown-body">
                    ${contentHtml}
                </div>
                ${seriesBottomHtml}
                <div class="article-actions">
                    <button class="btn share-btn">
                        <i class="fas fa-share"></i> ${t('share.button')}
                    </button>
                </div>
                <div class="article-comments giscus"></div>
            </div>
        </div>
    `;
}

function initArticleHighlights(container) {
    if (typeof hljs === 'undefined') return;
    container.querySelectorAll('.markdown-body pre code').forEach((block) => {
        try { hljs.highlightElement(block); } catch (e) { /* skip failed block */ }
    });
}
