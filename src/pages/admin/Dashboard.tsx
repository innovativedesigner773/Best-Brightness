import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  TestTube,
  Zap,
  Activity,
  Bell,
  RefreshCw
} from 'lucide-react';

// Import test components
import DatabaseFixVerification from '../../components/admin/DatabaseFixVerification';
import RealTimeRegistrationTest from '../../components/admin/RealTimeRegistrationTest';
import QuickRegistrationTest from '../../components/admin/QuickRegistrationTest';
import StockNotificationManager from '../../components/admin/StockNotificationManager';

// Import Supabase client
import { supabase } from '../../lib/supabase';

// Data interfaces
interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  growthRate: number;
  pendingOrders: number;
  newProductsThisWeek: number;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  type: 'user' | 'order' | 'product';
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    growthRate: 0,
    pendingOrders: 0,
    newProductsThisWeek: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      console.log('📊 Fetching dashboard statistics...');
      
      // Fetch users count
      const { count: usersCount, error: usersError } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch products count
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) throw productsError;

      // Fetch orders count and revenue
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at');

      if (ordersError) throw ordersError;

      // Fetch pending orders count
      const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;

      // Calculate total revenue
      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Fetch products added this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { count: newProductsCount, error: newProductsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo.toISOString());

      if (newProductsError) throw newProductsError;

      // Calculate growth rate (simplified - comparing this month to last month)
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const lastMonth = new Date(thisMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { count: thisMonthOrders, error: thisMonthError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString());

      const { count: lastMonthOrders, error: lastMonthError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', thisMonth.toISOString());

      const growthRate = lastMonthOrders && lastMonthOrders > 0 
        ? ((thisMonthOrders || 0) - lastMonthOrders) / lastMonthOrders * 100 
        : 0;

      setStats({
        totalUsers: usersCount || 0,
        totalProducts: productsCount || 0,
        totalOrders: ordersData?.length || 0,
        revenue: revenue,
        growthRate: Math.round(growthRate * 10) / 10,
        pendingOrders: pendingOrders,
        newProductsThisWeek: newProductsCount || 0
      });

      console.log('✅ Dashboard stats fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      console.log('🔄 Fetching recent activity...');
      
      const activities: RecentActivity[] = [];

      // Fetch recent user registrations
      const { data: recentUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!usersError && recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            id: `user-${user.created_at}`,
            action: 'New user registered',
            user: `${user.first_name} ${user.last_name}`,
            time: formatTimeAgo(user.created_at),
            type: 'user'
          });
        });
      }

      // Fetch recent orders
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders')
        .select('order_number, status, created_at, customer_id')
        .order('created_at', { ascending: false })
        .limit(3);

      if (!ordersError && recentOrders) {
        // Get customer names for orders
        const customerIds = recentOrders.map(order => order.customer_id).filter(Boolean);
        const { data: customers } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name')
          .in('id', customerIds);

        recentOrders.forEach(order => {
          const customer = customers?.find(c => c.id === order.customer_id);
          const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown Customer';
          
          activities.push({
            id: `order-${order.created_at}`,
            action: `Order ${order.status}`,
            user: customerName,
            time: formatTimeAgo(order.created_at),
            type: 'order'
          });
        });
      }

      // Sort activities by time and take the most recent 4
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activities.slice(0, 4));

      console.log('✅ Recent activity fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
    }
  };

  // Fetch top products
  const fetchTopProducts = async () => {
    try {
      console.log('🏆 Fetching top products...');
      
      // Get top products by order items
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          price,
          product:products(name)
        `);

      if (orderItemsError) throw orderItemsError;

      // Aggregate product sales
      const productSales = new Map<string, { name: string; sales: number; revenue: number }>();
      
      orderItems?.forEach(item => {
        if (item.product_id && item.product) {
          const existing = productSales.get(item.product_id) || { 
            name: item.product.name, 
            sales: 0, 
            revenue: 0 
          };
          existing.sales += item.quantity || 0;
          existing.revenue += (item.quantity || 0) * (item.price || 0);
          productSales.set(item.product_id, existing);
        }
      });

      // Convert to array and sort by sales
      const topProductsList = Array.from(productSales.entries())
        .map(([id, data]) => ({
          id,
          name: data.name,
          sales: data.sales,
          revenue: data.revenue
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 4);

      setTopProducts(topProductsList);
      console.log('✅ Top products fetched successfully');
    } catch (error) {
      console.error('❌ Error fetching top products:', error);
    }
  };

  // Format time ago helper
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentActivity(),
        fetchTopProducts()
      ]);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      setError('Failed to refresh dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-[#2C3E50] mb-2">
                Admin Dashboard
              </h1>
              <p className="text-[#6C757D]">
                Welcome back! Here's what's happening with Best Brightness today.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-4 w-4 mr-1" />
                {loading ? 'Loading...' : 'System Healthy'}
              </Badge>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white p-1 rounded-xl shadow-sm border border-[#B0E0E6]/30">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Registration Testing
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Stock Notifications
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database Status
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-[#4682B4] to-[#87CEEB] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">
                      {loading ? '...' : stats.totalUsers.toLocaleString()}
                    </div>
                    <Users className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    {loading ? 'Loading...' : `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate}% from last month`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-[#28A745] to-[#20C997] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">
                      {loading ? '...' : stats.totalProducts}
                    </div>
                    <Package className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    {loading ? 'Loading...' : `${stats.newProductsThisWeek} added this week`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C69] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">
                      {loading ? '...' : stats.totalOrders}
                    </div>
                    <ShoppingCart className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    {loading ? 'Loading...' : `${stats.pendingOrders} pending`}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">
                      {loading ? '...' : `R${stats.revenue.toLocaleString()}`}
                    </div>
                    <TrendingUp className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    {loading ? 'Loading...' : `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate}% growth`}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest system activities and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4682B4]"></div>
                        <span className="ml-2 text-[#6C757D]">Loading activities...</span>
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${
                              activity.type === 'user' ? 'bg-[#4682B4]/10 text-[#4682B4]' :
                              activity.type === 'order' ? 'bg-[#28A745]/10 text-[#28A745]' :
                              'bg-[#FF6B35]/10 text-[#FF6B35]'
                            }`}>
                              {activity.type === 'user' ? <Users className="h-4 w-4" /> :
                               activity.type === 'order' ? <ShoppingCart className="h-4 w-4" /> :
                               <Package className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-sm text-[#2C3E50]">{activity.action}</p>
                              <p className="text-xs text-[#6C757D]">{activity.user}</p>
                            </div>
                          </div>
                          <span className="text-xs text-[#6C757D]">{activity.time}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#6C757D]">
                        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No recent activity found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Products
                  </CardTitle>
                  <CardDescription>Best performing products this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4682B4]"></div>
                        <span className="ml-2 text-[#6C757D]">Loading products...</span>
                      </div>
                    ) : topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-[#F8F9FA] rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-[#4682B4] text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="text-sm text-[#2C3E50]">{product.name}</p>
                              <p className="text-xs text-[#6C757D]">{product.sales} sales</p>
                            </div>
                          </div>
                          <span className="text-sm text-[#28A745]">R{product.revenue.toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-[#6C757D]">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No product sales data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Registration Testing Tab */}
          <TabsContent value="testing" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl text-[#2C3E50] mb-2">Registration System Testing</h2>
                <p className="text-[#6C757D]">
                  Test and verify that the database fix has resolved the "Database error saving new user" issue.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-Time Test */}
                <div className="space-y-4">
                  <RealTimeRegistrationTest />
                </div>

                {/* Quick Test */}
                <div className="space-y-4">
                  <QuickRegistrationTest />
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Testing Guide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h4 className="font-medium mb-2">Before Testing:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Run COMPREHENSIVE_DATABASE_FIX.sql in Supabase</li>
                      <li>Wait for all ✅ success messages</li>
                      <li>Clear browser cache completely</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">During Testing:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Use "Real-Time Test" for comprehensive testing</li>
                      <li>Use "Quick Test" for simple verification</li>
                      <li>Check results show ✅ success indicators</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Stock Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl text-[#2C3E50] mb-2">Stock Notification Management</h2>
                <p className="text-[#6C757D]">
                  Manage and send stock availability notifications to customers who requested to be notified.
                </p>
              </div>

              <StockNotificationManager />
            </div>
          </TabsContent>

          {/* Database Status Tab */}
          <TabsContent value="database" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl text-[#2C3E50] mb-2">Database Status & Verification</h2>
                <p className="text-[#6C757D]">
                  Monitor database health and verify that all components are properly configured.
                </p>
              </div>

              <DatabaseFixVerification />

              {/* Database Health Indicators */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="text-sm font-medium text-green-900">Database Schema</h4>
                        <p className="text-xs text-green-700">user_profiles table ready</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Trigger Function</h4>
                        <p className="text-xs text-blue-700">handle_new_user active</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900">RLS Policies</h4>
                        <p className="text-xs text-yellow-700">INSERT policy configured</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}