import React, { useState, useEffect } from 'react';
import { Plus, Package, Scan, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarcodeScanner } from './BarcodeScanner';
import { QuickStartGuide } from './QuickStartGuide';
import { ImageWithFallback } from './figma/ImageWithFallback';
import ProductCard from './common/ProductCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  sku: string;
  barcode: string;
  category_id: string;
  price: number;
  cost_price: number;
  compare_at_price?: number;
  currency: string;
  images: string[];
  specifications?: any;
  features?: string[];
  tags?: any;
  weight_kg?: number;
  dimensions?: any;
  stock_quantity?: number;
  is_active: boolean;
  is_featured: boolean;
  stock_tracking: boolean;
  requires_shipping: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Manual add form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    sku: '',
    barcode: '',
    category_id: '',
    price: '',
    cost_price: '',
    compare_at_price: '',
    images: [''],
    features: [''],
    weight_kg: '',
    stock_quantity: '',
    is_featured: false,
    stock_tracking: true,
    requires_shipping: true,
  });
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      console.log('📂 Fetching categories...');
      
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        console.error('❌ Error fetching categories:', categoriesError);
        return;
      }

      console.log('✅ Categories fetched:', categoriesData);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('❌ Unexpected error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching products from Supabase...');
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('❌ Error fetching products:', productsError);
        throw new Error(`Failed to fetch products: ${productsError.message}`);
      }

      console.log('✅ Products fetched:', productsData);
      const productList = productsData || [];
      setProducts(productList);
      setShowQuickStart(productList.length === 0);
      setError(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductScanned = async (scannedProduct: any) => {
    try {
      console.log('📦 Adding scanned product:', scannedProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: scannedProduct.name || 'Unknown Product',
          slug: (scannedProduct.name || 'unknown-product').toLowerCase().replace(/\s+/g, '-'),
          description: scannedProduct.description || 'Product added via barcode scan',
          short_description: scannedProduct.short_description || scannedProduct.name,
          sku: scannedProduct.sku || `SCAN-${Date.now()}`,
          barcode: scannedProduct.barcode,
          category_id: categories[0]?.id || null, // Use first category as default
          price: scannedProduct.price || 0,
          cost_price: scannedProduct.cost_price || 0,
          currency: 'USD',
          images: scannedProduct.images || [],
          is_active: true,
          is_featured: false,
          stock_tracking: true,
          requires_shipping: true,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Product added successfully:', data);
      fetchProducts(); // Refresh the list
      setError(null);
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error instanceof Error ? error.message : 'Failed to add product. Please try again.');
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log('📦 Adding manual product:', formData);

      // Generate slug from name
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

      // Clean up arrays (remove empty strings)
      const cleanImages = formData.images.filter(img => img.trim() !== '');
      const cleanFeatures = formData.features.filter(feature => feature.trim() !== '');

      const productData = {
        name: formData.name,
        slug,
        description: formData.description,
        short_description: formData.short_description || formData.name,
        sku: formData.sku || `MANUAL-${Date.now()}`,
        barcode: formData.barcode.trim() || null, // Set to null if empty to avoid unique constraint issues
        category_id: formData.category_id || null,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        currency: 'USD',
        images: cleanImages,
        features: cleanFeatures,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : 0,
        is_active: true,
        is_featured: formData.is_featured,
        stock_tracking: formData.stock_tracking,
        requires_shipping: formData.requires_shipping,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Manual product added successfully:', data);
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        short_description: '',
        sku: '',
        barcode: '',
        category_id: '',
        price: '',
        cost_price: '',
        compare_at_price: '',
        images: [''],
        features: [''],
        weight_kg: '',
        stock_quantity: '',
        is_featured: false,
        stock_tracking: true,
        requires_shipping: true,
      });
      setShowManualAdd(false);
      fetchProducts(); // Refresh the list
      setError(null);
    } catch (error) {
      console.error('Error adding manual product:', error);
      
      // Better error messages for common issues
      let errorMessage = 'Failed to add product. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('barcode')) {
          errorMessage = 'This barcode already exists. Please use a different barcode or leave it empty.';
        } else if (error.message.includes('sku')) {
          errorMessage = 'This SKU already exists. Please use a different SKU or leave it empty for auto-generation.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'A product with this information already exists. Please check your input.';
        } else {
          errorMessage = error.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    // Safety check: ensure product exists and has required properties
    if (!product || typeof product !== 'object') {
      return false;
    }

    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.sku?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (product.barcode || '').includes(searchTerm);
    
    const matchesCategory = selectedCategory === '' || product.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Convert database product to ProductCard format
  const convertToProductCardFormat = (product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    original_price: product.compare_at_price || undefined,
    category: categories.find(c => c.id === product.category_id)?.name,
    image_url: product.images?.[0],
    featured: product.is_featured,
    description: product.description,
    in_stock: product.is_active && (product.stock_quantity || 0) > 0,
    stock_count: product.stock_quantity || 0,
    sku: product.sku,
  });

  const getStockStatus = (product: Product) => {
    const stockCount = product.stock_quantity || 0;
    if (stockCount === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const };
    } else if (stockCount <= 5) {
      return { label: `${stockCount} left`, variant: 'secondary' as const };
    } else {
      return { label: 'In Stock', variant: 'default' as const };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Package className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your inventory and add new products</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowScanner(true)} className="bg-blue-600 hover:bg-blue-700">
            <Scan className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button variant="outline" onClick={() => setShowManualAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Manual Add
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products by name, brand, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => {
          const productCardData = convertToProductCardFormat(product);
          
          return (
            <div key={product.id} className="relative">
              <ProductCard 
                product={productCardData}
                className="h-full"
              />
              {/* Admin Actions Overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Add edit functionality
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Add delete functionality
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Start Guide */}
      {showQuickStart && !loading && (
        <QuickStartGuide onDatabaseInitialized={() => {
          setShowQuickStart(false);
          fetchProducts();
        }} />
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && !showQuickStart && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory 
                ? 'No products match your current filters.'
                : 'Get started by scanning a barcode or adding products manually.'
              }
            </p>
            <Button onClick={() => setShowScanner(true)} className="bg-blue-600 hover:bg-blue-700">
              <Scan className="h-4 w-4 mr-2" />
              Scan Your First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onProductScanned={handleProductScanned}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Manual Add Product Modal */}
      {showManualAdd && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-md backdrop-filter"></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add New Product</h2>
                <button
                  onClick={() => setShowManualAdd(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU
                    </label>
                    <Input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      placeholder="Leave empty for auto-generation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Barcode
                    </label>
                    <Input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      placeholder="Product barcode"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description
                  </label>
                  <Input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    placeholder="Brief product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed product description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price * ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({...formData, cost_price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compare At Price ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.compare_at_price}
                      onChange={(e) => setFormData({...formData, compare_at_price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images
                  </label>
                  <div className="space-y-3">
                    {/* Image Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload images or add URLs</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(file => {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  const newImages = [...formData.images.filter(img => img), event.target?.result as string];
                                  setFormData({...formData, images: newImages});
                                };
                                reader.readAsDataURL(file);
                              });
                            }}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="cursor-pointer bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                          >
                            Choose Files
                          </label>
                          <span className="text-gray-400 text-sm self-center">or</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newImages = [...formData.images, ''];
                              setFormData({...formData, images: newImages});
                            }}
                          >
                            Add URL
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Image URLs List */}
                    {formData.images.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            value={image}
                            onChange={(e) => {
                              const newImages = [...formData.images];
                              newImages[index] = e.target.value;
                              setFormData({...formData, images: newImages});
                            }}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newImages = formData.images.filter((_, i) => i !== index);
                              setFormData({...formData, images: newImages});
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                        {/* Image Preview */}
                        {image && (
                          <div className="mt-2">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-md border"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {formData.images.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No images added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Features
                  </label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...formData.features];
                          newFeatures[index] = e.target.value;
                          setFormData({...formData, features: newFeatures});
                        }}
                        placeholder="Enter product feature"
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newFeatures = formData.features.filter((_, i) => i !== index);
                            setFormData({...formData, features: newFeatures});
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({...formData, features: [...formData.features, '']})}
                  >
                    Add Another Feature
                  </Button>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.weight_kg}
                      onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Featured Product</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.stock_tracking}
                      onChange={(e) => setFormData({...formData, stock_tracking: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Track Stock</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.requires_shipping}
                      onChange={(e) => setFormData({...formData, requires_shipping: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Requires Shipping</span>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowManualAdd(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.name || !formData.price}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}