import React, { useState, useEffect } from 'react';
import { Plus, Tag, Edit, Trash2, Search, Filter, Calendar, Users, TrendingUp, Percent, Gift, Truck, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Promotion {
  id: string;
  name: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  usage_limit?: number;
  usage_limit_per_customer: number;
  current_usage_count: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  applies_to: 'all' | 'specific_products' | 'specific_categories';
  conditions: any;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

export function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  
  // Form data for creating/editing promotions
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping',
    value: '',
    minimum_order_amount: '',
    maximum_discount_amount: '',
    usage_limit: '',
    usage_limit_per_customer: '1',
    start_date: '',
    end_date: '',
    applies_to: 'all' as 'all' | 'specific_products' | 'specific_categories',
    selected_products: [] as string[],
    selected_categories: [] as string[],
  });

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchPromotions();
      fetchCategories();
      fetchProducts();
    }
  }, [user]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching promotions...');
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching promotions:', error);
        throw error;
      }

      console.log('✅ Promotions fetched:', data);
      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, price')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('🎯 Creating promotion:', formData);
      
      // Prepare promotion data
      const promotionData = {
        name: formData.name,
        code: formData.code || null,
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        minimum_order_amount: parseFloat(formData.minimum_order_amount) || 0,
        maximum_discount_amount: formData.maximum_discount_amount ? parseFloat(formData.maximum_discount_amount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        usage_limit_per_customer: parseInt(formData.usage_limit_per_customer),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        applies_to: formData.applies_to,
        is_active: true,
        created_by: user?.id || null,
      };

      const { data: promotion, error: promotionError } = await supabase
        .from('promotions')
        .insert([promotionData])
        .select()
        .single();

      if (promotionError) throw promotionError;

      console.log('✅ Promotion created:', promotion);

      // Link to products if applicable
      if (formData.applies_to === 'specific_products' && formData.selected_products.length > 0) {
        const productLinks = formData.selected_products.map(productId => ({
          promotion_id: promotion.id,
          product_id: productId,
        }));

        const { error: productError } = await supabase
          .from('promotion_products')
          .insert(productLinks);

        if (productError) throw productError;
      }

      // Link to categories if applicable
      if (formData.applies_to === 'specific_categories' && formData.selected_categories.length > 0) {
        const categoryLinks = formData.selected_categories.map(categoryId => ({
          promotion_id: promotion.id,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from('promotion_categories')
          .insert(categoryLinks);

        if (categoryError) throw categoryError;
      }

      // Reset form and refresh data
      resetForm();
      setShowCreateForm(false);
      fetchPromotions();
      
    } catch (error) {
      console.error('Error creating promotion:', error);
      alert('Failed to create promotion. Please try again.');
    }
  };

  const handleToggleActive = async (promotionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', promotionId);

      if (error) throw error;

      fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion status:', error);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Are you sure you want to delete this promotion? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promotionId);

      if (error) throw error;

      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minimum_order_amount: '',
      maximum_discount_amount: '',
      usage_limit: '',
      usage_limit_per_customer: '1',
      start_date: '',
      end_date: '',
      applies_to: 'all',
      selected_products: [],
      selected_categories: [],
    });
  };

  const getPromotionTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'fixed_amount': return <TrendingUp className="h-4 w-4" />;
      case 'buy_x_get_y': return <Gift className="h-4 w-4" />;
      case 'free_shipping': return <Truck className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.start_date);
    const endDate = promotion.end_date ? new Date(promotion.end_date) : null;

    if (!promotion.is_active) {
      return { status: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-600' };
    }

    if (startDate > now) {
      return { status: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-600' };
    }

    if (endDate && endDate < now) {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-600' };
    }

    if (promotion.usage_limit && promotion.current_usage_count >= promotion.usage_limit) {
      return { status: 'exhausted', label: 'Limit Reached', color: 'bg-orange-100 text-orange-600' };
    }

    return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-600' };
  };

  // Filter promotions based on search and status
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const status = getPromotionStatus(promotion).status;
    return matchesSearch && status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions & Hot Deals</h1>
          <p className="text-gray-600 mt-2">Manage promotional campaigns and discount codes</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Promotion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Promotions</p>
                <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
              </div>
              <Tag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Promotions</p>
                <p className="text-2xl font-bold text-green-600">
                  {promotions.filter(p => getPromotionStatus(p).status === 'active').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {promotions.reduce((sum, p) => sum + p.current_usage_count, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">
                  {promotions.filter(p => getPromotionStatus(p).status === 'expired').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Promotions List */}
      <div className="grid gap-6">
        {filteredPromotions.map((promotion) => {
          const status = getPromotionStatus(promotion);
          
          return (
            <Card key={promotion.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPromotionTypeIcon(promotion.type)}
                      <h3 className="text-lg font-semibold text-gray-900">{promotion.name}</h3>
                      {promotion.code && (
                        <Badge variant="outline" className="font-mono">
                          {promotion.code}
                        </Badge>
                      )}
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{promotion.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <p className="capitalize">{promotion.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Value:</span>
                        <p>
                          {promotion.type === 'percentage' ? `${promotion.value}%` :
                           promotion.type === 'fixed_amount' ? `$${promotion.value}` :
                           promotion.value}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Usage:</span>
                        <p>
                          {promotion.current_usage_count}
                          {promotion.usage_limit ? ` / ${promotion.usage_limit}` : ' times'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Dates:</span>
                        <p>
                          {new Date(promotion.start_date).toLocaleDateString()}
                          {promotion.end_date ? ` - ${new Date(promotion.end_date).toLocaleDateString()}` : ' - No end'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(promotion.id, promotion.is_active)}
                    >
                      {promotion.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPromotion(promotion)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePromotion(promotion.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
          <p className="text-gray-500">Create your first promotion to get started.</p>
        </div>
      )}

      {/* Create/Edit Promotion Modal */}
      {(showCreateForm || editingPromotion) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingPromotion(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleCreatePromotion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promotion Name *
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Summer Sale 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promo Code
                    </label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="SUMMER25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="25% off all cleaning supplies during summer sale"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Promotion Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed_amount">Fixed Amount Discount</option>
                      <option value="buy_x_get_y">Buy X Get Y</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value *
                    </label>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      placeholder={formData.type === 'percentage' ? '25' : '50.00'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Amount
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.minimum_order_amount}
                      onChange={(e) => setFormData({...formData, minimum_order_amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Discount Amount
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.maximum_discount_amount}
                      onChange={(e) => setFormData({...formData, maximum_discount_amount: e.target.value})}
                      placeholder="100.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <Input
                      required
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applies To *
                  </label>
                  <select
                    required
                    value={formData.applies_to}
                    onChange={(e) => setFormData({...formData, applies_to: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Products</option>
                    <option value="specific_products">Specific Products</option>
                    <option value="specific_categories">Specific Categories</option>
                  </select>
                </div>

                {formData.applies_to === 'specific_products' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Products
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {products.map(product => (
                        <label key={product.id} className="flex items-center space-x-2 p-1">
                          <input
                            type="checkbox"
                            checked={formData.selected_products.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selected_products: [...formData.selected_products, product.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selected_products: formData.selected_products.filter(id => id !== product.id)
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{product.name} ({product.sku})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {formData.applies_to === 'specific_categories' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Categories
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center space-x-2 p-1">
                          <input
                            type="checkbox"
                            checked={formData.selected_categories.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selected_categories: [...formData.selected_categories, category.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selected_categories: formData.selected_categories.filter(id => id !== category.id)
                                });
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingPromotion(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
