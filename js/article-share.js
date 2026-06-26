/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initShareButton(container, article) {
    const shareBtn = container.querySelector('.share-btn');
    if (!shareBtn) return;
    shareBtn.addEventListener('click', function() {
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
