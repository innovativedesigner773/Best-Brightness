import React, { useState, useEffect } from 'react';
import { Percent, Tag, Clock, Zap, Gift, Truck, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Promotion {
  id: string;
  name: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value: number;
  minimum_order_amount: number;
  maximum_discount_amount?: number;
  start_date: string;
  end_date?: string;
  applies_to: 'all' | 'specific_products' | 'specific_categories';
}

interface HotDealsProps {
  showTitle?: boolean;
  maxDeals?: number;
  className?: string;
}

export function HotDeals({ showTitle = true, maxDeals = 4, className = '' }: HotDealsProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivePromotions();
  }, []);

  const fetchActivePromotions = async () => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(maxDeals);

      if (error) throw error;

      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-5 w-5" />;
      case 'fixed_amount': return <Tag className="h-5 w-5" />;
      case 'buy_x_get_y': return <Gift className="h-5 w-5" />;
      case 'free_shipping': return <Truck className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getPromotionDisplay = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}% OFF`;
      case 'fixed_amount':
        return `$${promotion.value} OFF`;
      case 'buy_x_get_y':
        return 'BOGO DEAL';
      case 'free_shipping':
        return 'FREE SHIPPING';
      default:
        return 'SPECIAL DEAL';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(maxDeals)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🔥 Hot Deals & Promotions</h2>
          <p className="text-gray-600">Limited time offers on your favorite cleaning supplies</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {promotions.map((promotion) => {
          const timeRemaining = promotion.end_date ? getTimeRemaining(promotion.end_date) : null;
          
          return (
            <div
              key={promotion.id}
              className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-2">
                  {getPromotionIcon(promotion.type)}
                </div>
                {timeRemaining && (
                  <div className="flex items-center text-xs bg-black bg-opacity-20 rounded-full px-2 py-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeRemaining}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-xl font-bold mb-1">
                  {getPromotionDisplay(promotion)}
                </h3>
                <p className="text-sm text-white text-opacity-90 line-clamp-2">
                  {promotion.description}
                </p>
              </div>

              {promotion.code && (
                <div className="mb-4">
                  <div className="bg-white bg-opacity-20 rounded border-2 border-dashed border-white border-opacity-30 p-2 text-center">
                    <p className="text-xs text-white text-opacity-80 mb-1">Promo Code</p>
                    <p className="font-mono font-bold text-sm">{promotion.code}</p>
                  </div>
                </div>
              )}

              {promotion.minimum_order_amount > 0 && (
                <p className="text-xs text-white text-opacity-80 mb-4">
                  Min. order: ${promotion.minimum_order_amount}
                </p>
              )}

              <Link 
                to={promotion.applies_to === 'all' ? '/products' : '/products'}
                className="w-full bg-white text-red-600 rounded-lg py-2 px-4 text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Shop Now
              </Link>
            </div>
          );
        })}
      </div>

      {promotions.length >= maxDeals && (
        <div className="text-center mt-8">
          <Link
            to="/promotions"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            View All Promotions
            <Tag className="h-4 w-4 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
}

// Full promotions page component
export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPromotions();
  }, []);

  const fetchAllPromotions = async () => {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPromotions(data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Current Promotions & Deals
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't miss out on these amazing offers! Save big on professional cleaning supplies.
          </p>
        </div>

        {promotions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Tag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Active Promotions</h3>
            <p className="text-gray-500 mb-6">Check back soon for exciting deals and offers!</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Products
              <ShoppingCart className="h-4 w-4 ml-2" />
            </Link>
          </div>
        ) : (
          <HotDeals showTitle={false} maxDeals={promotions.length} />
        )}
      </div>
    </div>
  );
}
