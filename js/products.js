// js/products.js - نظام إدارة المنتجات المحسن

console.log('📦 products.js - Loading enhanced products system...');

class ProductsManager {
    constructor() {
        this.categories = {};
        this.featuredProducts = [];
        this.currentCategory = 'all';
        this.init();
    }
    
    init() {
        console.log('🎯 ProductsManager initialization...');
        this.loadCategories();
        this.loadProducts();
    }
    
    loadCategories() {
        // يمكن جلب الفئات من Firebase أو استخدام بيانات محلية
        this.categories = {
            all: {
                id: 'all',
                name: 'الكل',
                icon: 'fas fa-fire',
                color: '#FF6B8B',
                description: 'جميع المنتجات'
            },
            electronics: {
                id: 'electronics',
                name: 'إلكترونيات',
                icon: 'fas fa-laptop',
                color: '#4361EE',
                description: 'أحدث الأجهزة الإلكترونية'
            },
            fashion: {
                id: 'fashion',
                name: 'أزياء',
                icon: 'fas fa-tshirt',
                color: '#F72585',
                description: 'أحدث صيحات الموضة'
            },
            home: {
                id: 'home',
                name: 'منزلية',
                icon: 'fas fa-home',
                color: '#4CC9F0',
                description: 'مستلزمات المنزل'
            },
            beauty: {
                id: 'beauty',
                name: 'جمال',
                icon: 'fas fa-spa',
                color: '#7209B7',
                description: 'مستحضرات التجميل والعناية'
            },
            sports: {
                id: 'sports',
                name: 'رياضة',
                icon: 'fas fa-futbol',
                color: '#06D6A0',
                description: 'معدات رياضية وملابس'
            },
            books: {
                id: 'books',
                name: 'كتب',
                icon: 'fas fa-book',
                color: '#FB5607',
                description: 'كتب ومراجع متنوعة'
            },
            toys: {
                id: 'toys',
                name: 'ألعاب',
                icon: 'fas fa-gamepad',
                color: '#FFD166',
                description: 'ألعاب أطفال وإلكترونية'
            },
            offers: {
                id: 'offers',
                name: 'عروض خاصة',
                icon: 'fas fa-tags',
                color: '#EF476F',
                description: 'عروض وتخفيضات حصرية'
            }
        };
    }
    
    async loadProducts() {
        try {
            // محاولة جلب المنتجات من Firebase
            if (window.db) {
                const snapshot = await window.db.collection('products').get();
                if (!snapshot.empty) {
                    this.processFirebaseProducts(snapshot);
                    return;
                }
            }
            
            // استخدام البيانات المحلية كبديل
            this.loadSampleProducts();
            
        } catch (error) {
            console.error('Error loading products:', error);
            this.loadSampleProducts();
        }
    }
    
    processFirebaseProducts(snapshot) {
        const productsByCategory = {};
        
        snapshot.forEach(doc => {
            const product = doc.data();
            product.id = doc.id;
            
            // إضافة صور افتراضية إذا لم تكن موجودة
            if (!product.image) {
                product.image = this.getDefaultImage(product.category);
            }
            
            // إضافة تقييم افتراضي
            if (!product.rating) {
                product.rating = this.getRandomRating();
            }
            
            const category = product.category || 'all';
            
            if (!productsByCategory[category]) {
                productsByCategory[category] = [];
            }
            
            productsByCategory[category].push(product);
            
            // إضافة المنتجات المميزة
            if (product.featured) {
                this.featuredProducts.push(product);
            }
        });
        
        // تخزين المنتجات حسب الفئة
        this.productsByCategory = productsByCategory;
        
        // عرض المنتجات
        this.displayProducts();
    }
    
    loadSampleProducts() {
        // بيانات منتجات نموذجية
        this.productsByCategory = {
            electronics: [
                {
                    id: 'elec-1',
                    name: 'سماعات لاسلكية',
                    price: 299,
                    oldPrice: 399,
                    image: '🎧',
                    description: 'سماعات بلوتوث عالية الجودة مع تقليل الضوضاء',
                    category: 'electronics',
                    rating: 4.5,
                    featured: true,
                    badge: 'الأكثر مبيعاً',
                    stock: 15
                },
                {
                    id: 'elec-2',
                    name: 'ساعة ذكية',
                    price: 499,
                    image: '⌚',
                    description: 'ساعة ذكية متطورة مع شاشة AMOLED',
                    category: 'electronics',
                    rating: 4.3,
                    badge: 'جديد',
                    stock: 8
                },
                {
                    id: 'elec-3',
                    name: 'هاتف ذكي',
                    price: 1299,
                    oldPrice: 1499,
                    image: '📱',
                    description: 'هاتف ذكي بمواصفات عالية وكاميرا متطورة',
                    category: 'electronics',
                    rating: 4.7,
                    featured: true,
                    badge: 'خصم',
                    stock: 5
                }
            ],
            fashion: [
                {
                    id: 'fash-1',
                    name: 'قميص رجالي',
                    price: 89,
                    image: '👔',
                    description: 'قميص قطني عالي الجودة بتصميم عصري',
                    category: 'fashion',
                    rating: 4.2,
                    stock: 20
                },
                {
                    id: 'fash-2',
                    name: 'فستان سهرة',
                    price: 299,
                    oldPrice: 399,
                    image: '👗',
                    description: 'فستان أنيق للمناسبات الخاصة',
                    category: 'fashion',
                    rating: 4.7,
                    badge: 'الأكثر مبيعاً',
                    stock: 12
                },
                {
                    id: 'fash-3',
                    name: 'حذاء رياضي',
                    price: 199,
                    image: '👟',
                    description: 'حذاء رياضي مريح وعصري',
                    category: 'fashion',
                    rating: 4.4,
                    stock: 18
                }
            ],
            home: [
                {
                    id: 'home-1',
                    name: 'سجادة صوف',
                    price: 199,
                    image: '🧶',
                    description: 'سجادة صوف طبيعي بتصميم شرقي',
                    category: 'home',
                    rating: 4.4,
                    stock: 10
                },
                {
                    id: 'home-2',
                    name: 'مصباح طاولة',
                    price: 149,
                    image: '💡',
                    description: 'مصباح LED عصري مع تحكم بالضوء',
                    category: 'home',
                    rating: 4.1,
                    stock: 15
                },
                {
                    id: 'home-3',
                    name: 'مجموعة أدوات مطبخ',
                    price: 299,
                    oldPrice: 399,
                    image: '🔪',
                    description: 'مجموعة كاملة من أدوات المطبخ عالية الجودة',
                    category: 'home',
                    rating: 4.6,
                    badge: 'خصم',
                    stock: 7
                }
            ],
            beauty: [
                {
                    id: 'beauty-1',
                    name: 'مجموعة تجميل',
                    price: 179,
                    oldPrice: 249,
                    image: '💄',
                    description: 'مجموعة كاملة من مستحضرات التجميل العالمية',
                    category: 'beauty',
                    rating: 4.6,
                    badge: 'خصم',
                    stock: 14
                },
                {
                    id: 'beauty-2',
                    name: 'عطر نسائي',
                    price: 249,
                    image: '🌸',
                    description: 'عطر نسائي برائحة عطرية فاخرة',
                    category: 'beauty',
                    rating: 4.3,
                    stock: 9
                }
            ],
            offers: [
                {
                    id: 'offer-1',
                    name: 'عرض خاص على الإلكترونيات',
                    price: 799,
                    oldPrice: 1299,
                    image: '🔥',
                    description: 'خصم كبير على مجموعة الإلكترونيات',
                    category: 'offers',
                    rating: 4.8,
                    badge: 'خصم 38%',
                    featured: true,
                    stock: 3
                }
            ]
        };
        
        this.displayProducts();
    }
    
    displayProducts() {
        // عرض المنتجات حسب الفئة
        for (const category in this.productsByCategory) {
            this.renderCategoryProducts(category);
        }
        
        // عرض المنتجات المميزة
        this.renderFeaturedProducts();
    }
    
    renderCategoryProducts(categoryId) {
        const container = document.getElementById(`category-${categoryId}`);
        if (!container) return;
        
        const products = this.productsByCategory[categoryId] || [];
        const categoryInfo = this.categories[categoryId];
        
        let html = '';
        
        if (products.length > 0) {
            html = `
                <div class="products-grid">
                    ${products.map(product => this.createProductCard(product)).join('')}
                </div>
                
                ${products.length > 6 ? `
                    <div style="text-align: center; margin-top: var(--space-xl);">
                        <button class="btn btn-outline view-more-btn" data-category="${categoryId}">
                            <i class="fas fa-eye"></i>
                            عرض المزيد من ${categoryInfo.name}
                        </button>
                    </div>
                ` : ''}
            `;
        } else {
            html = `
                <div style="text-align: center; padding: var(--space-2xl); background: var(--light); border-radius: var(--radius);">
                    <i class="fas fa-box-open" style="font-size: var(--icon-3xl); color: var(--text-light); margin-bottom: var(--space-md);"></i>
                    <h3 style="margin-bottom: var(--space-sm);">لا توجد منتجات حالياً</h3>
                    <p style="color: var(--text-light);">سيتم إضافة منتجات قريباً في هذه الفئة</p>
                </div>
            `;
        }
        
        container.innerHTML = html;
        
        // إضافة مستمعي الأحداث لأزرار عرض المزيد
        container.querySelectorAll('.view-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.showAllProducts(category);
            });
        });
    }
    
    createProductCard(product) {
        const discountPercent = product.oldPrice ? 
            Math.round((1 - product.price / product.oldPrice) * 100) : 0;
        
        const ratingStars = this.generateRatingStars(product.rating);
        
        return `
            <div class="product-card card" data-id="${product.id}">
                ${discountPercent > 0 ? `
                    <div class="discount-badge">${discountPercent}%</div>
                ` : ''}
                
                ${product.badge ? `
                    <div class="product-badge ${this.getBadgeClass(product.badge)}">
                        ${product.badge}
                    </div>
                ` : ''}
                
                <div class="product-image">
                    ${product.image}
                </div>
                
                <div class="product-info">
                    <div class="product-category">
                        <i class="fas fa-tag"></i>
                        ${this.categories[product.category]?.name || product.category}
                    </div>
                    
                    <h3 class="product-name">${product.name}</h3>
                    
                    <p class="product-description">${product.description}</p>
                    
                    <div class="product-rating">
                        ${ratingStars}
                        <span class="rating-count">${product.rating.toFixed(1)}</span>
                    </div>
                    
                    <div class="product-price">
                        <span class="price-current">${product.price.toFixed(2)} ر.س</span>
                        ${product.oldPrice ? `
                            <span class="price-old">${product.oldPrice.toFixed(2)} ر.س</span>
                        ` : ''}
                    </div>
                    
                    <div class="product-stock">
                        ${product.stock > 10 ? 
                            '<span style="color: var(--success);"><i class="fas fa-check-circle"></i> متوفر</span>' :
                            product.stock > 0 ?
                            `<span style="color: var(--warning);"><i class="fas fa-exclamation-circle"></i> آخر ${product.stock} قطع</span>` :
                            '<span style="color: var(--danger);"><i class="fas fa-times-circle"></i> غير متوفر</span>'
                        }
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            أضف للسلة
                        </button>
                        <button class="btn btn-icon btn-outline wishlist-btn" data-id="${product.id}" title="إضافة للمفضلة">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="btn btn-icon btn-outline quick-view-btn" data-id="${product.id}" title="عرض سريع">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFeaturedProducts() {
        const featuredProducts = this.getFeaturedProducts();
        
        if (featuredProducts.length === 0) return;
        
        // يمكن عرض المنتجات المميزة في مكان خاص في الصفحة
    }
    
    getFeaturedProducts() {
        const featured = [];
        for (const category in this.productsByCategory) {
            featured.push(...this.productsByCategory[category].filter(p => p.featured));
        }
        return featured;
    }
    
    generateRatingStars(rating) {
        const stars = Math.floor(rating);
        const hasHalfStar = rating - stars >= 0.5;
        
        let starsHtml = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= stars) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === stars + 1 && hasHalfStar) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }
        
        return `<div class="stars">${starsHtml}</div>`;
    }
    
    getBadgeClass(badge) {
        const badgeMap = {
            'جديد': 'badge-new',
            'الأكثر مبيعاً': 'badge-popular',
            'خصم': 'badge-sale',
            'محدود': 'badge-limited'
        };
        
        return badgeMap[badge] || 'badge-new';
    }
    
    getDefaultImage(category) {
        const images = {
            'electronics': '📱',
            'fashion': '👕',
            'home': '🏠',
            'beauty': '💄',
            'sports': '⚽',
            'books': '📚',
            'toys': '🎮',
            'offers': '🔥'
        };
        
        return images[category] || '📦';
    }
    
    getRandomRating() {
        return (Math.random() * 1.5 + 3.5).toFixed(1); // بين 3.5 و 5
    }
    
    showAllProducts(categoryId) {
        const categoryInfo = this.categories[categoryId];
        const products = this.productsByCategory[categoryId] || [];
        
        // إنشاء نافذة عرض جميع المنتجات
        const modal = document.createElement('div');
        modal.className = 'products-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1200px;">
                <div class="modal-header">
                    <h3>
                        <i class="${categoryInfo.icon}"></i>
                        ${categoryInfo.name}
                    </h3>
                    <button class="btn btn-icon btn-danger close-modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-light); margin-bottom: var(--space-xl);">${categoryInfo.description}</p>
                    
                    <div class="products-grid">
                        ${products.map(product => this.createProductCard(product)).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة أنماط للنافذة
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: var(--space-lg);
            animation: fadeIn 0.3s ease;
        `;
        
        modal.querySelector('.modal-content').style.cssText = `
            background: white;
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            max-height: 90vh;
            overflow-y: auto;
            width: 100%;
            animation: slideInUp 0.3s ease;
        `;
        
        // إضافة مستمعي الأحداث
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => modal.remove(), 300);
            }
        });
        
        // إضافة مستمعي الأحداث للأزرار داخل النافذة
        setTimeout(() => {
            modal.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const productId = e.target.closest('.add-to-cart-btn').dataset.id;
                    this.addToCart(productId);
                });
            });
        }, 100);
    }
    
    addToCart(productId) {
        if (window.cartManager) {
            window.cartManager.addToCart(productId);
        }
    }
    
    searchProducts(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        for (const category in this.productsByCategory) {
            this.productsByCategory[category].forEach(product => {
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
        }
        
        return results;
    }
    
    getProductById(productId) {
        for (const category in this.productsByCategory) {
            const product = this.productsByCategory[category].find(p => p.id === productId);
            if (product) return product;
        }
        return null;
    }
    
    getCategoryName(categoryId) {
        return this.categories[categoryId]?.name || categoryId;
    }
}

// تصدير المدير ككائن عام
window.productsManager = new ProductsManager();
console.log('✅ ProductsManager loaded successfully');
