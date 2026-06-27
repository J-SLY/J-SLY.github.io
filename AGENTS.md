# JSLY's Blog — AGENTS.md

Vanilla HTML/CSS/JS static blog, deployed on GitHub Pages.

## Architecture

- **Entrypoint**: `index.html` — single-page blog with hash-based article modals
- **Content**: `data/articles.json` — each article has Markdown `content` array (joined with `\n`, rendered via `marked.js`)
- **Public submission page**: `public/index.html` (served at `/public/`) — independent subpage for community-contributed articles
  - Data source: `data/articles-public.json` (separate from main blog, includes `author`/`authorLink` fields)
  - JS: `js/articles/articles-public.js` — fetches data, renders cards with author badges; modal display via shared `showArticleModal()` in `js/article-view/article-modal-shared.js`
  - CSS: `css/components/public.css` — distinct indigo accent (`#5c6bc0`), author badge styles
  - Router: `js/article-view/article-router.js` handles `/public/article/{id}` standalone pages (loads `data/articles-public.json`)
  - Submission workflow: users create GitHub Issues via `.github/ISSUE_TEMPLATE/public-submission.yml`, owner reviews and merges into `data/articles-public.json`
- **JS directory structure**:
  - `js/core/` — display-mode, utils, dark-mode, settings, navigation, nav-scroll, search, main
  - `js/articles/` — articles, articles-public, articles-change, articles-leaderboard
  - `js/article-view/` — article-content, article-toc, article-comments, article-share, article-og, article-modal-shared, article-modal, article-router
- **JS load order** (index.html): `marked.min.js` → `pinyin-pro` → `core/display-mode.js` → `core/utils.js` → `article-view/article-content.js` → `article-view/article-toc.js` → `article-view/article-comments.js` → `article-view/article-share.js` → `article-view/article-og.js` → `article-view/article-modal-shared.js` → `article-view/article-modal.js` → `articles/articles.js` → `core/search.js` → `core/dark-mode.js` → `core/settings.js` → `core/navigation.js` → `core/nav-scroll.js` → `core/main.js`
  - `core/display-mode.js` must load first (cookie utilities)
  - `core/utils.js` defines shared utilities like `escapeHtml()` globally
  - `article-view/article-content.js` must load before `article-view/article-modal.js` (content builder → modal)
  - `article-view/article-modal-shared.js` must load before `article-view/article-modal.js` (shared modal logic)
  - `articles/articles.js` defines `articlesData`, loads article cards
  - `core/search.js` accepts `dataSource`/`onOpenArticle` options; falls back to `window.articlesData`/`window.openArticle`
- **JS for standalone article page** (standalone route `/article/{id}` or `/public/article/{id}` served via `404.html` router): `core/display-mode.js` → `core/utils.js` → `article-view/article-content.js` → `article-view/article-toc.js` → `article-view/article-comments.js` → `article-view/article-share.js` → `article-view/article-og.js` → `article-view/article-router.js` → `core/dark-mode.js` → `core/search.js` → `core/settings.js` → `core/navigation.js` → `core/nav-scroll.js` (rendering handled by `article-view/article-router.js`)
- **CSS**: modular — `base.css` (vars/reset), `layout.css` (header/hero/footer), `components/cards.css` (article grid/cards/tags), `components/overlay.css` (modal/search/settings overlays), `components/article.css` (article detail/TOC/comments), `components/public.css` (public submission page styles), `responsive.css`
- **External CDN deps**: Font Awesome 6.4.0, marked 9.1.6, highlight.js 11.9.0, pinyin-pro 3.26.0

## Key conventions

- **No build tools, no package.json, no tests, no linters** — edit files directly
- **License**: AGPL-3.0-or-later — every source file has a copyright header
- **Language**: Chinese (zh-CN) UI, English tech variable names
- **Custom domain**: `www.jsly.asia` (configured in `CNAME`)
- **Deploy**: push to `main` branch — GitHub Pages serves the root directory

## Content workflow

- Edit `data/articles.json` to add/update articles — each article has `id`, `title`, `date`, `tags`, `excerpt`, `content` (array of Markdown lines), optional `image`
- Article deep link: `#article-<id>` in URL hash

## Search

- Client-side, supports pinyin matching via `pinyin-pro`
- Matches: title, tags, excerpt, full content (all four also support pinyin matching)
- Pinyin matching requires query length >= 2 (`js/core/search.js:49`)
- `initSearch(options)` is called from within the fetch `.then()` callback in `js/articles/articles.js`/`js/articles/articles-public.js`, AFTER data is assigned — never chain `.then()` from outside
- `findPinyinMatchRange()` strips spaces from query (`query.replace(/\s+/g, '')`) before comparing against the concatenated pinyin string
- Both title/excerpt and content use `matchPinyin()` for pinyin matching

## CDN SRI Hashes

- All CDN scripts use SRI `integrity` attributes for security
- If CDN content changes, hashes become stale — browser console shows computed hash in error message
- Fix: copy the computed SHA value from the error message into the `integrity` attribute
- Affected CDNs: `cdnjs.cloudflare.com` (marked, highlight.js, Font Awesome), `cdn.jsdelivr.net` (pinyin-pro)

## Changelog

- Every meaningful change must be recorded in `articles-change.json` before pushing（文章新增/修改不计入 changelog）
- Add a new entry with incrementing `id`, today's `date` (format: `YYYY-MM-DD HH:MM`，**必须包含时间**，否则排序会因时区问题出错)，a `type` field, descriptive `title`, and markdown `content` listing what changed
- Type values: `fix` (bug 修复), `feat` (新功能), `chore` (重构/杂项)
- The changelog is rendered at `/change/` via `js/articles/articles-change.js`

## Deployment

- **小修复**（typo、样式微调等）：可直接推送 `main` 分支触发自动部署。
- **文章**（新增/修改）：文章不计入 changelog，可直接推送。
- **大功能**（重构等）：在本地改完，我说「推」再推，不要擅自推送。
- **推送前**：更新 `change/index.html:71-72` 中的提交次数和推送次数（运行 `git rev-list --count HEAD` 和 `git rev-list --count --no-merges origin/main..HEAD` 等命令获取最新数字）。
