// js/utilities.js - المساعدات العامة
console.log('🔧 Loading utilities...');

const Utilities = {
    // تخزين محلي محسن
    storage: {
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error saving to localStorage:', error);
                return false;
            }
        },
        
        get: function(key) {
            try {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return null;
            }
        },
        
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removing from localStorage:', error);
                return false;
            }
        }
    },
    
    // تنسيق الأسعار
    formatPrice: function(price) {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2
        }).format(price);
    },
    
    // التحقق من صحة البريد الإلكتروني
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // التحقق من صحة الهاتف السعودي
    isValidSaudiPhone: function(phone) {
        const re = /^05\d{8}$/;
        return re.test(phone);
    },
    
    // توليد ID فريد
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // تخفيف الطلب (Debounce)
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // إشعارات سريعة
    toast: function(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${this.getToastColor(type)};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    getToastColor: function(type) {
        const colors = {
            success: '#06D6A0',
            error: '#EF476F',
            warning: '#FFD166',
            info: '#118AB2'
        };
        return colors[type] || colors.info;
    },
    
    // نسخ النص
    copyToClipboard: function(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    resolve();
                } catch (error) {
                    reject(error);
                }
                document.body.removeChild(textArea);
            }
        });
    },
    
    // فتح رابط في نافذة جديدة
    openInNewTab: function(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
    },
    
    // تحميل صورة
    loadImage: function(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    },
    
    // إضافة event listener آمن
    addEventListener: function(element, event, handler, options) {
        if (element && typeof element.addEventListener === 'function') {
            element.addEventListener(event, handler, options);
            return () => element.removeEventListener(event, handler, options);
        }
        return () => {};
    },
    
    // التحقق من أن العنصر مرئي
    isElementVisible: function(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // تنسيق التاريخ العربي
    formatArabicDate: function(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('ar-SA', options);
    },
    
    // إضافة فاصل الآلاف للأرقام
    formatNumber: function(number) {
        return new Intl.NumberFormat('ar-SA').format(number);
    },
    
    // قص النص وإضافة نقاط
    truncateText: function(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // إزالة HTML من النص
    stripHtml: function(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    },
    
    // الكشف عن الجهاز
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // الكشف عن المتصفح
    isChrome: function() {
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    },
    
    // الكشف عن نظام التشغيل
    isIOS: function() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },
    
    // توليد لون عشوائي
    getRandomColor: function() {
        const colors = ['#4361EE', '#F72585', '#4CC9F0', '#7209B7', '#06D6A0', '#FB5607', '#FFD166', '#EF476F'];
        return colors[Math.floor(Math.random() * colors.length)];
    },
    
    // تأخير التنفيذ
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // التحقق من صحة الصورة URL
    isValidImageUrl: function(url) {
        return /\.(jpeg|jpg|gif|png|webp|svg)$/.test(url.toLowerCase());
    },
    
    // إضافة فئة مؤقتة لعنصر
    addTempClass: function(element, className, duration) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }
};

// جعل الأدوات متاحة عالمياً
window.utils = Utilities;
console.log('✅ Utilities loaded successfully');
