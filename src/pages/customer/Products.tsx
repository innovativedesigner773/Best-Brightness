import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Grid, List, Star, ShoppingCart, Percent, Package, AlertTriangle, X, Tag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductCard from '../../components/common/ProductCard';
import { toast } from 'sonner@2.0.3';

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  rating: number;
  reviews_count: number;
  promotion_badge?: string;
  promotion_discount?: number;
  in_stock: boolean;
  stock_count: number;
  category: string;
  sku: string;
  description?: string;
  brand?: string;
  promotion_id?: string;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  discount_type?: string;
  buy_quantity?: number;
  get_quantity?: number;
  applicable_categories: string[];
  expires_at: string;
  active: boolean;
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedPromotions, setSelectedPromotions] = useState<string[]>(
    searchParams.getAll('promotion') || []
  );
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(true);
  const [onlyOnSale, setOnlyOnSale] = useState(searchParams.get('on_sale') === 'true');

  // Mock promotions data
  const promotions: Promotion[] = [
    {
      id: 'flash-sale-detergents',
      title: 'Flash Sale - 50% Off Selected Detergents',
      description: 'Limited time offer on premium cleaning chemicals',
      discount_percentage: 50,
      applicable_categories: ['Detergents'],
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      active: true
    },
    {
      id: 'buy-3-get-1-equipment',
      title: 'Buy 3 Get 1 Free - Cleaning Equipment',
      description: 'Stock up on essential cleaning equipment',
      discount_type: 'buy_x_get_y',
      buy_quantity: 3,
      get_quantity: 1,
      applicable_categories: ['Equipment'],
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      active: true
    }
  ];

  // Mock data with stock levels - cleaning supplies only
  const mockProducts: Product[] = [
    // Equipment
    {
      id: '1',
      name: 'Professional Vacuum Cleaner',
      brand: 'VacuumPro',
      price: 299.99,
      original_price: 349.99,
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews_count: 124,
      promotion_badge: '14% OFF',
      promotion_discount: 50.00,
      in_stock: true,
      stock_count: 7,
      category: 'Equipment',
      sku: 'VCP-001',
      description: 'High-power commercial vacuum with HEPA filtration and multiple attachments',
      promotion_id: 'buy-3-get-1-equipment'
    },
    {
      id: '2',
      name: 'Industrial Floor Scrubber',
      brand: 'FloorMaster',
      price: 189.99,
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews_count: 89,
      in_stock: true,
      stock_count: 3,
      category: 'Equipment',
      sku: 'IFS-002',
      description: 'Commercial-grade floor scrubber with rotating brushes for deep cleaning',
      promotion_id: 'buy-3-get-1-equipment'
    },
    {
      id: '3',
      name: 'Professional Mop & Bucket Set',
      brand: 'CleanPro',
      price: 45.99,
      original_price: 55.99,
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop',
      rating: 4.9,
      reviews_count: 67,
      promotion_badge: '18% OFF',
      promotion_discount: 10.00,
      in_stock: true,
      stock_count: 23,
      category: 'Equipment',
      sku: 'MBS-003',
      description: 'Heavy-duty mop and bucket system with wringer for commercial use',
      promotion_id: 'buy-3-get-1-equipment'
    },

    // Detergents
    {
      id: '4',
      name: 'Professional All-Purpose Cleaner 5L',
      brand: 'CleanPro',
      price: 24.99,
      original_price: 29.99,
      image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews_count: 156,
      promotion_badge: '17% OFF',
      promotion_discount: 5.00,
      in_stock: true,
      stock_count: 45,
      category: 'Detergents',
      sku: 'APC-004',
      description: 'Heavy-duty all-purpose cleaner suitable for all surfaces',
      promotion_id: 'flash-sale-detergents'
    },
    {
      id: '5',
      name: 'Heavy Duty Degreaser',
      brand: 'PowerClean',
      price: 34.99,
      original_price: 42.99,
      image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews_count: 89,
      promotion_badge: '19% OFF',
      promotion_discount: 8.00,
      in_stock: false,
      stock_count: 0,
      category: 'Detergents',
      sku: 'HDD-005',
      description: 'Industrial strength degreaser for kitchen hoods, engines, and heavy machinery',
      promotion_id: 'flash-sale-detergents'
    },
    {
      id: '6',
      name: 'Glass & Window Cleaner 2L',
      brand: 'ClearView',
      price: 18.99,
      image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=400&fit=crop',
      rating: 4.7,
      reviews_count: 112,
      in_stock: true,
      stock_count: 8,
      category: 'Detergents',
      sku: 'GWC-006',
      description: 'Professional-grade window cleaning solution for commercial buildings'
    },
    {
      id: '7',
      name: 'Disinfectant Spray 4L',
      brand: 'SafeClean',
      price: 32.99,
      original_price: 39.99,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop',
      rating: 4.9,
      reviews_count: 201,
      promotion_badge: 'MEDICAL GRADE',
      promotion_discount: 7.00,
      in_stock: true,
      stock_count: 15,
      category: 'Detergents',
      sku: 'DS-007',
      description: 'EPA-approved hospital-grade disinfectant kills 99.9% of germs and viruses',
      promotion_id: 'flash-sale-detergents'
    },

    // Supplies
    {
      id: '8',
      name: 'Microfiber Cleaning Cloth Set',
      brand: 'SoftClean',
      price: 19.99,
      image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
      rating: 4.9,
      reviews_count: 312,
      in_stock: true,
      stock_count: 127,
      category: 'Supplies',
      sku: 'MCS-008',
      description: 'Pack of 12 premium microfiber cloths for streak-free cleaning on all surfaces'
    },
    {
      id: '9',
      name: 'Sanitizing Wipes Bulk Pack',
      brand: 'SafeClean',
      price: 45.99,
      image_url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
      rating: 4.8,
      reviews_count: 194,
      in_stock: true,
      stock_count: 1,
      category: 'Supplies',
      sku: 'SWB-009',
      description: 'Case of 12 packs of antibacterial sanitizing wipes, hospital-grade formula'
    },
    {
      id: '10',
      name: 'Industrial Paper Towels (12 Rolls)',
      brand: 'AbsorbMax',
      price: 34.99,
      original_price: 39.99,
      image_url: 'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=400&h=400&fit=crop',
      rating: 4.6,
      reviews_count: 98,
      promotion_badge: 'BULK DEAL',
      promotion_discount: 5.00,
      in_stock: true,
      stock_count: 42,
      category: 'Supplies',
      sku: 'IPT-010',
      description: 'Heavy-duty paper towels for industrial cleaning applications'
    }
  ];

  const categories = ['Equipment', 'Detergents', 'Supplies'];

  // Get active promotions (not expired)
  const activePromotions = promotions.filter(promo => 
    promo.active && new Date(promo.expires_at) > new Date()
  );

  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      setLoading(true);
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedPromotions.length > 0) {
      selectedPromotions.forEach(promo => params.append('promotion', promo));
    }
    if (onlyOnSale) params.set('on_sale', 'true');
    
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, selectedPromotions, onlyOnSale, setSearchParams]);

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    if (selectedPromotions.length > 0 && !selectedPromotions.includes(product.promotion_id || '')) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    if (onlyInStock && !product.in_stock) {
      return false;
    }
    if (onlyOnSale && !product.original_price) {
      return false;
    }
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'rating':
        return b.rating - a.rating;
      case 'stock':
        return b.stock_count - a.stock_count;
      default:
        return 0;
    }
  });

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handlePromotionToggle = (promotionId: string) => {
    setSelectedPromotions(prev => 
      prev.includes(promotionId) 
        ? prev.filter(id => id !== promotionId)
        : [...prev, promotionId]
    );
  };

  const removePromotionFilter = (promotionId: string) => {
    setSelectedPromotions(prev => prev.filter(id => id !== promotionId));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedPromotions([]);
    setPriceRange([0, 500]);
    setOnlyInStock(true);
    setOnlyOnSale(false);
    setSearchParams({});
  };

  // Get stock status helper function
  const getStockStatus = (stockCount: number) => {
    if (stockCount === 0) {
      return { status: 'out-of-stock', message: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    } else if (stockCount <= 3) {
      return { 
        status: 'urgent', 
        message: `Only ${stockCount} left!`, 
        color: 'text-orange-600 bg-orange-50 animate-pulse' 
      };
    } else if (stockCount <= 10) {
      return { 
        status: 'low', 
        message: `${stockCount} in stock`, 
        color: 'text-yellow-600 bg-yellow-50' 
      };
    } else {
      return { 
        status: 'good', 
        message: `${stockCount} in stock`, 
        color: 'text-green-600 bg-green-50' 
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-4">Professional Cleaning Supplies</h1>
          <p className="text-xl text-[#2C3E50]/80">
            Discover our comprehensive range of equipment, detergents, and supplies
          </p>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory || selectedPromotions.length > 0 || onlyOnSale) && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-800 mr-2">Active Filters:</span>
              
              {selectedCategory && (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>Category: {selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-2 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {selectedPromotions.map(promoId => {
                const promo = activePromotions.find(p => p.id === promoId);
                return promo ? (
                  <div key={promoId} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Tag className="h-3 w-3 mr-1" />
                    <span>{promo.title}</span>
                    <button
                      onClick={() => removePromotionFilter(promoId)}
                      className="ml-2 hover:text-green-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : null;
              })}

              {onlyOnSale && (
                <div className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  <Percent className="h-3 w-3 mr-1" />
                  <span>On Sale</span>
                  <button
                    onClick={() => setOnlyOnSale(false)}
                    className="ml-2 hover:text-orange-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium ml-2"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-[#F8F9FA] rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search cleaning supplies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent bg-white"
            >
              <option value="featured">Featured</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="stock">Stock Level</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-[#4682B4] text-white' : 'bg-white text-gray-600'} hover:bg-[#87CEEB]/20 transition-colors`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-[#4682B4] text-white' : 'bg-white text-gray-600'} hover:bg-[#87CEEB]/20 transition-colors`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-[#87CEEB]/20 transition-colors bg-white"
            >
              <Filter className="h-5 w-5 mr-2 text-[#4682B4]" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-2">
                    Price Range: R{priceRange[0]} - R{priceRange[1]}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="10"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-[#4682B4]"
                  />
                </div>

                {/* Promotion Filters */}
                <div>
                  <label className="block text-sm font-medium text-[#2C3E50] mb-3">
                    Active Promotions
                  </label>
                  <div className="space-y-2">
                    {activePromotions.map(promo => (
                      <label key={promo.id} className="flex items-center text-[#2C3E50] text-sm">
                        <input
                          type="checkbox"
                          checked={selectedPromotions.includes(promo.id)}
                          onChange={() => handlePromotionToggle(promo.id)}
                          className="mr-2 accent-[#4682B4]"
                        />
                        <Tag className="h-3 w-3 mr-1 text-[#4682B4]" />
                        {promo.title}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div className="space-y-4">
                  <label className="flex items-center text-[#2C3E50]">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="mr-2 accent-[#4682B4]"
                    />
                    In Stock Only
                  </label>
                  <label className="flex items-center text-[#2C3E50]">
                    <input
                      type="checkbox"
                      checked={onlyOnSale}
                      onChange={(e) => setOnlyOnSale(e.target.checked)}
                      className="mr-2 accent-[#4682B4]"
                    />
                    On Sale Only
                  </label>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-[#4682B4] hover:text-[#2C3E50] font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-gray-600">
            Showing {sortedProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                className="h-full flex flex-col"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedProducts.map((product) => {
              const stockInfo = getStockStatus(product.stock_count);
              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative w-full md:w-48 shrink-0">
                    <Link to={`/products/${product.id}`}>
                      <ImageWithFallback
                        src={product.image_url}
                        alt={product.name}
                        className="w-full md:w-48 h-48 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {product.promotion_badge && (
                      <div className="absolute top-3 left-3 bg-[#FF6B35] text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
                        <Percent className="h-3 w-3 mr-1" />
                        {product.promotion_badge}
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      {product.brand && (
                        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                      )}
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-xl font-semibold text-[#2C3E50] hover:text-[#4682B4] transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-gray-600 text-sm mt-2">{product.description}</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{product.rating}</span>
                        <span className="text-sm text-gray-500">({product.reviews_count} reviews)</span>
                      </div>
                      
                      {/* Stock Status */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${stockInfo.color}`}>
                        <Package className="h-3 w-3 mr-1" />
                        {stockInfo.message}
                        {stockInfo.status === 'urgent' && <AlertTriangle className="h-3 w-3 ml-1" />}
                      </div>

                      {/* Promotion Badge */}
                      {product.promotion_id && (
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-200 flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          Promotion
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-[#2C3E50]">R{product.price}</span>
                        {product.original_price && (
                          <span className="text-lg text-gray-500 line-through">R{product.original_price}</span>
                        )}
                      </div>
                      {product.promotion_discount && (
                        <span className="text-sm text-[#28A745] font-medium">
                          Save R{product.promotion_discount.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.in_stock}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center ${
                        !product.in_stock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : stockInfo.status === 'urgent'
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 animate-pulse'
                          : 'bg-[#4682B4] text-white hover:bg-[#2C3E50]'
                      } shadow-lg hover:shadow-xl transform hover:scale-105`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {!product.in_stock 
                        ? 'Out of Stock' 
                        : stockInfo.status === 'urgent' 
                        ? 'Buy Now!' 
                        : 'Add to Cart'
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🧽</div>
            <h3 className="text-xl font-semibold text-[#2C3E50] mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
            <button
              onClick={clearAllFilters}
              className="bg-[#4682B4] text-white px-6 py-3 rounded-xl hover:bg-[#2C3E50] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}