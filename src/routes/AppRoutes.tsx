import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages - lazy loaded to reduce bundle size
import Home from '../pages/customer/Home';
import Products from '../pages/customer/Products';
import ProductDetails from '../pages/customer/ProductDetails';
import Cart from '../pages/customer/Cart';
import Favourites from '../pages/customer/Favourites';
import Checkout from '../pages/customer/Checkout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ResetPassword from '../pages/auth/ResetPassword';
import EmailConfirm from '../pages/auth/EmailConfirm';
import Profile from '../pages/customer/Profile';
import OrderHistory from '../pages/customer/OrderHistory';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AdminProductEditor from '../pages/admin/ProductEditor';
import AdminPromotions from '../pages/admin/Promotions';
import AdminOrders from '../pages/admin/Orders';
import AdminUsers from '../pages/admin/Users';

// Cashier Pages
import CashierDashboard from '../pages/cashier/Dashboard';
import POS from '../pages/cashier/POS';

// Components
import ProtectedRoute from '../components/common/ProtectedRoute';
import AuthGate from '../components/common/AuthGate';
import RoleBasedRedirect from '../components/common/RoleBasedRedirect';
import NotFoundPage from '../components/common/NotFoundPage';

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes - No authentication required */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      
      {/* Cart and Favourites - Public but enhanced experience for authenticated users */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/favourites" element={<Favourites />} />
      
      {/* Auth Routes - redirect if already logged in based on role */}
      <Route 
        path="/login" 
        element={user ? <RoleBasedRedirect /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <RoleBasedRedirect /> : <Register />} 
      />
      <Route 
        path="/reset-password" 
        element={user ? <RoleBasedRedirect /> : <ResetPassword />} 
      />
      
      {/* Email Confirmation Route - Public route for email confirmation */}
      <Route path="/auth/confirm" element={<EmailConfirm />} />

      {/* Checkout - Requires authentication but preserves guest cart */}
      <Route 
        path="/checkout" 
        element={
          <AuthGate requireAuth={true} preserveCart={true}>
            <Checkout />
          </AuthGate>
        } 
      />

      {/* User Account Routes - require authentication */}
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        } 
      />

      {/* Cashier Routes - require cashier role or higher */}
      <Route 
        path="/cashier" 
        element={
          <ProtectedRoute allowedRoles={['cashier', 'staff', 'manager', 'admin']}>
            <CashierDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cashier/pos" 
        element={
          <ProtectedRoute allowedRoles={['cashier', 'staff', 'manager', 'admin']}>
            <POS />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes - require admin/manager roles */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
            <AdminProducts />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/products/:id" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
            <AdminProductEditor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/promotions" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminPromotions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/orders" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}>
            <AdminOrders />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <AdminUsers />
          </ProtectedRoute>
        } 
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}