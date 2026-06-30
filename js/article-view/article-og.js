/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

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

    const fullUrl = window.location.origin + '/article/' + article.id;
    if (ogUrl) ogUrl.setAttribute('content', fullUrl);

    var safeImageUrl = article.image && isSafeUrl(article.image) ? resolveArticleImageUrl(article.image) : '';
    if (!ogImage && safeImageUrl) {
        const meta = document.createElement('meta');
        meta.setAttribute('property', 'og:image');
        meta.setAttribute('content', safeImageUrl);
        document.head.appendChild(meta);
    } else if (ogImage && safeImageUrl) {
        ogImage.setAttribute('content', safeImageUrl);
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
