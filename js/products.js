[file name]: app.js
[file content begin]
// js/app.js - التطبيق الرئيسي المحسّن

console.log('🚀 Nexus Store - Starting...');

class NexusStore {
    constructor() {
        this.currentCategory = 'all';
        this.products = {};
        this.categories = [
            { id: 'all', name: 'الكل', icon: 'fas fa-fire', color: '#FF6B8B' },
            { id: 'electronics', name: 'إلكترونيات', icon: 'fas fa-laptop', color: '#4361EE' },
            { id: 'fashion', name: 'أزياء', icon: 'fas fa-tshirt', color: '#F72585' },
            { id: 'home', name: 'منزلية', icon: 'fas fa-home', color: '#4CC9F0' },
            { id: 'beauty', name: 'جمال', icon: 'fas fa-spa', color: '#7209B7' },
            { id: 'sports', name: 'رياضة', icon: 'fas fa-futbol', color: '#06D6A0' },
            { id: 'books', name: 'كتب', icon: 'fas fa-book', color: '#FB5607' },
            { id: 'toys', name: 'ألعاب', icon: 'fas fa-gamepad', color: '#FFD166' },
            { id: 'offers', name: 'عروض خاصة', icon: 'fas fa-tags', color: '#EF476F' }
        ];
        
        this.init();
    }
    
    async init() {
        console.log('🎯 NexusStore initialization...');
        
        // Initialize components
        await this.initComponents();
        
        // Load data
        await this.loadInitialData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Show welcome
        this.showWelcome();
        
        console.log('✅ NexusStore ready!');
    }
    
    async initComponents() {
        // Initialize managers if they exist
        if (typeof ProductsManager !== 'undefined') {
            window.productsManager = new ProductsManager();
        }
        
        if (typeof CartManager !== 'undefined') {
            window.cartManager = new CartManager();
        }
        
        if (typeof UIManager !== 'undefined') {
            window.uiManager = new UIManager();
        }
        
        if (typeof SearchManager !== 'undefined') {
            window.searchManager = new SearchManager();
        }
        
        if (typeof CheckoutManager !== 'undefined') {
            window.checkoutManager = new CheckoutManager();
        }
        
        // Initialize Firebase in background
        this.initFirebase();
    }
    
    async loadInitialData() {
        try {
            // Load products
            await this.loadProducts();
            
            // Load special offers
            await this.loadSpecialOffers();
            
            // Update UI
            this.updateCategoryUI();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showFallbackUI();
        }
    }
    
    async loadProducts() {
        // Try Firebase first
        if (window.db) {
            try {
                const snapshot = await window.db.collection('products').limit(20).get();
                if (!snapshot.empty) {
                    this.organizeProductsByCategory(snapshot);
                    return;
                }
            } catch (error) {
                console.log('Firebase products not available, using local data');
            }
        }
        
        // Fallback to local data
        this.loadLocalProducts();
    }
    
    organizeProductsByCategory(snapshot) {
        this.products = {};
        
        snapshot.forEach(doc => {
            const product = doc.data();
            product.id = doc.id;
            
            const category = product.category || 'all';
            if (!this.products[category]) {
                this.products[category] = [];
            }
            
            this.products[category].push(product);
        });
        
        // Render products
        this.renderAllProducts();
    }
    
    loadLocalProducts() {
        // Sample products data
        this.products = {
            electronics: [
                { id: 'elec1', name: 'سماعات لاسلكية', price: 299, image: '🎧', description: 'سماعات بلوتوث عالية الجودة', category: 'electronics', rating: 4.5, badge: 'الأكثر مبيعاً' },
                { id: 'elec2', name: 'ساعة ذكية', price: 499, image: '⌚', description: 'ساعة ذكية متطورة', category: 'electronics', rating: 4.3, badge: 'جديد' }
            ],
            fashion: [
                { id: 'fash1', name: 'قميص رجالي', price: 89, image: '👔', description: 'قميص قطني عالي الجودة', category: 'fashion', rating: 4.2 },
                { id: 'fash2', name: 'فستان سهرة', price: 299, image: '👗', description: 'فستان أنيق للمناسبات', category: 'fashion', rating: 4.7, badge: 'الأكثر مبيعاً' }
            ],
            home: [
                { id: 'home1', name: 'سجادة صوف', price: 199, image: '🧶', description: 'سجادة صوف طبيعي', category: 'home', rating: 4.4 },
                { id: 'home2', name: 'مصباح طاولة', price: 149, image: '💡', description: 'مصباح LED عصري', category: 'home', rating: 4.1 }
            ],
            beauty: [
                { id: 'beauty1', name: 'مجموعة تجميل', price: 179, image: '💄', description: 'مجموعة كاملة من مستحضرات التجميل', category: 'beauty', rating: 4.6, badge: 'خصم' }
            ],
            offers: [
                { id: 'offer1', name: 'عرض خاص', price: 249, image: '🔥', description: 'خصم 50% لفترة محدودة', category: 'offers', oldPrice: 499, rating: 4.8, badge: 'خصم 50%' }
            ]
        };
        
        this.renderAllProducts();
    }
    
    renderAllProducts() {
        const container = document.getElementById('category-sections');
        if (!container) return;
        
        let html = '';
        
        this.categories.forEach(category => {
            if (category.id === 'all' || category.id === 'offers') return;
            
            const categoryProducts = this.products[category.id] || [];
            if (categoryProducts.length === 0) return;
            
            html += `
                <section class="section" id="category-${category.id}">
                    <div class="container">
                        <div class="category-header">
                            <h2 style="display: flex; align-items: center; gap: var(--space-sm); color: ${category.color}">
                                <i class="${category.icon}"></i>
                                ${category.name}
                                <span style="font-size: var(--font-sm); color: var(--text-light);">
                                    (${categoryProducts.length} منتج)
                                </span>
                            </h2>
                        </div>
                        
                        <div class="products-grid">
                            ${categoryProducts.map(product => this.renderProductCard(product)).join('')}
                        </div>
                        
                        ${categoryProducts.length > 8 ? `
                        <div style="text-align: center; margin-top: var(--space-xl);">
                            <button class="btn btn-outline" onclick="app.viewMore('${category.id}')">
                                <i class="fas fa-eye"></i>
                                عرض المزيد من ${category.name}
                            </button>
                        </div>
                        ` : ''}
                    </div>
                </section>
            `;
        });
        
        container.innerHTML = html;
        
        // Add event listeners to product buttons
        this.addProductEventListeners();
    }
    
    renderProductCard(product) {
        const ratingStars = this.generateRatingStars(product.rating || 4);
        const discountBadge = product.oldPrice ? 
            `<div class="discount-badge">${Math.round((1 - product.price / product.oldPrice) * 100)}%</div>` : '';
        
        const productBadge = product.badge ? `
            <div class="product-badge ${this.getBadgeClass(product.badge)}">
                ${product.badge}
            </div>
        ` : '';
        
        return `
            <div class="product-card card" data-id="${product.id}">
                ${discountBadge}
                ${productBadge}
                
                <div class="product-image">
                    ${product.image || '📦'}
                </div>
                
                <div class="product-info">
                    <div class="product-category">
                        <i class="fas fa-tag"></i>
                        ${this.getCategoryName(product.category)}
                    </div>
                    
                    <h3 class="product-name">${product.name}</h3>
                    
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-rating">
                        ${ratingStars}
                        <span class="rating-count">${product.rating || 4.0}</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="price-current">${product.price} ر.س</span>
                        ${product.oldPrice ? `
                            <span class="price-old">${product.oldPrice} ر.س</span>
                        ` : ''}
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm add-to-cart" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            أضف للسلة
                        </button>
                        <button class="btn btn-icon btn-outline wishlist-btn" data-id="${product.id}" title="إضافة للمفضلة">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="btn btn-icon btn-outline quick-view" data-id="${product.id}" title="عرض سريع">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    generateRatingStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return `<div class="stars">${stars}</div>`;
    }
    
    getBadgeClass(badge) {
        const badgeClasses = {
            'جديد': 'badge-new',
            'الأكثر مبيعاً': 'badge-popular',
            'خصم': 'badge-sale',
            'محدود': 'badge-limited'
        };
        
        return badgeClasses[badge] || 'badge-new';
    }
    
    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }
    
    async loadSpecialOffers() {
        const offersContainer = document.getElementById('special-offers');
        if (!offersContainer) return;
        
        const offers = this.products.offers || [];
        
        if (offers.length === 0) {
            offersContainer.innerHTML = `
                <div class="offer-card" style="grid-column: 1 / -1; text-align: center; padding: var(--space-2xl);">
                    <h3 class="offer-title">لا توجد عروض حالياً</h3>
                    <p class="offer-description">تابعنا للحصول على أحدث العروض والتخفيضات</p>
                </div>
            `;
            return;
        }
        
        offersContainer.innerHTML = offers.map(offer => `
            <div class="offer-card">
                <div class="offer-content">
                    <h3 class="offer-title">${offer.name}</h3>
                    <p class="offer-description">${offer.description}</p>
                    
                    <div class="offer-price" style="margin-bottom: var(--space-lg);">
                        <span style="font-size: var(--font-3xl); font-weight: 800;">${offer.price} ر.س</span>
                        ${offer.oldPrice ? `
                            <span style="text-decoration: line-through; opacity: 0.7; margin-right: var(--space-sm);">
                                ${offer.oldPrice} ر.س
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="offer-timer">
                        <div class="timer-numbers">
                            <span>23</span>:<span>59</span>:<span>59</span>
                        </div>
                        <div class="timer-unit">ساعة : دقيقة : ثانية</div>
                    </div>
                    
                    <button class="btn btn-secondary" onclick="app.addToCart('${offer.id}')">
                        <i class="fas fa-bolt"></i>
                        احصل على العرض الآن
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    addProductEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.addToCart(productId);
            });
        });
        
        // Wishlist buttons
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.toggleWishlist(productId);
            });
        });
        
        // Quick view buttons
        document.querySelectorAll('.quick-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.quickView(productId);
            });
        });
    }
    
    addToCart(productId) {
        if (window.cartManager) {
            window.cartManager.addToCart(productId);
            
            // Show notification
            if (window.uiManager) {
                window.uiManager.showNotification('تمت الإضافة', 'تم إضافة المنتج إلى سلة المشتريات', 'success');
            }
        } else {
            console.log('Adding product to cart:', productId);
        }
    }
    
    toggleWishlist(productId) {
        console.log('Toggle wishlist:', productId);
        // Implement wishlist functionality
    }
    
    quickView(productId) {
        console.log('Quick view:', productId);
        // Implement quick view modal
    }
    
    viewMore(categoryId) {
        // Scroll to category section
        const section = document.getElementById(`category-${categoryId}`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    updateCategoryUI() {
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = e.currentTarget.dataset.category;
                this.switchCategory(categoryId);
            });
        });
    }
    
    switchCategory(categoryId) {
        this.currentCategory = categoryId;
        
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === categoryId) {
                btn.classList.add('active');
            }
        });
        
        // Scroll to category section
        if (categoryId !== 'all') {
            const section = document.getElementById(`category-${categoryId}`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    setupEventListeners() {
        // Cart button
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                if (window.uiManager) {
                    window.uiManager.openCartSidebar();
                }
            });
        }
        
        // Wishlist button
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                this.showNotification('قريباً', 'ميزة المفضلة قريباً', 'info');
            });
        }
        
        // User button
        const userBtn = document.getElementById('user-btn');
        if (userBtn) {
            userBtn.addEventListener('click', () => {
                this.showNotification('قريباً', 'نظام الحسابات قريباً', 'info');
            });
        }
        
        // Search input
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            searchInput.addEventListener('focus', () => {
                const results = document.getElementById('search-results');
                if (results && results.innerHTML.trim()) {
                    results.classList.add('active');
                }
            });
        }
        
        // Close cart
        const closeCart = document.getElementById('close-cart');
        const cartOverlay = document.getElementById('cart-overlay');
        const continueShopping = document.getElementById('continue-shopping');
        
        [closeCart, cartOverlay, continueShopping].forEach(element => {
            if (element) {
                element.addEventListener('click', () => {
                    if (window.uiManager) {
                        window.uiManager.closeCartSidebar();
                    }
                });
            }
        });
        
        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (window.checkoutManager) {
                    window.checkoutManager.openCheckoutModal();
                }
            });
        }
        
        // Back to top
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });
        }
    }
    
    handleSearch(query) {
        if (!query.trim()) {
            const results = document.getElementById('search-results');
            if (results) {
                results.classList.remove('active');
            }
            return;
        }
        
        // Search logic
        const results = this.searchProducts(query);
        this.displaySearchResults(results);
    }
    
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        const results = [];
        
        Object.values(this.products).forEach(categoryProducts => {
            categoryProducts.forEach(product => {
                const searchFields = [
                    product.name,
                    product.description,
                    product.category
                ];
                
                if (searchFields.some(field => 
                    field && field.toLowerCase().includes(searchTerm)
                )) {
                    results.push(product);
                }
            });
        });
        
        return results.slice(0, 10); // Limit to 10 results
    }
    
    displaySearchResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div style="padding: var(--space-xl); text-align: center; color: var(--text-light);">
                    <i class="fas fa-search" style="font-size: var(--icon-2xl); margin-bottom: var(--space-sm); opacity: 0.5;"></i>
                    <div>لم يتم العثور على منتجات تطابق بحثك</div>
                </div>
            `;
        } else {
            container.innerHTML = results.map(product => `
                <div class="search-result-item" style="padding: var(--space-md); border-bottom: 1px solid var(--gray); cursor: pointer; display: flex; align-items: center; gap: var(--space-sm);">
                    <div style="font-size: 1.5rem; width: 40px; text-align: center;">
                        ${product.image}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 2px;">${product.name}</div>
                        <div style="font-size: var(--font-sm); color: var(--text-light); margin-bottom: 4px;">${product.description}</div>
                        <div style="font-weight: 700; color: var(--primary);">${product.price} ر.س</div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="app.addToCart('${product.id}')">
                        <i class="fas fa-cart-plus"></i>
                    </button>
                </div>
            `).join('');
        }
        
        container.classList.add('active');
    }
    
    initFirebase() {
        // Firebase initialization in background
        setTimeout(async () => {
            if (window.db) {
                try {
                    const snapshot = await window.db.collection('products').limit(1).get();
                    console.log(`Firebase connected: ${snapshot.size} products`);
                } catch (error) {
                    console.log('Firebase connection test failed');
                }
            }
        }, 2000);
    }
    
    showWelcome() {
        setTimeout(() => {
            if (window.uiManager) {
                window.uiManager.showNotification(
                    'مرحباً بك في Nexus Store!',
                    'تصفح آلاف المنتجات واستمتع بتجربة تسوق فريدة',
                    'info'
                );
            }
        }, 1500);
    }
    
    showNotification(title, message, type = 'info') {
        if (window.uiManager) {
            window.uiManager.showNotification(title, message, type);
        } else {
            alert(`${title}: ${message}`);
        }
    }
    
    showFallbackUI() {
        const container = document.getElementById('category-sections');
        if (container) {
            container.innerHTML = `
                <section class="section">
                    <div class="container">
                        <div style="text-align: center; padding: var(--space-3xl) 0;">
                            <div style="font-size: 4rem; margin-bottom: var(--space-lg);">🛒</div>
                            <h2 style="margin-bottom: var(--space-md);">Nexus Store</h2>
                            <p style="color: var(--text-light); margin-bottom: var(--space-xl); max-width: 500px; margin-left: auto; margin-right: auto;">
                                متجر إلكتروني عصري يقدم أفضل المنتجات بأفضل الأسعار
                            </p>
                            <div style="display: flex; gap: var(--space-md); justify-content: center; flex-wrap: wrap;">
                                <button class="btn btn-primary" onclick="app.loadInitialData()">
                                    <i class="fas fa-sync-alt"></i>
                                    إعادة تحميل المنتجات
                                </button>
                                <button class="btn btn-outline" onclick="window.location.reload()">
                                    <i class="fas fa-redo"></i>
                                    تحديث الصفحة
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            `;
        }
    }
    
    // ================ الدالة المضافة لحل مشكلة السلة ================
    
    /**
     * البحث عن منتج بواسطة ID
     * @param {string} productId - معرف المنتج
     * @returns {Object|null} - بيانات المنتج أو null إذا لم يوجد
     */
    getProductById(productId) {
        console.log('🔍 Searching for product with ID:', productId);
        
        // البحث في جميع الفئات
        for (const category in this.products) {
            const product = this.products[category].find(p => p.id === productId);
            if (product) {
                console.log('✅ Found product in app.products:', product);
                return product;
            }
        }
        
        console.log('❌ Product not found in app.products');
        return null;
    }
    
    /**
     * الحصول على جميع المنتجات كقائمة مسطحة
     * @returns {Array} - قائمة بجميع المنتجات
     */
    getAllProducts() {
        const allProducts = [];
        for (const category in this.products) {
            allProducts.push(...this.products[category]);
        }
        return allProducts;
    }
    
    /**
     * البحث عن منتجات بواسطة اسم الفئة
     * @param {string} categoryId - معرف الفئة
     * @returns {Array} - منتجات الفئة
     */
    getProductsByCategory(categoryId) {
        return this.products[categoryId] || [];
    }
}

// Initialize app
window.app = new NexusStore();

// جعل الدوال متاحة عالمياً
if (window.app) {
    window.app.getProductById = function(productId) {
        return this.getProductById(productId);
    };
    
    window.app.getAllProducts = function() {
        return this.getAllProducts();
    };
    
    window.app.getProductsByCategory = function(categoryId) {
        return this.getProductsByCategory(categoryId);
    };
}

// Make app available globally
console.log('✅ app.js loaded - Product search functions added');
[file content end]
