// js/products-manager.js
console.log('📦 Loading ProductsManager...');

class ProductsManager {
    constructor() {
        this.productsByCategory = {};
        this.allProducts = [];
        this.categories = {
            'electronics': { name: 'إلكترونيات', icon: 'fas fa-laptop', color: '#4361EE' },
            'fashion': { name: 'أزياء', icon: 'fas fa-tshirt', color: '#F72585' },
            'home': { name: 'منزلية', icon: 'fas fa-home', color: '#4CC9F0' },
            'beauty': { name: 'جمال', icon: 'fas fa-spa', color: '#7209B7' },
            'sports': { name: 'رياضة', icon: 'fas fa-futbol', color: '#06D6A0' },
            'books': { name: 'كتب', icon: 'fas fa-book', color: '#FB5607' },
            'toys': { name: 'ألعاب', icon: 'fas fa-gamepad', color: '#FFD166' },
            'offers': { name: 'عروض خاصة', icon: 'fas fa-tags', color: '#EF476F' }
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 ProductsManager initialization...');
        this.loadProducts();
        this.setupEventListeners();
    }
    
    loadProducts() {
        // محاكاة تحميل المنتجات
        this.productsByCategory = {
            electronics: [
                { id: 'elec1', name: 'سماعات لاسلكية', price: 299, image: '🎧', description: 'سماعات بلوتوث عالية الجودة', category: 'electronics', rating: 4.5, badge: 'الأكثر مبيعاً' },
                { id: 'elec2', name: 'ساعة ذكية', price: 499, image: '⌚', description: 'ساعة ذكية متطورة', category: 'electronics', rating: 4.3, badge: 'جديد' }
            ],
            fashion: [
                { id: 'fash1', name: 'قميص رجالي', price: 89, image: '👔', description: 'قميص قطني عالي الجودة', category: 'fashion', rating: 4.2 },
                { id: 'fash2', name: 'فستان سهرة', price: 299, image: '👗', description: 'فستان أنيق للمناسبات', category: 'fashion', rating: 4.7, badge: 'الأكثر مبيعاً' }
            ],
            home: [
                { id: 'home1', name: 'سجادة صوف', price: 199, image: '🧶', description: 'سجادة صوف طبيعي', category: 'home', rating: 4.4 },
                { id: 'home2', name: 'مصباح طاولة', price: 149, image: '💡', description: 'مصباح LED عصري', category: 'home', rating: 4.1 }
            ],
            beauty: [
                { id: 'beauty1', name: 'مجموعة تجميل', price: 179, image: '💄', description: 'مجموعة كاملة من مستحضرات التجميل', category: 'beauty', rating: 4.6, badge: 'خصم' }
            ],
            offers: [
                { id: 'offer1', name: 'عرض خاص', price: 249, image: '🔥', description: 'خصم 50% لفترة محدودة', category: 'offers', oldPrice: 499, rating: 4.8, badge: 'خصم 50%' }
            ]
        };
        
        // إنشاء قائمة بجميع المنتجات
        this.allProducts = [];
        for (const category in this.productsByCategory) {
            this.allProducts.push(...this.productsByCategory[category]);
        }
        
        console.log(`📊 Loaded ${this.allProducts.length} products in ${Object.keys(this.productsByCategory).length} categories`);
    }
    
    getProductById(productId) {
        return this.allProducts.find(product => product.id === productId) || null;
    }
    
    getProductsByCategory(categoryId) {
        return this.productsByCategory[categoryId] || [];
    }
    
    getCategoryName(categoryId) {
        return this.categories[categoryId]?.name || categoryId;
    }
    
    searchProducts(query) {
        if (!query || query.trim().length < 2) return [];
        
        const searchTerm = query.toLowerCase().trim();
        const results = [];
        
        this.allProducts.forEach(product => {
            let score = 0;
            
            if (product.name.toLowerCase().includes(searchTerm)) {
                score += 10;
            }
            
            if (product.description && product.description.toLowerCase().includes(searchTerm)) {
                score += 5;
            }
            
            if (product.category && product.category.toLowerCase().includes(searchTerm)) {
                score += 3;
            }
            
            if (score > 0) {
                results.push({ ...product, score });
            }
        });
        
        // ترتيب حسب الدرجة
        results.sort((a, b) => b.score - a.score);
        
        return results.slice(0, 10);
    }
    
    setupEventListeners() {
        // يمكن إضافة مستمعي الأحداث هنا
    }
    
    // دالة لإضافة منتج جديد (للتطوير)
    addProduct(product) {
        const category = product.category || 'general';
        
        if (!this.productsByCategory[category]) {
            this.productsByCategory[category] = [];
        }
        
        // توليد ID فريد إذا لم يكن موجوداً
        if (!product.id) {
            product.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        
        this.productsByCategory[category].push(product);
        this.allProducts.push(product);
        
        console.log(`✅ Added product: ${product.name} to category: ${category}`);
        return product.id;
    }
    
    // دالة لحذف منتج
    removeProduct(productId) {
        let removed = false;
        
        // البحث في جميع الفئات
        for (const category in this.productsByCategory) {
            const categoryProducts = this.productsByCategory[category];
            const index = categoryProducts.findIndex(p => p.id === productId);
            
            if (index !== -1) {
                categoryProducts.splice(index, 1);
                removed = true;
                console.log(`🗑️ Removed product: ${productId} from category: ${category}`);
                break;
            }
        }
        
        // تحديث القائمة الكلية
        if (removed) {
            this.allProducts = this.allProducts.filter(p => p.id !== productId);
        }
        
        return removed;
    }
    
    // دالة لتحديث منتج
    updateProduct(productId, updates) {
        let updated = false;
        
        // البحث في جميع الفئات
        for (const category in this.productsByCategory) {
            const categoryProducts = this.productsByCategory[category];
            const productIndex = categoryProducts.findIndex(p => p.id === productId);
            
            if (productIndex !== -1) {
                // تحديث المنتج
                this.productsByCategory[category][productIndex] = {
                    ...this.productsByCategory[category][productIndex],
                    ...updates
                };
                updated = true;
                console.log(`🔄 Updated product: ${productId}`);
                break;
            }
        }
        
        // تحديث القائمة الكلية
        if (updated) {
            const globalIndex = this.allProducts.findIndex(p => p.id === productId);
            if (globalIndex !== -1) {
                this.allProducts[globalIndex] = {
                    ...this.allProducts[globalIndex],
                    ...updates
                };
            }
        }
        
        return updated;
    }
}

// Export ProductsManager
window.productsManager = new ProductsManager();
console.log('✅ ProductsManager loaded successfully');
