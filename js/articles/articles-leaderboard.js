/* Copyright (C) 2026 JSLY
 * SPDX-License-Identifier: AGPL-3.0-or-later */

var currentBoard = 'pr';

var LEADERBOARD_CONFIG = {
    owner: 'J-SLY',
    repo: 'J-SLY.github.io',
    excludeLabels: ['public-submission', 'stats:exclude']
};

function fetchPaginated(url, extractItems) {
    var allItems = [];
    function fetchPage(pageUrl) {
        return fetch(pageUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } })
            .then(function (resp) {
                if (!resp.ok) throw new Error('GitHub API 请求失败: ' + resp.status);
                return resp.json().then(function (data) {
                    var items = extractItems(data);
                    allItems = allItems.concat(items);
                    var link = resp.headers.get('Link');
                    if (link) {
                        var m = link.match(/<([^>]+)>;\s*rel="next"/);
                        if (m) return fetchPage(m[1]);
                    }
                    return allItems;
                });
            });
    }
    return fetchPage(url);
}

function fetchLeaderboardData(type) {
    var q = 'repo:' + LEADERBOARD_CONFIG.owner + '/' + LEADERBOARD_CONFIG.repo + '+type:' + type;
    if (LEADERBOARD_CONFIG.excludeLabels) {
        LEADERBOARD_CONFIG.excludeLabels.forEach(function (label) {
            q += '+-label:' + encodeURIComponent(label);
        });
    }
    var url = 'https://api.github.com/search/issues?q=' + q + '&per_page=100';
    return fetchPaginated(url, function (data) { return data.items; }).then(function (items) {
        var counts = {}, userInfo = {};
        items.forEach(function (item) {
            var user = item.user;
            if (!user || !user.login) return;
            var login = user.login;
            if (!counts[login]) {
                counts[login] = 0;
                userInfo[login] = { username: login, profileUrl: user.html_url };
            }
            counts[login]++;
        });
        var entries = Object.keys(counts).map(function (login) {
            var info = userInfo[login];
            var typeDesc = type === 'pr' ? t('leaderboard.countPR') : t('leaderboard.countIssue');
            return { username: info.username, count: counts[login], description: t('leaderboard.countDesc', { count: counts[login], type: typeDesc }), link: info.profileUrl };
        });
        entries.sort(function (a, b) {
            if (b.count !== a.count) return b.count - a.count;
            return (a.username || '').localeCompare(b.username || '');
        });
        entries.forEach(function (e, i) { e.rank = i + 1; });
        return entries;
    });
}

var leaderboardCache = {
    pr: null,
    issues: null,
    submissions: null
};

function boardLabel(type) {
    var keyMap = { pr: 'tabPR', issues: 'tabIssue', submissions: 'tabSubmission' };
    return t('leaderboard.' + (keyMap[type] || type));
}

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
        var author = article.author || t('leaderboard.anonymous');
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
            description: t('leaderboard.countDesc', { count: counts[author], type: t('leaderboard.countSubmission') })
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
    var lang = (window.__currentLang || 'zh').split('-')[0];
    var articlesPromise = fetch('/data/articles-public-' + lang + '.yaml').then(function (resp) {
        if (!resp.ok) return fetch('/data/articles-public-zh.yaml');
        return resp;
    }).then(function (resp) {
        if (!resp.ok) throw new Error('网络响应不正常');
        return resp.text().then(function (text) { return jsyaml.load(text); });
    });
    var issuesPromise = fetchLeaderboardData('issue').catch(function (err) {
        console.error('加载 Issues 数据时出错:', err);
        return [];
    });
    var prPromise = fetchLeaderboardData('pr').catch(function (err) {
        console.error('加载 PR 数据时出错:', err);
        return [];
    });

    Promise.all([articlesPromise, issuesPromise, prPromise])
        .then(function (results) {
            var data = results[0];
            var issuesData = results[1];
            var prData = results[2];
            var articles = data.articles || [];
            leaderboardCache.submissions = buildSubmissionsFromArticles(articles);
            leaderboardCache.pr = prData;
            leaderboardCache.issues = issuesData;

            updateStats();
            renderFilters();
            renderBoard('pr');
        })
        .catch(function (err) {
            console.error('加载贡献榜时出错:', err);
            var container = document.getElementById('leaderboard-container');
            if (container) {
                container.innerHTML = '<p class="error-message">' + t('leaderboard.loadError') + '</p>';
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
        btn.innerHTML = '<i class="fas ' + boardIcons[type] + '"></i> ' + boardLabel(type);
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
        container.innerHTML = '<p class="no-articles">' + t('leaderboard.empty') + '</p>';
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
            '<img class="leaderboard-avatar" src="' + avatarUrl + '" alt="' + escapeHtml(entry.username) + '" loading="lazy" onerror="this.src=\'../images/JS.svg\'">',
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
    var key = type === 'pr' ? 'leaderboard.countPR' : type === 'issues' ? 'leaderboard.countIssue' : 'leaderboard.countSubmission';
    return t(key);
}
