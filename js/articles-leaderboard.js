/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

var currentBoard = 'pr';

var defaultPrData = [
    {
        rank: 1,
        username: 'J-SLY',
        count: 135,
        description: '项目维护者，核心功能开发与代码审查',
        link: 'https://github.com/J-SLY'
    }
];
var defaultIssuesData = [];

var leaderboardCache = {
    pr: null,
    issues: null,
    submissions: null
};

var boardLabels = {
    pr: 'PR 榜',
    issues: 'Issues 榜',
    submissions: '投稿榜'
};

var boardIcons = {
    pr: 'fa-code-branch',
    issues: 'fa-exclamation-circle',
    submissions: 'fa-feather-alt'
};

var boardAccentColors = {
    pr: '#66bb6a',
    issues: '#e53e3e',
    submissions: '#5c6bc0'
};

function getMedalHtml(rank) {
    if (rank === 1) return '<span class="leaderboard-medal gold"><i class="fas fa-crown"></i></span>';
    if (rank === 2) return '<span class="leaderboard-medal silver"><i class="fas fa-medal"></i></span>';
    if (rank === 3) return '<span class="leaderboard-medal bronze"><i class="fas fa-medal"></i></span>';
    return '<span class="leaderboard-rank-num">' + rank + '</span>';
}

function getAvatarUrl(username) {
    return 'https://avatars.githubusercontent.com/' + encodeURIComponent(username) + '?s=48';
}

function extractGithubUsername(authorLink) {
    if (!authorLink) return null;
    var match = authorLink.match(/github\.com\/([^\/\?#]+)/i);
    return match ? match[1] : null;
}

function buildSubmissionsFromArticles(articles) {
    var counts = {};
    var authorInfo = {};

    articles.forEach(function (article) {
        var author = article.author || '匿名';
        if (!counts[author]) {
            counts[author] = 0;
            authorInfo[author] = {
                authorLink: article.authorLink || '',
                author: author
            };
        }
        counts[author]++;
    });

    var entries = Object.keys(counts).map(function (author) {
        var info = authorInfo[author];
        var ghUser = extractGithubUsername(info.authorLink);
        return {
            username: ghUser || author,
            author: info.author,
            authorLink: info.authorLink,
            count: counts[author],
            description: '共 ' + counts[author] + ' 篇投稿'
        };
    });

    entries.sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        return (a.username || '').localeCompare(b.username || '');
    });
    entries.forEach(function (entry, idx) {
        entry.rank = idx + 1;
    });

    return entries;
}

function loadLeaderboard() {
    fetch('/articles-public.json')
        .then(function (resp) {
            if (!resp.ok) throw new Error('网络响应不正常');
            return resp.json();
        })
        .then(function (data) {
            var articles = data.articles || [];
            leaderboardCache.submissions = buildSubmissionsFromArticles(articles);

            leaderboardCache.pr = defaultPrData;
            leaderboardCache.issues = defaultIssuesData;

            updateStats();
            renderFilters();
            renderBoard('pr');
        })
        .catch(function (err) {
            console.error('加载贡献榜时出错:', err);
            var container = document.getElementById('leaderboard-container');
            if (container) {
                container.innerHTML = '<p class="error-message">无法加载贡献榜数据，请稍后重试。</p>';
            }
        });
}

function updateStats() {
    var prTotal = 0, issueTotal = 0, subTotal = 0;
    if (leaderboardCache.pr) {
        leaderboardCache.pr.forEach(function (e) { prTotal += e.count; });
    }
    if (leaderboardCache.issues) {
        leaderboardCache.issues.forEach(function (e) { issueTotal += e.count; });
    }
    if (leaderboardCache.submissions) {
        leaderboardCache.submissions.forEach(function (e) { subTotal += e.count; });
    }
    var prEl = document.getElementById('total-prs');
    var issueEl = document.getElementById('total-issues');
    var subEl = document.getElementById('total-submissions');
    if (prEl) prEl.textContent = prTotal;
    if (issueEl) issueEl.textContent = issueTotal;
    if (subEl) subEl.textContent = subTotal;
}

function renderFilters() {
    var container = document.getElementById('leaderboard-filters');
    if (!container) return;

    var types = ['pr', 'issues', 'submissions'];
    container.innerHTML = '';
    types.forEach(function (type) {
        var btn = document.createElement('button');
        btn.className = 'leaderboard-filter-btn' + (type === currentBoard ? ' active' : '');
        var color = boardAccentColors[type];
        btn.style.setProperty('--accent', color);
        btn.innerHTML = '<i class="fas ' + boardIcons[type] + '"></i> ' + boardLabels[type];
        btn.dataset.type = type;
        btn.addEventListener('click', function () {
            switchBoard(type);
        });
        container.appendChild(btn);
    });
}

function switchBoard(type) {
    currentBoard = type;
    renderBoard(type);
    var btns = document.querySelectorAll('.leaderboard-filter-btn');
    btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
}

function renderBoard(type) {
    var container = document.getElementById('leaderboard-container');
    if (!container) return;

    var entries = leaderboardCache[type];
    if (!entries || entries.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无数据。</p>';
        return;
    }

    var sorted = entries.slice().sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        return (a.username || '').localeCompare(b.username || '');
    });
    var accent = boardAccentColors[type];
    container.style.setProperty('--accent', accent);

    container.innerHTML = '';
    var list = document.createElement('div');
    list.className = 'leaderboard-list';

    sorted.forEach(function (entry, idx) {
        var item = document.createElement('div');
        item.className = 'leaderboard-item fade-in';
        if (idx === 0) item.classList.add('top-one');

        var avatarUrl = getAvatarUrl(entry.username);

        var nameHtml;
        if (type === 'submissions' && entry.authorLink) {
            nameHtml = '<a href="' + encodeURI(entry.authorLink) + '" target="_blank" rel="noopener" class="leaderboard-name-link">' + escapeHtml(entry.author || entry.username) + '</a>';
        } else if (entry.link) {
            nameHtml = '<a href="' + encodeURI(entry.link) + '" target="_blank" rel="noopener" class="leaderboard-name-link">' + escapeHtml(entry.username) + '</a>';
        } else {
            nameHtml = '<span class="leaderboard-name">' + escapeHtml(entry.username) + '</span>';
        }

        var descHtml = entry.description
            ? '<div class="leaderboard-desc">' + escapeHtml(entry.description) + '</div>'
            : '';

        item.innerHTML = [
            '<div class="leaderboard-rank">' + getMedalHtml(entry.rank) + '</div>',
            '<img class="leaderboard-avatar" src="' + avatarUrl + '" alt="' + escapeHtml(entry.username) + '" loading="lazy" onerror="this.src=\'../JS.svg\'">',
            '<div class="leaderboard-info">',
            '  <div class="leaderboard-name-row">' + nameHtml + '</div>',
            '  ' + descHtml,
            '</div>',
            '<div class="leaderboard-count"><span class="leaderboard-count-num">' + entry.count + '</span><span class="leaderboard-count-label">' + getCountLabel(type) + '</span></div>'
        ].join('\n');

        list.appendChild(item);
    });

    container.appendChild(list);
}

function getCountLabel(type) {
    var labels = {
        pr: '个 PR',
        issues: '个 Issue',
        submissions: '篇投稿'
    };
    return labels[type] || '';
}
