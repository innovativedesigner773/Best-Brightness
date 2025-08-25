import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner@2.0.3';

export interface FavouriteItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  original_price?: number;
  image_url?: string;
  sku: string;
  in_stock: boolean;
  stock_count: number;
  category: string;
  brand?: string;
  description?: string;
  rating?: number;
  reviews_count?: number;
  promotion_badge?: string;
  promotion_discount?: number;
  added_at: string;
}

interface FavouritesContextType {
  items: FavouriteItem[];
  loading: boolean;
  addToFavourites: (product: any) => Promise<void>;
  removeFromFavourites: (productId: string) => Promise<void>;
  isFavourite: (productId: string) => boolean;
  clearFavourites: () => Promise<void>;
  updateStockStatus: (productId: string, stockData: { stock_count: number; in_stock: boolean }) => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (context === undefined) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
}

interface FavouritesProviderProps {
  children: ReactNode;
}

const FAVOURITES_STORAGE_KEY = 'best_brightness_favourites';

export function FavouritesProvider({ children }: FavouritesProviderProps) {
  const [items, setItems] = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Mock stock data that would normally come from API
  const mockStockData: Record<string, { stock_count: number; in_stock: boolean }> = {
    '1': { stock_count: 7, in_stock: true },
    '2': { stock_count: 3, in_stock: true },
    '3': { stock_count: 23, in_stock: true },
    '4': { stock_count: 45, in_stock: true },
    '5': { stock_count: 0, in_stock: false },
    '6': { stock_count: 8, in_stock: true },
    '7': { stock_count: 15, in_stock: true },
    '8': { stock_count: 127, in_stock: true },
    '9': { stock_count: 1, in_stock: true },
    '10': { stock_count: 42, in_stock: true },
    '11': { stock_count: 5, in_stock: true },
    '12': { stock_count: 9, in_stock: true },
  };

  // Load favourites on mount and when user changes
  useEffect(() => {
    loadFavourites();
  }, [user]);

  // Periodic stock checking
  useEffect(() => {
    const checkStockLevels = () => {
      setItems(prevItems => 
        prevItems.map(item => {
          const stockData = mockStockData[item.product_id];
          if (stockData && (stockData.stock_count !== item.stock_count || stockData.in_stock !== item.in_stock)) {
            return {
              ...item,
              stock_count: stockData.stock_count,
              in_stock: stockData.in_stock
            };
          }
          return item;
        })
      );
    };

    // Check immediately and then every 30 seconds
    checkStockLevels();
    const interval = setInterval(checkStockLevels, 30000);

    return () => clearInterval(interval);
  }, [items.length]);

  const loadFavourites = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // For authenticated users, load from server (simulate with localStorage + user prefix)
        const serverKey = `${FAVOURITES_STORAGE_KEY}_${user.id}`;
        const stored = localStorage.getItem(serverKey);
        if (stored) {
          const favourites = JSON.parse(stored);
          // Update with current stock data
          const updatedFavourites = favourites.map((item: FavouriteItem) => {
            const stockData = mockStockData[item.product_id];
            return stockData ? { ...item, ...stockData } : item;
          });
          setItems(updatedFavourites);
        }
      } else {
        // For guest users, load from localStorage
        const stored = localStorage.getItem(FAVOURITES_STORAGE_KEY);
        if (stored) {
          const favourites = JSON.parse(stored);
          // Update with current stock data
          const updatedFavourites = favourites.map((item: FavouriteItem) => {
            const stockData = mockStockData[item.product_id];
            return stockData ? { ...item, ...stockData } : item;
          });
          setItems(updatedFavourites);
        }
      }
    } catch (error) {
      console.error('Error loading favourites:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveFavourites = async (favourites: FavouriteItem[]) => {
    try {
      const key = user ? `${FAVOURITES_STORAGE_KEY}_${user.id}` : FAVOURITES_STORAGE_KEY;
      localStorage.setItem(key, JSON.stringify(favourites));
      
      // In a real implementation, this would sync to the server for authenticated users
      if (user) {
        // TODO: Sync to server
        console.log('Syncing favourites to server for user:', user.id);
      }
    } catch (error) {
      console.error('Error saving favourites:', error);
    }
  };

  const addToFavourites = async (product: any) => {
    try {
      const productId = product.id || product.product_id;
      
      // Check if already in favourites
      if (items.some(item => item.product_id === productId)) {
        toast.info('Product is already in your favourites');
        return;
      }

      // Get current stock data
      const stockData = mockStockData[productId] || { stock_count: 0, in_stock: false };

      const favouriteItem: FavouriteItem = {
        id: `fav_${productId}_${Date.now()}`,
        product_id: productId,
        name: product.name,
        price: product.price,
        original_price: product.original_price,
        image_url: product.image_url,
        sku: product.sku,
        category: product.category || 'Unknown',
        brand: product.brand,
        description: product.description,
        rating: product.rating,
        reviews_count: product.reviews_count,
        promotion_badge: product.promotion_badge,
        promotion_discount: product.promotion_discount,
        added_at: new Date().toISOString(),
        ...stockData
      };

      const newItems = [...items, favouriteItem];
      setItems(newItems);
      await saveFavourites(newItems);
      
      toast.success(`${product.name} added to favourites!`);
    } catch (error) {
      console.error('Error adding to favourites:', error);
      toast.error('Failed to add to favourites. Please try again.');
    }
  };

  const removeFromFavourites = async (productId: string) => {
    try {
      const newItems = items.filter(item => item.product_id !== productId);
      setItems(newItems);
      await saveFavourites(newItems);
      
      const item = items.find(item => item.product_id === productId);
      toast.success(`${item?.name || 'Product'} removed from favourites`);
    } catch (error) {
      console.error('Error removing from favourites:', error);
      toast.error('Failed to remove from favourites. Please try again.');
    }
  };

  const isFavourite = (productId: string): boolean => {
    return items.some(item => item.product_id === productId);
  };

  const clearFavourites = async () => {
    try {
      setItems([]);
      await saveFavourites([]);
      toast.success('All favourites cleared');
    } catch (error) {
      console.error('Error clearing favourites:', error);
      toast.error('Failed to clear favourites. Please try again.');
    }
  };

  const updateStockStatus = (productId: string, stockData: { stock_count: number; in_stock: boolean }) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId
          ? { ...item, ...stockData }
          : item
      )
    );
  };

  const value: FavouritesContextType = {
    items,
    loading,
    addToFavourites,
    removeFromFavourites,
    isFavourite,
    clearFavourites,
    updateStockStatus,
  };

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}