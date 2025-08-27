import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CheckCircle, Headphones, Gift, Star, Sparkles, AlertCircle, Clock, Zap, Users } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import ProductCard from '../../components/common/ProductCard';
import { supabase } from '../../lib/supabase';
import { projectId } from '../../utils/supabase/info';
import { motion } from 'framer-motion';

// Sample cleaning supplies products data with stock levels
const featuredProducts = [
  {
    id: '1',
    name: 'Professional All-Purpose Cleaner',
    brand: 'CleanPro',
    price: 24.99,
    original_price: 29.99,
    discount: 17,
    category: 'Detergents',
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 248,
    featured: true,
    description: 'Heavy-duty all-purpose cleaner suitable for kitchens, bathrooms, and general surfaces',
    in_stock: true,
    stock_count: 45,
    promotion_badge: '17% OFF',
    promotion_id: 'flash-sale-detergents'
  },
  {
    id: '2',
    name: 'Industrial Floor Scrubber',
    brand: 'FloorMaster',
    price: 189.99,
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    rating: 4.7,
    reviews: 156,
    featured: true,
    description: 'Commercial-grade floor scrubber with rotating brushes for deep cleaning',
    in_stock: true,
    stock_count: 3,
    promotion_id: 'buy-3-get-1-equipment'
  },
  {
    id: '3',
    name: 'Microfiber Cleaning Cloth Set',
    brand: 'SoftClean',
    price: 19.99,
    category: 'Supplies',
    image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    rating: 4.9,
    reviews: 312,
    featured: true,
    description: 'Pack of 12 premium microfiber cloths for streak-free cleaning on all surfaces',
    in_stock: true,
    stock_count: 127
  },
  {
    id: '4',
    name: 'Heavy Duty Degreaser',
    brand: 'PowerClean',
    price: 34.99,
    original_price: 42.99,
    discount: 19,
    category: 'Detergents',
    image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop',
    rating: 4.6,
    reviews: 89,
    featured: true,
    description: 'Industrial strength degreaser for kitchen hoods, engines, and heavy machinery',
    in_stock: false,
    stock_count: 0,
    promotion_badge: '19% OFF',
    promotion_id: 'flash-sale-detergents'
  },
  {
    id: '5',
    name: 'Professional Vacuum Cleaner',
    brand: 'VacuumPro',
    price: 299.99,
    original_price: 349.99,
    discount: 14,
    category: 'Equipment',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    rating: 4.5,
    reviews: 178,
    featured: true,
    description: 'High-power commercial vacuum with HEPA filtration and multiple attachments',
    in_stock: true,
    stock_count: 7,
    promotion_badge: '14% OFF',
    promotion_id: 'buy-3-get-1-equipment'
  },
  {
    id: '6',
    name: 'Sanitizing Wipes Bulk Pack',
    brand: 'SafeClean',
    price: 45.99,
    category: 'Supplies',
    image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
    rating: 4.8,
    reviews: 194,
    featured: true,
    description: 'Case of 12 packs of antibacterial sanitizing wipes, hospital-grade formula',
    in_stock: true,
    stock_count: 1
  }
];

// Enhanced promotions with proper linking data
const promotions = [
  {
    id: 'flash-sale-detergents',
    title: 'Flash Sale - 50% Off Selected Detergents',
    description: 'Limited time offer on premium cleaning chemicals and detergents',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=300&fit=crop',
    badge: 'Ends in 2 hours',
    timeLeft: '2:00:00',
    urgent: true,
    filter_params: {
      promotion: 'flash-sale-detergents',
      category: 'Detergents'
    },
    expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    discount_percentage: 50,
    applicable_categories: ['Detergents']
  },
  {
    id: 'buy-3-get-1-equipment',
    title: 'Buy 3 Get 1 Free - Cleaning Equipment',
    description: 'Stock up on essential cleaning equipment and save big on bulk orders',
    image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=300&fit=crop',
    badge: 'Popular Deal',
    urgent: false,
    filter_params: {
      promotion: 'buy-3-get-1-equipment',
      category: 'Equipment'
    },
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    discount_type: 'buy_x_get_y',
    buy_quantity: 3,
    get_quantity: 1,
    applicable_categories: ['Equipment']
  },
];

// Updated categories to focus only on cleaning supplies
const categories = [
  { 
    name: 'Equipment', 
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop', 
    count: 45,
    description: 'Professional cleaning machines and tools'
  },
  { 
    name: 'Detergents', 
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=200&fit=crop', 
    count: 67,
    description: 'Industrial-strength cleaning chemicals'
  },
  { 
    name: 'Supplies', 
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300&h=200&fit=crop', 
    count: 89,
    description: 'Essential cleaning accessories and consumables'
  }
];

export default function Home() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [realFeaturedProducts, setRealFeaturedProducts] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-8880f2f2`;
        console.log('Testing server health at:', `${serverUrl}/health`);
        
        const response = await fetch(`${serverUrl}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Server health check successful:', result);
          setServerStatus('online');
        } else {
          console.error('Server health check failed:', response.status);
          setServerStatus('offline');
          setErrorDetails(`Server responded with ${response.status}: ${await response.text()}`);
        }
      } catch (error) {
        console.error('Server connection failed:', error);
        setServerStatus('offline');
        setErrorDetails(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    checkServerStatus();
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setFeaturedLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      
      // Transform the data to match the expected format
      const transformedProducts = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand || 'Best Brightness',
        price: product.price,
        original_price: product.compare_at_price,
        discount: product.compare_at_price ? 
          Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100) : 
          null,
        category: product.categories?.name || 'General',
        image_url: product.images?.[0] || '/api/placeholder/400/400',
        rating: 4.5, // You can add a reviews table later
        reviews: Math.floor(Math.random() * 200) + 50, // Placeholder
        featured: true,
        description: product.short_description || product.description || 'High-quality cleaning product',
        in_stock: product.stock_quantity > 0,
        stock_count: product.stock_quantity,
        promotion_badge: product.compare_at_price ? 
          `${Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF` : 
          null
      }));

      setRealFeaturedProducts(transformedProducts);
    } catch (err) {
      console.error('Failed to fetch featured products:', err);
      // Fallback to original hardcoded products if database fetch fails
      setRealFeaturedProducts([]);
    } finally {
      setFeaturedLoading(false);
    }
  };

  // Filter active promotions (not expired)
  const activePromotions = promotions.filter(promo => 
    new Date(promo.expires_at) > new Date()
  );

  // Helper function to build promotion URL
  const buildPromotionUrl = (promotion: any) => {
    const params = new URLSearchParams();
    Object.entries(promotion.filter_params).forEach(([key, value]) => {
      params.append(key, value as string);
    });
    return `/products?${params.toString()}`;
  };

  // Helper function to build "View All Promotions" URL
  const buildViewAllPromotionsUrl = () => {
    const params = new URLSearchParams();
    // Add all active promotion IDs
    activePromotions.forEach(promo => {
      params.append('promotion', promo.id);
    });
    params.append('on_sale', 'true'); // Show all discounted items
    return `/products?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Server Status Diagnostic Banner */}
      {serverStatus !== 'online' && (
        <div className={`w-full p-4 text-center text-sm ${
          serverStatus === 'checking' 
            ? 'bg-blue-50 text-blue-800 border-b border-blue-200' 
            : 'bg-red-50 text-red-800 border-b border-red-200'
        }`}>
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            {serverStatus === 'checking' ? (
              <span>Checking server connection...</span>
            ) : (
              <div className="text-left">
                <div>⚠️ Server Connection Issue: Some features may be limited in demo mode</div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs opacity-70">Click for technical details</summary>
                  <div className="mt-1 text-xs font-mono bg-red-100 p-2 rounded border">
                    <div>Project ID: {projectId}</div>
                    <div>Server URL: https://{projectId}.supabase.co/functions/v1/make-server-8880f2f2</div>
                    <div>Error: {errorDetails}</div>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#87CEEB] via-[#B0E0E6] to-[#87CEEB] overflow-hidden">
        {/* Floating bubbles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-6 h-6 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>
       
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <Sparkles className="h-8 w-8 text-white mr-3" />
                <span className="text-white/90 font-medium">Professional Grade Quality</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#2C3E50] leading-tight">
                Premium Cleaning Supplies for Every Need
              </h1>
              <p className="text-xl mb-8 text-[#2C3E50]/80 max-w-xl">
                Discover our comprehensive range of professional-grade cleaning equipment, 
                industrial detergents, and essential supplies. Quality guaranteed, competitive prices, fast delivery across Durban.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="bg-[#4682B4] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#2C3E50] transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/products"
                  className="border-2 border-[#4682B4] text-[#4682B4] px-8 py-4 rounded-xl font-semibold hover:bg-[#4682B4] hover:text-white transition-all duration-300 inline-flex items-center justify-center"
                >
                  View Catalog
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop"
                  alt="Professional cleaning supplies arrangement"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.8 }}
                className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold text-[#2C3E50]">4.9/5</span>
                  <span className="text-gray-600 text-sm">2,500+ reviews</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On orders over R500', color: 'from-[#87CEEB] to-[#B0E0E6]' },
              { icon: CheckCircle, title: 'Quality Guarantee', desc: '100% satisfaction guaranteed', color: 'from-[#28A745] to-[#20c997]' },
              { icon: Headphones, title: '24/7 Support', desc: 'Expert help when you need it', color: 'from-[#4682B4] to-[#2C3E50]' },
              { icon: Gift, title: 'Loyalty Rewards', desc: 'Earn points on every purchase', color: 'from-[#FF6B35] to-[#fd7e14]' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`bg-gradient-to-br ${item.color} rounded-2xl p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <item.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-[#2C3E50]">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Deals & Promotions Section */}
      <PromotionsSection />

      {/* Featured Products */}
      <section className="py-16 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-[#2C3E50] mb-2">Featured Products</h2>
              <p className="text-gray-600">Our most popular cleaning supplies and equipment</p>
            </div>
            <Link to="/products" className="text-[#4682B4] hover:text-[#2C3E50] font-medium flex items-center group">
              View All Products
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
         
          {/* Grid with equal height cards */}
          {featuredLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="bg-gray-300 h-4 rounded mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-300 h-4 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {(realFeaturedProducts.length > 0 ? realFeaturedProducts : featuredProducts).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full" // Ensure full height
                >
                  <ProductCard 
                    product={product} 
                    featured 
                    className="h-full flex flex-col" // Force equal height with flexbox
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#2C3E50] mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find exactly what you need across our three main categories of professional cleaning solutions
            </p>
          </motion.div>
         
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group block transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow relative">
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={category.image}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#87CEEB]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-xl font-semibold text-[#2C3E50] mb-2 group-hover:text-[#4682B4] transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <p className="text-xs text-gray-500 bg-[#F8F9FA] px-3 py-1 rounded-full inline-block">
                        {category.count} products
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#87CEEB] via-[#B0E0E6] to-[#4682B4] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white rounded-full"></div>
        </div>
       
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6 text-[#2C3E50]">Ready to Get Started?</h2>
          <p className="text-xl mb-10 text-[#2C3E50]/80 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Durban who trust Best Brightness for their cleaning needs.
            Experience the difference professional-grade supplies make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-[#4682B4] px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 inline-flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Create Account
              <Gift className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/products"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#4682B4] transition-all duration-300 inline-flex items-center justify-center"
            >
              Browse Products
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
         
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">2,500+ Happy Customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-sm">4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span className="text-sm">Fast Durban Delivery</span>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// Promotions Section Component with real database integration
const PromotionsSection: React.FC = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select(`
          *,
          promotion_products (
            product_id
          )
        `)
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPromotions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) return null;

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const formatDiscount = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}% OFF`;
      case 'fixed':
        return `R${value} OFF`;
      case 'bogo':
        return 'BUY 1 GET 1';
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return 'SPECIAL OFFER';
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#E74C3C] to-[#C0392B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white mt-4">Loading hot deals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-[#E74C3C] to-[#C0392B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-white mx-auto mb-4" />
            <p className="text-white">Unable to load promotions at this time</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-red-100">
      {/* Modern geometric background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23E74C3C' fill-opacity='0.05'%3E%3Cpath d='M0 0h40v40H0z'/%3E%3Cpath d='M0 0l40 40M40 0L0 40' stroke='%23E74C3C' stroke-width='0.5' stroke-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with consistent font styling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center space-x-2 mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            <Zap className="h-5 w-5 animate-pulse" />
            <span className="tracking-wide">HOT DEALS</span>
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            🔥 Hot Deals & Promotions
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Limited time offers on your favorite cleaning supplies
          </p>
        </motion.div>

        {promotions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center bg-white rounded-2xl p-12 shadow-xl border border-gray-200"
          >
            <Gift className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Promotions</h3>
            <p className="text-gray-600 text-lg">Check back soon for amazing deals on cleaning supplies!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promotion, index) => {
              const timeRemaining = getTimeRemaining(promotion.end_date);
              
              return (
                <motion.div
                  key={promotion.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  {/* Promotion header with gradient */}
                  <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-600 p-6">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                    
                    <div className="relative flex items-start justify-between mb-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {promotion.code || 'SPECIAL OFFER'}
                      </span>
                      
                      {timeRemaining && (
                        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
                          <div className="flex items-center space-x-1 text-white text-sm">
                            <Clock className="h-4 w-4" />
                            <span className="font-mono font-bold">
                              {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:scale-105 transition-transform leading-tight">
                      {promotion.name}
                    </h3>
                    
                    <div className="text-4xl font-black text-white drop-shadow-lg">
                      {formatDiscount(promotion.type, promotion.value)}
                    </div>
                  </div>
                  
                  {/* Promotion content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {promotion.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>Limited time</span>
                      </div>
                      
                      <Link
                        to="/products"
                        className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl group/btn"
                      >
                        <span>Shop Now</span>
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Call to action */}
        {promotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-gray-800 hover:to-gray-600 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};