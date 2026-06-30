/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function sanitizeAuthorLink(link) {
    if (link && (link.startsWith('http://') || link.startsWith('https://'))) return link;
    return null;
}

function isSafeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return !/^(javascript:|data:|file:|mailto:|vbscript:)/i.test(url);
}

function resolveArticleImageUrl(url) {
    if (!url || !isSafeUrl(url)) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return window.location.origin + '/' + url.replace(/^\/+/, '');
}
