// js/firebase-init.js - تهيئة Firebase مع تحسينات

console.log('🔥 Initializing Firebase...');

// التحقق من وجود Firebase
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded!');
} else {
    try {
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        
        // جعلها متاحة عالمياً
        window.firebaseApp = app;
        window.auth = auth;
        window.db = db;
        
        console.log('✅ Firebase initialized successfully');
        
        // تحسينات الأداء
        this.optimizeFirebase();
        
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        // الاستمرار بدون Firebase
        window.db = null;
    }
}

// تحسينات Firebase للأداء
function optimizeFirebase() {
    if (!window.db) return;
    
    try {
        // تحسينات Firestore
        const settings = {
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        };
        
        window.db.settings(settings);
        
        // تمكين التخزين المؤقت
        window.db.enablePersistence()
            .catch((err) => {
                console.log('Firebase persistence error:', err.code);
            });
            
        console.log('✅ Firebase optimized for performance');
        
    } catch (error) {
        console.log('Firebase optimization error:', error);
    }
}

// دالة مساعدة للتحقق من اتصال Firebase
window.checkFirebaseConnection = async function() {
    if (!window.db) {
        console.log('Firebase is not initialized');
        return false;
    }
    
    try {
        const testDoc = await window.db.collection('test').limit(1).get();
        console.log('Firebase connection test:', testDoc.size > 0 ? 'Connected' : 'No data');
        return true;
    } catch (error) {
        console.error('Firebase connection error:', error);
        return false;
    }
};

// دالة لتحميل المنتجات من Firebase
window.loadProductsFromFirebase = async function() {
    if (!window.db) {
        console.log('Firebase not available, using local data');
        return null;
    }
    
    try {
        const snapshot = await window.db.collection('products')
            .where('active', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();
            
        const products = [];
        snapshot.forEach(doc => {
            const product = doc.data();
            product.id = doc.id;
            products.push(product);
        });
        
        console.log(`✅ Loaded ${products.length} products from Firebase`);
        return products;
        
    } catch (error) {
        console.error('Error loading products from Firebase:', error);
        return null;
    }
};

// تهيئة المنتجات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.db && window.app) {
            console.log('🔄 Loading products from Firebase...');
            
            window.loadProductsFromFirebase()
                .then(products => {
                    if (products && products.length > 0) {
                        console.log('Products loaded, updating app...');
                        // يمكن تحديث التطبيق بالمنتجات هنا
                    }
                })
                .catch(error => {
                    console.error('Failed to load products:', error);
                });
        }
    }, 2000);
});

// إضافة دالة لتحديث المخزون
window.updateProductStock = async function(productId, quantityChange) {
    if (!window.db) return false;
    
    try {
        const productRef = window.db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        
        if (!productDoc.exists) {
            console.error('Product not found:', productId);
            return false;
        }
        
        const currentStock = productDoc.data().stock || 0;
        const newStock = Math.max(0, currentStock + quantityChange);
        
        await productRef.update({
            stock: newStock,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Updated stock for ${productId}: ${currentStock} → ${newStock}`);
        return true;
        
    } catch (error) {
        console.error('Error updating stock:', error);
        return false;
    }
};

// دالة لحفظ الطلبات في Firebase
window.saveOrderToFirebase = async function(orderData) {
    if (!window.db) {
        console.log('Firebase not available, saving locally');
        return null;
    }
    
    try {
        const orderRef = await window.db.collection('orders').add({
            ...orderData,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ Order saved to Firebase with ID:', orderRef.id);
        return orderRef.id;
        
    } catch (error) {
        console.error('Error saving order to Firebase:', error);
        return null;
    }
};

// دالة لتحميل آخر الطلبات
window.getRecentOrders = async function(limit = 10) {
    if (!window.db) return [];
    
    try {
        const snapshot = await window.db.collection('orders')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
            
        const orders = [];
        snapshot.forEach(doc => {
            const order = doc.data();
            order.id = doc.id;
            orders.push(order);
        });
        
        return orders;
        
    } catch (error) {
        console.error('Error loading orders:', error);
        return [];
    }
};

console.log('✅ firebase-init.js loaded');
