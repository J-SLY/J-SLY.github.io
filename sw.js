/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

var CACHE_NAME = 'jsly-blog-v1';
var STATIC_URLS = [
  '/',
  '/index.html',
  '/404.html',
  '/css/base.css',
  '/css/layout.css',
  '/css/components/cards.css',
  '/css/components/overlay.css',
  '/css/components/article.css',
  '/css/components/public.css',
  '/css/responsive.css',
  '/css/print.css',
  '/js/core/display-mode.js',
  '/js/core/utils.js',
  '/js/core/dark-mode.js',
  '/js/core/settings.js',
  '/js/core/navigation.js',
  '/js/core/nav-scroll.js',
  '/js/core/search.js',
  '/js/core/main.js',
  '/js/i18n/i18n.js',
  '/js/i18n/lang-reload.js',
  '/js/article-view/article-content.js',
  '/js/article-view/article-toc.js',
  '/js/article-view/article-comments.js',
  '/js/article-view/article-share.js',
  '/js/article-view/article-og.js',
  '/js/article-view/article-modal-shared.js',
  '/js/article-view/article-modal.js',
  '/js/articles/articles.js',
  '/js/articles/articles-public.js',
  '/js/core/keyboard.js',
  '/tags/',
  '/tags/index.html',
  '/css/components/tags.css',
  '/js/articles/articles-tags.js',
  '/images/JS.svg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // CDN resources: network-first with cache fallback
  if (url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Data files: network-first
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(fetchResponse) {
        var copy = fetchResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, copy); });
        return fetchResponse;
      });
    })
  );
});
