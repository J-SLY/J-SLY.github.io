# JSLY's Blog — AGENTS.md

Vanilla HTML/CSS/JS static blog, deployed on GitHub Pages.

## Architecture

- **Entrypoint**: `index.html` — single-page blog with hash-based article modals
- **Content**: `articles.json` — each article has Markdown `content` array (joined with `\n`, rendered via `marked.js`)
- **Public submission page**: `public/index.html` (served at `/public/`) — independent subpage for community-contributed articles
  - Data source: `articles-public.json` (separate from main blog, includes `author`/`authorLink` fields)
  - JS: `js/articles-public.js` — fetches data, renders cards with author badges; modal display via shared `showArticleModal()` in `article-modal-shared.js`
  - CSS: `css/components/public.css` — distinct indigo accent (`#5c6bc0`), author badge styles
  - Router: `js/article-router.js` handles `/public/article/{id}` standalone pages (loads `articles-public.json`)
  - Submission workflow: users create GitHub Issues via `.github/ISSUE_TEMPLATE/public-submission.yml`, owner reviews and merges into `articles-public.json`
- **JS load order** (index.html): `marked.min.js` → `pinyin-pro` → `display-mode.js` → `utils.js` → `article-content.js` → `article-toc.js` → `article-comments.js` → `article-share.js` → `article-og.js` → `article-modal-shared.js` → `article-modal.js` → `articles.js` → `search.js` → `dark-mode.js` → `settings.js` → `navigation.js` → `nav-scroll.js` → `main.js`
  - `display-mode.js` must load first (cookie utilities)
  - `utils.js` defines shared utilities like `escapeHtml()` globally
  - `article-content.js` must load before `article-modal.js` (content builder → modal)
  - `article-modal-shared.js` must load before `article-modal.js` (shared modal logic)
  - `articles.js` defines `articlesData`, loads article cards
  - `search.js` accepts `dataSource`/`onOpenArticle` options; falls back to `window.articlesData`/`window.openArticle`
- **JS for standalone article page** (standalone route `/article/{id}` or `/public/article/{id}` served via `404.html` router): `display-mode.js` → `utils.js` → `article-content.js` → `article-toc.js` → `article-comments.js` → `article-share.js` → `article-og.js` → `article-router.js` → `dark-mode.js` → `search.js` → `settings.js` → `navigation.js` → `nav-scroll.js` (rendering handled by `article-router.js`)
- **CSS**: modular — `base.css` (vars/reset), `layout.css` (header/hero/footer), `components/cards.css` (article grid/cards/tags), `components/overlay.css` (modal/search/settings overlays), `components/article.css` (article detail/TOC/comments), `components/public.css` (public submission page styles), `responsive.css`
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
- Matches: title, tags, excerpt, full content (all four also support pinyin matching)
- Pinyin matching requires query length >= 2 (`search.js:49`)
- `initSearch(options)` is called from within the fetch `.then()` callback in `articles.js`/`articles-public.js`, AFTER data is assigned — never chain `.then()` from outside
- `findPinyinMatchRange()` strips spaces from query (`query.replace(/\s+/g, '')`) before comparing against the concatenated pinyin string
- Both title/excerpt and content use `matchPinyin()` for pinyin matching

## CDN SRI Hashes

- All CDN scripts use SRI `integrity` attributes for security
- If CDN content changes, hashes become stale — browser console shows computed hash in error message
- Fix: copy the computed SHA value from the error message into the `integrity` attribute
- Affected CDNs: `cdnjs.cloudflare.com` (marked, highlight.js, Font Awesome), `cdn.jsdelivr.net` (pinyin-pro)

## Changelog

- Every meaningful change must be recorded in `articles-change.json` before pushing（文章新增/修改不计入 changelog）
- Add a new entry with incrementing `id`, today's `date` (format: `YYYY-MM-DD` 或 `YYYY-MM-DD HH:MM`)，a `type` field, descriptive `title`, and markdown `content` listing what changed
- Type values: `fix` (bug 修复), `feat` (新功能), `chore` (重构/杂项)
- The changelog is rendered at `/change/` via `js/articles-change.js`

## Deployment

- **小修复**（typo、样式微调等）：可直接推送 `main` 分支触发自动部署。
- **文章**（新增/修改）：文章不计入 changelog，可直接推送。
- **大功能**（重构等）：在本地改完，我说「推」再推，不要擅自推送。
