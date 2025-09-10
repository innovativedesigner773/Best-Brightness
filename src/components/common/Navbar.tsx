import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogOut, Settings, Package, BarChart3, Users, Sparkles, Heart, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useFavourites } from '../../contexts/FavouritesContext';
import { useStockNotifications } from '../../contexts/StockNotificationsContext';
import CartIcon from './CartIcon';
import ShareableCartNotifications from './ShareableCartNotifications';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, profile, signOut, isAtLeastRole } = useAuth();
  const { items: favouriteItems } = useFavourites();
  const { notifications } = useStockNotifications();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navigationLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/contact', label: 'Contact' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/promotions', label: 'Promotions', icon: Settings },
    { to: '/admin/orders', label: 'Orders', icon: Package },
    { to: '/admin/users', label: 'Users', icon: Users },
  ];

  const cashierLinks = [
    { to: '/cashier', label: 'Dashboard', icon: BarChart3 },
    { to: '/cashier/pos', label: 'POS System', icon: Settings },
    { to: '/cashier/reports', label: 'Reports', icon: BarChart3 },
  ];

  // Get user display name with fallback
  const getUserDisplayName = () => {
    return profile?.first_name || user?.user_metadata?.first_name || 'Profile';
  };

  // Get full user name for profile dropdown
  const getFullUserName = () => {
    const firstName = profile?.first_name || user?.user_metadata?.first_name;
    const lastName = profile?.last_name || user?.user_metadata?.last_name;
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User';
  };

  // Get loyalty points
  const getLoyaltyPoints = () => {
    return profile?.loyalty_points || user?.user_metadata?.loyalty_points || 0;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-[#B0E0E6]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-[#87CEEB] to-[#4682B4] text-white p-2 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold text-[#2C3E50] group-hover:text-[#4682B4] transition-colors">
                Best Brightness
              </span>
              <div className="text-xs text-[#87CEEB] font-medium">
                Professional Cleaning
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-[#2C3E50] hover:text-[#4682B4] px-3 py-2 rounded-lg transition-colors font-medium hover:bg-[#F8F9FA]"
              >
                {link.label}
              </Link>
            ))}

            {/* Admin/Cashier Links */}
            {isAtLeastRole('cashier') && (
              <div className="relative group">
                <button className="text-[#2C3E50] hover:text-[#4682B4] px-3 py-2 rounded-lg transition-colors flex items-center font-medium hover:bg-[#F8F9FA]">
                  Dashboard
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#B0E0E6]/30 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  {isAtLeastRole('admin') && adminLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <link.icon className="h-4 w-4 mr-3 text-[#87CEEB]" />
                      {link.label}
                    </Link>
                  ))}
                  {isAtLeastRole('cashier') && !isAtLeastRole('admin') && cashierLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <link.icon className="h-4 w-4 mr-3 text-[#87CEEB]" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search cleaning products..."
                className="w-full pl-10 pr-4 py-2 border border-[#B0E0E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#87CEEB] focus:border-transparent bg-[#F8F9FA]/50 hover:bg-white transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#87CEEB]" />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Favourites Icon - Always visible */}
            <Link
              to="/favourites"
              className="hidden md:flex relative p-2 text-[#2C3E50] hover:text-[#4682B4] hover:bg-[#F8F9FA] rounded-xl transition-all duration-300 group"
              title="Favourites"
            >
              <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
              {favouriteItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                  {favouriteItems.length > 99 ? '99+' : favouriteItems.length}
                </span>
              )}
            </Link>

            {/* Stock Notifications Icon - Only for authenticated users */}
            {user && (
              <Link
                to="/notifications"
                className="hidden md:flex relative p-2 text-[#2C3E50] hover:text-[#4682B4] hover:bg-[#F8F9FA] rounded-xl transition-all duration-300 group"
                title="Stock Notifications"
              >
                <Bell className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {notifications.filter(n => !n.is_notified).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                    {notifications.filter(n => !n.is_notified).length > 99 ? '99+' : notifications.filter(n => !n.is_notified).length}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon - Always visible */}
            <CartIcon className="hidden md:block" />

            {/* Shareable Cart Notifications - Only for authenticated users */}
            {user && <ShareableCartNotifications />}

            {user ? (
              <>
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 text-[#2C3E50] hover:text-[#4682B4] transition-colors hover:bg-[#F8F9FA] rounded-xl"
                  >
                    <div className="bg-gradient-to-br from-[#87CEEB] to-[#4682B4] rounded-full p-1">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <span className="hidden md:block font-medium">
                      {getUserDisplayName()}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#B0E0E6]/30 z-50">
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-[#B0E0E6]/30 bg-gradient-to-r from-[#F8F9FA] to-white">
                          <p className="font-semibold text-[#2C3E50]">
                            {getFullUserName()}
                          </p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                          <div className="flex items-center mt-2">
                            <Sparkles className="h-3 w-3 text-[#87CEEB] mr-1" />
                            <span className="text-sm text-[#4682B4] font-medium">
                              {getLoyaltyPoints()} points
                            </span>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4 mr-3 text-[#87CEEB]" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/favourites"
                          className="flex items-center px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Heart className="h-4 w-4 mr-3 text-[#87CEEB]" />
                          My Favourites ({favouriteItems.length})
                        </Link>
                        <Link
                          to="/notifications"
                          className="flex items-center px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Bell className="h-4 w-4 mr-3 text-[#87CEEB]" />
                          Stock Notifications ({notifications.filter(n => !n.is_notified).length})
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-3 text-sm text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Package className="h-4 w-4 mr-3 text-[#87CEEB]" />
                          Order History
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-[#2C3E50] hover:text-[#4682B4] px-4 py-2 rounded-xl transition-colors font-medium hover:bg-[#F8F9FA]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-[#4682B4] to-[#87CEEB] text-white px-6 py-2 rounded-xl hover:from-[#2C3E50] hover:to-[#4682B4] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-[#2C3E50] hover:bg-[#F8F9FA] rounded-xl transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#B0E0E6]/30">
            <div className="py-4 space-y-2">
              {/* Search */}
              <div className="px-4 pb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cleaning products..."
                    className="w-full pl-10 pr-4 py-2 border border-[#B0E0E6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#87CEEB] bg-[#F8F9FA]/50"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#87CEEB]" />
                </div>
              </div>

              {/* Mobile Favourites */}
              <div className="px-4 pb-2">
                <Link
                  to="/favourites"
                  className="flex items-center justify-between w-full p-3 bg-[#F8F9FA] hover:bg-[#B0E0E6]/20 rounded-xl transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-[#4682B4] mr-3" />
                    <span className="font-medium text-[#2C3E50]">My Favourites</span>
                  </div>
                  {favouriteItems.length > 0 && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      {favouriteItems.length}
                    </span>
                  )}
                </Link>
              </div>

              {/* Mobile Stock Notifications - Only for authenticated users */}
              {user && (
                <div className="px-4 pb-2">
                  <Link
                    to="/notifications"
                    className="flex items-center justify-between w-full p-3 bg-[#F8F9FA] hover:bg-[#B0E0E6]/20 rounded-xl transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-[#4682B4] mr-3" />
                      <span className="font-medium text-[#2C3E50]">Stock Notifications</span>
                    </div>
                    {notifications.filter(n => !n.is_notified).length > 0 && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {notifications.filter(n => !n.is_notified).length}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Mobile Cart */}
              <div className="px-4 pb-2">
                <CartIcon className="w-full" />
              </div>

              {/* Navigation Links */}
              {navigationLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-3 text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Admin/Cashier Links */}
              {isAtLeastRole('admin') && adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center px-4 py-3 text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4 mr-3 text-[#87CEEB]" />
                  {link.label}
                </Link>
              ))}
              {isAtLeastRole('cashier') && !isAtLeastRole('admin') && cashierLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center px-4 py-3 text-[#2C3E50] hover:bg-[#F8F9FA] hover:text-[#4682B4] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4 mr-3 text-[#87CEEB]" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
}