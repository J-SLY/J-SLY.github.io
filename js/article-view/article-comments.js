/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function initGiscus(container, articleId) {
    const commentsDiv = container.querySelector('.article-comments');
    if (!commentsDiv) return;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'J-SLY/J-SLY.github.io');
    script.setAttribute('data-repo-id', 'R_kgDOSmP4AQ');
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'DIC_kwDOSmP4Ac4C_k-w');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', 'article-' + articleId);
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    const giscusTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
    script.setAttribute('data-theme', giscusTheme);
    script.setAttribute('data-lang', 'zh-CN');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;
    commentsDiv.appendChild(script);
}
