// js/checkout.js - نظام الدفع والتوصيل المتقدم

console.log('💳 checkout.js - Loading enhanced checkout system...');

class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.orderData = {
            customerInfo: {},
            shippingInfo: {},
            paymentInfo: {},
            orderSummary: {}
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 CheckoutManager initialization...');
        this.createCheckoutModal();
        this.setupEventListeners();
    }
    
    createCheckoutModal() {
        // إنشاء مودال الدفع إذا لم يكن موجوداً
        if (!document.getElementById('checkout-modal')) {
            const modal = document.createElement('div');
            modal.id = 'checkout-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-overlay" onclick="window.checkoutManager.closeCheckoutModal()"></div>
                <div class="modal-container checkout-container">
                    <div class="checkout-header">
                        <h3><i class="fas fa-shopping-bag"></i> إتمام الشراء</h3>
                        <button class="modal-close" onclick="window.checkoutManager.closeCheckoutModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="checkout-steps" id="checkout-steps">
                        <!-- سيتم إنشاء الخطوات ديناميكياً -->
                    </div>
                    
                    <div class="checkout-content" id="checkout-content">
                        <!-- سيتم تحميل محتوى كل خطوة هنا -->
                    </div>
                    
                    <div class="checkout-footer" id="checkout-footer">
                        <!-- أزرار التنقل بين الخطوات -->
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            this.createCheckoutSteps();
        }
    }
    
    createCheckoutSteps() {
        const stepsContainer = document.getElementById('checkout-steps');
        if (!stepsContainer) return;
        
        const steps = [
            { number: 1, title: 'معلومات العميل', icon: 'fas fa-user' },
            { number: 2, title: 'عنوان التوصيل', icon: 'fas fa-map-marker-alt' },
            { number: 3, title: 'طريقة الدفع', icon: 'fas fa-credit-card' }
        ];
        
        stepsContainer.innerHTML = steps.map(step => `
            <div class="checkout-step ${step.number === 1 ? 'active' : ''}" data-step="${step.number}">
                <div class="step-number">${step.number}</div>
                <div class="step-info">
                    <div class="step-title">${step.title}</div>
                </div>
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // استمع لأحداث السلة
        document.addEventListener('cart-updated', () => {
            this.updateOrderSummary();
        });
    }
    
    openCheckoutModal() {
        const modal = document.getElementById('checkout-modal');
        if (!modal) return;
        
        // التحقق من أن السلة ليست فارغة
        if (window.cartManager && window.cartManager.isEmpty()) {
            window.uiManager?.showNotification('سلة فارغة', 'يرجى إضافة منتجات إلى السلة أولاً', 'warning');
            return;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // بدء من الخطوة الأولى
        this.goToStep(1);
    }
    
    closeCheckoutModal() {
        const modal = document.getElementById('checkout-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.resetCheckout();
        }
    }
    
    goToStep(stepNumber) {
        this.currentStep = stepNumber;
        
        // تحديث الخطوات النشطة
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active', 'completed');
            const stepNum = parseInt(step.dataset.step);
            
            if (stepNum < stepNumber) {
                step.classList.add('completed');
            } else if (stepNum === stepNumber) {
                step.classList.add('active');
            }
        });
        
        // تحميل محتوى الخطوة
        this.loadStepContent(stepNumber);
        
        // تحديث أزرار التنقل
        this.updateNavigationButtons();
    }
    
    loadStepContent(stepNumber) {
        const contentContainer = document.getElementById('checkout-content');
        if (!contentContainer) return;
        
        let content = '';
        
        switch(stepNumber) {
            case 1:
                content = this.createCustomerInfoStep();
                break;
            case 2:
                content = this.createShippingInfoStep();
                break;
            case 3:
                content = this.createPaymentStep();
                break;
        }
        
        contentContainer.innerHTML = content;
        
        // إضافة مستمعي الأحداث للمحتوى الجديد
        this.addStepEventListeners(stepNumber);
    }
    
    createCustomerInfoStep() {
        return `
            <div class="step-content step-1">
                <h4>معلومات الاتصال</h4>
                <p style="color: var(--text-light); margin-bottom: var(--space-xl);">يرجى إدخال معلوماتك للتواصل معك</p>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="customer-name">الاسم الكامل *</label>
                        <input type="text" id="customer-name" class="form-control" placeholder="أدخل اسمك الكامل" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-phone">رقم الهاتف *</label>
                        <input type="tel" id="customer-phone" class="form-control" placeholder="05XXXXXXXX" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-email">البريد الإلكتروني</label>
                        <input type="email" id="customer-email" class="form-control" placeholder="example@domain.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="customer-notes">ملاحظات إضافية (اختياري)</label>
                        <textarea id="customer-notes" class="form-control" rows="3" placeholder="ملاحظات خاصة بالطلب..."></textarea>
                    </div>
                </div>
            </div>
        `;
    }
    
    createShippingInfoStep() {
        return `
            <div class="step-content step-2">
                <h4>عنوان التوصيل</h4>
                <p style="color: var(--text-light); margin-bottom: var(--space-xl);">يرجى إدخال عنوان التوصيل بالتفصيل</p>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="shipping-region">المنطقة *</label>
                        <select id="shipping-region" class="form-control" required>
                            <option value="">اختر المنطقة</option>
                            <option value="riyadh">الرياض</option>
                            <option value="jeddah">جدة</option>
                            <option value="dammam">الدمام</option>
                            <option value="makkah">مكة المكرمة</option>
                            <option value="madina">المدينة المنورة</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="shipping-city">المدينة *</label>
                        <input type="text" id="shipping-city" class="form-control" placeholder="أدخل اسم المدينة" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="shipping-district">الحي *</label>
                        <input type="text" id="shipping-district" class="form-control" placeholder="أدخل اسم الحي" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="shipping-street">الشارع *</label>
                        <input type="text" id="shipping-street" class="form-control" placeholder="أدخل اسم الشارع" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="shipping-building">المبنى والرقم *</label>
                        <input type="text" id="shipping-building" class="form-control" placeholder="رقم المبنى والوحدة" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="shipping-zip">الرمز البريدي</label>
                        <input type="text" id="shipping-zip" class="form-control" placeholder="12345">
                    </div>
                </div>
                
                <div class="shipping-options" style="margin-top: var(--space-xl);">
                    <h5 style="margin-bottom: var(--space-lg);">خيارات التوصيل</h5>
                    
                    <div class="shipping-option">
                        <input type="radio" id="shipping-standard" name="shipping-method" value="standard" checked>
                        <label for="shipping-standard">
                            <div class="option-content">
                                <div class="option-title">توصيل عادي</div>
                                <div class="option-description">3-5 أيام عمل</div>
                                <div class="option-price">مجاني</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="shipping-option">
                        <input type="radio" id="shipping-express" name="shipping-method" value="express">
                        <label for="shipping-express">
                            <div class="option-content">
                                <div class="option-title">توصيل سريع</div>
                                <div class="option-description">24-48 ساعة</div>
                                <div class="option-price">25 ر.س</div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }
    
    createPaymentStep() {
        const orderSummary = this.getOrderSummary();
        
        return `
            <div class="step-content step-3">
                <h4>طريقة الدفع</h4>
                <p style="color: var(--text-light); margin-bottom: var(--space-xl);">اختر طريقة الدفع المناسبة لك</p>
                
                <div class="payment-methods-grid">
                    <div class="payment-method">
                        <input type="radio" id="payment-cod" name="payment-method" value="cod" checked>
                        <label for="payment-cod">
                            <div class="payment-icon">
                                <i class="fas fa-money-bill-wave"></i>
                            </div>
                            <div class="payment-info">
                                <div class="payment-name">الدفع عند الاستلام</div>
                                <div class="payment-description">ادفع عند استلام الطلب</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="payment-method">
                        <input type="radio" id="payment-mada" name="payment-method" value="mada">
                        <label for="payment-mada">
                            <div class="payment-icon">
                                <i class="fas fa-credit-card"></i>
                            </div>
                            <div class="payment-info">
                                <div class="payment-name">بطاقة مدى</div>
                                <div class="payment-description">دفع آمن عبر مدى</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="payment-method">
                        <input type="radio" id="payment-bank" name="payment-method" value="bank">
                        <label for="payment-bank">
                            <div class="payment-icon">
                                <i class="fas fa-university"></i>
                            </div>
                            <div class="payment-info">
                                <div class="payment-name">تحويل بنكي</div>
                                <div class="payment-description">تحويل إلى الحساب البنكي</div>
                            </div>
                        </label>
                    </div>
                    
                    <div class="payment-method">
                        <input type="radio" id="payment-apple" name="payment-method" value="apple">
                        <label for="payment-apple">
                            <div class="payment-icon">
                                <i class="fab fa-apple"></i>
                            </div>
                            <div class="payment-info">
                                <div class="payment-name">Apple Pay</div>
                                <div class="payment-description">دفع عبر Apple Pay</div>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="order-summary-final" style="margin-top: var(--space-xl);">
                    <h5 style="margin-bottom: var(--space-lg);">ملخص الطلب</h5>
                    
                    <div class="summary-items">
                        ${orderSummary.items.map(item => `
                            <div class="summary-item">
                                <div class="item-name">${item.name} × ${item.quantity}</div>
                                <div class="item-price">${item.total.toFixed(2)} ر.س</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="summary-totals">
                        <div class="total-row">
                            <span>المجموع الجزئي</span>
                            <span>${orderSummary.subtotal.toFixed(2)} ر.س</span>
                        </div>
                        
                        ${orderSummary.discount > 0 ? `
                            <div class="total-row discount">
                                <span>الخصم</span>
                                <span>-${orderSummary.discount.toFixed(2)} ر.س</span>
                            </div>
                        ` : ''}
                        
                        <div class="total-row">
                            <span>التوصيل</span>
                            <span>${orderSummary.shipping === 0 ? 'مجاني' : orderSummary.shipping.toFixed(2) + ' ر.س'}</span>
                        </div>
                        
                        <div class="total-row final-total">
                            <span>المجموع الكلي</span>
                            <span>${orderSummary.total.toFixed(2)} ر.س</span>
                        </div>
                    </div>
                </div>
                
                <div class="terms-agreement" style="margin-top: var(--space-xl);">
                    <input type="checkbox" id="agree-terms" required>
                    <label for="agree-terms">
                        أوافق على <a href="#" style="color: var(--primary);">الشروط والأحكام</a> 
                        و <a href="#" style="color: var(--primary);">سياسة الخصوصية</a>
                    </label>
                </div>
            </div>
        `;
    }
    
    addStepEventListeners(stepNumber) {
        switch(stepNumber) {
            case 1:
                this.addCustomerInfoListeners();
                break;
            case 2:
                this.addShippingInfoListeners();
                break;
            case 3:
                this.addPaymentListeners();
                break;
        }
    }
    
    addCustomerInfoListeners() {
        // التحقق من صحة البيانات أثناء الإدخال
        const inputs = ['customer-name', 'customer-phone', 'customer-email'];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('blur', () => {
                    this.validateCustomerInfo();
                });
            }
        });
    }
    
    addShippingInfoListeners() {
        // تحديث رسوم التوصيل عند تغيير الخيار
        document.querySelectorAll('input[name="shipping-method"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateShippingFee(e.target.value);
            });
        });
    }
    
    addPaymentListeners() {
        // التحقق من الموافقة على الشروط
        const agreeTerms = document.getElementById('agree-terms');
        if (agreeTerms) {
            agreeTerms.addEventListener('change', () => {
                this.updatePlaceOrderButton();
            });
        }
    }
    
    updateNavigationButtons() {
        const footer = document.getElementById('checkout-footer');
        if (!footer) return;
        
        let buttons = '';
        
        if (this.currentStep > 1) {
            buttons += `
                <button class="btn btn-outline" onclick="window.checkoutManager.goToStep(${this.currentStep - 1})">
                    <i class="fas fa-arrow-right"></i>
                    رجوع
                </button>
            `;
        }
        
        if (this.currentStep < this.totalSteps) {
            buttons += `
                <button class="btn btn-primary" onclick="window.checkoutManager.nextStep()">
                    متابعة
                    <i class="fas fa-arrow-left"></i>
                </button>
            `;
        } else {
            buttons += `
                <button class="btn btn-success" id="place-order-btn" onclick="window.checkoutManager.placeOrder()">
                    <i class="fas fa-check"></i>
                    تأكيد الطلب
                </button>
            `;
        }
        
        footer.innerHTML = buttons;
        this.updatePlaceOrderButton();
    }
    
    nextStep() {
        // التحقق من صحة البيانات في الخطوة الحالية
        if (!this.validateCurrentStep()) {
            return;
        }
        
        // حفظ بيانات الخطوة الحالية
        this.saveCurrentStepData();
        
        // الانتقال للخطوة التالية
        if (this.currentStep < this.totalSteps) {
            this.goToStep(this.currentStep + 1);
        }
    }
    
    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                return this.validateCustomerInfo();
            case 2:
                return this.validateShippingInfo();
            case 3:
                return this.validatePaymentInfo();
            default:
                return true;
        }
    }
    
    validateCustomerInfo() {
        const name = document.getElementById('customer-name');
        const phone = document.getElementById('customer-phone');
        
        let isValid = true;
        
        if (!name || !name.value.trim()) {
            this.showFieldError(name, 'الاسم مطلوب');
            isValid = false;
        } else {
            this.clearFieldError(name);
        }
        
        if (!phone || !this.isValidPhone(phone.value)) {
            this.showFieldError(phone, 'رقم هاتف صحيح مطلوب');
            isValid = false;
        } else {
            this.clearFieldError(phone);
        }
        
        return isValid;
    }
    
    validateShippingInfo() {
        const requiredFields = ['shipping-region', 'shipping-city', 'shipping-district', 'shipping-street', 'shipping-building'];
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field || !field.value.trim()) {
                this.showFieldError(field, 'هذا الحقل مطلوب');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });
        
        return isValid;
    }
    
    validatePaymentInfo() {
        const agreeTerms = document.getElementById('agree-terms');
        if (!agreeTerms || !agreeTerms.checked) {
            window.uiManager?.showNotification('تنبيه', 'يجب الموافقة على الشروط والأحكام', 'warning');
            return false;
        }
        
        return true;
    }
    
    saveCurrentStepData() {
        switch(this.currentStep) {
            case 1:
                this.saveCustomerInfo();
                break;
            case 2:
                this.saveShippingInfo();
                break;
            case 3:
                this.savePaymentInfo();
                break;
        }
    }
    
    saveCustomerInfo() {
        this.orderData.customerInfo = {
            name: document.getElementById('customer-name')?.value || '',
            phone: document.getElementById('customer-phone')?.value || '',
            email: document.getElementById('customer-email')?.value || '',
            notes: document.getElementById('customer-notes')?.value || ''
        };
    }
    
    saveShippingInfo() {
        const shippingMethod = document.querySelector('input[name="shipping-method"]:checked')?.value || 'standard';
        
        this.orderData.shippingInfo = {
            region: document.getElementById('shipping-region')?.value || '',
            city: document.getElementById('shipping-city')?.value || '',
            district: document.getElementById('shipping-district')?.value || '',
            street: document.getElementById('shipping-street')?.value || '',
            building: document.getElementById('shipping-building')?.value || '',
            zip: document.getElementById('shipping-zip')?.value || '',
            method: shippingMethod,
            fee: shippingMethod === 'express' ? 25 : 0
        };
    }
    
    savePaymentInfo() {
        this.orderData.paymentInfo = {
            method: document.querySelector('input[name="payment-method"]:checked')?.value || 'cod',
            status: 'pending'
        };
    }
    
    async placeOrder() {
        // التحقق النهائي
        if (!this.validateCurrentStep()) {
            return;
        }
        
        // حفظ بيانات الخطوة الأخيرة
        this.saveCurrentStepData();
        
        // الحصول على ملخص الطلب
        this.orderData.orderSummary = this.getOrderSummary();
        
        // إضافة معلومات إضافية
        this.orderData.orderId = this.generateOrderId();
        this.orderData.date = new Date().toISOString();
        this.orderData.status = 'pending';
        
        // عرض تحميل
        window.uiManager?.showLoading('جاري تأكيد الطلب...');
        
        try {
            // حفظ الطلب في قاعدة البيانات
            if (window.db) {
                await this.saveOrderToFirebase();
            } else {
                // حفظ محلي
                this.saveOrderLocally();
            }
            
            // إشعار النجاح
            window.uiManager?.hideLoading();
            window.uiManager?.showNotification('تم بنجاح', 'تم تأكيد طلبك بنجاح', 'success', 5000);
            
            // إرسال إشعار بالواتساب
            this.sendWhatsAppNotification();
            
            // إفراغ السلة
            if (window.cartManager) {
                window.cartManager.clearCart();
            }
            
            // إغلاق نافذة الدفع
            this.closeCheckoutModal();
            
            // عرض تأكيد الطلب
            this.showOrderConfirmation();
            
        } catch (error) {
            console.error('Error placing order:', error);
            window.uiManager?.hideLoading();
            window.uiManager?.showNotification('خطأ', 'حدث خطأ أثناء تأكيد الطلب', 'error');
        }
    }
    
    async saveOrderToFirebase() {
        if (!window.db) throw new Error('Firebase not available');
        
        const orderRef = await window.db.collection('orders').add({
            ...this.orderData,
            createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
        });
        
        this.orderData.firebaseId = orderRef.id;
        return orderRef.id;
    }
    
    saveOrderLocally() {
        const orders = JSON.parse(localStorage.getItem('nexus_orders') || '[]');
        orders.push(this.orderData);
        localStorage.setItem('nexus_orders', JSON.stringify(orders));
    }
    
    sendWhatsAppNotification() {
        const phone = "966551234567"; // رقم الواتساب الافتراضي
        const message = this.createWhatsAppMessage();
        const encodedMessage = encodeURIComponent(message);
        
        const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
        
        // فتح الواتساب في نافذة جديدة
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1000);
    }
    
    createWhatsAppMessage() {
        const order = this.orderData;
        let message = `🛒 *طلب جديد - Nexus Store*\n`;
        message += `══════════════════\n\n`;
        
        message += `📋 *معلومات الطلب:*\n`;
        message += `🆔 رقم الطلب: ${order.orderId}\n`;
        message += `👤 الاسم: ${order.customerInfo.name}\n`;
        message += `📞 الهاتف: ${order.customerInfo.phone}\n`;
        message += `📅 التاريخ: ${new Date().toLocaleString('ar-SA')}\n\n`;
        
        message += `📍 *عنوان التوصيل:*\n`;
        message += `${order.shippingInfo.region} - ${order.shippingInfo.city}\n`;
        message += `${order.shippingInfo.district} - ${order.shippingInfo.street}\n`;
        message += `المبنى: ${order.shippingInfo.building}\n\n`;
        
        message += `🛍️ *المنتجات:*\n`;
        message += `══════════════════\n`;
        
        order.orderSummary.items.forEach((item, index) => {
            message += `\n${index + 1}. ${item.name}\n`;
            message += `   الكمية: ${item.quantity}\n`;
            message += `   السعر: ${item.price.toFixed(2)} × ${item.quantity} = ${item.total.toFixed(2)} ر.س\n`;
        });
        
        message += `\n💰 *الإجماليات:*\n`;
        message += `══════════════════\n`;
        message += `المجموع: ${order.orderSummary.subtotal.toFixed(2)} ر.س\n`;
        
        if (order.orderSummary.discount > 0) {
            message += `الخصم: -${order.orderSummary.discount.toFixed(2)} ر.س\n`;
        }
        
        message += `التوصيل: ${order.orderSummary.shipping === 0 ? 'مجاني' : order.orderSummary.shipping.toFixed(2) + ' ر.س'}\n`;
        message += `المجموع الكلي: ${order.orderSummary.total.toFixed(2)} ر.س\n\n`;
        
        message += `💳 *طريقة الدفع:*\n`;
        message += `${this.getPaymentMethodName(order.paymentInfo.method)}\n\n`;
        
        if (order.customerInfo.notes) {
            message += `📝 *ملاحظات العميل:*\n`;
            message += `${order.customerInfo.notes}\n\n`;
        }
        
        message += `شكراً لطلبكم من Nexus Store! 🚀`;
        
        return message;
    }
    
    showOrderConfirmation() {
        const order = this.orderData;
        
        const confirmation = document.createElement('div');
        confirmation.className = 'order-confirmation';
        confirmation.innerHTML = `
            <div class="confirmation-content">
                <div class="confirmation-header">
                    <i class="fas fa-check-circle"></i>
                    <h3>تم تأكيد طلبك بنجاح!</h3>
                    <p>رقم الطلب: <strong>${order.orderId}</strong></p>
                </div>
                
                <div class="confirmation-body">
                    <div class="confirmation-section">
                        <h4>معلومات الطلب</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span>الاسم:</span>
                                <span>${order.customerInfo.name}</span>
                            </div>
                            <div class="info-item">
                                <span>الهاتف:</span>
                                <span>${order.customerInfo.phone}</span>
                            </div>
                            <div class="info-item">
                                <span>طريقة الدفع:</span>
                                <span>${this.getPaymentMethodName(order.paymentInfo.method)}</span>
                            </div>
                            <div class="info-item">
                                <span>الحالة:</span>
                                <span class="status-pending">قيد المراجعة</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="confirmation-section">
                        <h4>ملخص الطلب</h4>
                        <div class="summary-final">
                            <div class="total-row">
                                <span>المجموع:</span>
                                <span>${order.orderSummary.subtotal.toFixed(2)} ر.س</span>
                            </div>
                            
                            ${order.orderSummary.discount > 0 ? `
                                <div class="total-row">
                                    <span>الخصم:</span>
                                    <span>-${order.orderSummary.discount.toFixed(2)} ر.س</span>
                                </div>
                            ` : ''}
                            
                            <div class="total-row">
                                <span>التوصيل:</span>
                                <span>${order.orderSummary.shipping === 0 ? 'مجاني' : order.orderSummary.shipping.toFixed(2) + ' ر.س'}</span>
                            </div>
                            
                            <div class="total-row final">
                                <span>المجموع الكلي:</span>
                                <span>${order.orderSummary.total.toFixed(2)} ر.س</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="confirmation-footer">
                    <button class="btn btn-primary" onclick="this.closest('.order-confirmation').remove(); window.location.reload();">
                        <i class="fas fa-home"></i>
                        العودة للرئيسية
                    </button>
                    <button class="btn btn-outline" onclick="window.print()">
                        <i class="fas fa-print"></i>
                        طباعة الطلب
                    </button>
                </div>
            </div>
        `;
        
        // إضافة الأنماط
        confirmation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            padding: var(--space-lg);
            animation: fadeIn 0.3s ease;
        `;
        
        confirmation.querySelector('.confirmation-content').style.cssText = `
            background: white;
            border-radius: var(--radius-lg);
            padding: var(--space-xl);
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: slideInUp 0.3s ease;
        `;
        
        document.body.appendChild(confirmation);
        
        // إضافة مستمع حدث للإغلاق بالنقر خارج المحتوى
        confirmation.addEventListener('click', (e) => {
            if (e.target === confirmation) {
                confirmation.remove();
            }
        });
    }
    
    // دعم
    generateOrderId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD-${timestamp}${random}`;
    }
    
    getOrderSummary() {
        if (window.cartManager) {
            return window.cartManager.createOrderSummary();
        }
        
        // ملخص افتراضي
        return {
            items: [],
            subtotal: 0,
            discount: 0,
            shipping: 0,
            total: 0
        };
    }
    
    updateOrderSummary() {
        // تحديث ملخص الطلب في الخطوة الثالثة إذا كانت نشطة
        if (this.currentStep === 3) {
            this.loadStepContent(3);
            this.updateNavigationButtons();
        }
    }
    
    updateShippingFee(method) {
        if (window.cartManager) {
            window.cartManager.shippingFee = method === 'express' ? 25 : 0;
            this.updateOrderSummary();
        }
    }
    
    updatePlaceOrderButton() {
        const button = document.getElementById('place-order-btn');
        if (button) {
            const agreeTerms = document.getElementById('agree-terms');
            button.disabled = !agreeTerms?.checked;
        }
    }
    
    getPaymentMethodName(method) {
        const methods = {
            'cod': 'الدفع عند الاستلام',
            'mada': 'بطاقة مدى',
            'bank': 'تحويل بنكي',
            'apple': 'Apple Pay'
        };
        
        return methods[method] || method;
    }
    
    isValidPhone(phone) {
        const regex = /^(05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/;
        return regex.test(phone);
    }
    
    showFieldError(field, message) {
        if (!field) return;
        
        // إزالة أي رسالة خطأ سابقة
        this.clearFieldError(field);
        
        // إضافة رسالة الخطأ
        const error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        error.style.cssText = `
            color: var(--danger);
            font-size: var(--font-xs);
            margin-top: 4px;
        `;
        
        field.parentNode.appendChild(error);
        field.style.borderColor = 'var(--danger)';
    }
    
    clearFieldError(field) {
        if (!field) return;
        
        // إزالة رسالة الخطأ
        const error = field.parentNode.querySelector('.field-error');
        if (error) {
            error.remove();
        }
        
        // إعادة لون الحدود
        field.style.borderColor = '';
    }
    
    resetCheckout() {
        this.currentStep = 1;
        this.orderData = {
            customerInfo: {},
            shippingInfo: {},
            paymentInfo: {},
            orderSummary: {}
        };
        
        this.createCheckoutSteps();
    }
}

// تصدير مدير الدفع
window.checkoutManager = new CheckoutManager();
console.log('✅ CheckoutManager loaded successfully');
