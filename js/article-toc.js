/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function generateTOC(container, scrollRoot) {
    const markdownBody = container.querySelector('.markdown-body');
    if (!markdownBody) return;
    const headings = markdownBody.querySelectorAll('h1, h2, h3');
    if (headings.length <= 1) return;

    const toc = document.createElement('nav');
    toc.className = 'article-toc';
    const tocTitle = document.createElement('div');
    tocTitle.className = 'article-toc-title';
    tocTitle.innerHTML = '<i class="fas fa-list"></i> 目录';
    toc.appendChild(tocTitle);

    const tocList = document.createElement('ul');
    tocList.className = 'article-toc-list';

    const usedIds = {};
    headings.forEach(h => {
        let baseId = (h.id || h.textContent).toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '');
        if (!baseId) baseId = 'heading';
        if (usedIds[baseId]) {
            usedIds[baseId]++;
            h.id = baseId + '-' + usedIds[baseId];
        } else {
            usedIds[baseId] = 1;
            h.id = baseId;
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
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        li.appendChild(a);
        tocList.appendChild(li);
    });

    toc.appendChild(tocList);

    const tocSidebar = container.querySelector('.article-toc-sidebar');
    if (!tocSidebar) return;
    tocSidebar.appendChild(toc);

    if (!scrollRoot) scrollRoot = container;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocSidebar.querySelectorAll('.article-toc-item a').forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { root: scrollRoot, rootMargin: '0px 0px -80% 0px', threshold: 0 });
    headings.forEach(h => observer.observe(h));
}
