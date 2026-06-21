/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function showArticleDetail(article) {
    const existingModal = document.querySelector('.article-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'article-modal';

    modal.innerHTML = `
        <div class="modal-content">
            <div class="reading-progress-bar">
                <div class="progress-fill"></div>
            </div>
            <span class="close-modal">&times;</span>
            <div class="article-detail">
                ${buildArticleContent(article)}
            </div>
        </div>
    `;

    updateOGTags(article);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const modalContent = modal.querySelector('.modal-content');
    const progressFill = modal.querySelector('.progress-fill');
    if (modalContent && progressFill) {
        modalContent.addEventListener('scroll', function () {
            const scrollTop = modalContent.scrollTop;
            const scrollHeight = modalContent.scrollHeight - modalContent.clientHeight;
            progressFill.style.width = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 + '%' : '0%';
        });
    }

    initArticleHighlights(modal);
    generateTOC(modal, modalContent);
    initGiscus(modal, article.id);
    initLikeButton(modal, article);
    initShareButton(modal, article);

    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') closeModal();
    };

    const closeModal = () => {
        if (document.body.contains(modal)) document.body.removeChild(modal);
        document.body.style.overflow = 'auto';
        restoreOGTags();
        modal.removeEventListener('click', handleBackgroundClick);
        document.removeEventListener('keydown', handleEscapeKey);
    };

    const handleBackgroundClick = (e) => {
        if (e.target === modal) closeModal();
    };

    modal.querySelector('.close-modal').addEventListener('click', closeModal, {once: true});
    modal.addEventListener('click', handleBackgroundClick);
    document.addEventListener('keydown', handleEscapeKey);
}

function openArticleFromHash() {
    const match = window.location.hash.match(/^#article-(\d+)$/);
    if (!match) return;

    const articleId = parseInt(match[1], 10);
    const article = articlesData.find(a => a.id === articleId);

    if (article) {
        if (getArticleDisplayMode() === 'page') {
            // navigate to clean article URL
            window.location.href = '/article/' + article.id;
            return;
        }
        setTimeout(() => showArticleDetail(article), 300);
    } else {
        window.location.href = '/404.html';
    }
}

window.addEventListener('hashchange', function() {
    openArticleFromHash();
});
