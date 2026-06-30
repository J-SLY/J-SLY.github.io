/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function showArticleDetail(article) {
    var series = null;
    if (article.series && article.series.name && window.seriesMap) {
        series = window.seriesMap[article.series.name];
    }
    var mode = getArticleDisplayMode();
    var seriesMode = mode === 'legacy' ? 'main-legacy' : mode === 'page' ? 'main-page' : 'main-modal';
    showArticleModal(article, { giscusIdPrefix: '', seriesArticles: series, seriesMode: seriesMode, isPublic: false });
}

function openArticleFromHash() {
    const match = window.location.hash.match(/^#article-(\d+)$/);
    if (!match) return;

    const articleId = parseInt(match[1], 10);
    const article = articlesData.find(a => a.id === articleId);

    if (article) {
        var mode = getArticleDisplayMode();
        if (mode === 'page') {
            // navigate to clean article URL
            window.location.href = '/article/' + article.id;
            return;
        }
        if (mode === 'legacy') {
            window.location.href = '/article.html?id=' + article.id;
            return;
        }
        setTimeout(() => showArticleDetail(article), 300);
    } else {
        window.location.href = '/404.html';
    }
}

window.addEventListener('hashchange', function() {
    if (typeof articlesData !== 'undefined' && articlesData.length > 0) {
        openArticleFromHash();
    }
});
