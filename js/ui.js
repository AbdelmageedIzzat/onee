// js/ui.js - نظام واجهة المستخدم المتقدم مع الإصلاحات
console.log('🎨 ui.js - Loading enhanced UI system...');

class UIManager {
    constructor() {
        this.notification = null;
        this.notificationTimeout = null;
        this.modals = {};
        this.currentModal = null;
        
        this.init();
    }
    
    init() {
        console.log('🎯 UIManager initialization...');
        
        // إنشاء العناصر الديناميكية
        this.createNotification();
        this.createModals();
        
        // إعداد مستمعي الأحداث
        this.setupEventListeners();
        
        // تهيئة المكونات
        this.initComponents();
        
        // إعداد تحسينات الموبايل والأداء
        this.setupMobileFeatures();
        this.setupPerformanceOptimizations();
        
        console.log('✅ UIManager ready!');
    }
    
    createNotification() {
        // إنشاء عنصر الإشعار إذا لم يكن موجوداً
        if (!document.getElementById('notification')) {
            this.notification = document.createElement('div');
            this.notification.id = 'notification';
            this.notification.className = 'notification';
            this.notification.innerHTML = `
                <i class="fas fa-check-circle notification-icon success" id="notification-icon"></i>
                <div class="notification-content">
                    <div class="notification-title" id="notification-title"></div>
                    <div class="notification-message" id="notification-message"></div>
                </div>
                <button class="notification-close" id="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            document.body.appendChild(this.notification);
        } else {
            this.notification = document.getElementById('notification');
        }
    }
    
    createModals() {
        // إنشاء المودالات الأساسية
        const modals = [
            {
                id: 'quick-view-modal',
                title: 'عرض سريع',
                content: '<div id="quick-view-content"></div>'
            }
        ];
        
        modals.forEach(modalConfig => {
            this.createModal(modalConfig);
        });
    }
    
    createModal(config) {
        const modal = document.createElement('div');
        modal.id = config.id;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="window.uiManager.closeModal()"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h3>${config.title}</h3>
                    <button class="modal-close" onclick="window.uiManager.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${config.content}
            </div>
        `;
        
        document.body.appendChild(modal);
        this.modals[config.id] = modal;
    }
    
    initComponents() {
        // تهيئة شريط البحث
        this.initSearch();
        
        // تهيئة أزرار الفئات
        this.initCategoryButtons();
        
        // تهيئة السلة
        this.initCart();
    }
    
    initSearch() {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                this.showSearchResults();
            });
            
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }
        
        // تهيئة البحث على الموبايل
        const mobileSearchInput = document.querySelector('.mobile-search-input input');
        if (mobileSearchInput) {
            mobileSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }
    }
    
    initCategoryButtons() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.switchCategory(category);
            });
        });
    }
    
    initCart() {
        console.log('🛒 Initializing cart system in UI...');
        
        // زر فتح السلة
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => {
                console.log('Cart button clicked');
                this.openCartSidebar();
                // تحديث السلة عند الفتح
                if (window.cartManager) {
                    console.log('Updating cart UI on open');
                    setTimeout(() => {
                        window.cartManager.updateCartUI();
                    }, 300);
                }
            });
        } else {
            console.warn('Cart button not found!');
        }
        
        // زر إغلاق السلة
        const closeCart = document.getElementById('close-cart');
        if (closeCart) {
            closeCart.addEventListener('click', () => {
                this.closeCartSidebar();
            });
        }
        
        // زر متابعة التسوق
        const continueShopping = document.getElementById('continue-shopping');
        if (continueShopping) {
            continueShopping.addEventListener('click', () => {
                this.closeCartSidebar();
            });
        }
        
        // زر إتمام الشراء
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (window.cartManager && !window.cartManager.isEmpty()) {
                    this.closeCartSidebar();
                    if (window.checkoutManager) {
                        window.checkoutManager.openCheckoutModal();
                    }
                } else {
                    this.showNotification('السلة فارغة', 'يرجى إضافة منتجات إلى السلة أولاً', 'warning');
                }
            });
        }
        
        // مستمع حدث تحديث السلة
        window.addEventListener('cart-updated', (event) => {
            console.log('📢 Cart updated event received in UI:', event.detail);
            if (window.cartManager) {
                window.cartManager.updateCartUI();
            }
        });
        
        // تحديث السلة عند فتح السلة الجانبية
        document.addEventListener('cart-sidebar-opened', () => {
            console.log('Cart sidebar opened, updating cart');
            if (window.cartManager) {
                setTimeout(() => {
                    window.cartManager.updateCartUI();
                }, 100);
            }
        });
        
        console.log('✅ Cart system initialized in UI');
    }
    
    setupEventListeners() {
        // إغلاق الإشعار
        const notificationClose = document.getElementById('notification-close');
        if (notificationClose) {
            notificationClose.addEventListener('click', () => {
                this.hideNotification();
            });
        }
        
        // زر العودة للأعلى
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
        
        // النقر خارج السلة لإغلاقها
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartOverlay = document.getElementById('cart-overlay');
            
            if (cartSidebar && cartSidebar.classList.contains('active')) {
                if (e.target === cartOverlay) {
                    this.closeCartSidebar();
                }
            }
        });
        
        // إغلاق الإشعار تلقائياً بالنقر عليه
        this.notification?.addEventListener('click', (e) => {
            if (e.target === this.notification) {
                this.hideNotification();
            }
        });
        
        // تحديث السلة عند تحميل الصفحة
        window.addEventListener('load', () => {
            console.log('Page loaded, updating cart UI');
            if (window.cartManager) {
                setTimeout(() => {
                    window.cartManager.updateCartCount();
                }, 500);
            }
        });
        
        // تحديث السلة عند تغيير حجم النافذة
        window.addEventListener('resize', () => {
            if (window.cartManager && document.getElementById('cart-sidebar')?.classList.contains('active')) {
                window.cartManager.updateCartUI();
            }
        });
    }
    
    // الإشعارات
    showNotification(title, message, type = 'info', duration = 3000) {
        if (!this.notification) return;
        
        // إخفاء أي إشعار سابق
        this.hideNotification();
        
        // تحديث المحتوى
        const icon = this.notification.querySelector('#notification-icon');
        const titleEl = this.notification.querySelector('#notification-title');
        const messageEl = this.notification.querySelector('#notification-message');
        
        if (icon && titleEl && messageEl) {
            // تحديث الأيقونة حسب النوع
            icon.className = `fas notification-icon ${this.getNotificationIcon(type)} ${type}`;
            
            // تحديط النصوص
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // إظهار الإشعار
            this.notification.classList.add('show');
            
            // إخفاء تلقائي بعد المدة المحددة
            this.notificationTimeout = setTimeout(() => {
                this.hideNotification();
            }, duration);
        }
    }
    
    hideNotification() {
        if (this.notification) {
            this.notification.classList.remove('show');
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }
        }
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        return icons[type] || 'fa-info-circle';
    }
    
    // السلة الجانبية
    openCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // إرسال حدث فتح السلة
            const event = new CustomEvent('cart-sidebar-opened');
            window.dispatchEvent(event);
            
            console.log('Cart sidebar opened');
        }
    }
    
    closeCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
            
            console.log('Cart sidebar closed');
        }
    }
    
    // البحث
    showSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.classList.add('active');
        }
    }
    
    hideSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }
    
    handleSearchInput(query) {
        if (query.trim().length === 0) {
            this.hideSearchResults();
            return;
        }
        
        // عرض نتائج البحث
        this.showSearchResults();
        
        // يمكن تنفيذ البحث الفعلي هنا
        if (window.app) {
            const results = window.app.searchProducts(query);
            this.displaySearchResults(results);
        }
    }
    
    displaySearchResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-empty">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على منتجات تطابق بحثك</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = results.slice(0, 5).map(product => `
            <div class="search-result" onclick="window.uiManager.selectSearchResult('${product.id}')">
                <div class="search-result-image">${product.image}</div>
                <div class="search-result-info">
                    <div class="search-result-name">${product.name}</div>
                    <div class="search-result-category">${window.app?.getCategoryName(product.category)}</div>
                    <div class="search-result-price">${product.price} ر.س</div>
                </div>
            </div>
        `).join('');
    }
    
    selectSearchResult(productId) {
        // إغلاق نتائج البحث
        this.hideSearchResults();
        
        // مسح حقل البحث
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // عرض المنتج
        this.showProductQuickView(productId);
    }
    
    // الفئات
    switchCategory(categoryId) {
        // تحديث الأزرار النشطة
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === categoryId) {
                btn.classList.add('active');
            }
        });
        
        // التمرير إلى القسم المناسب
        if (categoryId === 'offers') {
            const offersSection = document.getElementById('special-offers-section');
            if (offersSection) {
                offersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            const section = document.getElementById(`category-${categoryId}`);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    
    // المودالات
    openModal(modalId, data = null) {
        const modal = this.modals[modalId];
        if (modal) {
            modal.classList.add('active');
            this.currentModal = modalId;
            document.body.style.overflow = 'hidden';
            
            // تحميل البيانات إذا كانت موجودة
            if (data) {
                this.loadModalData(modalId, data);
            }
        }
    }
    
    closeModal() {
        if (this.currentModal) {
            const modal = this.modals[this.currentModal];
            if (modal) {
                modal.classList.remove('active');
            }
            this.currentModal = null;
            document.body.style.overflow = '';
        }
    }
    
    loadModalData(modalId, data) {
        switch (modalId) {
            case 'quick-view-modal':
                this.loadQuickViewData(data);
                break;
        }
    }
    
    loadQuickViewData(productId) {
        let product = null;
        
        // البحث عن المنتج
        if (window.app) {
            product = window.app.getProductById(productId);
        }
        
        if (!product) {
            this.showNotification('خطأ', 'المنتج غير موجود', 'error');
            this.closeModal();
            return;
        }
        
        const content = document.getElementById('quick-view-content');
        if (content) {
            content.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xl);">
                    <div class="product-image-large">
                        ${product.image || '📦'}
                    </div>
                    <div>
                        <h3 style="margin-bottom: var(--space-sm);">${product.name}</h3>
                        <p style="color: var(--text-light); margin-bottom: var(--space-lg);">${product.description}</p>
                        
                        <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-lg);">
                            <span style="font-size: var(--font-2xl); font-weight: 800; color: var(--primary);">
                                ${product.price} ر.س
                            </span>
                            ${product.oldPrice ? `
                                <span style="text-decoration: line-through; color: var(--text-light);">
                                    ${product.oldPrice} ر.س
                                </span>
                            ` : ''}
                        </div>
                        
                        <div style="margin-bottom: var(--space-xl);">
                            <button class="btn btn-primary" onclick="window.cartManager.addToCart('${product.id}'); window.uiManager.closeModal();">
                                <i class="fas fa-shopping-cart"></i>
                                أضف إلى السلة
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    showProductQuickView(productId) {
        this.openModal('quick-view-modal', productId);
    }
    
    // تحسين تجربة المستخدم على الموبايل
    setupMobileFeatures() {
        // منع التكبير في حقول الإدخال على iOS
        document.addEventListener('touchstart', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                e.target.style.fontSize = '16px';
            }
        });
        
        // إصلاح ارتفاع 100vh على الموبايل
        this.fixViewportHeight();
        
        // إضافة class للكشف عن الموبايل
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            document.body.classList.add('is-mobile');
        }
    }
    
    fixViewportHeight() {
        const setVh = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVh();
        window.addEventListener('resize', setVh);
        window.addEventListener('orientationchange', setVh);
    }
    
    // تحسينات الأداء
    setupPerformanceOptimizations() {
        // Lazy loading للصور
        this.setupLazyLoading();
        
        // Defer loading للعناصر غير الضرورية
        this.deferNonCriticalContent();
    }
    
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    deferNonCriticalContent() {
        // تأجيل تحميل المحتوى غير الضروري للشاشة الأولى
        window.addEventListener('load', () => {
            setTimeout(() => {
                // تحميل المحتوى الإضافي
                this.loadAdditionalContent();
            }, 1000);
        });
    }
    
    loadAdditionalContent() {
        // يمكن تحميل المزيد من المنتجات أو المحتوى هنا
        console.log('Loading additional content...');
    }
    
    // دوال مساعدة
    showLoading(message = 'جاري التحميل...') {
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(loading);
    }
    
    hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            loading.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => loading.remove(), 300);
        }
    }
}

// تصدير مدير واجهة المستخدم
window.uiManager = new UIManager();
console.log('✅ UIManager loaded successfully');
