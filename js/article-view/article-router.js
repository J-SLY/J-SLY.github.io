/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

(function () {
  function showNotFound() {
    document.getElementById('article-content').innerHTML = [
      '<div class="not-found">',
      '  <div class="not-found-code">404</div>',
      '  <div class="not-found-icon"><i class="fas fa-map-signs"></i></div>',
      '  <h1>' + t('router.404heading') + '</h1>',
      '  <p class="not-found-message">' + t('router.404message') + '</p>',
      '  <div class="not-found-actions">',
      '    <a href="/" class="btn"><i class="fas fa-home"></i> ' + t('router.backHome') + '</a>',
      '    <a href="/#articles" class="btn btn-outline"><i class="fas fa-book"></i> ' + t('router.browseArticles') + '</a>',
      '  </div>',
      '  <div class="not-found-suggestions">',
      '    <h3>' + t('router.suggestions') + '</h3>',
      '    <ul>',
      '      <li><a href="/"><i class="fas fa-arrow-right"></i> ' + t('router.goHome') + '</a></li>',
      '      <li><a href="/#articles"><i class="fas fa-arrow-right"></i> ' + t('router.viewArticles') + '</a></li>',
      '      <li><a href="/#about"><i class="fas fa-arrow-right"></i> ' + t('router.aboutMe') + '</a></li>',
      '    </ul>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function renderArticle(article, seriesArticles) {
    document.title = article.title + t('router.titleSuffix');
    var container = document.getElementById('article-content');
    var seriesMode = getArticleDisplayMode() === 'legacy' ? 'main-legacy' : 'main-page';
    var seriesNavOpts = seriesArticles ? buildSeriesNavHtml(article, seriesArticles, seriesMode) : null;
    container.innerHTML = buildArticleContent(article, false, seriesNavOpts);
    initArticleHighlights(container);
    generateTOC(container);
    initGiscus(container, article.id);
    updateOGTags(article);
    initShareButton(container, article, false);
  }

  function renderPublicArticle(article, seriesArticles) {
    document.title = article.title + t('router.publicSuffix');
    var container = document.getElementById('article-content');
    var safeLink = sanitizeAuthorLink(article.authorLink);
    var authorHtml = safeLink
      ? '<a href="' + encodeURI(safeLink) + '" target="_blank" rel="noopener">' + escapeHtml(article.author) + '</a>'
      : escapeHtml(article.author);
    var authorSection = [
      '<div class="article-author-info">',
      '  <i class="fas fa-feather-alt"></i>',
      '  <div>',
      '    <div class="author-label">' + t('public.author') + '</div>',
      '    <div class="author-name">' + authorHtml + '</div>',
      '  </div>',
      '</div>'
    ].join('\n');
    var seriesMode = getArticleDisplayMode() === 'legacy' ? 'public-legacy' : 'public-page';
    var seriesNavOpts = seriesArticles ? buildSeriesNavHtml(article, seriesArticles, seriesMode) : null;
    container.innerHTML = buildArticleContent(article, false, seriesNavOpts, authorSection);
    initArticleHighlights(container);
    generateTOC(container);
    initGiscus(container, 'public-' + article.id);
    updateOGTags(article);
    initShareButton(container, article, true);
  }

  function tryRenderArticleFromPath() {
    var pathname = window.location.pathname || '/';
    var lang = (window.__currentLang || 'zh').split('-')[0];

    var publicMatch = pathname.match(/^\/public\/article\/(\d+)\/?$/);
    if (publicMatch) {
      var pubId = parseInt(publicMatch[1], 10);
      fetch('/data/articles-public-' + lang + '.json')
        .then(function (resp) {
          if (!resp.ok) return fetch('/data/articles-public-zh.json');
          return resp;
        })
        .then(function (resp) {
          if (!resp.ok) throw new Error('Network response not ok');
          return resp.json();
        })
        .then(function (data) {
          var article = data.articles.find(function (a) { return Number(a.id) === pubId; });
          if (!article) { showNotFound(); return; }
          var pubSeries = article.series && article.series.name ? buildSeriesMap(data.articles)[article.series.name] : null;
          renderPublicArticle(article, pubSeries);
        })
        .catch(function (err) {
          console.error('Failed to load public article:', err);
          showNotFound();
        });
      return true;
    }

    var match = pathname.match(/^\/article\/(\d+)\/?$/);
    if (match) {
      var id = parseInt(match[1], 10);
      fetch('/data/articles-' + lang + '.json')
        .then(function (resp) {
          if (!resp.ok) throw new Error('网络响应不正常');
          return resp.json();
        })
        .then(function (data) {
          var article = data.articles.find(function (a) { return Number(a.id) === id; });
          if (!article) { showNotFound(); return; }
          var series = article.series && article.series.name ? buildSeriesMap(data.articles)[article.series.name] : null;
          renderArticle(article, series);
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
      var rawId = params.get('id');

      // pub- prefix → public article; otherwise → main blog article
      if (rawId && rawId.indexOf('pub-') === 0) {
        var pubId = parseInt(rawId.substring(4), 10);
        if (pubId) {
          fetch('/data/articles-public-' + lang + '.json')
            .then(function (resp) { if (!resp.ok) return fetch('/data/articles-public-zh.json'); return resp; })
            .then(function (resp) { if (!resp.ok) throw new Error('Network response not ok'); return resp.json(); })
            .then(function (data) {
              var article = data.articles.find(function (a) { return Number(a.id) === pubId; });
              if (!article) { showNotFound(); return; }
              var pubSeries = article.series && article.series.name ? buildSeriesMap(data.articles)[article.series.name] : null;
              renderPublicArticle(article, pubSeries);
            })
            .catch(function (err) { console.error('加载投稿文章时出错:', err); showNotFound(); });
        } else {
          showNotFound();
        }
        return true;
      }

      var id2 = parseInt(rawId, 10);
      if (id2) {
        fetch('/data/articles-' + lang + '.json')
          .then(function (resp) { if (!resp.ok) return fetch('/data/articles-zh.json'); return resp; })
          .then(function (resp) { if (!resp.ok) throw new Error('Network response not ok'); return resp.json(); })
          .then(function (data) {
            var article = data.articles.find(function (a) { return Number(a.id) === id2; });
            if (!article) { showNotFound(); return; }
            var series = article.series && article.series.name ? buildSeriesMap(data.articles)[article.series.name] : null;
            renderArticle(article, series);
          })
          .catch(function (err) { console.error('加载文章数据时出错:', err); showNotFound(); });
        return true;
      }
    }

    return false;
  }

  function initRouter() {
    if (!tryRenderArticleFromPath()) {
      showNotFound();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
  } else {
    initRouter();
  }
})();
