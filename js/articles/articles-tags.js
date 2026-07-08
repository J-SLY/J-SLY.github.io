/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

function loadTags() {
    var lang = (window.__currentLang || 'zh').split('-')[0];
    var url = '/data/articles-' + lang + '.yaml';
    fetch(url).then(function (resp) {
        if (!resp.ok) return fetch('/data/articles-zh.yaml');
        return resp;
    })
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.text().then(function (text) { return jsyaml.load(text); });
        })
        .then(function (data) {
            renderTags(data.articles || []);
        })
        .catch(function (err) {
            console.error('加载标签时出错:', err);
            var container = document.getElementById('tags-container');
            if (container) {
                container.innerHTML = '<p class="error-message">' + (window.t ? t('article.loadError') : '无法加载文章，请检查网络连接或刷新页面重试。') + '</p>';
            }
        });
}

function renderTags(articles) {
    var container = document.getElementById('tags-container');
    if (!container) return;

    var tagMap = {};
    articles.forEach(function (article) {
        var tags = article.tags || [];
        tags.forEach(function (tag) {
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push(article);
        });
    });

    var tagNames = Object.keys(tagMap);
    if (tagNames.length === 0) {
        container.innerHTML = '<p class="no-articles">' + (window.t ? t('tagsPage.empty') : '暂无标签。') + '</p>';
        return;
    }

    tagNames.sort(function (a, b) {
        var diff = tagMap[b].length - tagMap[a].length;
        if (diff !== 0) return diff;
        return a < b ? -1 : 1;
    });

    var articleCount = articles.length;
    var tagCount = tagNames.length;

    var maxCount = tagMap[tagNames[0]].length;
    var minCount = tagMap[tagNames[tagNames.length - 1]].length;
    var sizeRange = maxCount - minCount || 1;

    var html = '';

    html += '<div class="tags-stats">';
    html += '  <span>' + (window.t ? t('tagsPage.count', { tags: tagCount, articles: articleCount }) : '共 ' + tagCount + ' 个标签 \u00B7 ' + articleCount + ' 篇文章') + '</span>';
    html += '</div>';

    html += '<div class="tags-cloud">';
    tagNames.forEach(function (tag) {
        var count = tagMap[tag].length;
        var ratio = sizeRange > 1 ? (count - minCount) / sizeRange : count / maxCount;
        var size = 0.8 + Math.pow(ratio, 0.6) * 1.6;
        var pad = Math.round(3 + Math.pow(ratio, 0.6) * 12);
        var encodedTag = encodeURIComponent(tag);
        console.log('TAG:', tag, 'count:', count, 'ratio:', ratio, 'size:', size.toFixed(2), 'pad:', pad);
        html += '<a href="#tag-' + encodedTag + '" class="tag-cloud-item" style="font-size: ' + size.toFixed(2) + 'rem; padding: ' + pad + 'px ' + (pad + 9) + 'px">';
        html += escapeHtml(tag);
        html += ' <span class="tag-count">' + count + '</span>';
        html += '</a>';
    });
    html += '</div>';

    html += '<div class="tags-articles">';
    tagNames.forEach(function (tag) {
        var count = tagMap[tag].length;
        var encodedTag = encodeURIComponent(tag);
        html += '<section id="tag-' + encodedTag + '" class="tag-section">';
        html += '  <h2 class="tag-section-title">' + escapeHtml(tag) + ' <span class="tag-count">' + count + '</span></h2>';
        html += '  <div class="tag-articles-grid">';
        tagMap[tag].forEach(function (article) {
            var excerpt = article.excerpt || '';
            if (excerpt.length > 100) {
                excerpt = excerpt.substring(0, 100) + '...';
            }
            html += '    <a href="/article/' + encodeURIComponent(article.id) + '" class="tag-article-card">';
            html += '      <div class="tag-article-title">' + escapeHtml(article.title) + '</div>';
            html += '      <div class="tag-article-date">' + escapeHtml(article.date) + '</div>';
            html += '      <div class="tag-article-excerpt">' + escapeHtml(excerpt) + '</div>';
            html += '    </a>';
        });
        html += '  </div>';
        html += '</section>';
    });
    html += '</div>';

    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function () {
    loadTags();
});
