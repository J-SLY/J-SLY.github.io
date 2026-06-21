# JSLY's Blog — AGENTS.md

Vanilla HTML/CSS/JS static blog, deployed on GitHub Pages.

## Architecture

- **Entrypoint**: `index.html` — single-page blog with hash-based article modals
- **Content**: `articles.json` — each article has Markdown `content` array (joined with `\n`, rendered via `marked.js`)
- **JS load order** (index.html:125–130): `marked.min.js` → `pinyin-pro` → `articles.js` → `search.js` → `navigation.js` → `main.js`
  - `articles.js` must load first (defines `articlesData`, `showArticleDetail`)
- **CSS**: modular — `base.css` (vars/reset), `layout.css` (header/hero/footer), `components.css` (cards/modals/search), `responsive.css`
- **External CDN deps**: Font Awesome 6.4.0, marked 9.1.6, pinyin-pro 3.26.0

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

## Automated Deployment

- Every time you edit `articles.json`, `index.html`, CSS/JS files, or any static resource, you **must** immediately run `git add . && git commit -m "Update content" && git push` to push the changes to the `main` branch, which will trigger GitHub Pages to automatically redeploy.
- If you want further automation, you can use a file watching tool locally (such as `entr` or `watch`) to automatically execute the above commands, or configure a post-commit hook in Git, but this repository does not require it.
- Note: Any changes not pushed will cause the online site to be inconsistent with the local version, affecting access.