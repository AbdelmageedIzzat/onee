// js/firebase-init.js - تهيئة Firebase مع معالجة الأخطاء المتقدمة

console.log('🔥 firebase-init.js - Initializing Firebase...');

class FirebaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.auth = null;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }
    
    async init() {
        console.log('🎯 FirebaseManager initialization...');
        
        try {
            // التحقق من وجود Firebase SDK
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }
            
            // التحقق من وجود الإعدادات
            if (typeof firebaseConfig === 'undefined') {
                throw new Error('Firebase configuration not found');
            }
            
            // تهيئة Firebase
            this.app = firebase.initializeApp(firebaseConfig);
            
            // تهيئة الخدمات
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            // تحسين أداء Firebase
            this.optimizeFirebase();
            
            // اختبار الاتصال
            await this.testConnection();
            
            this.isInitialized = true;
            console.log('✅ Firebase initialized successfully');
            
            // إرسال حدث للتطبيقات الأخرى
            this.dispatchReadyEvent();
            
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            this.handleInitializationError(error);
        }
    }
    
    optimizeFirebase() {
        // تحسينات الأداء
        this.db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
        
        // تمكين التخزين المؤقت بشكل دائم
        this.db.enablePersistence()
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
                } else if (err.code === 'unimplemented') {
                    console.log('The current browser does not support persistence.');
                }
            });
        
        // إعداد مراقبة الاتصال
        this.setupConnectionMonitoring();
    }
    
    async testConnection() {
        try {
            // اختبار بسيط للاتصال
            const testDoc = await this.db.collection('_test').doc('connection').get({
                source: 'cache'
            }).catch(() => null);
            
            // محاولة الاتصال بالخادم
            const serverTest = await Promise.race([
                this.db.collection('products').limit(1).get(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), 5000)
                )
            ]);
            
            console.log(`📊 Firebase connection test: ${serverTest.size} products available`);
            
            // تحديث حالة الاتصال
            this.updateConnectionStatus(true);
            
        } catch (error) {
            console.log('⚠️ Firebase connection test failed:', error.message);
            this.updateConnectionStatus(false);
            
            // إعادة المحاولة إذا لزم الأمر
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`Retrying connection... (${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => this.testConnection(), 2000 * this.retryCount);
            }
        }
    }
    
    setupConnectionMonitoring() {
        // مراقبة حالة الاتصال
        const connectedRef = this.db.ref('.info/connected');
        
        if (connectedRef) {
            connectedRef.on('value', (snap) => {
                const isConnected = snap.val() === true;
                this.updateConnectionStatus(isConnected);
                
                if (isConnected) {
                    console.log('🌐 Firebase: Online');
                    this.dispatchEvent('firebase-online');
                } else {
                    console.log('🌐 Firebase: Offline');
                    this.dispatchEvent('firebase-offline');
                }
            });
        }
        
        // مراقبة الأخطاء
        this.db.onSnapshotsInSync(() => {
            console.log('🔄 Firebase: All listeners are in-sync');
        });
    }
    
    updateConnectionStatus(isConnected) {
        // تحديث حالة الاتصال في التطبيق
        document.documentElement.classList.toggle('firebase-online', isConnected);
        document.documentElement.classList.toggle('firebase-offline', !isConnected);
        
        // إرسال إشعار إذا تغيرت الحالة
        if (isConnected && this.retryCount > 0) {
            console.log('✅ Firebase connection restored');
            this.dispatchEvent('firebase-connected');
        }
    }
    
    handleInitializationError(error) {
        // معالجة أخطاء التهيئة
        switch(error.code) {
            case 'failed-precondition':
                console.log('Firebase app already initialized');
                break;
            case 'invalid-api-key':
                console.error('Invalid Firebase API key');
                this.showErrorMessage('إعدادات Firebase غير صحيحة');
                break;
            case 'network-request-failed':
                console.error('Network error');
                this.showErrorMessage('خطأ في الشبكة، جاري استخدام البيانات المحلية');
                break;
            default:
                console.error('Unknown Firebase error:', error);
                this.showErrorMessage('خطأ في الاتصال، جاري استخدام البيانات المحلية');
        }
        
        // استخدام وضع عدم الاتصال
        this.setupOfflineMode();
    }
    
    setupOfflineMode() {
        console.log('📴 Setting up offline mode...');
        
        // إنشاء واجهة Firebase وهمية للعمل دون اتصال
        this.createMockFirebase();
        
        // إرسال حدث وضع عدم الاتصال
        this.dispatchEvent('firebase-offline-mode');
    }
    
    createMockFirebase() {
        // إنشاء واجهة وهمية للعمل دون اتصال
        window.db = {
            collection: () => ({
                doc: () => ({
                    get: () => Promise.resolve({ exists: false, data: () => null }),
                    set: () => Promise.resolve(),
                    update: () => Promise.resolve(),
                    delete: () => Promise.resolve(),
                    onSnapshot: () => () => {}
                }),
                get: () => Promise.resolve({ empty: true, docs: [], forEach: () => {} }),
                add: () => Promise.resolve({ id: 'mock-id' }),
                where: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }),
                orderBy: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) }),
                limit: () => ({ get: () => Promise.resolve({ empty: true, docs: [] }) })
            })
        };
        
        window.auth = {
            currentUser: null,
            onAuthStateChanged: (callback) => callback(null),
            signInWithEmailAndPassword: () => Promise.reject(new Error('Offline mode')),
            signOut: () => Promise.resolve()
        };
    }
    
    showErrorMessage(message) {
        // عرض رسالة خطأ للمستخدم
        if (window.uiManager) {
            window.uiManager.showNotification('تنبيه', message, 'warning', 5000);
        }
    }
    
    dispatchReadyEvent() {
        const event = new CustomEvent('firebase-ready', {
            detail: { 
                db: this.db, 
                auth: this.auth,
                isOnline: true 
            }
        });
        window.dispatchEvent(event);
    }
    
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
    
    // وظائف مساعدة
    async getDocument(collection, docId) {
        try {
            const doc = await this.db.collection(collection).doc(docId).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error getting document:', error);
            return null;
        }
    }
    
    async getCollection(collection, options = {}) {
        try {
            let query = this.db.collection(collection);
            
            // تطبيق الفلاتر
            if (options.where) {
                query = query.where(...options.where);
            }
            
            if (options.orderBy) {
                query = query.orderBy(...options.orderBy);
            }
            
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            const snapshot = await query.get();
            const results = [];
            
            snapshot.forEach(doc => {
                results.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            return results;
        } catch (error) {
            console.error('Error getting collection:', error);
            return [];
        }
    }
    
    async addDocument(collection, data) {
        try {
            const docRef = await this.db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return docRef.id;
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    }
    
    async updateDocument(collection, docId, data) {
        try {
            await this.db.collection(collection).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return true;
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }
    
    async deleteDocument(collection, docId) {
        try {
            await this.db.collection(collection).doc(docId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }
    
    // النسخ الاحتياطي والاستعادة
    async backupCollection(collection) {
        try {
            const snapshot = await this.db.collection(collection).get();
            const backup = [];
            
            snapshot.forEach(doc => {
                backup.push({
                    id: doc.id,
                    data: doc.data()
                });
            });
            
            // حفظ محلي
            localStorage.setItem(`backup_${collection}`, JSON.stringify(backup));
            console.log(`Backup created for ${collection}: ${backup.length} documents`);
            
            return backup;
        } catch (error) {
            console.error('Backup error:', error);
            return [];
        }
    }
    
    async restoreCollection(collection) {
        try {
            const backup = JSON.parse(localStorage.getItem(`backup_${collection}`) || '[]');
            
            for (const item of backup) {
                await this.db.collection(collection).doc(item.id).set(item.data);
            }
            
            console.log(`Restored ${backup.length} documents to ${collection}`);
            return true;
        } catch (error) {
            console.error('Restore error:', error);
            return false;
        }
    }
    
    // إحصائيات
    async getStats() {
        try {
            const stats = {
                products: 0,
                orders: 0,
                users: 0,
                lastUpdated: new Date().toISOString()
            };
            
            // جلب إحصائيات المنتجات
            const productsSnapshot = await this.db.collection('products').get();
            stats.products = productsSnapshot.size;
            
            // جلب إحصائيات الطلبات
            const ordersSnapshot = await this.db.collection('orders').get();
            stats.orders = ordersSnapshot.size;
            
            // جلب إحصائيات المستخدمين
            const usersSnapshot = await this.db.collection('users').get();
            stats.users = usersSnapshot.size;
            
            return stats;
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }
    
    // التحقق من الصلاحيات
    async checkPermission(collection, permission) {
        // هذه دمية - في تطبيق حقيقي يجب التحقق من صلاحيات Firebase
        return true;
    }
}

// تهيئة مدير Firebase
window.firebaseManager = new FirebaseManager();

// جعل الدوال متاحة عالمياً
window.initFirebase = () => window.firebaseManager.init();
window.getFirebaseStats = () => window.firebaseManager.getStats();
window.backupData = (collection) => window.firebaseManager.backupCollection(collection);
window.restoreData = (collection) => window.firebaseManager.restoreCollection(collection);

console.log('✅ firebase-init.js loaded successfully');
