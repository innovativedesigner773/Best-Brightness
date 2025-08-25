import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';

// Import test components
import DatabaseFixVerification from '../../components/admin/DatabaseFixVerification';
import RealTimeRegistrationTest from '../../components/admin/RealTimeRegistrationTest';
import QuickRegistrationTest from '../../components/admin/QuickRegistrationTest';

// Mock data for dashboard
const mockStats = {
  totalUsers: 1247,
  totalProducts: 156,
  totalOrders: 89,
  revenue: 15420.50,
  growthRate: 12.5
};

const mockRecentActivity = [
  { id: 1, action: 'New user registered', user: 'John Doe', time: '2 minutes ago', type: 'user' },
  { id: 2, action: 'Order completed', user: 'Jane Smith', time: '15 minutes ago', type: 'order' },
  { id: 3, action: 'Product added', user: 'Admin', time: '1 hour ago', type: 'product' },
  { id: 4, action: 'User login', user: 'Mike Johnson', time: '2 hours ago', type: 'user' }
];

const mockTopProducts = [
  { id: 1, name: 'Professional Glass Cleaner', sales: 45, revenue: 675 },
  { id: 2, name: 'Industrial Floor Mop', sales: 32, revenue: 960 },
  { id: 3, name: 'Antibacterial Wipes Pack', sales: 28, revenue: 420 },
  { id: 4, name: 'Multi-Surface Disinfectant', sales: 25, revenue: 500 }
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

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
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-4 w-4 mr-1" />
                System Healthy
              </Badge>
            </div>
          </div>
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
                    <div className="text-2xl">{mockStats.totalUsers.toLocaleString()}</div>
                    <Users className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    +{mockStats.growthRate}% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-[#28A745] to-[#20C997] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{mockStats.totalProducts}</div>
                    <Package className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    5 added this week
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C69] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{mockStats.totalOrders}</div>
                    <ShoppingCart className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    12 pending
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-[#2C3E50] to-[#34495E] text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-white/90">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">${mockStats.revenue.toLocaleString()}</div>
                    <TrendingUp className="h-8 w-8 text-white/80" />
                  </div>
                  <p className="text-xs text-white/80 mt-1">
                    +{mockStats.growthRate}% growth
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
                    {mockRecentActivity.map((activity) => (
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
                    ))}
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
                    {mockTopProducts.map((product, index) => (
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
                        <span className="text-sm text-[#28A745]">${product.revenue}</span>
                      </div>
                    ))}
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