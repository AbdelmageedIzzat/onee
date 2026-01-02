// js/cart.js - نظام سلة المشتريات المتقدم مع الإصلاحات

console.log('🛒 cart.js - Loading enhanced cart system...');

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.discounts = {
            'WELCOME10': { percent: 10, minAmount: 100 },
            'SUMMER25': { percent: 25, minAmount: 300 },
            'VIP30': { percent: 30, minAmount: 500 }
        };
        this.activeDiscount = null;
        this.shippingFee = 0;
        this.freeShippingThreshold = 200;
        
        this.init();
    }
    
    init() {
        console.log('🎯 CartManager initialization...');
        this.updateCartUI();
        this.setupEventListeners();
    }
    
    loadCart() {
        try {
            const cart = localStorage.getItem('nexus_cart');
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }
    
    saveCart() {
        try {
            localStorage.setItem('nexus_cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }
    
    addToCart(productId, quantity = 1) {
        console.log('📥 [CartManager] Adding to cart - Product ID:', productId);
        
        // البحث عن المنتج
        const product = this.findProductById(productId);
        
        if (!product) {
            console.error('❌ [CartManager] Product not found:', productId);
            this.showNotification('خطأ', 'المنتج غير متوفر', 'error');
            return false;
        }
        
        console.log('✅ [CartManager] Found product:', product);
        
        // البحث عن المنتج في السلة
        const existingIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingIndex !== -1) {
            // تحديث الكمية
            this.cart[existingIndex].quantity += quantity;
            this.cart[existingIndex].total = this.cart[existingIndex].price * this.cart[existingIndex].quantity;
            console.log('🔄 Updated existing item:', this.cart[existingIndex]);
        } else {
            // إضافة منتج جديد
            const cartItem = {
                id: product.id,
                name: product.name || `منتج ${productId}`,
                price: product.price || 0,
                oldPrice: product.oldPrice,
                image: product.image || '📦',
                category: product.category || 'general',
                quantity: quantity,
                total: (product.price || 0) * quantity,
                maxStock: product.stock || 99
            };
            
            this.cart.push(cartItem);
            console.log('➕ Added new item:', cartItem);
        }
        
        // حفظ وتحديث الواجهة
        this.saveCart();
        this.updateCartUI();
        
        // إشعار النجاح
        this.showNotification('تمت الإضافة', 
            `تم إضافة ${product.name || 'المنتج'} إلى السلة`, 'success');
        
        // تأثير على أيقونة السلة
        this.pulseCartIcon();
        
        // إرسال حدث للتحديث
        this.dispatchCartUpdatedEvent();
        
        return true;
    }
    
    findProductById(productId) {
        console.log('🔍 [CartManager] Searching for product:', productId);
        
        // المصدر 1: من app إذا كان متاحاً
        if (window.app && typeof window.app.getProductById === 'function') {
            const product = window.app.getProductById(productId);
            if (product) {
                console.log('✅ Found in app:', product);
                return product;
            }
        }
        
        // المصدر 2: من productsManager
        if (window.productsManager && typeof window.productsManager.getProductById === 'function') {
            const product = window.productsManager.getProductById(productId);
            if (product) {
                console.log('✅ Found in productsManager:', product);
                return product;
            }
        }
        
        // المصدر 3: البحث في جميع المنتجات
        if (window.app && window.app.products) {
            for (const category in window.app.products) {
                const categoryProducts = window.app.products[category];
                if (Array.isArray(categoryProducts)) {
                    const product = categoryProducts.find(p => p.id === productId);
                    if (product) {
                        console.log('✅ Found in app.products:', product);
                        return product;
                    }
                }
            }
        }
        
        // المصدر 4: بيانات افتراضية للطوارئ
        console.log('⚠️ Using fallback product data');
        const fallbackProducts = {
            'elec1': { id: 'elec1', name: 'سماعات لاسلكية', price: 299, image: '🎧', category: 'electronics' },
            'elec2': { id: 'elec2', name: 'ساعة ذكية', price: 499, image: '⌚', category: 'electronics' },
            'fash1': { id: 'fash1', name: 'قميص رجالي', price: 89, image: '👔', category: 'fashion' },
            'fash2': { id: 'fash2', name: 'فستان سهرة', price: 299, image: '👗', category: 'fashion' },
            'home1': { id: 'home1', name: 'سجادة صوف', price: 199, image: '🧶', category: 'home' },
            'home2': { id: 'home2', name: 'مصباح طاولة', price: 149, image: '💡', category: 'home' },
            'beauty1': { id: 'beauty1', name: 'مجموعة تجميل', price: 179, image: '💄', category: 'beauty' },
            'offer1': { id: 'offer1', name: 'عرض خاص', price: 249, image: '🔥', category: 'offers' }
        };
        
        return fallbackProducts[productId] || {
            id: productId,
            name: `منتج ${productId}`,
            price: 100,
            image: '📦',
            category: 'general'
        };
    }
    
    removeFromCart(productId) {
        console.log('Removing from cart:', productId);
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length < initialLength) {
            this.saveCart();
            this.updateCartUI();
            this.showNotification('تمت الإزالة', 'تمت إزالة المنتج من السلة');
            this.dispatchCartUpdatedEvent();
        }
    }
    
    updateQuantity(productId, newQuantity) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            // التحقق من عدم تجاوز المخزون
            const maxStock = this.cart[itemIndex].maxStock || 99;
            if (newQuantity > maxStock) {
                this.showNotification('مخزون محدود', `الحد الأقصى ${maxStock} قطعة`, 'warning');
                newQuantity = maxStock;
            }
            
            this.cart[itemIndex].quantity = newQuantity;
            this.cart[itemIndex].total = this.cart[itemIndex].price * newQuantity;
            
            this.saveCart();
            this.updateCartUI();
            this.dispatchCartUpdatedEvent();
        }
    }
    
    dispatchCartUpdatedEvent() {
        const event = new CustomEvent('cart-updated', {
            detail: { cart: this.cart }
        });
        window.dispatchEvent(event);
    }
    
    applyDiscount(code) {
        const discount = this.discounts[code.toUpperCase()];
        
        if (!discount) {
            this.showNotification('كود خصم غير صالح', 'يرجى التحقق من الكود والمحاولة مرة أخرى', 'error');
            return false;
        }
        
        const subtotal = this.getSubtotal();
        
        if (subtotal < discount.minAmount) {
            this.showNotification('غير مؤهل للخصم', 
                `يجب أن يكون مجموع المشتريات ${discount.minAmount} ريال على الأقل`, 'warning');
            return false;
        }
        
        this.activeDiscount = {
            code: code.toUpperCase(),
            percent: discount.percent,
            amount: (subtotal * discount.percent / 100)
        };
        
        this.updateCartUI();
        this.showNotification('تم تطبيق الخصم', 
            `تم تطبيق خصم ${discount.percent}% على طلبك`, 'success');
        
        return true;
    }
    
    removeDiscount() {
        this.activeDiscount = null;
        this.updateCartUI();
    }
    
    calculateShipping() {
        const subtotal = this.getSubtotal();
        
        if (subtotal >= this.freeShippingThreshold || this.cart.length === 0) {
            this.shippingFee = 0;
        } else {
            this.shippingFee = 25;
        }
        
        return this.shippingFee;
    }
    
    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.total || 0), 0);
    }
    
    getDiscountAmount() {
        if (!this.activeDiscount) return 0;
        
        const subtotal = this.getSubtotal();
        return (subtotal * this.activeDiscount.percent / 100);
    }
    
    getTotal() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscountAmount();
        const shipping = this.calculateShipping();
        
        return subtotal - discount + shipping;
    }
    
    getItemCount() {
        return this.cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    
    clearCart() {
        this.cart = [];
        this.activeDiscount = null;
        this.saveCart();
        this.updateCartUI();
        this.showNotification('تم تفريغ السلة', 'تمت إزالة جميع المنتجات من السلة');
        this.dispatchCartUpdatedEvent();
    }
    
    updateCartUI() {
        console.log('🔄 Updating cart UI...');
        
        // تحديث العناصر
        this.renderCartItems();
        
        // تحديث الملخص
        this.updateCartSummary();
        
        // تحديث العداد
        this.updateCartCount();
        
        // تحديث زر الشراء
        this.updateCheckoutButton();
        
        console.log('✅ Cart UI updated');
    }
    
    renderCartItems() {
        const container = document.getElementById('cart-items-container');
        if (!container) {
            console.error('Cart container not found!');
            return;
        }
        
        console.log('Rendering cart items:', this.cart);
        
        if (this.cart.length === 0) {
            container.innerHTML = this.createEmptyCartTemplate();
            return;
        }
        
        container.innerHTML = this.cart.map(item => this.createCartItemTemplate(item)).join('');
        
        // إضافة مستمعي الأحداث بعد عرض العناصر
        setTimeout(() => {
            this.addCartEventListeners();
        }, 100);
    }
    
    createEmptyCartTemplate() {
        return `
            <div style="text-align: center; padding: var(--space-2xl);">
                <i class="fas fa-shopping-bag" style="font-size: var(--icon-3xl); color: var(--text-light); margin-bottom: var(--space-md); opacity: 0.5;"></i>
                <h3 style="margin-bottom: var(--space-sm); color: var(--text-light);">سلة المشتريات فارغة</h3>
                <p style="color: var(--text-light); margin-bottom: var(--space-xl);">لم تقم بإضافة أي منتجات بعد</p>
                <button class="btn btn-primary" onclick="window.uiManager?.closeCartSidebar(); window.app?.switchCategory('all');">
                    <i class="fas fa-shopping-cart"></i>
                    ابدأ التسوق الآن
                </button>
            </div>
        `;
    }
    
    createCartItemTemplate(item) {
        const categoryName = this.getCategoryName(item.category);
        
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    ${item.image || '📦'}
                </div>
                
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <h4 class="cart-item-name">${item.name || `منتج ${item.id}`}</h4>
                        <button class="btn btn-icon btn-sm btn-danger remove-item" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="cart-item-category">
                        <i class="fas fa-tag"></i>
                        ${categoryName}
                    </div>
                    
                    <div class="cart-item-price">
                        ${(item.price || 0).toFixed(2)} ر.س
                        ${item.oldPrice ? `
                            <span style="text-decoration: line-through; color: var(--text-light); font-size: var(--font-sm); margin-right: var(--space-xs);">
                                ${item.oldPrice.toFixed(2)} ر.س
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity || 1}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="cart-item-total">
                    ${(item.total || 0).toFixed(2)} ر.س
                </div>
            </div>
        `;
    }
    
    getCategoryName(categoryId) {
        if (!categoryId) return 'عام';
        
        // البحث في categories من app
        if (window.app?.categories) {
            const category = window.app.categories.find(c => c.id === categoryId);
            if (category) return category.name;
        }
        
        // البحث في productsManager
        if (window.productsManager?.categories) {
            const category = window.productsManager.categories[categoryId];
            if (category) return category.name;
        }
        
        return categoryId;
    }
    
    addCartEventListeners() {
        // أزرار الإزالة
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = e.currentTarget.dataset.id;
                this.removeFromCart(productId);
            });
        });
        
        // أزرار الكمية
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = e.currentTarget.dataset.id;
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = e.currentTarget.dataset.id;
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });
    }
    
    updateCartSummary() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscountAmount();
        const shipping = this.calculateShipping();
        const total = this.getTotal();
        
        // تحديث العناصر
        const subtotalEl = document.getElementById('cart-subtotal');
        const discountEl = document.getElementById('cart-discount');
        const shippingEl = document.getElementById('cart-shipping');
        const totalEl = document.getElementById('cart-total');
        
        if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} ر.س`;
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'مجاني' : `${shipping.toFixed(2)} ر.س`;
        if (totalEl) totalEl.textContent = `${total.toFixed(2)} ر.س`;
        
        // تحديث عداد السلة في الهيدر
        this.updateCartCount();
    }
    
    updateCartCount() {
        const count = this.getItemCount();
        const countElements = document.querySelectorAll('.cart-count');
        
        countElements.forEach(el => {
            el.textContent = count;
        });
    }
    
    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.disabled = this.cart.length === 0;
        }
    }
    
    setupEventListeners() {
        // تحديث السلة عند أي حدث
        window.addEventListener('cart-updated', () => {
            this.updateCartUI();
        });
    }
    
    pulseCartIcon() {
        const cartIcon = document.getElementById('cart-btn');
        if (cartIcon) {
            cartIcon.classList.add('pulse');
            setTimeout(() => {
                cartIcon.classList.remove('pulse');
            }, 1000);
        }
    }
    
    showNotification(title, message, type = 'info') {
        if (window.uiManager) {
            window.uiManager.showNotification(title, message, type);
        } else {
            console.log(`${title}: ${message}`);
        }
    }
    
    getCartItems() {
        return [...this.cart];
    }
    
    isEmpty() {
        return this.cart.length === 0;
    }
    
    // ============ إضافة الدوال المفقودة ============
    
    /**
     * الحصول على تفاصيل السلة الكاملة
     * @returns {Object} - تفاصيل السلة
     */
    getCartDetails() {
        const subtotal = this.getSubtotal();
        const discount = this.getDiscountAmount();
        const shipping = this.calculateShipping();
        const total = this.getTotal();
        
        return {
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                oldPrice: item.oldPrice,
                image: item.image,
                category: item.category,
                quantity: item.quantity,
                total: item.total || item.price * item.quantity
            })),
            subtotal: subtotal,
            discount: discount,
            shipping: shipping,
            total: total,
            discountCode: this.activeDiscount?.code,
            itemCount: this.getItemCount(),
            isEmpty: this.isEmpty()
        };
    }
    
    createOrderSummary() {
        return this.getCartDetails();
    }
}

// تصدير مدير السلة
console.log('✅ CartManager loaded successfully with enhanced features');
