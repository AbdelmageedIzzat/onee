// js/cart.js - نظام سلة المشتريات المتقدم

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
            return JSON.parse(localStorage.getItem('nexus_cart')) || [];
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
        // الحصول على بيانات المنتج
        const product = window.productsManager?.getProductById(productId);
        
        if (!product) {
            console.error('Product not found:', productId);
            this.showNotification('خطأ', 'المنتج غير متوفر', 'error');
            return false;
        }
        
        // التحقق من المخزون
        if (product.stock <= 0) {
            this.showNotification('غير متوفر', 'هذا المنتج غير متوفر حالياً', 'error');
            return false;
        }
        
        // البحث عن المنتج في السلة
        const existingIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingIndex !== -1) {
            // التحقق من عدم تجاوز المخزون
            if (this.cart[existingIndex].quantity + quantity > product.stock) {
                this.showNotification('مخزون محدود', `لا يمكن إضافة أكثر من ${product.stock} قطعة`, 'warning');
                quantity = product.stock - this.cart[existingIndex].quantity;
            }
            
            this.cart[existingIndex].quantity += quantity;
            this.cart[existingIndex].total = this.cart[existingIndex].price * this.cart[existingIndex].quantity;
        } else {
            // التحقق من المخزون للكمية المطلوبة
            if (quantity > product.stock) {
                this.showNotification('مخزون محدود', `الكمية المتاحة ${product.stock} قطعة فقط`, 'warning');
                quantity = product.stock;
            }
            
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                oldPrice: product.oldPrice,
                image: product.image,
                category: product.category,
                quantity: quantity,
                total: product.price * quantity,
                maxStock: product.stock
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.updateProductUI(productId);
        
        // إشعار النجاح
        this.showNotification('تمت الإضافة', 
            `تم إضافة ${product.name} إلى السلة`, 'success');
        
        // تأثير على أيقونة السلة
        this.pulseCartIcon();
        
        return true;
    }
    
    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length < initialLength) {
            this.saveCart();
            this.updateCartUI();
            this.updateProductUI(productId);
            this.showNotification('تمت الإزالة', 'تمت إزالة المنتج من السلة');
        }
    }
    
    updateQuantity(productId, newQuantity) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            // الحصول على بيانات المنتج للتحقق من المخزون
            const product = window.productsManager?.getProductById(productId);
            const maxStock = product?.stock || this.cart[itemIndex].maxStock || 99;
            
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            
            if (newQuantity > maxStock) {
                this.showNotification('مخزون محدود', `الحد الأقصى ${maxStock} قطعة`, 'warning');
                newQuantity = maxStock;
            }
            
            this.cart[itemIndex].quantity = newQuantity;
            this.cart[itemIndex].total = this.cart[itemIndex].price * newQuantity;
            
            this.saveCart();
            this.updateCartUI();
            this.updateProductUI(productId);
        }
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
            this.shippingFee = 25; // رسوم التوصيل الافتراضية
        }
        
        return this.shippingFee;
    }
    
    getSubtotal() {
        return this.cart.reduce((sum, item) => sum + item.total, 0);
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
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    clearCart() {
        this.cart = [];
        this.activeDiscount = null;
        this.saveCart();
        this.updateCartUI();
        this.showNotification('تم تفريغ السلة', 'تمت إزالة جميع المنتجات من السلة');
    }
    
    updateCartUI() {
        this.renderCartItems();
        this.updateCartSummary();
        this.updateCartCount();
        this.updateCheckoutButton();
    }
    
    renderCartItems() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;
        
        if (this.cart.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--space-2xl);">
                    <i class="fas fa-shopping-bag" style="font-size: var(--icon-3xl); color: var(--text-light); margin-bottom: var(--space-md); opacity: 0.5;"></i>
                    <h3 style="margin-bottom: var(--space-sm); color: var(--text-light);">سلة المشتريات فارغة</h3>
                    <p style="color: var(--text-light); margin-bottom: var(--space-xl);">لم تقم بإضافة أي منتجات بعد</p>
                    <button class="btn btn-primary" onclick="window.uiManager?.closeCartSidebar(); window.app.switchCategory('all');">
                        <i class="fas fa-shopping-cart"></i>
                        ابدأ التسوق الآن
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    ${item.image}
                </div>
                
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <button class="btn btn-icon btn-sm btn-danger remove-item" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="cart-item-category">
                        <i class="fas fa-tag"></i>
                        ${window.productsManager?.getCategoryName(item.category) || item.category}
                    </div>
                    
                    <div class="cart-item-price">
                        ${item.price.toFixed(2)} ر.س
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
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                
                <div class="cart-item-total">
                    ${item.total.toFixed(2)} ر.س
                </div>
            </div>
        `).join('');
        
        // إضافة الأنماط إذا لزم الأمر
        const style = document.createElement('style');
        style.textContent = `
            .cart-item {
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: var(--space-md);
                padding: var(--space-md);
                border-bottom: 1px solid var(--gray);
                align-items: start;
            }
            
            .cart-item-image {
                width: 60px;
                height: 60px;
                background: var(--light);
                border-radius: var(--radius);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }
            
            .cart-item-details {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs);
            }
            
            .cart-item-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .cart-item-name {
                font-weight: 600;
                margin: 0;
                font-size: var(--font-base);
            }
            
            .cart-item-category {
                font-size: var(--font-xs);
                color: var(--text-light);
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .cart-item-price {
                font-weight: 700;
                color: var(--primary);
                font-size: var(--font-base);
            }
            
            .cart-item-quantity {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                background: var(--light);
                padding: 4px;
                border-radius: var(--radius);
                width: fit-content;
            }
            
            .quantity-btn {
                width: 28px;
                height: 28px;
                border: none;
                background: white;
                border-radius: var(--radius-sm);
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: var(--transition);
            }
            
            .quantity-btn:hover {
                background: var(--primary);
                color: white;
            }
            
            .quantity {
                font-weight: 700;
                min-width: 30px;
                text-align: center;
            }
            
            .cart-item-total {
                font-weight: 800;
                font-size: var(--font-lg);
                color: var(--dark);
                min-width: 80px;
                text-align: left;
            }
        `;
        
        if (!document.querySelector('#cart-styles')) {
            style.id = 'cart-styles';
            document.head.appendChild(style);
        }
        
        // إضافة مستمعي الأحداث
        this.addCartEventListeners();
    }
    
    addCartEventListeners() {
        // أزرار الإزالة
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.removeFromCart(productId);
            });
        });
        
        // أزرار الكمية
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });
        
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
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
        
        // تحديث العناصر إذا كانت موجودة
        const subtotalEl = document.getElementById('cart-subtotal');
        const discountEl = document.getElementById('cart-discount');
        const shippingEl = document.getElementById('cart-shipping');
        const totalEl = document.getElementById('cart-total');
        
        if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} ر.س`;
        if (shippingEl) shippingEl.textContent = shipping === 0 ? 'مجاني' : `${shipping.toFixed(2)} ر.س`;
        if (totalEl) totalEl.textContent = `${total.toFixed(2)} ر.س`;
        
        // إضافة أو إزالة عنصر الخصم
        const summaryContainer = document.querySelector('.cart-summary');
        if (summaryContainer) {
            let discountElement = document.getElementById('cart-discount-row');
            
            if (this.activeDiscount && !discountElement) {
                discountElement = document.createElement('div');
                discountElement.id = 'cart-discount-row';
                discountElement.className = 'summary-row discount';
                discountElement.innerHTML = `
                    <span>
                        <i class="fas fa-tag"></i>
                        خصم ${this.activeDiscount.code}
                        <button class="btn btn-icon btn-sm" onclick="window.cartManager.removeDiscount()" style="margin-right: var(--space-xs);">
                            <i class="fas fa-times"></i>
                        </button>
                    </span>
                    <span style="color: var(--success);">-${discount.toFixed(2)} ر.س</span>
                `;
                
                // إدراج قبل المجموع الكلي
                const totalRow = summaryContainer.querySelector('.total');
                if (totalRow) {
                    totalRow.parentNode.insertBefore(discountElement, totalRow);
                }
            } else if (!this.activeDiscount && discountElement) {
                discountElement.remove();
            }
        }
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
    
    updateProductUI(productId) {
        const item = this.cart.find(item => item.id === productId);
        const quantity = item ? item.quantity : 0;
        
        // تحديث أزرار الإضافة في صفحات المنتجات
        document.querySelectorAll(`.add-to-cart-btn[data-id="${productId}"]`).forEach(btn => {
            if (quantity > 0) {
                btn.classList.add('added');
                btn.innerHTML = '<i class="fas fa-check"></i> مضاف للسلة';
                btn.style.background = 'var(--success)';
            } else {
                btn.classList.remove('added');
                btn.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
                btn.style.background = '';
            }
        });
        
        // تحديث عداد الكمية إذا كان موجوداً
        const quantityElement = document.querySelector(`[data-id="${productId}"] .quantity`);
        if (quantityElement) {
            quantityElement.textContent = quantity;
        }
    }
    
    setupEventListeners() {
        // استمع لتحديثات من المكونات الأخرى
        document.addEventListener('cart-updated', () => {
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
        }
    }
    
    getCartItems() {
        return [...this.cart];
    }
    
    isEmpty() {
        return this.cart.length === 0;
    }
    
    // دالة للمساعدة في إنشاء ملخص الطلب
    createOrderSummary() {
        return {
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: item.total
            })),
            subtotal: this.getSubtotal(),
            discount: this.getDiscountAmount(),
            shipping: this.calculateShipping(),
            total: this.getTotal(),
            discountCode: this.activeDiscount?.code
        };
    }
}

// تصدير مدير السلة
window.cartManager = new CartManager();
console.log('✅ CartManager loaded successfully');
