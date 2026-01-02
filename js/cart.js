// ============================
// 🛒 نظام السلة الذكي
// ============================

class CartManager {
    constructor() {
        console.log('🛒 بدء تهيئة نظام السلة...');
        this.cart = this.loadCart();
        this.discountCode = null;
        this.discountPercentage = 0;
        this.discountAmount = 0;
        this.discountApplied = false;
        this.init();
    }
    
    init() {
        this.initElements();
        this.setupEventListeners();
        this.updateCartUI();
        console.log('✅ نظام السلة جاهز');
    }
    
    // تحميل السلة من localStorage
    loadCart() {
        try {
            const cartData = localStorage.getItem('global-store-cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                console.log(`📦 تم تحميل ${cart.length} منتج من السلة`);
                return cart;
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل السلة:', error);
        }
        return [];
    }
    
    // حفظ السلة في localStorage
    saveCart() {
        try {
            localStorage.setItem('global-store-cart', JSON.stringify(this.cart));
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ السلة:', error);
            return false;
        }
    }
    
    // تهيئة عناصر DOM
    initElements() {
        this.elements = {
            cartItems: document.getElementById('cart-items'),
            cartSubtotal: document.getElementById('cart-subtotal'),
            cartTotal: document.getElementById('cart-total'),
            cartCount: document.getElementById('cart-count'),
            cartItemCount: document.getElementById('cart-item-count'),
            checkoutBtn: document.getElementById('checkout-btn'),
            continueShopping: document.getElementById('continue-shopping'),
            closeCart: document.getElementById('close-cart'),
            discountCode: document.getElementById('discount-code'),
            applyDiscount: document.getElementById('apply-discount'),
            cartDiscount: document.getElementById('cart-discount'),
            discountSection: document.querySelector('.discount-section')
        };
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        const { closeCart, continueShopping, checkoutBtn, applyDiscount, discountCode } = this.elements;
        
        // إغلاق السلة
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }
        
        // متابعة التسوق
        if (continueShopping) {
            continueShopping.addEventListener('click', () => this.closeCart());
        }
        
        // فتح صفحة الدفع
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.cart.length > 0) {
                    window.checkoutManager?.openCheckoutModal();
                }
            });
        }
        
        // تطبيق كود الخصم
        if (applyDiscount && discountCode) {
            applyDiscount.addEventListener('click', () => this.applyDiscountCode());
            
            discountCode.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyDiscountCode();
                }
            });
        }
        
        // فتح السلة عند النقر على أيقونة السلة
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCart();
            });
        }
        
        // إغلاق السلة عند النقر خارجها
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cart-sidebar');
            const cartOverlay = document.getElementById('cart-overlay');
            
            if (cartSidebar?.classList.contains('active') && 
                !cartSidebar.contains(e.target) && 
                !cartIcon?.contains(e.target)) {
                this.closeCart();
            }
        });
    }
    
    // ==================== إدارة السلة ====================
    
    // إضافة منتج إلى السلة
    addToCart(productId, productName = '', price = 0, image = '📦', category = 'offers') {
        console.log(`➕ إضافة منتج ${productId} إلى السلة`);
        
        // البحث عن المنتج في السلة
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            // زيادة الكمية إذا المنتج موجود
            existingItem.quantity += 1;
            this.showNotification(`تم زيادة كمية "${existingItem.name}" في السلة`);
        } else {
            // إضافة منتج جديد
            const product = {
                id: productId,
                name: productName || `منتج ${productId}`,
                price: price,
                quantity: 1,
                image: image,
                category: category,
                addedAt: new Date().toISOString()
            };
            
            this.cart.push(product);
            this.showNotification(`تم إضافة "${product.name}" إلى السلة`);
        }
        
        // حفظ وتحديث
        this.saveCart();
        this.updateCartUI();
        this.pulseCartIcon();
        
        // فتح السلة تلقائياً (اختياري)
        if (this.cart.length === 1) {
            setTimeout(() => this.openCart(), 500);
        }
        
        return true;
    }
    
    // تحديث واجهة السلة
    updateCartUI() {
        this.renderCartItems();
        this.updateCartSummary();
        this.updateCartCounter();
        this.updateCheckoutButton();
    }
    
    // عرض منتجات السلة
    renderCartItems() {
        const { cartItems } = this.elements;
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = this.getEmptyCartHTML();
            return;
        }
        
        let html = '';
        
        this.cart.forEach((item, index) => {
            const totalPrice = item.price * item.quantity;
            
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-header">
                        <div class="cart-item-image">${item.image}</div>
                        <button class="remove-item-btn" onclick="cartManager.removeItem('${item.id}')" 
                                title="إزالة المنتج" aria-label="إزالة ${item.name}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="cart-item-body">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <div class="cart-item-meta">
                            <span class="cart-item-category">
                                <i class="fas fa-tag"></i> ${this.getCategoryName(item.category)}
                            </span>
                            <span class="cart-item-price">${item.price} ريال</span>
                        </div>
                    </div>
                    
                    <div class="cart-item-footer">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" onclick="cartManager.updateQuantity('${item.id}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity-value">${item.quantity}</span>
                            <button class="quantity-btn plus" onclick="cartManager.updateQuantity('${item.id}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="cart-item-total">${totalPrice.toFixed(2)} ريال</div>
                    </div>
                </div>
            `;
        });
        
        cartItems.innerHTML = html;
    }
    
    // تحديث الملخص
    updateCartSummary() {
        const { cartSubtotal, cartTotal, cartDiscount, discountSection } = this.elements;
        
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // حساب الخصم
        if (this.discountApplied && this.discountPercentage > 0) {
            this.discountAmount = subtotal * this.discountPercentage;
            const total = subtotal - this.discountAmount;
            
            if (cartSubtotal) cartSubtotal.textContent = `${subtotal.toFixed(2)} ريال`;
            if (cartTotal) cartTotal.textContent = `${total.toFixed(2)} ريال`;
            if (cartDiscount) cartDiscount.textContent = `-${this.discountAmount.toFixed(2)} ريال`;
            if (discountSection) discountSection.style.display = 'flex';
        } else {
            if (cartSubtotal) cartSubtotal.textContent = `${subtotal.toFixed(2)} ريال`;
            if (cartTotal) cartTotal.textContent = `${subtotal.toFixed(2)} ريال`;
            if (discountSection) discountSection.style.display = 'none';
        }
    }
    
    // تحديث عداد السلة
    updateCartCounter() {
        const { cartCount, cartItemCount } = this.elements;
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) {
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
        
        if (cartItemCount) {
            cartItemCount.textContent = `(${totalItems} منتج)`;
        }
    }
    
    // تحديث زر الدفع
    updateCheckoutButton() {
        const { checkoutBtn } = this.elements;
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
        }
    }
    
    // ==================== عمليات السلة ====================
    
    // تحديث كمية المنتج
    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
        if (!item) return;
        
        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeItem(productId);
        } else {
            this.saveCart();
            this.updateCartUI();
            this.showNotification(`تم تحديث كمية "${item.name}" إلى ${item.quantity}`);
        }
    }
    
    // إزالة منتج
    removeItem(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        
        const itemName = this.cart[itemIndex].name;
        this.cart.splice(itemIndex, 1);
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification(`تم إزالة "${itemName}" من السلة`);
        
        // إغلاق السلة إذا أصبحت فارغة
        if (this.cart.length === 0) {
            setTimeout(() => this.closeCart(), 1000);
        }
    }
    
    // تطبيق كود الخصم
    applyDiscountCode() {
        const { discountCode } = this.elements;
        if (!discountCode) return;
        
        const code = discountCode.value.trim().toUpperCase();
        
        if (!code) {
            this.showNotification('الرجاء إدخال كود الخصم', 'error');
            return;
        }
        
        // قائمة أكواد الخصم
        const discountCodes = {
            'WELCOME10': 0.10,    // خصم 10%
            'SAVE15': 0.15,       // خصم 15%
            'SUMMER20': 0.20,     // خصم 20%
            'SPECIAL25': 0.25     // خصم 25%
        };
        
        if (discountCodes[code]) {
            this.discountCode = code;
            this.discountPercentage = discountCodes[code];
            this.discountApplied = true;
            
            this.updateCartUI();
            this.showNotification(`تم تطبيق كود الخصم "${code}" بنجاح!`);
            
            // حفظ الكود
            localStorage.setItem('discount_code', code);
        } else {
            this.showNotification('كود الخصم غير صالح', 'error');
            discountCode.value = '';
        }
    }
    
    // إفراغ السلة
    clearCart() {
        this.cart = [];
        this.discountCode = null;
        this.discountPercentage = 0;
        this.discountApplied = false;
        
        this.saveCart();
        this.updateCartUI();
        this.closeCart();
        
        this.showNotification('تم إفراغ السلة بنجاح');
    }
    
    // ==================== واجهة المستخدم ====================
    
    // فتح السلة
    openCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            cartSidebar.setAttribute('aria-expanded', 'true');
        }
        
        if (cartOverlay) {
            cartOverlay.classList.add('active');
        }
        
        // تحديث محتوى السلة
        this.updateCartUI();
        
        // إضافة تأثير
        this.pulseCartIcon();
    }
    
    // إغلاق السلة
    closeCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            cartSidebar.setAttribute('aria-expanded', 'false');
        }
        
        if (cartOverlay) {
            cartOverlay.classList.remove('active');
        }
    }
    
    // تأثير النبض على أيقونة السلة
    pulseCartIcon() {
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('pulse');
            setTimeout(() => {
                cartIcon.classList.remove('pulse');
            }, 500);
        }
    }
    
    // عرض الإشعارات
    showNotification(message, type = 'success') {
        if (window.uiManager?.showNotification) {
            window.uiManager.showNotification(
                type === 'success' ? 'نجاح' : 'خطأ',
                message,
                type
            );
        } else {
            alert(message);
        }
    }
    
    // ==================== دوال مساعدة ====================
    
    getEmptyCartHTML() {
        return `
            <div class="empty-cart-state">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h3 class="empty-cart-title">سلة المشتريات فارغة</h3>
                <p class="empty-cart-message">لم تقم بإضافة أي منتجات بعد</p>
                <button class="btn-primary" onclick="cartManager.closeCart()">
                    <i class="fas fa-shopping-cart"></i>
                    ابدأ التسوق
                </button>
            </div>
        `;
    }
    
    getCategoryName(category) {
        const categories = {
            'offers': 'العروض',
            'accessories': 'الإكسسوارات',
            'cosmetics': 'التجميل',
            'clothing': 'الملابس',
            'electronics': 'الإلكترونيات',
            'home': 'منزلي'
        };
        return categories[category] || category;
    }
    
    // الحصول على إجمالي السلة
    getTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = this.discountApplied ? subtotal * this.discountPercentage : 0;
        return subtotal - discount;
    }
    
    // الحصول على تفاصيل السلة
    getCartDetails() {
        return {
            items: [...this.cart],
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            discount: this.discountAmount,
            total: this.getTotal(),
            discountCode: this.discountCode
        };
    }
}

// تهيئة السلة
window.cartManager = new CartManager();

// دالة إضافة سريعة للمنتجات
window.addToCart = function(productId, productName, price, image, category) {
    return window.cartManager.addToCart(productId, productName, price, image, category);
};

// دالة للتصحيح
window.debugCart = function() {
    console.log('=== تصحيح السلة ===');
    console.log('المنتجات:', window.cartManager.cart);
    console.log('الإجمالي:', window.cartManager.getTotal());
    console.log('الكود الخصم:', window.cartManager.discountCode);
    return window.cartManager.cart;
};
