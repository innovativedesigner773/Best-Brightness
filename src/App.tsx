import React from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { FavouritesProvider } from './contexts/FavouritesContext';
import { OfflineProvider } from './contexts/OfflineContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import DatabaseStatusBanner from './components/common/DatabaseStatusBanner';
import ServerStatusBanner from './components/common/ServerStatusBanner';
import OfflineIndicator from './components/common/OfflineIndicator';
import AppLoading from './components/common/AppLoading';
import AppRoutes from './routes/AppRoutes';
import BotpressIframeChat from './components/common/BotpressIframeChat';

// Config
import { queryClient } from './config/queryClient';
import { setupConsoleErrorSuppression } from './config/console';

// Setup console error suppression for development
setupConsoleErrorSuppression();

function AppContent() {
  const { user, userProfile, loading } = useAuth();
  const [forceLoad, setForceLoad] = React.useState(false);
  const location = useLocation();

  console.log('🎯 App Content Render:', { 
    user: user?.id || null, 
    emailConfirmed: user?.email_confirmed_at ? 'confirmed' : 'pending',
    userProfile: userProfile?.role || null,
    loading, 
    forceLoad,
    timestamp: new Date().toISOString() 
  });

  const handleLoadingTimeout = React.useCallback(() => {
    console.log('⚠️ Loading timeout - forcing app to display');
    setForceLoad(true);
  }, []);

  if (loading && !forceLoad) {
    return <AppLoading onTimeout={handleLoadingTimeout} />;
  }

  // Check if we're on a cashier route
  const isCashierRoute = location.pathname.startsWith('/cashier');

  // Don't render the normal layout for cashier routes
  if (isCashierRoute) {
    return (
      <>
        <AppRoutes />
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          duration={4000}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <Navbar />
        <OfflineIndicator />
        <ServerStatusBanner />
        <DatabaseStatusBanner />
        
        <main className="min-h-screen">
          <AppRoutes />
        </main>

        <Footer />
      </ErrorBoundary>
      
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        duration={4000}
      />
    </div>
  );
}

export default function App() {
  console.log('🚀 App Component Mounting');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <OfflineProvider>
          <AuthProvider>
            <ErrorBoundary>
              <CartProvider>
                <FavouritesProvider>
                  <AppContent />
                  {/* Fallback iframe-based chat to avoid CDN script issues */}
                  <BotpressIframeChat />
                </FavouritesProvider>
              </CartProvider>
            </ErrorBoundary>
          </AuthProvider>
        </OfflineProvider>
      </Router>
    </QueryClientProvider>
  );
}