/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

const LIKED_KEY = 'liked_articles';

function getLikedArticles() {
    const match = document.cookie.match(new RegExp('(?:^| )' + LIKED_KEY + '=([^;]+)'));
    if (!match || !match[1]) return new Set();
    return new Set(match[1].split(',').map(Number).filter(n => !isNaN(n)));
}

function setLikedArticle(articleId, liked) {
    const likedSet = getLikedArticles();
    if (liked) likedSet.add(Number(articleId));
    else likedSet.delete(Number(articleId));
    const value = Array.from(likedSet).join(',');
    if (value) {
        document.cookie = LIKED_KEY + '=' + value + ';path=/;max-age=31536000;SameSite=Lax';
    } else {
        document.cookie = LIKED_KEY + '=;path=/;max-age=0;SameSite=Lax';
    }
}
