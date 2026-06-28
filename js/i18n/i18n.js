/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

(function () {
  var LOCALE_ZH = {
    "nav": {
      "home": "首页",
      "articles": "文章",
      "public": "公共投稿",
      "leaderboard": "贡献榜",
      "changelog": "更新日志",
      "about": "关于我"
    },
    "darkmode": { "title": "切换暗色模式" },
    "settings": {
      "title": "阅读设置", "close": "关闭设置",
      "subtitleNav": "导航栏", "lockNav": "锁定导航栏",
      "subtitleMode": "阅读模式",
      "modal": "弹窗模式", "newPage": "新页面模式", "legacy": "兼容模式 (article.html?id=)",
      "subtitleDefault": "默认页面", "mainSite": "主站", "publicSite": "公共投稿",
      "subtitleLang": "界面语言"
    },
    "search": {
      "aria": "搜索",
      "placeholder": "搜索文章标题、标签、内容...",
      "hint": "输入关键词搜索，支持标题、标签、摘要和内容",
      "empty": "未找到匹配的文章"
    },
    "menu": { "aria": "菜单" },
    "hero": { "ctaRead": "开始阅读", "ctaSubmit": "我要投稿" },
    "section": { "latestArticles": "最新文章", "about": "关于我" },
    "footer": {
      "quickLinks": "快速链接", "contact": "联系我",
      "address": "中国，安徽，六安",
      "copyright": "保留所有权利.", "sourceCode": "源代码 (AGPL-3.0)"
    },
    "article": {
      "pinned": "置顶",
      "empty": "暂无文章，敬请期待...",
      "loadError": "无法加载文章，请检查网络连接或刷新页面重试。",
      "readTime": "约 {minutes} 分钟",
      "backToList": "返回文章列表"
    },
    "share": { "button": "分享", "copied": "链接已复制", "copyFailed": "复制失败" },
    "toc": { "title": "目录" },
    "change": {
      "all": "全部", "feat": "功能更新", "fix": "Bug 修复", "chore": "杂项",
      "empty": "暂无更新日志。", "loadError": "无法加载更新日志，请稍后重试。"
    },
    "changePage": {
      "title": "更新日志", "desc": "记录博客的每一次改进。",
      "modeLabel": "模式：", "modeUser": "用户版", "modeDev": "开发者版",
      "sectionTitle": "变更历史",
      "commits": "次提交", "pushes": "次推送",
      "sinceUntil": "至今"
    },
    "leaderboard": {
      "tabPR": "PR 榜", "tabIssue": "Issues 榜", "tabSubmission": "投稿榜",
      "anonymous": "匿名",
      "countPR": "PR", "countIssue": "Issue", "countSubmission": "投稿",
      "empty": "暂无数据。", "loadError": "无法加载贡献榜数据，请稍后重试。",
      "countDesc": "共 {count} 个 {type}"
    },
    "leaderboardPage": {
      "title": "贡献榜", "desc": "感谢每一位通过 PR、Issue 或投稿为博客做出贡献的朋友。",
      "sectionTitle": "贡献者排名"
    },
    "public": {
      "empty": "暂无投稿，期待你的第一篇贡献！",
      "author": "投稿作者",
      "loadError": "无法加载文章，请稍后重试。",
      "sectionTitle": "投稿文章"
    },
    "publicPage": {
      "title": "公共投稿",
      "heroTitle": "JSLY's Public Blog",
      "desc": "来自社区的声音。欢迎提交你的文章，与更多人分享知识与见解。",
      "submitGitHub": "GitHub 投稿", "submitEmail": "邮件投稿", "submitEmailAlt": "邮件投稿（备选）",
      "howTitle": "如何投稿？", "howText": "两种方式任选其一：",
      "howGithub": "<strong>GitHub</strong> — 点击上方「GitHub 投稿」按钮，按模板填写 Issue 提交（你的 GitHub 用户名会自动作为作者名）。",
      "howEmail": "<strong>邮件</strong> — 点击上方「邮件投稿」按钮，发送邮件至 {email}，请附上文章标题、正文（Markdown）和你的署名。",
      "howWait": "提交后等待审核，审核通过后文章会出现在这里。"
    },
    "router": {
      "titleSuffix": " - JSLY's Blog",
      "publicSuffix": " - 公共投稿 - JSLY's Blog",
      "404heading": "页面未找到",
      "404message": "您访问的页面不存在，可能已被移除或链接有误。",
      "backHome": "返回首页", "browseArticles": "浏览文章",
      "suggestions": "您可能想要",
      "goHome": "前往首页", "viewArticles": "查看文章列表", "aboutMe": "了解关于我"
    },
    "404page": {
      "title": "404 - 页面未找到",
      "backLink": "返回文章列表"
    },
    "lang": {
      "zh": "中文", "en": "英文", "ja": "日文", "ru": "俄文"
    },
    "meta": {
      "siteName": "JSLY's Blog", "description": "JSLY's Blog",
      "siteTitle": "JSLY's Blog",
      "keywords": "博客, 个人博客, JSLY, 技术, 编程",
      "changeTitle": "更新日志 - JSLY's Blog",
      "publicKeywords": "博客, 投稿, 社区, JSLY",
      "publicTitle": "公共投稿 - JSLY's Blog",
      "publicDesc": "公共投稿 - JSLY's Blog",
      "publicOGDesc": "来自社区的投稿文章",
      "changeKeywords": "博客, 更新日志, JSLY, 网站更新",
      "changeDesc": "更新日志 - JSLY's Blog",
      "changeOGDesc": "博客功能更新与变更历史",
      "leaderboardKeywords": "博客, 贡献榜, PR, Issues, 投稿, JSLY",
      "leaderboardTitle": "贡献榜 - JSLY's Blog",
      "leaderboardDesc": "贡献榜 - JSLY's Blog",
      "leaderboardOGDesc": "感谢每一位贡献者的付出",
      "errorDesc": "页面未找到 - JSLY's Blog",
      "errorTitle": "404 - 页面未找到"
    }
  };

  var currentLang = 'zh';
  var localeData = LOCALE_ZH;
  var loaded = true;
  var SUPPORTED = ['zh', 'en', 'ja', 'ru'];

  function detectLanguage() {
    var m = window.location.search.match(/[?&]lang=([a-z]{2}(-[a-z]{2})?)/i);
    if (m && SUPPORTED.indexOf(m[1].substring(0, 2)) !== -1) return m[1].substring(0, 2);
    var s = localStorage.getItem('blog_lang');
    if (s && SUPPORTED.indexOf(s) !== -1) return s;
    var n = (navigator.language || '').substring(0, 2);
    if (n && SUPPORTED.indexOf(n) !== -1) return n;
    return 'zh';
  }

  function lookup(key) {
    var keys = key.split('.');
    var val = localeData;
    for (var i = 0; i < keys.length; i++) {
      if (val == null || typeof val !== 'object') return undefined;
      val = val[keys[i]];
    }
    return val;
  }

  window.t = function (key, params) {
    var val = lookup(key);
    if (typeof val !== 'string') return key;
    if (params) {
      for (var k in params) {
        if (params.hasOwnProperty(k)) {
          val = val.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
        }
      }
    }
    return val;
  };

  function applyI18n(root) {
    root = root || document;
    if (!loaded) return;
    var els, i, key, text, tel, tkey, ael, akey, pel, pkey;

    els = root.querySelectorAll('[data-i18n]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n');
      text = t(key);
      if (text !== key) els[i].textContent = text;
    }

    els = root.querySelectorAll('[data-i18n-title]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-title');
      text = t(key);
      if (text !== key) els[i].setAttribute('title', text);
    }

    els = root.querySelectorAll('[data-i18n-aria]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-aria');
      text = t(key);
      if (text !== key) els[i].setAttribute('aria-label', text);
    }

    els = root.querySelectorAll('[data-i18n-placeholder]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-placeholder');
      text = t(key);
      if (text !== key) els[i].setAttribute('placeholder', text);
    }

    els = root.querySelectorAll('[data-i18n-value]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-value');
      text = t(key);
      if (text !== key) els[i].value = text;
    }

    els = root.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < els.length; i++) {
      key = els[i].getAttribute('data-i18n-html');
      text = t(key);
      if (text !== key) els[i].innerHTML = text;
    }

    tel = root.querySelector('title[data-i18n]');
    if (tel) {
      tkey = tel.getAttribute('data-i18n');
      text = t(tkey);
      if (text !== tkey) document.title = text;
    }

    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : currentLang;
  }

  function loadLocale(lang, cb) {
    if (lang === 'zh') {
      localeData = LOCALE_ZH;
      currentLang = 'zh';
      loaded = true;
      if (cb) cb();
      return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/js/i18n/locales/' + lang + '.json', true);
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 400) {
        try {
          localeData = JSON.parse(xhr.responseText);
          currentLang = lang;
          loaded = true;
        } catch (e) { fallback(); }
      } else { fallback(); }
      if (cb) cb();
    };
    xhr.onerror = function () { fallback(); if (cb) cb(); };
    xhr.send();
    function fallback() {
      localeData = LOCALE_ZH;
      currentLang = 'zh';
      loaded = true;
    }
  }

  window.setLanguage = function (lang, noReload) {
    if (SUPPORTED.indexOf(lang) === -1) lang = 'zh';
    localStorage.setItem('blog_lang', lang);
    if (noReload) {
      loadLocale(lang, function () { applyI18n(); });
    } else {
      window.location.reload();
    }
  };

  window.applyI18n = applyI18n;
  window.__currentLang = currentLang;

  currentLang = detectLanguage();
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : currentLang;
  window.__currentLang = currentLang;

  if (currentLang !== 'zh') {
    loadLocale(currentLang, function () {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { applyI18n(); });
      } else {
        applyI18n();
      }
    });
  } else {
    localeData = LOCALE_ZH;
    loaded = true;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { applyI18n(); });
    } else {
      applyI18n();
    }
  }
})();
