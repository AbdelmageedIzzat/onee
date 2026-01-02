// إدارة سلة المشتريات - نسخة محسنة ومضبوطة

class CartManager {
    constructor() {
        console.log('🛒 CartManager: بدء التهيئة...');
        this.cart = this.loadCart();
        this.initDOMElements();
        this.init();
    }
    
    // تحميل السلة من localStorage
    loadCart() {
        try {
            const cartData = localStorage.getItem('cart');
            if (cartData) {
                const cart = JSON.parse(cartData);
                console.log('🛒 CartManager: تم تحميل السلة:', cart.length, 'منتج');
                return cart;
            }
        } catch (error) {
            console.error('❌ CartManager: خطأ في تحميل السلة:', error);
        }
        console.log('🛒 CartManager: السلة فارغة، سيتم إنشاء سلة جديدة');
        return [];
    }
    
    // تهيئة عناصر DOM
    initDOMElements() {
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        
        console.log('🛒 CartManager: عناصر DOM:', {
            cartItemsContainer: !!this.cartItemsContainer,
            cartSubtotal: !!this.cartSubtotal,
            cartTotal: !!this.cartTotal,
            cartCount: !!this.cartCount,
            checkoutBtn: !!this.checkoutBtn
        });
    }
    
    init() {
        console.log('🛒 CartManager: بدء التشغيل...');
        this.updateCartUI();
        this.setupEventListeners();
        console.log('✅ CartManager: تم التهيئة بنجاح');
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        console.log('🛒 CartManager: إعداد مستمعي الأحداث...');
        
        // إضافة حدث يدوي لفتح السلة
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                console.log('🛒 CartManager: تم النقر على زر السلة');
                if (window.uiManager) {
                    window.uiManager.openCartSidebar();
                } else {
                    this.openCartSidebar();
                }
            });
        }
        
        // تحديث السلة عند إضافة منتج من أي مكان
        document.addEventListener('productAddedToCart', (event) => {
            if (event.detail && event.detail.productId) {
                this.addToCart(event.detail.productId);
            }
        });
        
        console.log('✅ CartManager: تم إعداد مستمعي الأحداث');
    }
    
    // ==================== إضافة منتج إلى السلة ====================
    addToCart(productId, category = null) {
        console.log('🛒 CartManager: محاولة إضافة منتج:', productId);
        
        // البحث عن المنتج
        const product = this.findProductById(productId, category);
        if (!product) {
            console.error('❌ CartManager: المنتج غير موجود:', productId);
            this.showError('المنتج غير موجود', 'error');
            return false;
        }
        
        console.log('✅ CartManager: تم العثور على المنتج:', product.name);
        
        // التحقق من المنتج في السلة
        const existingItemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
            // زيادة الكمية إذا المنتج موجود
            this.cart[existingItemIndex].quantity += 1;
            console.log(`📈 CartManager: زيادة كمية المنتج "${product.name}" إلى ${this.cart[existingItemIndex].quantity}`);
        } else {
            // إضافة منتج جديد
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                category: product.category || category,
                image: product.image || '📦',
                description: product.description || ''
            });
            console.log(`➕ CartManager: إضافة منتج جديد "${product.name}"`);
        }
        
        // حفظ وتحديث
        this.saveCart();
        this.updateCartUI();
        this.updateProductUI(productId);
        
        // إظهار إشعار النجاح
        this.showSuccess('تمت الإضافة', `تم إضافة ${product.name} إلى السلة`);
        
        // تأثير النبض على أيقونة السلة
        this.pulseCartIcon();
        
        return true;
    }
    
    // البحث عن المنتج بالمعرف
    findProductById(productId, category = null) {
        console.log('🔍 CartManager: البحث عن المنتج:', productId);
        
        // إذا كان هناك category محددة، ابحث فيها أولاً
        if (category && window.productsManager?.products?.[category]) {
            const product = window.productsManager.products[category].find(p => p.id === productId);
            if (product) {
                product.category = category;
                return product;
            }
        }
        
        // البحث في جميع الفئات
        if (window.productsManager?.products) {
            for (const [cat, products] of Object.entries(window.productsManager.products)) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    product.category = cat;
                    return product;
                }
            }
        }
        
        // البحث في البيانات المحلية (للطوارئ)
        const fallbackProducts = [
            { id: 'offer1', name: 'عرض خاص على ساعات اليد', price: 250, image: '⌚', category: 'offers' },
            { id: 'offer2', name: 'مجموعة مستحضرات تجميل', price: 180, image: '💄', category: 'offers' },
            { id: 'acc1', name: 'ساعة يد فاخرة', price: 350, image: '⌚', category: 'accessories' },
            { id: 'cos1', name: 'أحمر شفاه مات', price: 75, image: '💄', category: 'cosmetics' },
            { id: 'clo1', name: 'فستان سهرة', price: 450, image: '👗', category: 'clothing' },
            { id: 'elec1', name: 'سماعات لاسلكية', price: 320, image: '🎧', category: 'electronics' },
            { id: 'home1', name: 'سجادة صوف', price: 420, image: '🧶', category: 'home' }
        ];
        
        const fallbackProduct = fallbackProducts.find(p => p.id === productId);
        if (fallbackProduct) {
            console.log('⚠️ CartManager: تم العثور على المنتج في البيانات الاحتياطية');
            return fallbackProduct;
        }
        
        return null;
    }
    
    // ==================== تحديث واجهة السلة ====================
    updateCartUI() {
        console.log('🔄 CartManager: تحديث واجهة السلة...');
        this.renderCart();
        this.updateCartTotals();
        this.updateCartCount();
        this.updateCheckoutButton();
        console.log('✅ CartManager: تم تحديث واجهة السلة');
    }
    
    // عرض محتويات السلة
    renderCart() {
        if (!this.cartItemsContainer) {
            console.error('❌ CartManager: عنصر cart-items غير موجود');
            return;
        }
        
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = this.getEmptyCartHTML();
            console.log('🛒 CartManager: السلة فارغة - عرض حالة فارغة');
            return;
        }
        
        let html = '';
        console.log(`🛒 CartManager: عرض ${this.cart.length} منتج في السلة`);
        
        this.cart.forEach(item => {
            const categoryName = this.getCategoryName(item.category);
            const itemTotal = item.price * item.quantity;
            
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        ${item.image}
                    </div>
                    <div class="cart-item-info">
                        <h4 class="cart-item-name">${item.name}</h4>
                        <div class="cart-item-category">
                            <i class="fas fa-tag"></i>
                            ${categoryName}
                        </div>
                        <div class="cart-item-price">${item.price} ريال للواحد</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}" title="تقليل الكمية">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}" title="زيادة الكمية">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div class="cart-item-total">${itemTotal.toFixed(2)} ريال</div>
                        <button class="remove-item" data-id="${item.id}" title="إزالة المنتج">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.cartItemsContainer.innerHTML = html;
        this.addCartEventListeners();
        console.log('✅ CartManager: تم عرض محتويات السلة');
    }
    
    // HTML للسلة الفارغة
    getEmptyCartHTML() {
        return `
            <div class="empty-state">
                <div style="font-size: 4rem; color: var(--gray-dark); margin-bottom: 20px;">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <h3 style="color: var(--dark); margin-bottom: 10px;">سلة المشتريات فارغة</h3>
                <p style="color: var(--text-light); margin-bottom: 25px;">لم تقم بإضافة أي منتجات بعد. ابدأ بالتسوق الآن!</p>
                <button class="continue-shopping-btn" onclick="window.productsManager?.switchCategory('offers')">
                    <i class="fas fa-shopping-cart"></i>
                    ابدأ التسوق
                </button>
            </div>
        `;
    }
    
    // إضافة مستمعي الأحداث للعناصر في السلة
    addCartEventListeners() {
        if (!this.cartItemsContainer) return;
        
        // أزرار الزيادة
        this.cartItemsContainer.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                console.log(`➕ CartManager: زيادة كمية المنتج ${id}`);
                this.updateCartItemQuantity(id, 1);
            });
        });
        
        // أزرار النقصان
        this.cartItemsContainer.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                console.log(`➖ CartManager: تقليل كمية المنتج ${id}`);
                this.updateCartItemQuantity(id, -1);
            });
        });
        
        // أزرار الإزالة
        this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                console.log(`🗑️ CartManager: إزالة المنتج ${id}`);
                this.removeFromCart(id);
            });
        });
        
        console.log('✅ CartManager: تم إضافة مستمعي الأحداث للعناصر');
    }
    
    // تحديث كمية المنتج
    updateCartItemQuantity(productId, change) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const oldQuantity = this.cart[itemIndex].quantity;
            this.cart[itemIndex].quantity += change;
            
            if (this.cart[itemIndex].quantity <= 0) {
                this.cart.splice(itemIndex, 1);
                this.showSuccess('تمت الإزالة', 'تمت إزالة المنتج من السلة');
                console.log(`🗑️ CartManager: المنتج ${productId} تمت إزالته`);
            } else {
                console.log(`🔄 CartManager: تحديث كمية المنتج ${productId} من ${oldQuantity} إلى ${this.cart[itemIndex].quantity}`);
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
            this.showSuccess('تمت الإزالة', 'تمت إزالة المنتج من السلة');
            console.log(`✅ CartManager: تم إزالة المنتج ${productId}`);
        }
    }
    
    // تحديث واجهة المنتج على الصفحة
    updateProductUI(productId) {
        const cartItem = this.cart.find(item => item.id === productId);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        // تحديث الكمية على بطاقة المنتج
        const quantityElement = document.getElementById(`quantity-${productId}`);
        if (quantityElement) {
            quantityElement.textContent = quantity;
        }
        
        // تحديث زر الإضافة
        const addButtons = document.querySelectorAll(`.add-to-cart-btn[data-id="${productId}"]`);
        addButtons.forEach(addButton => {
            if (quantity > 0) {
                addButton.classList.add('added');
                addButton.innerHTML = '<i class="fas fa-check"></i> مضاف';
                addButton.disabled = false;
                
                // إظهار عنصر التحكم في الكمية
                const quantityControl = addButton.closest('.product-actions')?.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'flex';
                }
            } else {
                addButton.classList.remove('added');
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
                addButton.disabled = false;
                
                // إخفاء عنصر التحكم في الكمية
                const quantityControl = addButton.closest('.product-actions')?.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            }
        });
    }
    
    // تحديث الإجماليات
    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (this.cartSubtotal) {
            this.cartSubtotal.textContent = subtotal.toFixed(2) + ' ريال';
        }
        
        if (this.cartTotal) {
            this.cartTotal.textContent = subtotal.toFixed(2) + ' ريال';
        }
        
        console.log(`💰 CartManager: المجموع: ${subtotal.toFixed(2)} ريال`);
    }
    
    // تحديث العداد
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
            if (totalItems > 0) {
                this.cartCount.style.display = 'flex';
            } else {
                this.cartCount.style.display = 'none';
            }
        }
        
        console.log(`🛒 CartManager: عدد المنتجات في السلة: ${totalItems}`);
    }
    
    // تحديث زر الدفع
    updateCheckoutButton() {
        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = this.cart.length === 0;
            console.log(`✅ CartManager: زر الدفع ${this.cart.length === 0 ? 'معطل' : 'مفعل'}`);
        }
    }
    
    // حفظ السلة
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            console.log('💾 CartManager: تم حفظ السلة في localStorage');
            return true;
        } catch (error) {
            console.error('❌ CartManager: خطأ في حفظ السلة:', error);
            this.showError('خطأ في حفظ السلة', 'error');
            return false;
        }
    }
    
    // ==================== دوال مساعدة ====================
    getCategoryName(category) {
        const categories = {
            'offers': 'العروض والخصومات',
            'accessories': 'الإكسسوارات',
            'cosmetics': 'مستحضرات التجميل',
            'clothing': 'الملابس',
            'electronics': 'الإلكترونيات',
            'home': 'أدوات منزلية'
        };
        return categories[category] || category || 'غير محدد';
    }
    
    // عرض رسائل النجاح
    showSuccess(title, message) {
        if (window.uiManager) {
            window.uiManager.showNotification(title, message, 'success');
        } else {
            console.log(`✅ ${title}: ${message}`);
            alert(`${title}: ${message}`);
        }
    }
    
    // عرض رسائل الخطأ
    showError(message, type = 'error') {
        if (window.uiManager) {
            window.uiManager.showNotification('خطأ', message, type);
        } else {
            console.error(`❌ ${message}`);
            alert(`خطأ: ${message}`);
        }
    }
    
    // تأثير النبض على أيقونة السلة
    pulseCartIcon() {
        const cartIcon = document.getElementById('cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('cart-pulse');
            setTimeout(() => {
                cartIcon.classList.remove('cart-pulse');
            }, 1000);
        }
    }
    
    // فتح السلة
    openCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('active');
            console.log('📂 CartManager: تم فتح السلة');
        }
    }
    
    // ==================== دوال عامة للوصول ====================
    // الحصول على منتج من السلة
    getCartItem(productId) {
        return this.cart.find(item => item.id === productId) || null;
    }
    
    // إفراغ السلة
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.showSuccess('تم التخليص', 'تم إفراغ السلة بنجاح');
        console.log('🔄 CartManager: تم إفراغ السلة');
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
    
    // التحقق من وجود منتج في السلة
    hasProduct(productId) {
        return this.cart.some(item => item.id === productId);
    }
}

// ==================== تهيئة مدير السلة ====================
console.log('🛒 بدء تحميل CartManager...');

// الانتظار حتى تحميل DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM محمل، تهيئة CartManager...');
        window.cartManager = new CartManager();
    });
} else {
    console.log('📄 DOM محمل مسبقاً، تهيئة CartManager...');
    window.cartManager = new CartManager();
}

// جعل الدالة متاحة للاستخدام من الأزرار
window.addToCart = function(productId, category) {
    console.log(`📞 استدعاء addToCart من global: ${productId}`);
    if (window.cartManager) {
        return window.cartManager.addToCart(productId, category);
    } else {
        console.error('❌ cartManager غير موجود');
        return false;
    }
};

console.log('✅ cart.js محمل وجاهز');
