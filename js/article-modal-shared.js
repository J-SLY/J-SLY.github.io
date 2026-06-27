/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function showArticleModal(article, options) {
    options = options || {};

    var existingModal = document.querySelector('.article-modal');
    if (existingModal) {
        restoreOGTags();
        existingModal.remove();
    }

    var modal = document.createElement('div');
    modal.className = 'article-modal';

    var content = buildArticleContent(article);
    if (options.authorSectionHtml) {
        content = content.replace('<div class="article-body">', '<div class="article-body">' + options.authorSectionHtml);
    }

    modal.innerHTML = [
        '<div class="modal-content">',
        '  <div class="reading-progress-bar"><div class="progress-fill"></div></div>',
        '  <span class="close-modal">&times;</span>',
        '  <div class="article-detail">',
        '    ' + content,
        '  </div>',
        '</div>'
    ].join('\n');

    updateOGTags(article);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    var modalContent = modal.querySelector('.modal-content');
    var progressFill = modal.querySelector('.progress-fill');
    if (modalContent && progressFill) {
        modalContent.addEventListener('scroll', function () {
            var scrollTop = modalContent.scrollTop;
            var scrollHeight = modalContent.scrollHeight - modalContent.clientHeight;
            progressFill.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 + '%' : '0%';
        });
    }

    initArticleHighlights(modal);
    generateTOC(modal, modalContent);
    initGiscus(modal, (options.giscusIdPrefix || '') + article.id);
    initShareButton(modal, article);

    function closeModalFn() {
        if (document.body.contains(modal)) document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
        restoreOGTags();
        modal.removeEventListener('click', bgClickFn);
        document.removeEventListener('keydown', escKeyFn);
    }

    function escKeyFn(e) {
        if (e.key === 'Escape') closeModalFn();
    }

    function bgClickFn(e) {
        if (e.target === modal) closeModalFn();
    }

    modal.querySelector('.close-modal').addEventListener('click', closeModalFn, { once: true });
    modal.addEventListener('click', bgClickFn);
    document.addEventListener('keydown', escKeyFn);
}
