// js/firebase-init.js
console.log('🚀 تهيئة Firebase...');

class FirebaseManager {
    constructor() {
        this.isInitialized = false;
        this.db = null;
        this.auth = null;
        this.init();
    }
    
    async init() {
        try {
            // التحقق من وجود Firebase SDK
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK غير محمل');
            }
            
            // التحقق من وجود الإعدادات
            if (typeof firebaseConfig === 'undefined') {
                throw new Error('إعدادات Firebase غير موجودة');
            }
            
            console.log('✅ بدء تهيئة Firebase...');
            
            // التحقق من التهيئة المسبقة
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(firebaseConfig);
                console.log('🔥 Firebase تم تهيئته لأول مرة');
            } else {
                this.app = firebase.app();
                console.log('🔥 Firebase مهيأ مسبقاً');
            }
            
            // تهيئة الخدمات
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // إعدادات الأداء
            this.db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });
            
            // تمكين التخزين المؤقت (Persistence)
            try {
                await this.db.enablePersistence({
                    synchronizeTabs: true
                });
                console.log('💾 التخزين المؤقت مفعل');
            } catch (err) {
                console.log('⚠️ تعطيل التخزين المؤقت:', err.code);
            }
            
            this.isInitialized = true;
            console.log('✅ Firebase Manager جاهز');
            
            // اختبار الاتصال
            await this.testConnection();
            
            // إرسال حدث نجاح التهيئة
            this.dispatchReadyEvent();
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة Firebase:', error);
            this.createMockFirebase();
        }
    }
    
    async testConnection() {
        try {
            console.log('🔗 اختبار اتصال Firestore...');
            const startTime = Date.now();
            
            // اختبار بسيط
            const snapshot = await this.db.collection('products').limit(1).get();
            const responseTime = Date.now() - startTime;
            
            console.log(`✅ اتصال ناجح: ${snapshot.size} منتج (${responseTime}ms)`);
            
            if (snapshot.empty) {
                console.log('📭 قاعدة البيانات فارغة - جاهزة لإضافة منتجات');
                return { connected: true, hasData: false };
            }
            
            return { connected: true, hasData: true, count: snapshot.size };
            
        } catch (error) {
            console.log('⚠️ خطأ في الاتصال:', error.message);
            return { connected: false, error: error.message };
        }
    }
    
    createMockFirebase() {
        console.log('🔄 إنشاء نسخة وهمية للاختبار...');
        
        this.db = {
            collection: (name) => ({
                get: () => Promise.resolve({ 
                    empty: true, 
                    size: 0, 
                    forEach: () => {},
                    docs: []
                }),
                doc: (id) => ({
                    get: () => Promise.resolve({ 
                        exists: false, 
                        id: id,
                        data: () => null 
                    }),
                    set: (data) => {
                        console.log('Mock: إضافة مستند', data);
                        return Promise.resolve();
                    },
                    update: (data) => Promise.resolve(),
                    delete: () => Promise.resolve(),
                    onSnapshot: () => () => {}
                }),
                add: (data) => {
                    const mockId = 'mock-' + Date.now();
                    console.log('Mock: إضافة مستند جديد', data);
                    return Promise.resolve({ id: mockId });
                },
                where: () => ({ 
                    get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
                    onSnapshot: () => () => {}
                }),
                orderBy: () => ({ 
                    get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
                    limit: () => ({ get: () => Promise.resolve({ empty: true, size: 0, docs: [] }) })
                }),
                limit: (num) => ({ 
                    get: () => Promise.resolve({ empty: true, size: 0, docs: [] }),
                    onSnapshot: () => () => {}
                }),
                onSnapshot: (callback, errorCallback) => {
                    callback({ empty: true, size: 0, docs: [] });
                    return () => {};
                }
            }),
            batch: () => ({
                set: () => {},
                update: () => {},
                delete: () => {},
                commit: () => Promise.resolve()
            })
        };
        
        this.auth = {
            onAuthStateChanged: (callback) => {
                callback(null);
                return () => {};
            },
            signInWithEmailAndPassword: (email, password) => 
                Promise.reject(new Error('الوضع التجريبي')),
            signOut: () => Promise.resolve(),
            currentUser: null,
            createUserWithEmailAndPassword: () => 
                Promise.reject(new Error('الوضع التجريبي'))
        };
        
        console.log('✅ النسخة الوهمية جاهزة للاختبار');
    }
    
    dispatchReadyEvent() {
        const event = new CustomEvent('firebase:ready', {
            detail: { 
                db: this.db, 
                auth: this.auth, 
                isInitialized: this.isInitialized 
            }
        });
        document.dispatchEvent(event);
    }
    
    // دالة لاستيراد المنتجات التجريبية
    async seedSampleProducts() {
        if (!this.isInitialized) {
            console.error('Firebase غير مهيأ');
            return false;
        }
        
        const sampleProducts = [
            {
                name: "آيفون 14 برو",
                price: 4499,
                category: "electronics",
                image: "📱",
                description: "هاتف أيفون 14 برو بمواصفات متطورة",
                rating: 4.7,
                stock: 15,
                badge: "جديد",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                name: "سماعات لاسلكية",
                price: 299,
                category: "electronics",
                image: "🎧",
                description: "سماعات بلوتوث عالية الجودة",
                rating: 4.5,
                stock: 30,
                badge: "الأكثر مبيعاً",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                name: "ساعة يد فاخرة",
                price: 599,
                category: "accessories",
                image: "⌚",
                description: "ساعة يد أنيقة بتصميم عصري",
                rating: 4.3,
                stock: 20,
                badge: "جديد",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                name: "مجموعة تجميل",
                price: 199,
                category: "cosmetics",
                image: "💄",
                description: "مجموعة متكاملة من مستحضرات التجميل",
                rating: 4.6,
                stock: 40,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                name: "حذاء رياضي",
                price: 249,
                category: "clothing",
                image: "👟",
                description: "حذاء رياضي مريح للجري",
                rating: 4.4,
                stock: 25,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            {
                name: "سجادة صوف",
                price: 399,
                category: "home",
                image: "🧶",
                description: "سجادة صوف طبيعي بتصميم شرقي",
                rating: 4.2,
                stock: 18,
                badge: "خصم",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        ];
        
        try {
            console.log('🌱 جاري إضافة المنتجات التجريبية...');
            
            const batch = this.db.batch();
            const productsRef = this.db.collection('products');
            
            sampleProducts.forEach(product => {
                const docRef = productsRef.doc();
                batch.set(docRef, product);
            });
            
            await batch.commit();
            console.log(`✅ تم إضافة ${sampleProducts.length} منتج بنجاح`);
            return true;
            
        } catch (error) {
            console.error('❌ خطأ في إضافة المنتجات:', error);
            return false;
        }
    }
    
    // الحصول على جميع المنتجات
    async getAllProducts() {
        try {
            const snapshot = await this.db.collection('products').get();
            const products = [];
            
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return products;
        } catch (error) {
            console.error('خطأ في جلب المنتجات:', error);
            return [];
        }
    }
    
    // الحصول على المنتجات حسب الفئة
    async getProductsByCategory(category) {
        try {
            const snapshot = await this.db.collection('products')
                .where('category', '==', category)
                .get();
            
            const products = [];
            snapshot.forEach(doc => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return products;
        } catch (error) {
            console.error(`خطأ في جلب منتجات الفئة ${category}:`, error);
            return [];
        }
    }
    
    // إضافة منتج جديد
    async addProduct(productData) {
        try {
            const docRef = await this.db.collection('products').add({
                ...productData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ تم إضافة المنتج:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ خطأ في إضافة المنتج:', error);
            return { success: false, error: error.message };
        }
    }
    
    // تحديث منتج
    async updateProduct(productId, updates) {
        try {
            await this.db.collection('products').doc(productId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ تم تحديث المنتج:', productId);
            return { success: true };
        } catch (error) {
            console.error('❌ خطأ في تحديث المنتج:', error);
            return { success: false, error: error.message };
        }
    }
    
    // حذف منتج
    async deleteProduct(productId) {
        try {
            await this.db.collection('products').doc(productId).delete();
            console.log('✅ تم حذف المنتج:', productId);
            return { success: true };
        } catch (error) {
            console.error('❌ خطأ في حذف المنتج:', error);
            return { success: false, error: error.message };
        }
    }
}

// إنشاء نسخة واحدة من FirebaseManager
let firebaseManagerInstance = null;

function getFirebaseManager() {
    if (!firebaseManagerInstance) {
        firebaseManagerInstance = new FirebaseManager();
    }
    return firebaseManagerInstance;
}

// التصدير للاستخدام العالمي
window.firebaseManager = getFirebaseManager();
window.db = () => getFirebaseManager().db;
window.auth = () => getFirebaseManager().auth;

console.log('✅ firebase-init.js جاهز');
