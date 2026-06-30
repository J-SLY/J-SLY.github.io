/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initShareButton(container, article, isPublic) {
    const shareBtn = container.querySelector('.share-btn');
    if (!shareBtn) return;
    shareBtn.addEventListener('click', function() {
        var btn = this;
        const basePath = isPublic ? '/public/article/' : '/article/';
        const url = window.location.origin + basePath + article.id;
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: url,
            }).catch(function(error) { console.log('分享出错:', error); });
        } else {
            navigator.clipboard.writeText(url).then(function() {
                var origHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> ' + t('share.copied');
                setTimeout(function() { btn.innerHTML = origHtml; }, 2000);
            }).catch(function(error) {
                console.log('复制链接出错:', error);
                btn.innerHTML = '<i class="fas fa-times"></i> ' + t('share.copyFailed');
            });
        }
    });
}
