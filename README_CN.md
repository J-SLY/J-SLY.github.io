# JSLY's Blog

[![AGPL-3.0 License](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222222)](https://pages.github.com/)

基于原生 HTML/CSS/JS 的静态个人博客，部署于 GitHub Pages。支持社区公共投稿、带拼音模糊匹配的全文搜索、暗色模式等功能。

**[→ 访问博客](https://www.jsly.asia)** · **[→ 公共投稿](https://www.jsly.asia/public/)** · **[→ 更新日志](https://www.jsly.asia/change/)**

---

## 功能特性

- **文章系统** — Markdown 内容经 [marked.js](https://marked.js.org/) 渲染，支持 `#article-<id>` 哈希深链
- **公共投稿** — 通过 GitHub Issues 提交社区文章，独立子页面展示，附带作者徽标
- **全文搜索** — 客户端搜索，支持拼音模糊匹配（基于 [pinyin-pro](https://pinyin-pro.cn/)），覆盖标题、标签、摘要、正文
- **暗色模式** — 一键切换暗色/亮色主题，设置持久保存
- **阅读设置** — 可自定义字号、行高、列宽、导航栏锁定
- **文章目录** — 自动生成目录，支持滚动跟踪高亮
- **代码高亮** — 基于 [highlight.js](https://highlightjs.org/)，支持主题切换
- **社交分享** — OG 标签、Web Share API、链接复制
- **响应式设计** — 移动端友好，自适应导航
- **RSS 订阅** — 自动生成的 `feed.xml`
- **独立文章页** — 通过 GitHub Pages 404.html 路由实现 `/article/{id}`、`/public/article/{id}` 独立访问

## 技术栈

| 技术 | 用途 |
|---|---|
| HTML5 / CSS3 / 原生 JS | 核心栈 — 无框架、无构建工具 |
| [marked.js](https://marked.js.org/) | Markdown 渲染 |
| [highlight.js](https://highlightjs.org/) | 代码语法高亮 |
| [pinyin-pro](https://pinyin-pro.cn/) | 中文拼音搜索匹配 |
| [Font Awesome 6](https://fontawesome.com/) | 图标库 |
| [GitHub Pages](https://pages.github.com/) | 托管与部署 |

## 项目结构

```
├── index.html                  # 单页博客入口
├── 404.html                    # GitHub Pages SPA 路由
├── article.html                # 独立文章页模板
├── CNAME                       # 自定义域名配置
├── feed.xml                    # RSS 订阅源
├── css/
│   ├── base.css                # CSS 变量、重置、排版
│   ├── layout.css              # 页头、英雄区、页脚布局
│   ├── responsive.css          # 响应式断点
│   └── components/
│       ├── cards.css           # 文章网格、卡片、标签
│       ├── overlay.css         # 模态框、搜索、设置浮层
│       ├── article.css         # 文章详情、目录、评论
│       └── public.css          # 公共投稿页面样式
├── js/
│   ├── i18n/                   # 国际化
│   │   ├── i18n.js             # 国际化引擎（语言检测、翻译函数）
│   │   └── locales/            # UI 翻译文件
│   │       ├── zh.json
│   │       ├── en.json
│   │       ├── ja.json
│   │       └── ru.json
│   ├── core/                   # 核心功能
│   │   ├── display-mode.js     # 基于 Cookie 的显示模式
│   │   ├── utils.js            # 共享工具函数
│   │   ├── dark-mode.js        # 暗色模式切换
│   │   ├── settings.js         # 阅读设置面板
│   │   ├── navigation.js       # 导航与路由
│   │   ├── nav-scroll.js       # 导航栏滚动行为
│   │   ├── search.js           # 全文搜索（含拼音匹配）
│   │   └── main.js             # 初始化入口
│   ├── articles/               # 文章数据与渲染
│   │   ├── articles.js         # 主博客文章列表
│   │   ├── articles-public.js  # 公共投稿列表
│   │   ├── articles-change.js  # 更新日志渲染
│   │   └── articles-leaderboard.js  # 贡献者排行榜
│   └── article-view/           # 文章详情组件
│       ├── article-content.js  # 内容构建器
│       ├── article-toc.js      # 文章目录
│       ├── article-comments.js # 评论区
│       ├── article-share.js    # 分享功能
│       ├── article-og.js       # Open Graph 标签
│       ├── article-modal-shared.js # 共享模态框逻辑
│       ├── article-modal.js    # 模态框展示
│       └── article-router.js   # 独立页面路由
├── data/
│   ├── articles.json           # 主博客文章数据
│   ├── articles-{lang}.json    # 主博客多语言数据（zh/en/ja/ru）
│   ├── articles-public.json    # 公共投稿文章数据
│   ├── articles-public-{lang}.json # 公共投稿多语言数据
│   ├── articles-change.json    # 更新日志数据
│   └── articles-change-{lang}.json # 更新日志多语言数据
├── public/
│   └── index.html              # 公共投稿页面
├── leaderboard/
│   └── index.html              # 贡献者排行榜页面
├── change/
│   └── index.html              # 更新日志页面
├── images/                     # 静态图片与 SVG
└── .github/ISSUE_TEMPLATE/
    └── public-submission.yml   # 公共投稿 Issue 模板
```

## 内容管理

### 撰写文章

博客支持多语言（zh/en/ja/ru）。编辑 `data/articles-{lang}.json` 对应语言文件，新增文章需同步所有语言文件：

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

文章深链：`https://www.jsly.asia/#article-my-article`

### 更新日志

有意义的功能变更需记录在 `data/articles-change-{lang}.json` 中（文章新增/修改不计入）。每条包含：
- `type`：`fix`（修复）、`feat`（新功能）、`chore`（重构/杂项）
- `title`：简短描述
- `date`：`YYYY-MM-DD HH:MM`（**必须包含时间**，否则排序会因时区出错）
- `content`：Markdown 描述

### 公共投稿

社区成员通过创建 GitHub Issue（使用[公共投稿模板](.github/ISSUE_TEMPLATE/public-submission.yml)）提交文章。审核通过后合并到 `data/articles-public-{lang}.json`。

## 搜索

客户端全文搜索支持：
- 标题、标签、摘要、正文匹配
- 拼音模糊匹配（查询长度 ≥ 2 时启用）
- 结果高亮与上下文预览

## 部署

推送 `main` 分支即可触发 GitHub Pages 自动部署。

推送重大变更前：
1. 更新 `change/index.html` 71-72 行的提交次数和推送次数
2. 在 `data/articles-change.json` 中记录变更

```bash
git rev-list --count HEAD                                    # 总提交数
git rev-list --count --no-merges origin/main..HEAD           # 推送前新提交数
```

## 许可协议

Copyright (C) 2026 JSLY

本项目基于 **GNU Affero General Public License v3.0 or later** 发布 — 详见 [LICENSE](LICENSE) 文件。

仓库中每个源文件均带有 `SPDX-License-Identifier: AGPL-3.0-or-later` 头部声明。

---

由 [JSLY](https://github.com/J-SLY) 用心构建 ❤️
