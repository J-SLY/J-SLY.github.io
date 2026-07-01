/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initShareButton(container, article, isPublic) {
    var shareContainer = container.querySelector('.share-buttons');
    if (!shareContainer) return;

    shareContainer.innerHTML = '';

    var basePath = isPublic ? '/public/article/' : '/article/';
    var url = window.location.origin + basePath + article.id;
    var title = article.title;
    var excerpt = article.excerpt;

    var buttons = [
        { type: 'copy', icon: 'fas fa-link', text: t('share.button'), cls: 'share-btn-copy' },
        { type: 'twitter', icon: 'fab fa-twitter', text: '', cls: 'share-btn-twitter' },
        { type: 'weibo', icon: 'fab fa-weibo', text: '', cls: 'share-btn-weibo' },
        { type: 'qq', icon: 'fab fa-qq', text: '', cls: 'share-btn-qq' },
    ];

    buttons.forEach(function (btn) {
        var el = document.createElement('button');
        el.className = 'share-btn-platform ' + btn.cls + (btn.text ? '' : ' share-btn-icon');
        el.innerHTML = '<i class="' + btn.icon + '"></i>' + (btn.text ? ' ' + btn.text : '');
        el.addEventListener('click', function (e) {
            handleShareClick(btn.type, url, title, excerpt, el);
        });
        shareContainer.appendChild(el);
    });
}

function handleShareClick(type, url, title, excerpt, btn) {
    switch (type) {
        case 'copy':
            copyToClipboard(url, btn);
            break;
        case 'twitter':
            window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url), '_blank', 'noopener');
            break;
        case 'weibo':
            window.open('https://service.weibo.com/share/share.php?title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url), '_blank', 'noopener');
            break;
        case 'qq':
            window.open('https://connect.qq.com/widget/shareqq/index.html?title=' + encodeURIComponent(title) + '&url=' + encodeURIComponent(url), '_blank', 'noopener');
            break;
    }
}

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
        var origHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> ' + t('share.copied');
        setTimeout(function () { btn.innerHTML = origHtml; }, 2000);
    }).catch(function () {
        btn.innerHTML = '<i class="fas fa-times"></i> ' + t('share.copyFailed');
    });
}
