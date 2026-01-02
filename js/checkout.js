// ============================
// 💳 نظام الدفع الذكي
// ============================

class CheckoutManager {
    constructor() {
        console.log('💳 بدء تهيئة نظام الدفع...');
        this.modal = document.getElementById('checkout-modal');
        this.checkoutForm = document.getElementById('checkout-form');
        this.checkoutItems = document.getElementById('checkout-items');
        this.checkoutSubtotal = document.getElementById('checkout-subtotal');
        this.checkoutDiscount = document.getElementById('checkout-discount');
        this.checkoutTotal = document.getElementById('checkout-total');
        this.submitOrderBtn = document.getElementById('submit-order');
        this.init();
    }
    
    init() {
        this.initPaymentMethods();
        this.setupEventListeners();
        console.log('✅ نظام الدفع جاهز');
    }
    
    // تهيئة طرق الدفع
    initPaymentMethods() {
        const container = document.getElementById('payment-methods');
        if (!container) return;
        
        const methods = [
            {
                id: 'cash',
                name: 'الدفع عند الاستلام',
                icon: 'fas fa-money-bill-wave',
                description: 'ادفع نقداً عند استلام الطلب',
                recommended: true
            },
            {
                id: 'bank',
                name: 'تحويل بنكي',
                icon: 'fas fa-university',
                description: 'التحويل عبر تطبيق البنك'
            },
            {
                id: 'mada',
                name: 'بطاقة مدى',
                icon: 'fas fa-credit-card',
                description: 'الدفع ببطاقة مدى'
            },
            {
                id: 'fawry',
                name: 'فوري',
                icon: 'fas fa-bolt',
                description: 'الدفع عبر تطبيق فوري'
            }
        ];
        
        let html = '';
        methods.forEach(method => {
            html += `
                <div class="payment-method">
                    <input type="radio" id="payment-${method.id}" name="payment" 
                           value="${method.id}" ${method.recommended ? 'checked' : ''}>
                    <label for="payment-${method.id}" class="payment-label">
                        <div class="payment-icon">
                            <i class="${method.icon}"></i>
                        </div>
                        <div class="payment-info">
                            <div class="payment-name">${method.name}</div>
                            <div class="payment-desc">${method.description}</div>
                        </div>
                        ${method.recommended ? '<div class="payment-badge">مفضل</div>' : ''}
                    </label>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // إغلاق نافذة الدفع
        const closeBtn = document.getElementById('close-checkout');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        // إرسال النموذج
        if (this.checkoutForm) {
            this.checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processOrder();
            });
        }
        
        // إغلاق عند النقر خارج النافذة
        document.addEventListener('click', (e) => {
            if (this.modal?.classList.contains('active') && 
                !this.modal.contains(e.target) && 
                !document.getElementById('checkout-btn')?.contains(e.target)) {
                this.closeModal();
            }
        });
        
        // تحديث عدادات الأحرف
        const addressField = document.getElementById('delivery-address');
        const notesField = document.getElementById('order-notes');
        
        if (addressField) {
            addressField.addEventListener('input', () => {
                this.updateCharCounter(addressField, 'address-counter');
            });
        }
        
        if (notesField) {
            notesField.addEventListener('input', () => {
                this.updateCharCounter(notesField, 'notes-counter');
            });
        }
    }
    
    // فتح نافذة الدفع
    openCheckoutModal() {
        if (!window.cartManager || window.cartManager.cart.length === 0) {
            this.showNotification('السلة فارغة', 'أضف منتجات إلى السلة أولاً', 'error');
            return;
        }
        
        this.updateOrderSummary();
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // إضافة تأثير
        setTimeout(() => {
            this.modal.classList.add('visible');
        }, 10);
        
        console.log('📄 فتح نافذة الدفع');
    }
    
    // إغلاق نافذة الدفع
    closeModal() {
        this.modal.classList.remove('visible');
        setTimeout(() => {
            this.modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }, 300);
    }
    
    // تحديث ملخص الطلب
    updateOrderSummary() {
        if (!this.checkoutItems || !window.cartManager) return;
        
        const cartDetails = window.cartManager.getCartDetails();
        
        // عرض المنتجات
        let itemsHTML = '';
        cartDetails.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            itemsHTML += `
                <div class="checkout-item">
                    <div class="checkout-item-info">
                        <span class="checkout-item-name">${item.name} × ${item.quantity}</span>
                        <span class="checkout-item-price">${itemTotal.toFixed(2)} ريال</span>
                    </div>
                </div>
            `;
        });
        
        this.checkoutItems.innerHTML = itemsHTML;
        
        // تحديث الأسعار
        if (this.checkoutSubtotal) {
            this.checkoutSubtotal.textContent = `${cartDetails.subtotal.toFixed(2)} ريال`;
        }
        
        if (this.checkoutTotal) {
            this.checkoutTotal.textContent = `${cartDetails.total.toFixed(2)} ريال`;
        }
        
        // عرض الخصم إذا وجد
        const discountRow = document.querySelector('.discount-row');
        if (discountRow && this.checkoutDiscount) {
            if (cartDetails.discount > 0) {
                discountRow.style.display = 'flex';
                this.checkoutDiscount.textContent = `-${cartDetails.discount.toFixed(2)} ريال`;
            } else {
                discountRow.style.display = 'none';
            }
        }
    }
    
    // معالجة الطلب
    async processOrder() {
        if (!this.validateForm()) return;
        
        const submitBtn = this.submitOrderBtn;
        const originalText = submitBtn.innerHTML;
        
        // تعطيل الزر أثناء المعالجة
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري معالجة الطلب...';
        
        try {
            // جمع بيانات الطلب
            const orderData = this.collectOrderData();
            
            // التحقق من صحة البيانات
            if (!this.validateOrderData(orderData)) {
                throw new Error('بيانات الطلب غير صالحة');
            }
            
            // حفظ الطلب محلياً
            this.saveOrderLocally(orderData);
            
            // عرض تأكيد الطلب النهائي
            this.showFinalConfirmation(orderData);
            
            // إغلاق نافذة الدفع
            this.closeModal();
            
        } catch (error) {
            console.error('❌ خطأ في معالجة الطلب:', error);
            this.showNotification('خطأ', error.message || 'حدث خطأ أثناء معالجة الطلب', 'error');
        } finally {
            // إعادة تمكين الزر
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    // جمع بيانات الطلب
    collectOrderData() {
        const cartDetails = window.cartManager.getCartDetails();
        
        return {
            // معلومات العميل
            customerName: document.getElementById('customer-name')?.value.trim() || '',
            customerPhone: document.getElementById('customer-phone')?.value.trim() || '',
            
            // العنوان
            address: document.getElementById('delivery-address')?.value.trim() || '',
            
            // طريقة الدفع
            paymentMethod: document.querySelector('input[name="payment"]:checked')?.value || 'cash',
            
            // الملاحظات
            notes: document.getElementById('order-notes')?.value.trim() || '',
            
            // المنتجات
            items: cartDetails.items,
            
            // الأسعار
            subtotal: cartDetails.subtotal,
            discount: cartDetails.discount,
            total: cartDetails.total,
            discountCode: cartDetails.discountCode,
            
            // معلومات إضافية
            orderId: this.generateOrderId(),
            date: new Date().toLocaleString('ar-SA'),
            timestamp: new Date().getTime()
        };
    }
    
    // التحقق من صحة النموذج
    validateForm() {
        const nameField = document.getElementById('customer-name');
        const phoneField = document.getElementById('customer-phone');
        const addressField = document.getElementById('delivery-address');
        const termsCheckbox = document.getElementById('agree-terms');
        
        let isValid = true;
        let errorMessage = '';
        
        // التحقق من الاسم
        if (!nameField?.value.trim()) {
            errorMessage = 'الرجاء إدخال الاسم الكامل';
            nameField?.focus();
            isValid = false;
        }
        
        // التحقق من الهاتف
        else if (!phoneField?.value.trim()) {
            errorMessage = 'الرجاء إدخال رقم الهاتف';
            phoneField?.focus();
            isValid = false;
        } else if (!/^05\d{8}$/.test(phoneField.value.trim())) {
            errorMessage = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05 ويتكون من 10 أرقام)';
            phoneField?.focus();
            isValid = false;
        }
        
        // التحقق من العنوان
        else if (!addressField?.value.trim()) {
            errorMessage = 'الرجاء إدخال عنوان التوصيل';
            addressField?.focus();
            isValid = false;
        } else if (addressField.value.trim().length < 10) {
            errorMessage = 'العنوان قصير جداً (10 أحرف على الأقل)';
            addressField?.focus();
            isValid = false;
        }
        
        // التحقق من شروط الخدمة
        else if (!termsCheckbox?.checked) {
            errorMessage = 'الرجاء الموافقة على شروط الخدمة';
            termsCheckbox?.focus();
            isValid = false;
        }
        
        if (!isValid) {
            this.showNotification('خطأ في البيانات', errorMessage, 'error');
        }
        
        return isValid;
    }
    
    // التحقق من صحة بيانات الطلب
    validateOrderData(orderData) {
        if (!orderData.customerName || orderData.customerName.length < 2) {
            throw new Error('الاسم غير صالح');
        }
        
        if (!orderData.customerPhone || !/^05\d{8}$/.test(orderData.customerPhone)) {
            throw new Error('رقم الهاتف غير صالح');
        }
        
        if (!orderData.address || orderData.address.length < 10) {
            throw new Error('العنوان غير صالح');
        }
        
        if (!orderData.items || orderData.items.length === 0) {
            throw new Error('السلة فارغة');
        }
        
        if (orderData.total <= 0) {
            throw new Error('المبلغ غير صالح');
        }
        
        return true;
    }
    
    // حفظ الطلب محلياً
    saveOrderLocally(orderData) {
        try {
            // الحصول على سجل الطلبات القديم
            const orders = JSON.parse(localStorage.getItem('store_orders') || '[]');
            
            // إضافة الطلب الجديد
            orders.push(orderData);
            
            // حفظ آخر 50 طلب فقط
            if (orders.length > 50) {
                orders.shift();
            }
            
            // حفظ في localStorage
            localStorage.setItem('store_orders', JSON.stringify(orders));
            localStorage.setItem('last_order', JSON.stringify(orderData));
            
            console.log('💾 تم حفظ الطلب محلياً:', orderData.orderId);
            return true;
        } catch (error) {
            console.error('❌ خطأ في حفظ الطلب:', error);
            return false;
        }
    }
    
    // عرض تأكيد الطلب النهائي
    showFinalConfirmation(orderData) {
        // إنشاء رسالة الطلب
        const message = this.createOrderMessage(orderData);
        
        // إنشاء نافذة التأكيد
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'final-confirmation-modal';
        confirmationModal.innerHTML = `
            <div class="final-confirmation-content">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>تأكيد الطلب النهائي</h3>
                </div>
                
                <div class="confirmation-body">
                    <div class="order-details">
                        <div class="order-detail">
                            <span>رقم الطلب:</span>
                            <strong>${orderData.orderId}</strong>
                        </div>
                        <div class="order-detail">
                            <span>الاسم:</span>
                            <span>${orderData.customerName}</span>
                        </div>
                        <div class="order-detail">
                            <span>الهاتف:</span>
                            <span>${orderData.customerPhone}</span>
                        </div>
                        <div class="order-detail">
                            <span>العنوان:</span>
                            <span>${orderData.address}</span>
                        </div>
                        <div class="order-detail">
                            <span>طريقة الدفع:</span>
                            <span>${this.getPaymentMethodName(orderData.paymentMethod)}</span>
                        </div>
                        <div class="order-detail">
                            <span>المجموع:</span>
                            <strong>${orderData.total.toFixed(2)} ريال</strong>
                        </div>
                    </div>
                    
                    <div class="whatsapp-notice">
                        <i class="fab fa-whatsapp"></i>
                        <p>سيتم إرسال الطلب عبر الواتساب. تأكد من صحة المعلومات قبل الإرسال.</p>
                    </div>
                    
                    <div class="warning-note">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>يرجى حفظ رقم الطلب: <strong>${orderData.orderId}</strong> للمراجعة</p>
                    </div>
                </div>
                
                <div class="confirmation-footer">
                    <button class="btn-success send-whatsapp" onclick="checkoutManager.sendToWhatsApp('${this.escapeText(message)}')">
                        <i class="fab fa-whatsapp"></i>
                        إرسال عبر الواتساب
                    </button>
                    <button class="btn-secondary edit-order" onclick="checkoutManager.editOrder()">
                        تعديل الطلب
                    </button>
                </div>
            </div>
        `;
        
        // إضافة النافذة إلى الصفحة
        document.body.appendChild(confirmationModal);
        
        // إظهار النافذة
        setTimeout(() => {
            confirmationModal.classList.add('active');
        }, 50);
    }
    
    // إنشاء رسالة الطلب للواتساب
    createOrderMessage(orderData) {
        let message = `🛒 *طلب جديد - Global Store* 🛒\n`;
        message += `══════════════════════\n\n`;
        
        message += `📋 *معلومات الطلب:*\n`;
        message += `🔢 رقم الطلب: ${orderData.orderId}\n`;
        message += `👤 الاسم: ${orderData.customerName}\n`;
        message += `📞 الهاتف: ${orderData.customerPhone}\n`;
        message += `📍 العنوان: ${orderData.address}\n`;
        message += `💳 الدفع: ${this.getPaymentMethodName(orderData.paymentMethod)}\n`;
        message += `📅 التاريخ: ${orderData.date}\n\n`;
        
        message += `🛍️ *المنتجات:*\n`;
        message += `══════════════════════\n`;
        
        orderData.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            message += `\n${index + 1}. ${item.name}\n`;
            message += `   الكمية: ${item.quantity}\n`;
            message += `   السعر: ${item.price} × ${item.quantity} = ${itemTotal} ريال\n`;
        });
        
        message += `\n══════════════════════\n`;
        message += `💰 *الإجماليات:*\n`;
        message += `══════════════════════\n`;
        message += `المجموع: ${orderData.subtotal.toFixed(2)} ريال\n`;
        
        if (orderData.discount > 0) {
            message += `الخصم: -${orderData.discount.toFixed(2)} ريال\n`;
            message += `كود الخصم: ${orderData.discountCode}\n`;
        }
        
        message += `*المجموع النهائي: ${orderData.total.toFixed(2)} ريال*\n\n`;
        
        if (orderData.notes) {
            message += `📝 *ملاحظات العميل:*\n`;
            message += `${orderData.notes}\n\n`;
        }
        
        message += `══════════════════════\n`;
        message += `شكراً لطلبكم من Global Store! 🚀\n`;
        message += `سيتم التواصل معكم قريباً لتأكيد الطلب.\n`;
        
        return message;
    }
    
    // إرسال إلى واتساب
    sendToWhatsApp(message) {
        try {
            const decodedMessage = message.replace(/\\'/g, "'").replace(/\\n/g, '\n');
            const whatsappNumber = "+249112703344";
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            const encodedMessage = encodeURIComponent(decodedMessage);
            const whatsappURL = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
            
            // إغلاق نافذة التأكيد
            const confirmationModal = document.querySelector('.final-confirmation-modal');
            if (confirmationModal) {
                confirmationModal.classList.remove('active');
                setTimeout(() => confirmationModal.remove(), 300);
            }
            
            // إفراغ السلة
            window.cartManager?.clearCart();
            
            // إظهار رسالة النجاح
            this.showNotification('نجاح', 'تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً.', 'success');
            
            // فتح واتساب
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 500);
            
        } catch (error) {
            console.error('❌ خطأ في إرسال واتساب:', error);
            this.showNotification('خطأ', 'حدث خطأ أثناء الإرسال', 'error');
        }
    }
    
    // تعديل الطلب
    editOrder() {
        const confirmationModal = document.querySelector('.final-confirmation-modal');
        if (confirmationModal) {
            confirmationModal.classList.remove('active');
            setTimeout(() => {
                confirmationModal.remove();
                this.openCheckoutModal();
            }, 300);
        }
    }
    
    // ==================== دوال مساعدة ====================
    
    generateOrderId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `ORD-${timestamp}-${random}`;
    }
    
    getPaymentMethodName(methodId) {
        const methods = {
            'cash': 'الدفع عند الاستلام',
            'bank': 'تحويل بنكي',
            'mada': 'بطاقة مدى',
            'fawry': 'فوري'
        };
        return methods[methodId] || 'غير محدد';
    }
    
    updateCharCounter(field, counterId) {
        const counter = document.getElementById(counterId);
        if (counter) {
            const length = field.value.length;
            const span = counter.querySelector('span');
            if (span) span.textContent = length;
            
            // تغيير اللون عند الاقتراب من الحد
            if (length > 450) {
                counter.style.color = '#EF4444';
            } else if (length > 400) {
                counter.style.color = '#F59E0B';
            } else {
                counter.style.color = '#718096';
            }
        }
    }
    
    escapeText(text) {
        return text.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    }
    
    showNotification(title, message, type = 'info') {
        if (window.uiManager?.showNotification) {
            window.uiManager.showNotification(title, message, type);
        } else {
            alert(`${title}: ${message}`);
        }
    }
}

// تهيئة نظام الدفع
window.checkoutManager = new CheckoutManager();

// دالة مساعدة للتحقق من النظام
window.debugCheckout = function() {
    console.log('=== تصحيح نظام الدفع ===');
    console.log('نافذة الدفع:', document.getElementById('checkout-modal'));
    console.log('نموذج الدفع:', document.getElementById('checkout-form'));
    console.log('مدير الدفع:', window.checkoutManager);
};
