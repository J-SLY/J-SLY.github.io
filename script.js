// 全局变量存储文章数据
let articlesData = [];

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 从JSON文件加载文章数据
    loadArticlesFromJSON();
    
    // 初始化导航功能
    initNavigation();
    
    // 添加事件监听器
    document.getElementById('load-more').addEventListener('click', loadMoreArticles);
    document.getElementById('subscribe-form').addEventListener('submit', handleSubscribe);
    
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // 响应式调整
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            navLinks.style.display = 'flex';
        } else {
            navLinks.style.display = 'none';
        }
    });
    
    // 监听滚动事件
    window.addEventListener('scroll', updateNavOnScroll);
});

// 从JSON文件加载文章
function loadArticlesFromJSON() {
    fetch('articles.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.json();
        })
        .then(data => {
            articlesData = data.articles;
            renderAllArticles();
        })
        .catch(error => {
            console.error('加载文章数据时出错:', error);
            // 如果加载失败，显示错误信息
            document.getElementById('articles-container').innerHTML = 
                '<p class="error-message">无法加载文章，请检查网络连接或刷新页面重试。</p>';
        });
}

// 渲染所有文章到对应的分类区域
function renderAllArticles() {
    // 清空所有文章容器
    document.querySelectorAll('.articles-grid').forEach(container => {
        container.innerHTML = '';
    });
    
    // 渲染所有文章到"最新文章"区域
    renderArticlesToContainer(articlesData, document.getElementById('articles-container'));
    
    // 根据分类渲染文章到对应区域
    const categories = {
        'travel': '旅行日记',
        'food': '美食记录', 
        'reading': '读书笔记',
        'life': '生活随笔'
    };
    
    // 渲染每个分类的文章
    Object.keys(categories).forEach(categoryId => {
        const categoryName = categories[categoryId];
        const container = document.getElementById(`${categoryId}-container`);
        const categoryArticles = articlesData.filter(article => article.category === categoryName);
        
        if (container) {
            renderArticlesToContainer(categoryArticles, container);
        }
    });
}

// 渲染文章到指定容器
function renderArticlesToContainer(articles, container) {
    if (!container) return;
    
    // 如果该分类没有文章，显示提示信息
    if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">暂无文章，敬请期待...</p>';
        return;
    }
    
    articles.forEach(article => {
        const articleElement = createArticleElement(article);
        container.appendChild(articleElement);
    });
    
    // 添加文章点击事件
    addArticleClickEvents();
}

// 创建文章元素
function createArticleElement(article) {
    const articleCard = document.createElement('article');
    articleCard.className = 'article-card fade-in';
    articleCard.setAttribute('data-article-id', article.id);
    
    articleCard.innerHTML = `
        <div class="article-image">
            <img src="${article.image}" alt="${article.title}" loading="lazy">
        </div>
        <div class="article-content">
            <span class="article-category">${article.category}</span>
            <h3>${article.title}</h3>
            <p>${article.excerpt}</p>
            <div class="article-meta">
                <span><i class="far fa-calendar"></i> ${article.date}</span>
                <span><i class="far fa-clock"></i> ${article.readTime}</span>
                <span><i class="far fa-eye"></i> ${article.views}</span>
            </div>
        </div>
    `;
    
    return articleCard;
}

// 添加文章点击事件
function addArticleClickEvents() {
    document.querySelectorAll('.article-card').forEach(card => {
        card.style.cursor = 'pointer'; // 添加手型光标，表示可点击
        
        card.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article-id');
            const article = articlesData.find(a => a.id == articleId);
            
            if (article) {
                // 显示文章详情弹窗
                showArticleDetail(article);
            }
        });
    });
}

// 导航功能
function initNavigation() {
    // 为导航链接添加点击事件
    document.querySelectorAll('.nav-links a, .footer-links a, .categories-list a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // 更新导航激活状态
                updateActiveNav(this);
                
                // 平滑滚动到目标区域
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 如果是分类链接，筛选文章
                if (['articles', 'travel', 'food', 'reading', 'life'].includes(targetId)) {
                    filterArticlesByCategory(targetId);
                }
            }
        });
    });
}

// 更新导航激活状态
function updateActiveNav(clickedLink) {
    // 移除所有active类
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // 为当前点击的链接添加active类
    if (clickedLink.classList.contains('nav-links')) {
        clickedLink.classList.add('active');
    }
}

// 根据分类筛选文章
function filterArticlesByCategory(category) {
    const allArticles = document.querySelectorAll('.articles-section');
    
    // 隐藏所有文章部分
    allArticles.forEach(section => {
        section.style.display = 'none';
    });
    
    // 显示选中的分类部分
    const targetSection = document.getElementById(category);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // 如果该分类容器为空，则渲染文章
        const container = targetSection.querySelector('.articles-grid');
        if (container && container.children.length === 0) {
            const categoryMap = {
                'travel': '旅行日记',
                'food': '美食记录',
                'reading': '读书笔记',
                'life': '生活随笔',
                'articles': '' // 全部文章
            };
            
            let categoryArticles;
            if (category === 'articles') {
                categoryArticles = articlesData;
            } else {
                categoryArticles = articlesData.filter(article => 
                    article.category === categoryMap[category]
                );
            }
            
            renderArticlesToContainer(categoryArticles, container);
        }
    }
}

// 滚动时更新导航激活状态
function updateNavOnScroll() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const headerHeight = document.querySelector('header').offsetHeight;
        
        if (scrollY >= (sectionTop - headerHeight - 50)) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}

// 显示文章详情
// 显示文章详情
function showArticleDetail(article) {
    // 检查是否已存在模态框，如果存在则先移除
    const existingModal = document.querySelector('.article-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // 创建文章详情弹窗
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    
    // 将内容中的换行符转换为HTML段落
    const contentWithParagraphs = article.content.split('\n\n').map(paragraph => 
        `<p>${paragraph}</p>`
    ).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="article-detail">
                <div class="article-hero">
                    <img src="${article.image}" alt="${article.title}">
                </div>
                <div class="article-body">
                    <span class="article-category">${article.category}</span>
                    <h2>${article.title}</h2>
                    <div class="article-meta">
                        <span><i class="far fa-calendar"></i> ${article.date}</span>
                        <span><i class="far fa-clock"></i> ${article.readTime}</span>
                        <span><i class="far fa-eye"></i> ${article.views}</span>
                    </div>
                    <div class="article-content">
                        ${contentWithParagraphs}
                    </div>
                    <div class="article-actions">
                        <button class="btn like-btn">
                            <i class="far fa-heart"></i> 点赞
                        </button>
                        <button class="btn share-btn">
                            <i class="fas fa-share"></i> 分享
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
    
    // 添加关闭事件 - 使用一次性事件监听器
    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = 'auto'; // 恢复滚动
        // 移除事件监听器
        modal.removeEventListener('click', handleBackgroundClick);
    };
    
    const handleBackgroundClick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };
    
    modal.querySelector('.close-modal').addEventListener('click', closeModal, {once: true});
    modal.addEventListener('click', handleBackgroundClick);
    
    // 添加点赞和分享功能
    modal.querySelector('.like-btn').addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-heart"></i> 已点赞';
        this.style.background = '#e74c3c';
        this.disabled = true;
        
        // 在实际应用中，这里应该发送请求到服务器记录点赞
        setTimeout(() => {
            alert('感谢您的点赞！');
        }, 300);
    }, {once: true});
    
    modal.querySelector('.share-btn').addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt,
                url: window.location.href + '#article-' + article.id,
            })
            .catch(error => console.log('分享出错:', error));
        } else {
            // 备用方案 - 复制链接到剪贴板
            const url = window.location.href + '#article-' + article.id;
            navigator.clipboard.writeText(url).then(() => {
                alert('文章链接已复制到剪贴板！');
            });
        }
    }, {once: true});
    
    // 添加ESC键关闭功能
    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscapeKey);
        }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
}

// 加载更多文章
let currentLimit = 4;
function loadMoreArticles() {
    currentLimit += 2;
    const articlesContainer = document.getElementById('articles-container');
    const allArticles = articlesData.slice(0, currentLimit);
    renderArticlesToContainer(allArticles, articlesContainer);
}

// 处理订阅表单
function handleSubscribe(e) {
    e.preventDefault();
    const emailInput = e.target.querySelector('input[type="email"]');
    const email = emailInput.value;
    
    if (email) {
        alert(`感谢您的订阅！我们将发送更新到: ${email}`);
        emailInput.value = '';
    }
}

// 简单的滚动动画
const fadeInOnScroll = function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }
    });
};

// 初始设置
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    });
});

// 监听滚动
window.addEventListener('scroll', fadeInOnScroll);