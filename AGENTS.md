# JSLY's Blog — AGENTS.md

Vanilla HTML/CSS/JS static blog, deployed on GitHub Pages.

## Architecture

- **Entrypoint**: `index.html` — single-page blog with hash-based article modals
- **Content**: `articles.json` — each article has Markdown `content` array (joined with `\n`, rendered via `marked.js`)
- **JS load order** (index.html:158–171): `marked.min.js` → `pinyin-pro` → `display-mode.js` → `article-content.js` → `article-toc.js` → `article-comments.js` → `article-share.js` → `article-og.js` → `article-modal.js` → `articles.js` → `search.js` → `dark-mode.js` → `settings.js` → `navigation.js` → `nav-scroll.js` → `main.js`
  - `display-mode.js` must load first (cookie utilities)
  - `article-content.js` must load before `article-modal.js` (content builder → modal)
  - `articles.js` defines `articlesData`, loads article cards
- **JS for standalone article page** (standalone route `/article/{id}` served via `404.html` router): `display-mode.js` → `article-content.js` → `article-toc.js` → `article-comments.js` → `article-share.js` → `article-og.js` → `article-router.js` → `dark-mode.js` → `search.js` → `settings.js` → `navigation.js` → `nav-scroll.js` (rendering handled by `article-router.js`)
- **CSS**: modular — `base.css` (vars/reset), `layout.css` (header/hero/footer), `components/cards.css` (article grid/cards/tags), `components/overlay.css` (modal/search/settings overlays), `components/article.css` (article detail/TOC/comments), `responsive.css`
- **External CDN deps**: Font Awesome 6.4.0, marked 9.1.6, highlight.js 11.9.0, pinyin-pro 3.26.0

## Key conventions

- **No build tools, no package.json, no tests, no linters** — edit files directly
- **License**: AGPL-3.0-or-later — every source file has a copyright header
- **Language**: Chinese (zh-CN) UI, English tech variable names
- **Custom domain**: `www.jsly.asia` (configured in `CNAME`)
- **Deploy**: push to `main` branch — GitHub Pages serves the root directory

## Content workflow

- Edit `articles.json` to add/update articles — each article has `id`, `title`, `date`, `tags`, `excerpt`, `content` (array of Markdown lines), optional `image`
- Article deep link: `#article-<id>` in URL hash

## Search

- Client-side, supports pinyin matching via `pinyin-pro`
- Matches: title, tags, excerpt, full content
- Pinyin matching requires query length >= 2 (`search.js:49`)

## Deployment

- **小修复**（typo、样式微调等）：可直接推送 `main` 分支触发自动部署。
- **大功能**（新文章、重构等）：在本地改完，我说「推」再推，不要擅自推送。
