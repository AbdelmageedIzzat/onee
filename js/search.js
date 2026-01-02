// js/search.js - نظام البحث الذكي والمتقدم

console.log('🔍 search.js - Loading enhanced search system...');

class SearchManager {
    constructor() {
        this.searchIndex = [];
        this.searchHistory = [];
        this.searchSuggestions = [];
        this.maxHistory = 10;
        this.maxSuggestions = 5;
        
        this.init();
    }
    
    init() {
        console.log('🎯 SearchManager initialization...');
        this.loadSearchHistory();
        this.setupSearchUI();
        this.buildSearchIndex();
    }
    
    setupSearchUI() {
        const searchInput = document.getElementById('global-search');
        if (!searchInput) return;
        
        // إضافة مستمعي الأحداث
        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        searchInput.addEventListener('focus', () => {
            this.showSearchSuggestions();
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(searchInput.value);
            }
            
            if (e.key === 'Escape') {
                this.hideSearchResults();
            }
        });
        
        // إضافة زر البحث إذا لم يكن موجوداً
        if (!document.getElementById('search-button')) {
            const searchButton = document.createElement('button');
            searchButton.id = 'search-button';
            searchButton.innerHTML = '<i class="fas fa-search"></i>';
            searchButton.className = 'btn btn-icon';
            searchButton.addEventListener('click', () => {
                this.performSearch(searchInput.value);
            });
            
            searchInput.parentNode.appendChild(searchButton);
        }
    }
    
    buildSearchIndex() {
        if (window.productsManager && window.productsManager.productsByCategory) {
            this.searchIndex = [];
            
            for (const category in window.productsManager.productsByCategory) {
                window.productsManager.productsByCategory[category].forEach(product => {
                    this.searchIndex.push({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        category: product.category,
                        price: product.price,
                        image: product.image,
                        tags: this.extractTags(product),
                        popularity: product.rating || 4.0
                    });
                });
            }
            
            console.log(`Built search index with ${this.searchIndex.length} items`);
        }
    }
    
    extractTags(product) {
        const tags = [];
        
        // استخراج الكلمات المفتاحية من الاسم والوصف
        const text = `${product.name} ${product.description}`.toLowerCase();
        const words = text.split(/\s+/);
        
        // إضافة الكلمات الشائعة
        const commonWords = ['جديد', 'مميز', 'عرض', 'خصم', 'أفضل', 'أحدث', 'راقي'];
        commonWords.forEach(word => {
            if (text.includes(word)) {
                tags.push(word);
            }
        });
        
        // إضافة الفئة كعلامة
        if (product.category) {
            tags.push(product.category);
        }
        
        return [...new Set(tags)]; // إزالة التكرارات
    }
    
    handleSearchInput(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) {
            this.showSearchHistory();
            return;
        }
        
        // البحث عن اقتراحات
        const suggestions = this.getSearchSuggestions(trimmedQuery);
        this.showSearchSuggestions(suggestions);
        
        // البحث الفعلي إذا كان النص طويلاً
        if (trimmedQuery.length >= 2) {
            const results = this.searchProducts(trimmedQuery);
            this.displaySearchResults(results);
        }
    }
    
    getSearchSuggestions(query) {
        if (query.length < 1) return this.searchHistory.slice(0, this.maxSuggestions);
        
        const suggestions = new Set();
        
        // البحث في السجل
        this.searchHistory.forEach(term => {
            if (term.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(term);
            }
        });
        
        // البحث في الفهرس
        this.searchIndex.forEach(item => {
            if (item.name.toLowerCase().includes(query.toLowerCase()) && suggestions.size < this.maxSuggestions) {
                suggestions.add(item.name);
            }
            
            item.tags.forEach(tag => {
                if (tag.toLowerCase().includes(query.toLowerCase()) && suggestions.size < this.maxSuggestions) {
                    suggestions.add(tag);
                }
            });
        });
        
        // إضافة اقتراحات شائعة
        const popularSuggestions = ['إلكترونيات', 'أزياء', 'عروض خاصة', 'جديد', 'الأكثر مبيعاً'];
        popularSuggestions.forEach(suggestion => {
            if (suggestion.includes(query) && suggestions.size < this.maxSuggestions) {
                suggestions.add(suggestion);
            }
        });
        
        return Array.from(suggestions).slice(0, this.maxSuggestions);
    }
    
    searchProducts(query) {
        if (!query || query.length < 2) return [];
        
        const searchTerm = query.toLowerCase();
        const results = [];
        
        // خوارزمية بحث محسنة
        this.searchIndex.forEach(item => {
            let score = 0;
            
            // البحث في الاسم (أعلى وزن)
            if (item.name.toLowerCase().includes(searchTerm)) {
                score += 100;
                
                // مطابقة تامة أعلى درجة
                if (item.name.toLowerCase() === searchTerm) {
                    score += 50;
                }
            }
            
            // البحث في الوصف
            if (item.description && item.description.toLowerCase().includes(searchTerm)) {
                score += 30;
            }
            
            // البحث في العلامات
            item.tags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm)) {
                    score += 20;
                }
            });
            
            // البحث في الفئة
            if (item.category && item.category.toLowerCase().includes(searchTerm)) {
                score += 15;
            }
            
            // إضافة عامل الشعبية
            score += item.popularity * 5;
            
            if (score > 0) {
                results.push({
                    ...item,
                    score: score,
                    matchedFields: this.getMatchedFields(item, searchTerm)
                });
            }
        });
        
        // ترتيب النتائج حسب الدرجة
        results.sort((a, b) => b.score - a.score);
        
        return results;
    }
    
    getMatchedFields(item, searchTerm) {
        const fields = [];
        
        if (item.name.toLowerCase().includes(searchTerm)) {
            fields.push('name');
        }
        
        if (item.description && item.description.toLowerCase().includes(searchTerm)) {
            fields.push('description');
        }
        
        item.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
                fields.push('tag');
            }
        });
        
        if (item.category && item.category.toLowerCase().includes(searchTerm)) {
            fields.push('category');
        }
        
        return [...new Set(fields)];
    }
    
    displaySearchResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = this.createNoResultsTemplate();
            container.classList.add('active');
            return;
        }
        
        const limitedResults = results.slice(0, 8);
        const hasMore = results.length > 8;
        
        container.innerHTML = `
            <div class="search-results-container">
                <div class="search-results-header">
                    <span>${results.length} نتيجة وجدت</span>
                    ${hasMore ? `<span class="more-results">+${results.length - 8} منتج إضافي</span>` : ''}
                </div>
                
                <div class="search-results-list">
                    ${limitedResults.map(result => this.createSearchResultTemplate(result)).join('')}
                </div>
                
                ${hasMore ? `
                    <div class="search-results-footer">
                        <button class="btn btn-outline btn-sm" onclick="window.searchManager.showAllResults()">
                            <i class="fas fa-search"></i>
                            عرض جميع النتائج
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.classList.add('active');
        
        // إضافة الأنماط إذا لزم الأمر
        this.addSearchResultsStyles();
        
        // إضافة مستمعي الأحداث
        this.addSearchResultsEventListeners();
    }
    
    createSearchResultTemplate(result) {
        const product = window.productsManager?.getProductById(result.id);
        const categoryName = window.productsManager?.getCategoryName(result.category);
        
        // تمييز النص المطابق
        const highlightedName = this.highlightText(result.name, result.matchedFields.includes('name'));
        const highlightedDesc = result.description ? 
            this.highlightText(result.description.substring(0, 100) + '...', result.matchedFields.includes('description')) : '';
        
        return `
            <div class="search-result-item" data-id="${result.id}">
                <div class="result-image">${result.image}</div>
                
                <div class="result-info">
                    <div class="result-header">
                        <h4 class="result-title">${highlightedName}</h4>
                        <span class="result-price">${result.price.toFixed(2)} ر.س</span>
                    </div>
                    
                    <div class="result-meta">
                        <span class="result-category">
                            <i class="fas fa-tag"></i>
                            ${categoryName}
                        </span>
                        <span class="result-score">
                            <i class="fas fa-star"></i>
                            ${result.popularity.toFixed(1)}
                        </span>
                    </div>
                    
                    <p class="result-description">${highlightedDesc}</p>
                    
                    <div class="result-actions">
                        <button class="btn btn-primary btn-sm add-to-cart" data-id="${result.id}">
                            <i class="fas fa-cart-plus"></i>
                            أضف للسلة
                        </button>
                        <button class="btn btn-outline btn-sm quick-view" data-id="${result.id}">
                            <i class="fas fa-eye"></i>
                            عرض سريع
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    createNoResultsTemplate() {
        return `
            <div class="search-no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h4>لا توجد نتائج</h4>
                <p>لم نتمكن من العثور على منتجات تطابق بحثك</p>
                <div class="no-results-suggestions">
                    <p>اقتراحات:</p>
                    <ul>
                        <li>تأكد من كتابة الكلمات بشكل صحيح</li>
                        <li>جرب استخدام كلمات بحث أخرى</li>
                        <li>جرب البحث باللغة الإنجليزية</li>
                        <li>تصفح الفئات المختلفة</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    showSearchSuggestions(suggestions = []) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (suggestions.length === 0) {
            this.showSearchHistory();
            return;
        }
        
        container.innerHTML = `
            <div class="search-suggestions">
                <div class="suggestions-header">
                    <span>اقتراحات البحث</span>
                </div>
                
                <div class="suggestions-list">
                    ${suggestions.map(suggestion => `
                        <div class="suggestion-item" data-suggestion="${suggestion}">
                            <i class="fas fa-search"></i>
                            <span>${suggestion}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${this.searchHistory.length > 0 ? `
                    <div class="suggestions-footer">
                        <span>سجل البحث السابق</span>
                        <button class="btn btn-text btn-sm" onclick="window.searchManager.clearSearchHistory()">
                            مسح السجل
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.classList.add('active');
        
        // إضافة مستمعي الأحداث للاقتراحات
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const suggestion = item.dataset.suggestion;
                this.performSearch(suggestion);
            });
        });
    }
    
    showSearchHistory() {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (this.searchHistory.length === 0) {
            container.innerHTML = `
                <div class="search-history-empty">
                    <i class="fas fa-history"></i>
                    <p>لا يوجد سجل بحث سابق</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="search-history">
                    <div class="history-header">
                        <span>سجل البحث</span>
                        <button class="btn btn-text btn-sm" onclick="window.searchManager.clearSearchHistory()">
                            مسح الكل
                        </button>
                    </div>
                    
                    <div class="history-list">
                        ${this.searchHistory.map(term => `
                            <div class="history-item" data-term="${term}">
                                <i class="fas fa-history"></i>
                                <span>${term}</span>
                                <button class="btn btn-icon btn-sm remove-history" data-term="${term}">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            // إضافة مستمعي الأحداث
            container.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.remove-history')) {
                        const term = item.dataset.term;
                        this.performSearch(term);
                    }
                });
            });
            
            container.querySelectorAll('.remove-history').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const term = btn.dataset.term;
                    this.removeFromSearchHistory(term);
                });
            });
        }
        
        container.classList.add('active');
    }
    
    performSearch(query) {
        const trimmedQuery = query.trim();
        
        if (trimmedQuery.length === 0) return;
        
        // إضافة إلى سجل البحث
        this.addToSearchHistory(trimmedQuery);
        
        // تحديث حقل البحث
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = trimmedQuery;
            searchInput.focus();
        }
        
        // البحث الفعلي
        const results = this.searchProducts(trimmedQuery);
        
        if (results.length === 0) {
            this.displaySearchResults([]);
            return;
        }
        
        // عرض النتائج
        this.displaySearchResults(results);
        
        // إذا كان هناك نتيجة واحدة فقط، عرضها مباشرة
        if (results.length === 1) {
            setTimeout(() => {
                this.showProductQuickView(results[0].id);
            }, 300);
        }
    }
    
    showAllResults() {
        const searchInput = document.getElementById('global-search');
        if (searchInput && searchInput.value.trim()) {
            this.performSearch(searchInput.value.trim());
        }
    }
    
    addToSearchHistory(term) {
        // إزالة التكرارات
        this.searchHistory = this.searchHistory.filter(t => t !== term);
        
        // إضافة المصطلح في البداية
        this.searchHistory.unshift(term);
        
        // الحد من عدد العناصر
        if (this.searchHistory.length > this.maxHistory) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistory);
        }
        
        // حفظ السجل
        this.saveSearchHistory();
    }
    
    removeFromSearchHistory(term) {
        this.searchHistory = this.searchHistory.filter(t => t !== term);
        this.saveSearchHistory();
        this.showSearchHistory();
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
        this.showSearchHistory();
    }
    
    loadSearchHistory() {
        try {
            const history = localStorage.getItem('nexus_search_history');
            if (history) {
                this.searchHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('Error loading search history:', error);
        }
    }
    
    saveSearchHistory() {
        try {
            localStorage.setItem('nexus_search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }
    
    highlightText(text, shouldHighlight = true) {
        if (!text || !shouldHighlight) return text;
        
        const searchInput = document.getElementById('global-search');
        if (!searchInput) return text;
        
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length < 2) return text;
        
        try {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        } catch (error) {
            return text;
        }
    }
    
    showProductQuickView(productId) {
        if (window.uiManager) {
            window.uiManager.showProductQuickView(productId);
        }
        
        // إخفاء نتائج البحث
        this.hideSearchResults();
    }
    
    hideSearchResults() {
        const container = document.getElementById('search-results');
        if (container) {
            container.classList.remove('active');
        }
    }
    
    addSearchResultsStyles() {
        if (document.querySelector('#search-results-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'search-results-styles';
        style.textContent = `
            .search-results-container {
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .search-results-header {
                padding: var(--space-md);
                border-bottom: 1px solid var(--gray);
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: var(--font-sm);
                color: var(--text-light);
            }
            
            .more-results {
                background: var(--light);
                padding: 2px 8px;
                border-radius: var(--radius-sm);
                font-size: var(--font-xs);
            }
            
            .search-results-list {
                padding: var(--space-sm);
            }
            
            .search-result-item {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: var(--space-md);
                padding: var(--space-md);
                border-bottom: 1px solid var(--gray);
                transition: var(--transition);
            }
            
            .search-result-item:hover {
                background: var(--light);
            }
            
            .result-image {
                width: 60px;
                height: 60px;
                background: var(--light);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            
            .result-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: var(--space-xs);
            }
            
            .result-title {
                margin: 0;
                font-size: var(--font-base);
                line-height: 1.3;
            }
            
            .result-price {
                font-weight: 700;
                color: var(--primary);
                font-size: var(--font-base);
            }
            
            .result-meta {
                display: flex;
                gap: var(--space-md);
                margin-bottom: var(--space-sm);
                font-size: var(--font-xs);
                color: var(--text-light);
            }
            
            .result-description {
                margin: 0 0 var(--space-sm);
                font-size: var(--font-sm);
                color: var(--text-light);
                line-height: 1.4;
            }
            
            .result-actions {
                display: flex;
                gap: var(--space-sm);
            }
            
            .search-results-footer {
                padding: var(--space-md);
                text-align: center;
                border-top: 1px solid var(--gray);
            }
            
            .search-no-results {
                padding: var(--space-xl);
                text-align: center;
            }
            
            .no-results-icon {
                font-size: var(--icon-3xl);
                color: var(--text-light);
                margin-bottom: var(--space-md);
                opacity: 0.5;
            }
            
            .no-results-suggestions {
                text-align: right;
                margin-top: var(--space-xl);
                font-size: var(--font-sm);
            }
            
            .no-results-suggestions ul {
                padding-right: var(--space-lg);
                margin-top: var(--space-sm);
            }
            
            .no-results-suggestions li {
                margin-bottom: var(--space-xs);
                color: var(--text-light);
            }
            
            .search-suggestions {
                padding: var(--space-sm);
            }
            
            .suggestions-header {
                padding: var(--space-sm);
                font-size: var(--font-sm);
                color: var(--text-light);
                border-bottom: 1px solid var(--gray);
                margin-bottom: var(--space-sm);
            }
            
            .suggestion-item {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                padding: var(--space-sm);
                border-radius: var(--radius);
                cursor: pointer;
                transition: var(--transition);
            }
            
            .suggestion-item:hover {
                background: var(--light);
            }
            
            .suggestion-item i {
                color: var(--text-light);
                font-size: var(--icon-sm);
            }
            
            .suggestions-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-sm);
                margin-top: var(--space-sm);
                border-top: 1px solid var(--gray);
                font-size: var(--font-sm);
                color: var(--text-light);
            }
            
            .search-history-empty {
                padding: var(--space-xl);
                text-align: center;
                color: var(--text-light);
            }
            
            .search-history {
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .history-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-md);
                border-bottom: 1px solid var(--gray);
                font-size: var(--font-sm);
                color: var(--text-light);
            }
            
            .history-list {
                padding: var(--space-sm);
            }
            
            .history-item {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                padding: var(--space-sm);
                border-radius: var(--radius);
                cursor: pointer;
                transition: var(--transition);
                position: relative;
            }
            
            .history-item:hover {
                background: var(--light);
            }
            
            .history-item i {
                color: var(--text-light);
                font-size: var(--icon-sm);
            }
            
            .history-item span {
                flex: 1;
            }
            
            .remove-history {
                opacity: 0;
                transition: var(--transition);
            }
            
            .history-item:hover .remove-history {
                opacity: 1;
            }
            
            .highlight {
                background: #FFF3CD;
                color: var(--dark);
                padding: 1px 3px;
                border-radius: 3px;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    addSearchResultsEventListeners() {
        // أزرار الإضافة للسلة
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = e.currentTarget.dataset.id;
                
                if (window.cartManager) {
                    window.cartManager.addToCart(productId);
                    window.uiManager?.showNotification('تمت الإضافة', 'تم إضافة المنتج إلى السلة', 'success');
                }
            });
        });
        
        // أزرار العرض السريع
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = e.currentTarget.dataset.id;
                this.showProductQuickView(productId);
            });
        });
        
        // النقر على نتيجة البحث
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.add-to-cart') && !e.target.closest('.quick-view')) {
                    const productId = item.dataset.id;
                    this.showProductQuickView(productId);
                }
            });
        });
    }
    
    // البحث المتقدم
    advancedSearch(filters) {
        let results = [...this.searchIndex];
        
        // تطبيق الفلاتر
        if (filters.category) {
            results = results.filter(item => item.category === filters.category);
        }
        
        if (filters.minPrice !== undefined) {
            results = results.filter(item => item.price >= filters.minPrice);
        }
        
        if (filters.maxPrice !== undefined) {
            results = results.filter(item => item.price <= filters.maxPrice);
        }
        
        if (filters.minRating) {
            results = results.filter(item => item.popularity >= filters.minRating);
        }
        
        // إذا كان هناك نص للبحث
        if (filters.query) {
            const searchResults = this.searchProducts(filters.query);
            const searchResultIds = new Set(searchResults.map(r => r.id));
            results = results.filter(item => searchResultIds.has(item.id));
        }
        
        // ترتيب النتائج
        if (filters.sortBy) {
            results.sort((a, b) => {
                switch(filters.sortBy) {
                    case 'price-asc':
                        return a.price - b.price;
                    case 'price-desc':
                        return b.price - a.price;
                    case 'rating-desc':
                        return b.popularity - a.popularity;
                    case 'name-asc':
                        return a.name.localeCompare(b.name, 'ar');
                    default:
                        return 0;
                }
            });
        }
        
        return results;
    }
    
    // البحث في فئة معينة
    searchInCategory(category, query = '') {
        const results = this.searchIndex.filter(item => item.category === category);
        
        if (query) {
            return results.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase()) ||
                item.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
        }
        
        return results;
    }
}

// تصدير مدير البحث
window.searchManager = new SearchManager();
console.log('✅ SearchManager loaded successfully');
