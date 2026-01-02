// js/cart.js - إدارة سلة المشتريات المحسنة

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartItemsContainer = document.getElementById('cart-items-container');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.sidebarCartCount = document.getElementById('sidebar-cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        
        console.log('CartManager: تهيئة السلة، عدد المنتجات:', this.cart.length);
        this.init();
    }
    
    init() {
        this.updateCartUI();
        console.log('CartManager: تم التهيئة');
    }
    
    // إضافة منتج إلى السلة
    addToCart(productId, category = null) {
        console.log('محاولة إضافة منتج:', productId, 'فئة:', category);
        
        // البحث عن المنتج
        let product = null;
        let foundCategory = null;
        
        // البحث في جميع الفئات
        if (window.app && window.app.products) {
            for (const [cat, products] of Object.entries(window.app.products)) {
                const found = products.find(p => p.id === productId);
                if (found) {
                    product = found;
                    foundCategory = cat;
                    console.log('تم العثور على المنتج في app.products:', product.name);
                    break;
                }
            }
        }
        
        // إذا لم يتم العثور، جرب في productsManager
        if (!product && window.productsManager && window.productsManager.products) {
            for (const [cat, products] of Object.entries(window.productsManager.products)) {
                const found = products.find(p => p.id === productId);
                if (found) {
                    product = found;
                    foundCategory = cat;
                    console.log('تم العثور على المنتج في productsManager:', product.name);
                    break;
                }
            }
        }
        
        if (!product) {
            console.error('المنتج غير موجود:', productId);
            window.uiManager?.showNotification('خطأ', 'المنتج غير موجود', 'error');
            return;
        }
        
        // التحقق من المنتج في السلة
        const existingItemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
            // زيادة الكمية إذا المنتج موجود مسبقاً
            this.cart[existingItemIndex].quantity += 1;
        } else {
            // إضافة منتج جديد
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                category: foundCategory || category,
                image: product.image || '📦',
                oldPrice: product.oldPrice || null
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.updateProductUI(productId);
        
        window.uiManager?.showNotification('تمت الإضافة', 
            `تم إضافة ${product.name} إلى السلة`, 'success');
        
        // تأثير على أيقونة السلة
        this.pulseCartIcon();
        
        // افتح السلة تلقائياً (اختياري)
        // window.uiManager?.openCartSidebar();
        
        console.log('السلة بعد الإضافة:', this.cart);
    }
    
    // تحديث واجهة السلة
    updateCartUI() {
        this.renderCart();
        this.updateCartTotals();
        this.updateCartCount();
        this.updateCheckoutButton();
    }
    
    // عرض محتويات السلة
    renderCart() {
        if (!this.cartItemsContainer) {
            console.error('عنصر cart-items-container غير موجود');
            return;
        }
        
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-cart" style="text-align: center; padding: 40px 20px; color: var(--text-light);">
                    <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.3;"></i>
                    <h3 style="margin-bottom: 10px; color: var(--text);">سلة المشتريات فارغة</h3>
                    <p style="margin-bottom: 20px;">لم تقم بإضافة أي منتجات بعد. ابدأ بالتسوق الآن!</p>
                    <button class="btn btn-primary" onclick="window.uiManager?.closeCartSidebar(); window.app.switchCategory('all');">
                        <i class="fas fa-shopping-cart"></i>
                        ابدأ التسوق
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const categoryName = window.app?.getCategoryName(item.category) || item.category;
            
            html += `
                <div class="cart-item" data-id="${item.id}" style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid var(--gray);">
                    <div class="cart-item-image" style="width: 60px; height: 60px; background: var(--light); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-left: 15px; font-size: 1.5rem;">
                        ${item.image}
                    </div>
                    
                    <div class="cart-item-info" style="flex: 1;">
                        <h4 class="cart-item-name" style="margin-bottom: 5px; font-size: 0.95rem;">${item.name}</h4>
                        <div class="cart-item-category" style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 8px;">
                            <i class="fas fa-tag"></i> ${categoryName}
                        </div>
                        <div class="cart-item-price" style="font-weight: 700; color: var(--primary);">
                            ${item.price} ر.س
                        </div>
                    </div>
                    
                    <div class="cart-item-actions" style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
                        <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 10px; background: var(--light); padding: 5px; border-radius: 20px;">
                            <button class="quantity-btn minus" data-id="${item.id}" style="width: 25px; height: 25px; border-radius: 50%; border: none; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                <i class="fas fa-minus" style="font-size: 0.7rem;"></i>
                            </button>
                            <span class="quantity" style="font-weight: 700; min-width: 20px; text-align: center;">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}" style="width: 25px; height: 25px; border-radius: 50%; border: none; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                                <i class="fas fa-plus" style="font-size: 0.7rem;"></i>
                            </button>
                        </div>
                        
                        <div class="cart-item-total" style="font-weight: 800; font-size: 0.95rem;">
                            ${itemTotal.toFixed(2)} ر.س
                        </div>
                        
                        <button class="remove-item" data-id="${item.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 0.9rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.cartItemsContainer.innerHTML = html;
        this.addCartEventListeners();
    }
    
    // إضافة مستمعي الأحداث لعناصر السلة
    addCartEventListeners() {
        // أزرار زيادة الكمية
        this.cartItemsContainer.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.updateCartItemQuantity(id, 1);
            });
        });
        
        // أزرار تقليل الكمية
        this.cartItemsContainer.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.updateCartItemQuantity(id, -1);
            });
        });
        
        // أزرار إزالة العنصر
        this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.removeFromCart(id);
            });
        });
    }
    
    // تحديث كمية المنتج
    updateCartItemQuantity(productId, change) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += change;
            
            if (this.cart[itemIndex].quantity <= 0) {
                this.cart.splice(itemIndex, 1);
                window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من السلة');
            }
            
            this.saveCart();
            this.updateCartUI();
            this.updateProductUI(productId);
        }
    }
    
    // إزالة منتج من السلة
    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length < initialLength) {
            this.saveCart();
            this.updateCartUI();
            this.updateProductUI(productId);
            window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من السلة');
        }
    }
    
    // تحديث واجهة المنتج في قائمة المنتجات
    updateProductUI(productId) {
        const cartItem = this.cart.find(item => item.id === productId);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        // تحديث كمية المنتج في واجهة المنتجات
        const quantityElements = document.querySelectorAll(`.product-quantity[data-id="${productId}"]`);
        quantityElements.forEach(el => {
            el.textContent = quantity;
        });
        
        // تحديث زر الإضافة/الإزالة
        const addButtons = document.querySelectorAll(`.add-to-cart[data-id="${productId}"]`);
        addButtons.forEach(addButton => {
            if (quantity > 0) {
                addButton.classList.add('added');
                addButton.innerHTML = '<i class="fas fa-check"></i> مضاف';
            } else {
                addButton.classList.remove('added');
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
            }
        });
    }
    
    // تحديث الإجماليات
    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (this.cartSubtotal) {
            this.cartSubtotal.textContent = subtotal.toFixed(2) + ' ر.س';
        }
        
        if (this.cartTotal) {
            // يمكن إضافة رسوم الشحن أو الخصومات هنا
            const total = subtotal; // حالياً بدون رسوم إضافية
            this.cartTotal.textContent = total.toFixed(2) + ' ر.س';
        }
    }
    
    // تحديث عداد السلة
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // تحديث العداد في الهيدر
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
        }
        
        // تحديث العداد في السايدبار
        if (this.sidebarCartCount) {
            this.sidebarCartCount.textContent = totalItems;
        }
    }
    
    // تحديث زر الدفع
    updateCheckoutButton() {
        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = this.cart.length === 0;
        }
    }
    
    // حفظ السلة في localStorage
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
        }
    }
    
    // تأثير النبض لأيقونة السلة
    pulseCartIcon() {
        const cartIcon = document.getElementById('cart-btn');
        if (cartIcon) {
            cartIcon.classList.add('pulse');
            setTimeout(() => {
                cartIcon.classList.remove('pulse');
            }, 1000);
        }
    }
    
    // الحصول على منتج من السلة
    getCartItem(productId) {
        return this.cart.find(item => item.id === productId) || null;
    }
    
    // إفراغ السلة
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }
    
    // الحصول على الإجمالي
    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // الحصول على عدد المنتجات
    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // الحصول على جميع المنتجات
    getAllItems() {
        return [...this.cart];
    }
}

// تهيئة مدير السلة
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});
