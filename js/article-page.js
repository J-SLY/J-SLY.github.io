/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    const container = document.getElementById('article-content');

    if (!id) {
        window.location.href = '404.html';
        return;
    }

    fetch('articles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            const article = data.articles.find(a => a.id === id);
            if (!article) {
                window.location.href = '404.html';
                return;
            }
            renderArticlePage(article);
        })
        .catch(error => {
            console.error('加载文章数据时出错:', error);
            container.innerHTML = '<p class="error-message">无法加载文章，请稍后重试。</p>';
        });

    // Dark mode toggle
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    const icon = darkModeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme');
    let initialDark = false;
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        icon.classList.replace('fa-moon', 'fa-sun');
        initialDark = true;
    } else if (savedTheme === 'light') {
        // do nothing
    } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark-mode');
            icon.classList.replace('fa-moon', 'fa-sun');
            initialDark = true;
        }
    }
    updateHighlightTheme(initialDark);

    function updateHighlightTheme(isDark) {
        const link = document.getElementById('hljs-theme');
        if (link) {
            link.href = isDark
                ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css'
                : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
        }
    }

    function updateGiscusTheme(isDark) {
        const theme = isDark ? 'dark' : 'light';
        const giscusIframe = document.querySelector('giscus-widget iframe');
        if (giscusIframe) {
            giscusIframe.contentWindow.postMessage({ giscus: { setConfig: { theme: theme } } }, 'https://giscus.app');
        }
    }

    darkModeToggle.addEventListener('click', function() {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        }
        updateGiscusTheme(isDark);
        updateHighlightTheme(isDark);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const isDark = e.matches;
            if (isDark) {
                document.documentElement.classList.add('dark-mode');
                icon.classList.replace('fa-moon', 'fa-sun');
            } else {
                document.documentElement.classList.remove('dark-mode');
                icon.classList.replace('fa-sun', 'fa-moon');
            }
            updateGiscusTheme(isDark);
            updateHighlightTheme(isDark);
        }
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (window.innerWidth <= 992) {
        navLinks.style.display = 'none';
    }

    menuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });

    if (typeof initSearch === 'function') {
        initSearch();
    }
});

function renderArticlePage(article) {
    document.title = article.title + ' - JSLY\'s Blog';

    const container = document.getElementById('article-content');
    container.innerHTML = buildArticleContent(article, false);

    container.querySelectorAll('.markdown-body pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Generate TOC
    const markdownBody = container.querySelector('.markdown-body');
    if (markdownBody) {
        const headings = markdownBody.querySelectorAll('h1, h2, h3');
        if (headings.length > 1) {
            const toc = document.createElement('nav');
            toc.className = 'article-toc';
            const tocTitle = document.createElement('div');
            tocTitle.className = 'article-toc-title';
            tocTitle.innerHTML = '<i class="fas fa-list"></i> 目录';
            toc.appendChild(tocTitle);

            const tocList = document.createElement('ul');
            tocList.className = 'article-toc-list';

            headings.forEach(h => {
                if (!h.id) {
                    h.id = h.textContent.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '');
                }

                const li = document.createElement('li');
                li.className = 'article-toc-item';
                li.style.paddingLeft = (parseInt(h.tagName[1]) - 1) * 16 + 'px';

                const a = document.createElement('a');
                a.href = '#' + h.id;
                a.textContent = h.textContent;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.getElementById(h.id);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                });

                li.appendChild(a);
                tocList.appendChild(li);
            });

            toc.appendChild(tocList);

            const tocSidebar = container.querySelector('.article-toc-sidebar');
            if (tocSidebar) {
                tocSidebar.appendChild(toc);
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            tocSidebar.querySelectorAll('.article-toc-item a').forEach(link => {
                                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                            });
                        }
                    });
                }, { rootMargin: '-80px 0px -80% 0px', threshold: 0 });
                headings.forEach(h => observer.observe(h));
            }
        }
    }

    // Giscus comments
    const commentsDiv = container.querySelector('.article-comments');
    if (commentsDiv) {
        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'J-SLY/J-SLY.github.io');
        script.setAttribute('data-repo-id', 'R_kgDOSmP4AQ');
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'DIC_kwDOSmP4Ac4C_k-w');
        script.setAttribute('data-mapping', 'specific');
        script.setAttribute('data-term', 'article-' + article.id);
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

    // Update OG tags
    updateOGTags(article);

    // Like and share buttons
    container.querySelector('.like-btn').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-heart"></i> 已点赞';
        this.style.background = '#e74c3c';
        this.disabled = true;
    }, {once: true});

    container.querySelector('.share-btn').addEventListener('click', function() {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: url,
            })
            .catch(error => console.log('分享出错:', error));
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i> 链接已复制';
            });
        }
    }, {once: true});
}
