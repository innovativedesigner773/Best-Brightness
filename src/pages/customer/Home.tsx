import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, CheckCircle, Headphones, Gift, Star, Sparkles, AlertCircle, Clock, Zap, Users } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import ProductCard from '../../components/common/ProductCard';
import { supabase } from '../../lib/supabase';
import { projectId } from '../../utils/supabase/info';
import { motion } from 'framer-motion';


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

// Add this helper function before HeroSlide component
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

// Also add this helper function that was referenced but not defined
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

// Add this helper function before the Home component
const HeroSlide: React.FC<{ promotion?: any }> = ({ promotion }) => {
  if (!promotion) {
    return (
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
    );
  }

  // Promotion slide
  const timeRemaining = getTimeRemaining(promotion.end_date);
  
  // Add this helper function inside HeroSlide
  const buildPromotionUrl = (promotion: any) => {
    const params = new URLSearchParams();
    if (promotion.filter_params) {
      Object.entries(promotion.filter_params).forEach(([key, value]) => {
        params.append(key, value as string);
      });
    }
    return `/products?${params.toString()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center lg:text-left"
      >
        <div className="flex items-center justify-center lg:justify-start mb-4">
          <Zap className="h-8 w-8 text-white mr-3" />
          <span className="text-white/90 font-medium">Hot Deal</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#2C3E50] leading-tight">
          {promotion.name}
        </h1>
        <div className="text-3xl font-black text-[#E74C3C] mb-4">
          {formatDiscount(promotion.type, promotion.value)}
        </div>
        <p className="text-xl mb-8 text-[#2C3E50]/80 max-w-xl">
          {promotion.description}
        </p>
        {timeRemaining && (
          <div className="mb-8 inline-flex items-center bg-[#2C3E50]/10 rounded-lg px-4 py-2">
            <Clock className="h-5 w-5 mr-2 text-[#2C3E50]" />
            <span className="font-mono font-bold text-[#2C3E50]">
              {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
            </span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Link
            to={buildPromotionUrl(promotion)}
            className="bg-[#E74C3C] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#C0392B] transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Shop Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            to={buildPromotionUrl(promotion)}
            className="border-2 border-[#E74C3C] text-[#E74C3C] px-8 py-4 rounded-xl font-semibold hover:bg-[#E74C3C] hover:text-white transition-all duration-300 inline-flex items-center justify-center"
          >
            View Details
          </Link>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <Link to={buildPromotionUrl(promotion)} className="block">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src={promotion.image_url || "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=300&fit=crop"}
              alt={promotion.name}
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default function Home() {
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [realFeaturedProducts, setRealFeaturedProducts] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activePromotions, setActivePromotions] = useState<any[]>([]);

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

  // Helper function to build promotion URL
  const buildPromotionUrl = (promotion: any) => {
    const params = new URLSearchParams();
    if (promotion.filter_params) {
      Object.entries(promotion.filter_params).forEach(([key, value]) => {
        params.append(key, value as string);
      });
    }
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

  // Add this useEffect for slide rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex(current => 
        current >= activePromotions.length ? 0 : current + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [activePromotions.length]);

  // Modify the useEffect that fetches promotions
  useEffect(() => {
    const fetchActivePromotions = async () => {
      try {
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .gte('end_date', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;
        setActivePromotions(data || []);
      } catch (err) {
        console.error('Failed to fetch promotions:', err);
        setActivePromotions([]);
      }
    };

    fetchActivePromotions();
  }, []);

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
      
      {/* Updated Hero Section with Promotions */}
      <section className="relative bg-gradient-to-br from-[#87CEEB] via-[#B0E0E6] to-[#87CEEB] overflow-hidden">
        {/* Floating bubbles animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-6 h-6 bg-white/15 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-white/25 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-white/10 rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>
       
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <HeroSlide promotion={currentSlideIndex === 0 ? null : activePromotions[currentSlideIndex - 1]} />
          
          {/* Slide indicators */}
          {activePromotions.length > 0 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <button
                onClick={() => setCurrentSlideIndex(0)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlideIndex === 0 ? 'bg-[#4682B4] w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
              />
              {activePromotions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index + 1)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlideIndex === index + 1 ? 'bg-[#4682B4] w-6' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
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
      {/* <PromotionsSection /> Removed as promotions are now in the hero section */}

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

// Remove the PromotionsSection component since it's now integrated into the hero