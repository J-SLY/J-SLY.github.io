/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

(function () {
  function showNotFound() {
    document.getElementById('article-content').innerHTML =
      '<div style="padding:48px;text-align:center;"><h1>404 · 页面未找到</h1><p>您访问的页面不存在。</p><p><a href="/">返回首页</a></p></div>';
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
