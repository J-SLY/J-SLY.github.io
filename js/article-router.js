/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

(function () {
  function showNotFound() {
    document.getElementById('article-content').innerHTML = [
      '<div class="not-found">',
      '  <div class="not-found-code">404</div>',
      '  <div class="not-found-icon"><i class="fas fa-map-signs"></i></div>',
      '  <h1>页面未找到</h1>',
      '  <p class="not-found-message">您访问的页面不存在，可能已被移除或链接有误。</p>',
      '  <div class="not-found-actions">',
      '    <a href="/" class="btn"><i class="fas fa-home"></i> 返回首页</a>',
      '    <a href="/#articles" class="btn btn-outline"><i class="fas fa-book"></i> 浏览文章</a>',
      '  </div>',
      '  <div class="not-found-suggestions">',
      '    <h3>您可能想要</h3>',
      '    <ul>',
      '      <li><a href="/"><i class="fas fa-arrow-right"></i> 前往首页</a></li>',
      '      <li><a href="/#articles"><i class="fas fa-arrow-right"></i> 查看文章列表</a></li>',
      '      <li><a href="/#about"><i class="fas fa-arrow-right"></i> 了解关于我</a></li>',
      '    </ul>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function renderArticle(article) {
    document.title = article.title + ' - JSLY\'s Blog';
    var container = document.getElementById('article-content');
    container.innerHTML = buildArticleContent(article, false);
    initArticleHighlights(container);
    generateTOC(container);
    initGiscus(container, article.id);
    updateOGTags(article);
    initShareButton(container, article);
  }

  function tryRenderArticleFromPath() {
    var pathname = window.location.pathname || '/';
    var match = pathname.match(/^\/article\/(\d+)\/?$/);
    if (match) {
      var id = parseInt(match[1], 10);
      fetch('/articles.json')
        .then(function (resp) {
          if (!resp.ok) throw new Error('网络响应不正常');
          return resp.json();
        })
        .then(function (data) {
          var article = data.articles.find(function (a) { return Number(a.id) === id; });
          if (!article) { showNotFound(); return; }
          renderArticle(article);
        })
        .catch(function (err) {
          console.error('加载文章数据时出错:', err);
          showNotFound();
        });
      return true;
    }

    var qs = window.location.search || '';
    if (qs.indexOf('id=') !== -1 && pathname.indexOf('article.html') !== -1) {
      var params = new URLSearchParams(qs);
      var id2 = parseInt(params.get('id'), 10);
      if (id2) {
        fetch('/articles.json')
          .then(function (resp) { if (!resp.ok) throw new Error('网络响应不正常'); return resp.json(); })
          .then(function (data) {
            var article = data.articles.find(function (a) { return Number(a.id) === id2; });
            if (!article) { showNotFound(); return; }
            renderArticle(article);
          })
          .catch(function (err) { console.error(err); showNotFound(); });
        return true;
      }
    }

    return false;
  }

  if (!tryRenderArticleFromPath()) {
    showNotFound();
  }
})();
