// js/firebase-init.js - النسخة المحسنة

console.log('🔥 تهيئة Firebase...');

async function initFirebase() {
    try {
        // التحقق من وجود Firebase SDK
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK غير محمل');
            throw new Error('Firebase SDK غير محمل');
        }
        
        // التحقق من وجود الإعدادات
        if (typeof firebaseConfig === 'undefined') {
            console.error('إعدادات Firebase غير موجودة');
            throw new Error('إعدادات Firebase غير موجودة');
        }
        
        console.log('✅ بدء تهيئة Firebase...');
        
        // التحقق إذا تم التهيئة مسبقاً
        if (firebase.apps.length > 0) {
            console.log('✅ Firebase مهيأ مسبقاً');
            window.app = firebase.app();
        } else {
            // التهيئة الأولى
            window.app = firebase.initializeApp(firebaseConfig);
        }
        
        // تهيئة الخدمات
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        // إعدادات الأداء
        window.db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
        
        // تمكين التخزين المؤقت
        window.db.enablePersistence()
            .catch((err) => {
                console.log('⚠️ تعطيل التخزين المؤقت:', err.code);
            });
        
        console.log('✅ تم تهيئة Firebase بنجاح');
        
        // اختبار الاتصال
        await testConnection();
        
        return { success: true, message: 'تم تهيئة Firebase' };
        
    } catch (error) {
        console.error('❌ خطأ في تهيئة Firebase:', error);
        
        // استخدام نسخة وهمية للاختبار
        createMockFirebase();
        
        return { 
            success: false, 
            message: 'تم استخدام البيانات المحلية للاختبار',
            error: error.message 
        };
    }
}

async function testConnection() {
    try {
        console.log('🔗 اختبار اتصال Firebase...');
        
        const startTime = Date.now();
        const snapshot = await window.db.collection('products').limit(1).get();
        const endTime = Date.now();
        
        console.log(`✅ اتصال ناجح: ${snapshot.size} منتج (${endTime - startTime}ms)`);
        
        if (snapshot.empty) {
            console.log('📭 قاعدة البيانات فارغة، يمكنك إضافة منتجات');
            return false;
        }
        
        return true;
        
    } catch (error) {
        console.log('⚠️ Firebase متصل ولكن قد تكون قاعدة البيانات فارغة أو محمية');
        return false;
    }
}

function createMockFirebase() {
    console.log('🔄 إنشاء نسخة وهمية من Firebase للاختبار');
    
    // نسخة وهمية لـ Firestore
    window.db = {
        collection: (name) => ({
            get: () => Promise.resolve({ empty: true, size: 0, forEach: () => {} }),
            doc: (id) => ({
                get: () => Promise.resolve({ exists: false, data: () => null }),
                set: () => Promise.resolve(),
                update: () => Promise.resolve(),
                delete: () => Promise.resolve()
            }),
            add: (data) => Promise.resolve({ id: 'mock-' + Date.now() }),
            where: () => ({ get: () => Promise.resolve({ empty: true, size: 0 }) }),
            orderBy: () => ({ get: () => Promise.resolve({ empty: true, size: 0 }) }),
            limit: () => ({ get: () => Promise.resolve({ empty: true, size: 0 }) })
        })
    };
    
    // نسخة وهمية لـ Auth
    window.auth = {
        onAuthStateChanged: (callback) => callback(null),
        signInWithEmailAndPassword: () => Promise.reject(new Error('وضع الاختبار')),
        signOut: () => Promise.resolve(),
        currentUser: null
    };
    
    console.log('✅ تم إنشاء نسخة وهمية للاختبار');
}

// البدء الفوري
setTimeout(() => {
    initFirebase().then(result => {
        if (result.success) {
            console.log('🎉 Firebase جاهز للاستخدام');
            
            // إعلام التطبيق الرئيسي
            if (window.app && window.app.onFirebaseReady) {
                window.app.onFirebaseReady();
            }
        } else {
            console.log('ℹ️ العمل في وضع عدم الاتصال');
        }
    });
}, 100);

// جعل الدوال متاحة للاستخدام
window.initFirebase = initFirebase;
window.testFirebaseConnection = testConnection;

console.log('✅ firebase-init.js جاهز');
