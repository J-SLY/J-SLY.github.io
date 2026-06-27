/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

const DISPLAY_MODE_COOKIE = 'article_display_mode';

function getArticleDisplayMode() {
    const match = document.cookie.match(new RegExp('(^| )' + DISPLAY_MODE_COOKIE + '=([^;]+)'));
    return match ? match[2] : 'modal';
}

function setArticleDisplayMode(mode) {
    document.cookie = DISPLAY_MODE_COOKIE + '=' + mode + ';path=/;max-age=31536000';
}

var defaultPage = localStorage.getItem('default_page');
var path = (window.location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
if (defaultPage === 'public' && (path === '/' || path === '/index.html') && !window.location.hash) {
    window.location.replace('/public/');
}

function openArticle(article) {
    var mode = getArticleDisplayMode();
    if (mode === 'page') {
        // open the clean URL; 404.html will route /article/<id> to rendered content
        window.open('/article/' + article.id, '_blank');
    } else if (mode === 'legacy') {
        // legacy article.html?id=<id> path
        window.open('article.html?id=' + article.id, '_blank');
    } else {
        showArticleDetail(article);
    }
}
