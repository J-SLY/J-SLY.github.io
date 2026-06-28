# JSLY's Blog

[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222222)](https://pages.github.com/)

A static personal blog built with vanilla HTML/CSS/JS, deployed on GitHub Pages. Features a public community submission system, full-text search with pinyin support, dark mode, and more.

**[→ Visit Blog](https://www.jsly.asia)** · **[→ Public Submissions](https://www.jsly.asia/public/)** · **[→ Changelog](https://www.jsly.asia/change/)**

---

## Features

- **Article System** — Markdown-based articles rendered via [marked.js](https://marked.js.org/), with hash-based deep linking (`#article-<id>`)
- **Public Submissions** — Community-contributed articles via GitHub Issues, displayed on a dedicated subpage with author badges
- **Full-Text Search** — Client-side search with pinyin matching (via [pinyin-pro](https://pinyin-pro.cn/)), covering title, tags, excerpt, and content
- **Dark Mode** — Toggleable dark/light theme with persistent settings
- **Reading Settings** — Customizable font size, line height, column width, and navigation bar lock
- **Article Table of Contents** — Auto-generated TOC with scroll tracking
- **Syntax Highlighting** — Code blocks highlighted via [highlight.js](https://highlightjs.org/) with theme switching
- **Open Graph / Share** — OG meta tags, Web Share API integration, and link copying
- **Responsive Design** — Mobile-friendly layout with adaptive navigation
- **RSS Feed** — Auto-generated `feed.xml` for subscription
- **Standalone Article Pages** — Deep-linkable standalone routes via GitHub Pages 404.html router (`/article/{id}`, `/public/article/{id}`)

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 / CSS3 / Vanilla JS | Core stack — no frameworks, no build tools |
| [marked.js](https://marked.js.org/) | Markdown rendering |
| [highlight.js](https://highlightjs.org/) | Code syntax highlighting |
| [pinyin-pro](https://pinyin-pro.cn/) | Chinese pinyin matching for search |
| [Font Awesome 6](https://fontawesome.com/) | Icon library |
| [GitHub Pages](https://pages.github.com/) | Hosting and deployment |

## Project Structure

```
├── index.html                  # Single-page blog entrypoint
├── 404.html                    # GitHub Pages SPA router
├── article.html                # Standalone article page template
├── CNAME                       # Custom domain: www.jsly.asia
├── feed.xml                    # RSS feed
├── css/
│   ├── base.css                # CSS variables, reset, typography
│   ├── layout.css              # Header, hero, footer layout
│   ├── responsive.css          # Responsive breakpoints
│   └── components/
│       ├── cards.css           # Article grid, cards, tags
│       ├── overlay.css         # Modal, search, settings overlays
│       ├── article.css         # Article detail, TOC, comments
│       └── public.css          # Public submission page styles
├── js/
│   ├── i18n/                   # Internationalization
│   │   ├── i18n.js             # i18n engine (detection, translation)
│   │   └── locales/            # UI locale files
│   │       ├── zh.json
│   │       ├── en.json
│   │       ├── ja.json
│   │       └── ru.json
│   ├── core/                   # Core functionality
│   │   ├── display-mode.js     # Cookie-based display mode
│   │   ├── utils.js            # Shared utilities (escapeHtml, etc.)
│   │   ├── dark-mode.js        # Dark mode toggle
│   │   ├── settings.js         # Reading settings panel
│   │   ├── navigation.js       # Navigation and routing
│   │   ├── nav-scroll.js       # Scroll behavior for navbar
│   │   ├── search.js           # Full-text search with pinyin
│   │   └── main.js             # Initialization entrypoint
│   ├── articles/               # Article data and rendering
│   │   ├── articles.js         # Main article list
│   │   ├── articles-public.js  # Public submissions list
│   │   ├── articles-change.js  # Changelog rendering
│   │   └── articles-leaderboard.js  # Contributor leaderboard
│   └── article-view/           # Article detail components
│       ├── article-content.js  # Content builder
│       ├── article-toc.js      # Table of contents
│       ├── article-comments.js # Comment section
│       ├── article-share.js    # Share functionality
│       ├── article-og.js       # Open Graph tags
│       ├── article-modal-shared.js # Shared modal logic
│       ├── article-modal.js    # Modal display
│       └── article-router.js   # Standalone page router
├── data/
│   ├── articles.json           # Main blog articles (JSON array)
│   ├── articles-{lang}.json    # Main blog per-language data (zh/en/ja/ru)
│   ├── articles-public.json    # Public submission articles
│   ├── articles-public-{lang}.json # Public submissions per-language data
│   ├── articles-change.json    # Changelog entries
│   └── articles-change-{lang}.json # Changelog per-language data
├── public/
│   └── index.html              # Public submissions page
├── leaderboard/
│   └── index.html              # Contributor leaderboard page
├── change/
│   └── index.html              # Changelog page
├── images/                     # Static images and SVGs
└── .github/ISSUE_TEMPLATE/
    └── public-submission.yml   # Issue template for public submissions
```

## Content Management

### Writing Articles

Multi-language support (zh/en/ja/ru). Edit `data/articles-{lang}.json` for the target language. When adding an article, add it to all language files:

```json
{
  "id": "my-article",
  "title": "文章标题",
  "date": "2026-01-01",
  "tags": ["技术", "前端"],
  "excerpt": "文章摘要...",
  "content": [
    "# 一级标题",
    "",
    "正文内容，支持完整 Markdown 语法。",
    "",
    "```js",
    "console.log('Hello World');",
    "```"
  ],
  "image": "images/cover.jpg"
}
```

Article deep link: `https://www.jsly.asia/#article-my-article`

### Changelog

Record meaningful changes in `data/articles-change-{lang}.json`. Each entry has:
- `type`: `fix`, `feat`, or `chore`
- `title`: short description
- `date`: `YYYY-MM-DD HH:MM` (including time — required for correct sorting)
- `content`: Markdown description

### Public Submissions

Community members submit articles by creating a GitHub Issue using the [public submission template](.github/ISSUE_TEMPLATE/public-submission.yml). After review, approved articles are merged into `data/articles-public-{lang}.json`.

## Search

Client-side full-text search supports:
- Title, tags, excerpt, and full content matching
- Pinyin fuzzy matching (requires query length ≥ 2)
- Highlighted results with excerpt context

## Deployment

Push to the `main` branch to trigger automatic GitHub Pages deployment.

Before pushing significant changes:
1. Update commit/push counts in `change/index.html` (lines 71-72)
2. Record changes in `data/articles-change.json`

```bash
git rev-list --count HEAD           # total commits
git rev-list --count --no-merges origin/main..HEAD  # commits since last deploy
```

## License

Copyright (C) 2026 JSLY

This project is licensed under the **GNU Affero General Public License v3.0 or later** — see the [LICENSE](LICENSE) file for details.

Every source file in this repository carries the `SPDX-License-Identifier: AGPL-3.0-or-later` header.

---

Built with ❤️ by [JSLY](https://github.com/J-SLY)
