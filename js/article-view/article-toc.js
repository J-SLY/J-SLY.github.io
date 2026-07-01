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
    const chevron = document.createElement('i');
    chevron.className = 'fas fa-chevron-down toc-chevron';
    tocTitle.innerHTML = '<i class="fas fa-list"></i> ' + t('toc.title') + ' ';
    tocTitle.appendChild(chevron);
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

    function updateTOCCollapse() {
        const isMobile = window.innerWidth <= 992;
        toc.classList.toggle('collapsed', isMobile);
    }
    updateTOCCollapse();
    window.addEventListener('resize', updateTOCCollapse);

    tocTitle.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
            e.stopPropagation();
            toc.classList.toggle('collapsed');
        }
    });

    var scrollEl = scrollRoot || window;

    function updateActiveHeading() {
        var scrollTop = scrollEl === window ? window.scrollY : scrollEl.scrollTop;
        var headerHeight = document.querySelector('header') ? document.querySelector('header').offsetHeight : 0;
        var offset = headerHeight + 30;
        var activeIdx = -1;
        headings.forEach(function (h, i) {
            var hTop;
            if (scrollEl === window) {
                hTop = h.getBoundingClientRect().top + window.scrollY;
            } else {
                hTop = h.offsetTop;
            }
            if (hTop - scrollTop < offset) {
                activeIdx = i;
            }
        });
        if (activeIdx >= 0) {
            tocSidebar.querySelectorAll('.article-toc-item a').forEach(function (link, i) {
                link.classList.toggle('active', i === activeIdx);
            });
        }
    }

    updateActiveHeading();
    scrollEl.addEventListener('scroll', updateActiveHeading, { passive: true });
}
