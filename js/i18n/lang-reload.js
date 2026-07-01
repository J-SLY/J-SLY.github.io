/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

document.addEventListener('languageChanged', function () {
    if (typeof loadArticlesFromJSON === 'function') {
        var container = document.getElementById('articles-container');
        if (container) {
            container.innerHTML = '<p class="loading-message">' + (t('article.loading') || '加载中...') + '</p>';
        }
        loadArticlesFromJSON();
    }

    if (typeof loadPublicArticles === 'function') {
        loadPublicArticles();
    }

    if (typeof loadChangeLog === 'function') {
        loadChangeLog();
    }

    if (typeof loadLeaderboard === 'function') {
        loadLeaderboard();
    }
});
