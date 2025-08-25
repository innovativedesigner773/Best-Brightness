import React, { useState, useEffect } from 'react';
import { Plus, Package, Scan, Search, Filter, Edit, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarcodeScanner } from './BarcodeScanner';
import { QuickStartGuide } from './QuickStartGuide';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  barcode: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  reorder_level: number;
  image_url: string;
  sku: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8880f2f2/products`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      const productList = data.products || [];
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
      // Try multiple methods to get the auth token
      let accessToken: string | null = null;
      
      // Method 1: Try the Supabase client session
      try {
        const { createClient } = await import('../utils/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token || null;
      } catch {
        // If that fails, try localStorage
        try {
          const authData = JSON.parse(localStorage.getItem('sb-' + projectId.replace(/[^a-zA-Z0-9]/g, '')) + '-auth-token' || '{}');
          accessToken = authData.access_token;
        } catch {
          // Use public anon key as fallback (though this may not work for protected endpoints)
          accessToken = publicAnonKey;
        }
      }

      if (!accessToken) {
        throw new Error('Authentication required. Please log in.');
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8880f2f2/barcode/add-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(scannedProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      const data = await response.json();
      
      // Refresh products list
      await fetchProducts();
      
      console.log('Product added successfully:', data.product);
      setError(null);
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error instanceof Error ? error.message : 'Failed to add product. Please try again.');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))];

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (product.stock_quantity <= product.reorder_level) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
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
          <Button variant="outline">
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
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const stockStatus = getStockStatus(product);
          
          return (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <ImageWithFallback
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-sm leading-tight">{product.name}</h3>
                      <Badge {...stockStatus}>{stockStatus.label}</Badge>
                    </div>
                    
                    {product.brand && (
                      <Badge variant="outline" className="text-xs">{product.brand}</Badge>
                    )}
                    
                    <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Price:</span> ${product.price.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-medium">Stock:</span> {product.stock_quantity}
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span> {product.sku}
                      </div>
                      <div>
                        <span className="font-medium">Barcode:</span> {product.barcode}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}