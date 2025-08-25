import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Plus, Minus, ShoppingCart, Heart, Share2, ArrowLeft, Shield, Truck, RotateCcw, Package, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useFavourites } from '../../contexts/FavouritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner@2.0.3';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToFavourites, removeFromFavourites, isFavourite } = useFavourites();
  const { user } = useAuth();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [favouriteLoading, setFavouriteLoading] = useState(false);

  // Mock product data based on ID - cleaning supplies only
  const getProductById = (productId: string) => {
    const products = {
      '1': {
        id: '1',
        name: 'Professional Vacuum Cleaner',
        brand: 'VacuumPro',
        price: 299.99,
        original_price: 349.99,
        rating: 4.8,
        reviews_count: 124,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=600&fit=crop',
        ],
        description: 'High-power commercial vacuum with HEPA filtration and multiple attachments. Perfect for cleaning large areas with superior suction power and advanced filtration system.',
        features: [
          'HEPA filtration system',
          'Multiple cleaning attachments',
          'Commercial-grade motor',
          'Large capacity dust bag',
          'Lightweight design',
          '10-meter power cord',
        ],
        specifications: {
          'Power': '1200W',
          'Capacity': '15L',
          'Weight': '6.5kg',
          'Cord Length': '10m',
          'Filtration': 'HEPA + Pre-filter',
          'Warranty': '2 Years',
        },
        sku: 'VCP-001',
        barcode: '1234567890123',
        category: 'Equipment',
        in_stock: true,
        stock_count: 7,
        promotion_badge: '14% OFF',
        promotion_discount: 50.00,
      },
      '2': {
        id: '2',
        name: 'Industrial Floor Scrubber',
        brand: 'FloorMaster',
        price: 189.99,
        rating: 4.7,
        reviews_count: 89,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop',
        ],
        description: 'Commercial-grade floor scrubber with rotating brushes for deep cleaning. Ideal for maintaining commercial and industrial floors.',
        features: [
          'Rotating brush system',
          'Adjustable cleaning pressure',
          'Commercial-grade construction',
          'Easy maneuverability',
          'Multiple brush attachments',
          'Ergonomic handle design',
        ],
        specifications: {
          'Brush Width': '35cm',
          'Brush Speed': '180 RPM',
          'Weight': '8.2kg',
          'Handle Length': 'Adjustable 120-140cm',
          'Material': 'Stainless Steel',
          'Warranty': '3 Years',
        },
        sku: 'IFS-002',
        barcode: '2345678901234',
        category: 'Equipment',
        in_stock: true,
        stock_count: 3,
      },
      '4': {
        id: '4',
        name: 'Professional All-Purpose Cleaner 5L',
        brand: 'CleanPro',
        price: 24.99,
        original_price: 29.99,
        rating: 4.8,
        reviews_count: 156,
        image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=600&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=600&fit=crop',
        ],
        description: 'Heavy-duty all-purpose cleaner suitable for all surfaces including countertops, walls, and equipment. Professional grade formula that cuts through grease, grime, and dirt.',
        features: [
          'Professional grade formula',
          'Safe on all surfaces',
          'Cuts through grease and grime',
          'Concentrated formula - dilutes up to 1:10',
          'Biodegradable ingredients',
          'Pleasant citrus scent',
        ],
        specifications: {
          'Volume': '5 Litres',
          'Type': 'All-Purpose Cleaner',
          'pH Level': '7.2 (Neutral)',
          'Dilution Ratio': '1:10',
          'Fragrance': 'Citrus',
          'Ingredients': 'Biodegradable surfactants, citrus extracts',
        },
        sku: 'APC-004',
        barcode: '3456789012345',
        category: 'Detergents',
        in_stock: true,
        stock_count: 45,
        promotion_badge: '17% OFF',
        promotion_discount: 5.00,
      },
      '5': {
        id: '5',
        name: 'Heavy Duty Degreaser',
        brand: 'PowerClean',
        price: 34.99,
        original_price: 42.99,
        rating: 4.6,
        reviews_count: 89,
        image_url: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&h=600&fit=crop',
        ],
        description: 'Industrial strength degreaser for kitchen hoods, engines, and heavy machinery. Powerful formula removes even the toughest grease and oil stains.',
        features: [
          'Industrial strength formula',
          'Removes tough grease and oil',
          'Safe for multiple surfaces',
          'Fast-acting formula',
          'Professional grade',
          'Concentrated solution',
        ],
        specifications: {
          'Volume': '2 Litres',
          'Type': 'Heavy Duty Degreaser',
          'pH Level': '11.5 (Alkaline)',
          'Dilution Ratio': '1:5',
          'Application': 'Kitchen hoods, engines, machinery',
          'Active Ingredients': 'Alkaline degreasers, surfactants',
        },
        sku: 'HDD-005',
        barcode: '4567890123456',
        category: 'Detergents',
        in_stock: false,
        stock_count: 0,
        promotion_badge: '19% OFF',
        promotion_discount: 8.00,
      },
    };

    return products[productId] || products['4']; // Default to all-purpose cleaner
  };

  const product = getProductById(id || '4');
  const isProductFavourite = isFavourite(product.id);

  // Get stock status helper function
  const getStockStatus = (stockCount: number) => {
    if (stockCount === 0) {
      return { 
        status: 'out-of-stock', 
        message: 'Out of Stock', 
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: AlertTriangle,
        urgent: false
      };
    } else if (stockCount <= 3) {
      return { 
        status: 'urgent', 
        message: `Only ${stockCount} left in stock!`, 
        color: 'text-orange-600 bg-orange-50 border-orange-200 animate-pulse',
        icon: AlertTriangle,
        urgent: true
      };
    } else if (stockCount <= 10) {
      return { 
        status: 'low', 
        message: `${stockCount} units in stock - running low`, 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: Package,
        urgent: false
      };
    } else {
      return { 
        status: 'good', 
        message: `${stockCount} units in stock`, 
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: CheckCircle,
        urgent: false
      };
    }
  };

  const stockInfo = getStockStatus(product.stock_count);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        sku: product.sku,
        in_stock: product.in_stock,
        stock_count: product.stock_count,
        brand: product.brand,
        category: product.category,
      }, quantity);
      
      toast.success(`Added ${quantity} ${product.name} to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavourite = async () => {
    if (!user) {
      // Allow guest favourites
    }
    
    try {
      setFavouriteLoading(true);
      if (isProductFavourite) {
        await removeFromFavourites(product.id);
        toast.success('Removed from favourites');
      } else {
        await addToFavourites({
          ...product,
          product_id: product.id,
          reviews_count: product.reviews_count
        });
        toast.success('Added to favourites!');
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
      toast.error('Failed to update favourites. Please try again.');
    } finally {
      setFavouriteLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = Math.min(10, product.stock_count);
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-[#4682B4] text-white px-4 py-2 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 mb-6 font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </button>
          <nav className="text-sm text-[#2C3E50]/60 font-medium">
            <span 
              className="hover:text-[#4682B4] cursor-pointer"
              onClick={() => navigate('/')}
            >
              Home
            </span> 
            <span className="mx-2">→</span> 
            <span 
              className="hover:text-[#4682B4] cursor-pointer"
              onClick={() => navigate('/products')}
            >
              {product.category}
            </span> 
            <span className="mx-2">→</span> 
            <span className="text-[#2C3E50] font-bold">{product.name}</span>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-6 shadow-xl border border-gray-100 relative">
              {product.promotion_badge && (
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg">
                  {product.promotion_badge}
                </div>
              )}
              {stockInfo.urgent && (
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg animate-pulse">
                  URGENT
                </div>
              )}
              <ImageWithFallback
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex space-x-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-1 aspect-square bg-white rounded-xl overflow-hidden border-3 transition-all duration-300 shadow-lg hover:shadow-xl ${
                    selectedImage === index 
                      ? 'border-[#4682B4] ring-2 ring-[#4682B4]/30 transform scale-105' 
                      : 'border-gray-200 hover:border-[#4682B4]/50'
                  }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="text-lg text-[#2C3E50]/60 font-medium mb-2">{product.brand}</p>
              )}
              <h1 className="text-4xl font-bold text-[#2C3E50] mb-4 leading-tight">{product.name}</h1>
              
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-3 text-[#2C3E50]/70 font-medium">
                  {product.rating} ({product.reviews_count} reviews)
                </span>
              </div>
            </div>

            {/* Stock Status - Prominent Display */}
            <div className={`border-2 rounded-2xl p-4 ${stockInfo.color}`}>
              <div className="flex items-center">
                <stockInfo.icon className="h-6 w-6 mr-3" />
                <div>
                  <span className="font-bold text-lg">{stockInfo.message}</span>
                  {stockInfo.urgent && (
                    <p className="text-sm mt-1 font-medium">
                      ⚡ High demand item - order now to secure your unit!
                    </p>
                  )}
                  {stockInfo.status === 'low' && (
                    <p className="text-sm mt-1 font-medium">
                      📦 Limited stock available - order soon!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-[#4682B4]/10 to-[#2C3E50]/10 rounded-2xl p-6 border border-[#4682B4]/20">
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-4xl font-bold text-[#2C3E50]">R{product.price}</span>
                {product.original_price && (
                  <span className="text-2xl text-[#2C3E50]/50 line-through">R{product.original_price}</span>
                )}
                {product.promotion_discount && (
                  <span className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-sm font-bold border border-green-200">
                    Save R{product.promotion_discount.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#2C3E50]/60 font-medium">Inclusive of VAT</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <p className="text-[#2C3E50]/80 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 space-y-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="p-3 hover:bg-[#4682B4] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="px-6 py-3 font-bold text-lg text-[#2C3E50] bg-gray-50">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="p-3 hover:bg-[#4682B4] hover:text-white transition-all duration-300 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-current"
                    disabled={quantity >= Math.min(10, product.stock_count)}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <span className="text-sm text-[#2C3E50]/60 font-medium">
                  Maximum {Math.min(10, product.stock_count)} per order
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || loading}
                  className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center transform hover:-translate-y-1 ${
                    !product.in_stock
                      ? 'bg-gray-300 text-gray-500'
                      : stockInfo.urgent
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 animate-pulse shadow-2xl'
                      : 'bg-gradient-to-r from-[#4682B4] to-[#2C3E50] text-white hover:shadow-2xl'
                  }`}
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <>
                      <ShoppingCart className="h-6 w-6 mr-3" />
                      {!product.in_stock 
                        ? 'Out of Stock' 
                        : stockInfo.urgent 
                        ? 'Buy Now!' 
                        : 'Add to Cart'
                      }
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleToggleFavourite}
                  disabled={favouriteLoading}
                  className={`p-4 border-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    isProductFavourite 
                      ? 'border-red-300 bg-red-50 text-red-600' 
                      : 'border-gray-300 hover:border-[#4682B4] hover:bg-[#4682B4]/5'
                  }`}
                  title={isProductFavourite ? "Remove from favourites" : "Add to favourites"}
                >
                  {favouriteLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Heart className={`h-6 w-6 ${isProductFavourite ? 'fill-current' : ''}`} />
                  )}
                </button>
                
                <button 
                  onClick={handleShare}
                  className="p-4 border-2 border-gray-300 rounded-xl hover:border-[#4682B4] hover:bg-[#4682B4]/5 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-bold text-[#2C3E50]">SKU:</span>
                  <span className="text-[#2C3E50]/70 font-medium">{product.sku}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-bold text-[#2C3E50]">Barcode:</span>
                  <span className="text-[#2C3E50]/70 font-medium">{product.barcode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features, Specifications, and Guarantees */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Features */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-[#4682B4] rounded-xl p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Key Features</h3>
            </div>
            <ul className="space-y-4">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-green-100 rounded-full p-1 mr-3 mt-1">
                    <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[#2C3E50]/80 font-medium leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-[#4682B4] rounded-xl p-3 mr-4">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Specifications</h3>
            </div>
            <dl className="space-y-4">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <dt className="font-bold text-[#2C3E50]">{key}:</dt>
                  <dd className="text-[#2C3E50]/70 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Guarantees */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-[#4682B4] rounded-xl p-3 mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C3E50]">Guarantees</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="bg-blue-600 rounded-xl p-2 mr-4">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-[#2C3E50] font-semibold">Quality Guarantee</span>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="bg-green-600 rounded-xl p-2 mr-4">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <span className="text-[#2C3E50] font-semibold">Free Delivery over R500</span>
              </div>
              <div className="flex items-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div className="bg-purple-600 rounded-xl p-2 mr-4">
                  <RotateCcw className="h-5 w-5 text-white" />
                </div>
                <span className="text-[#2C3E50] font-semibold">30-Day Return Policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}