// js/search.js - نظام البحث المبسط

console.log('🔍 search.js - Loading simple search system...');

// نظام بحث مبسط يركز على الأداء
const SearchManager = {
    init: function() {
        console.log('🎯 Search system initialization...');
        
        // إعداد البحث على الهاتف
        this.setupMobileSearch();
        
        // إعداد البحث على سطح المكتب
        this.setupDesktopSearch();
    },
    
    setupMobileSearch: function() {
        const mobileSearchBtn = document.getElementById('mobile-search-btn');
        const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
        const mobileSearchClose = document.getElementById('mobile-search-close');
        const mobileSearchInput = document.querySelector('.mobile-search-input input');
        
        if (mobileSearchBtn && mobileSearchOverlay) {
            mobileSearchBtn.addEventListener('click', () => {
                mobileSearchOverlay.style.display = 'block';
                setTimeout(() => {
                    mobileSearchOverlay.classList.add('active');
                    if (mobileSearchInput) {
                        mobileSearchInput.focus();
                    }
                }, 10);
            });
            
            mobileSearchClose.addEventListener('click', () => {
                mobileSearchOverlay.classList.remove('active');
                setTimeout(() => {
                    mobileSearchOverlay.style.display = 'none';
                }, 300);
            });
            
            // البحث أثناء الكتابة
            if (mobileSearchInput) {
                mobileSearchInput.addEventListener('input', (e) => {
                    this.performSearch(e.target.value);
                });
                
                mobileSearchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.showSearchResults(e.target.value);
                    }
                });
            }
        }
    },
    
    setupDesktopSearch: function() {
        const searchInput = document.getElementById('global-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
        
        searchInput.addEventListener('focus', () => {
            this.showSearchResults(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.showFullSearchResults(searchInput.value);
            }
        });
    },
    
    performSearch: function(query) {
        if (!query || query.trim().length < 2) {
            this.hideSearchResults();
            return;
        }
        
        const results = this.searchProducts(query);
        this.displaySearchResults(results);
    },
    
    searchProducts: function(query) {
        if (!window.app || !window.app.getAllProducts) return [];
        
        const searchTerm = query.toLowerCase().trim();
        const allProducts = window.app.getAllProducts();
        
        return allProducts.filter(product => {
            return (
                (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.toLowerCase().includes(searchTerm))
            );
        }).slice(0, 5); // عرض أول 5 نتائج فقط
    },
    
    displaySearchResults: function(results) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على منتجات تطابق بحثك</p>
                </div>
            `;
        } else {
            container.innerHTML = results.map(product => `
                <div class="search-result" onclick="SearchManager.selectProduct('${product.id}')">
                    <div class="search-result-image">${product.image || '📦'}</div>
                    <div class="search-result-info">
                        <div class="search-result-name">${product.name}</div>
                        <div class="search-result-category">${window.app?.getCategoryNameById(product.category)}</div>
                        <div class="search-result-price">${product.price} ر.س</div>
                    </div>
                </div>
            `).join('');
        }
        
        container.classList.add('active');
    },
    
    showSearchResults: function(query) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (!query || query.trim().length === 0) {
            this.showRecentSearches();
            return;
        }
        
        this.performSearch(query);
    },
    
    showFullSearchResults: function(query) {
        if (!query || query.trim().length === 0) return;
        
        // هنا يمكن إضافة منطق للانتقال إلى صفحة نتائج البحث الكاملة
        console.log('Full search for:', query);
        
        // إخفاء نتائج البحث الحالية
        this.hideSearchResults();
        
        // مسح حقل البحث
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        const mobileSearchInput = document.querySelector('.mobile-search-input input');
        if (mobileSearchInput) {
            mobileSearchInput.value = '';
        }
    },
    
    showRecentSearches: function() {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        // الحصول على سجل البحث من localStorage
        const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        
        if (searchHistory.length === 0) {
            container.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>ابدأ بكتابة اسم المنتج للبحث</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="search-history">
                    <div class="history-header">سجل البحث</div>
                    ${searchHistory.slice(0, 5).map(term => `
                        <div class="history-item" onclick="SearchManager.useSearchTerm('${term}')">
                            <i class="fas fa-history"></i>
                            <span>${term}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        container.classList.add('active');
    },
    
    hideSearchResults: function() {
        const container = document.getElementById('search-results');
        if (container) {
            container.classList.remove('active');
        }
    },
    
    selectProduct: function(productId) {
        // إخفاء نتائج البحث
        this.hideSearchResults();
        
        // مسح حقل البحث
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        const mobileSearchInput = document.querySelector('.mobile-search-input input');
        if (mobileSearchInput) {
            mobileSearchInput.value = '';
        }
        
        // إغلاق نافذة البحث على الموبايل
        const mobileSearchOverlay = document.getElementById('mobile-search-overlay');
        if (mobileSearchOverlay) {
            mobileSearchOverlay.classList.remove('active');
            setTimeout(() => {
                mobileSearchOverlay.style.display = 'none';
            }, 300);
        }
        
        // عرض المنتج
        if (window.uiManager) {
            window.uiManager.showProductQuickView(productId);
        }
    },
    
    useSearchTerm: function(term) {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = term;
            searchInput.focus();
            this.performSearch(term);
        }
        
        const mobileSearchInput = document.querySelector('.mobile-search-input input');
        if (mobileSearchInput) {
            mobileSearchInput.value = term;
            this.performSearch(term);
        }
    },
    
    addToSearchHistory: function(term) {
        if (!term || term.trim().length === 0) return;
        
        const searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        
        // إزالة التكرارات
        const filteredHistory = searchHistory.filter(t => t !== term);
        
        // إضافة المصطلح الجديد في البداية
        filteredHistory.unshift(term);
        
        // حفظ فقط آخر 10 عمليات بحث
        const limitedHistory = filteredHistory.slice(0, 10);
        
        localStorage.setItem('search_history', JSON.stringify(limitedHistory));
    }
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    SearchManager.init();
});

// جعل النظام متاحاً عالمياً
window.SearchManager = SearchManager;
console.log('✅ Search system loaded successfully');
