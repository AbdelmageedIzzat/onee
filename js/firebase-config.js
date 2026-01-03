// js/firebase-config.js
// إعدادات Firebase للمتجر

const firebaseConfig = {
  apiKey: "AIzaSyAnc2QZF46bzwqUikXcg-xkgbdAjoNN4ZY",
  authDomain: "ourmarket-7bbd1.firebaseapp.com",
  projectId: "ourmarket-7bbd1",
  storageBucket: "ourmarket-7bbd1.firebasestorage.app",
  messagingSenderId: "877489389634",
  appId: "1:877489389634:web:9d9fbad820015275feeddb",
  measurementId: "G-99YJ6X3ZHS"
};

// ملاحظة: يمكن استبدال هذه المفاتيح بمفاتيح مشروع Firebase الخاص بك

// التحقق من وجود Firebase في الكونسول
console.log('🔥 Firebase Config Loaded');

// جعل الإعدادات متاحة عالمياً للتحقق
window.firebaseConfig = firebaseConfig;

// دالة للتحقق من صحة الإعدادات
window.validateFirebaseConfig = function() {
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
        if (!firebaseConfig[field]) {
            missingFields.push(field);
        }
    });
    
    if (missingFields.length > 0) {
        console.error('❌ Missing Firebase config fields:', missingFields);
        return false;
    }
    
    console.log('✅ Firebase config is valid');
    return true;
};

// التحقق التلقائي عند التحميل
if (typeof window !== 'undefined') {
    setTimeout(() => {
        if (window.validateFirebaseConfig) {
            window.validateFirebaseConfig();
        }
    }, 1000);
}
