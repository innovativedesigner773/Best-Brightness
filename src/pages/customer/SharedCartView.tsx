import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Package,
  Tag,
  Gift,
  CreditCard,
  Truck,
  MapPin,
  Check
} from 'lucide-react';
import { ShareableCartService, ShareableCart } from '../../utils/shareable-cart';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../contexts/AuthContext';

export default function SharedCartView() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [shareableCart, setShareableCart] = useState<ShareableCart | null>(null);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    province: '',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  });

  useEffect(() => {
    if (token) {
      loadShareableCart();
    }
  }, [token]);

  const loadShareableCart = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const result = await ShareableCartService.getShareableCartByToken(token);
      
      if (result.success && result.data) {
        setShareableCart(result.data);
        setError('');
      } else {
        setError(result.error || 'Cart not found or expired');
      }
    } catch (error) {
      console.error('Error loading shareable cart:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!shareableCart) return;
    
    setCheckoutLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order (this would typically integrate with your order system)
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mark the shareable cart as paid
      const result = await ShareableCartService.markAsPaid(token!, orderId);
      
      if (result.success) {
        toast.success('Payment successful! Order has been placed.');
        setCurrentStep(4); // Show success step
      } else {
        toast.error('Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(3);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCheckout();
  };

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
  ];

  const steps = [
    { id: 1, name: 'Review', icon: ShoppingBag },
    { id: 2, name: 'Shipping', icon: Truck },
    { id: 3, name: 'Payment', icon: CreditCard },
    { id: 4, name: 'Complete', icon: Check },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-6 text-[#2C3E50]/80 text-lg font-medium">Loading shared cart...</p>
        </div>
      </div>
    );
  }

  if (error || !shareableCart) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center">
          <AlertCircle className="w-20 h-20 text-[#FF6B35] mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-4">Cart Not Available</h1>
          <p className="text-[#2C3E50]/80 text-lg mb-8">
            {error || 'This shared cart is no longer available. It may have expired or been cancelled.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-[#4682B4] text-white px-8 py-4 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 font-semibold shadow-lg"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const { cart_data, cart_metadata, status, expires_at } = shareableCart;
  const { items, subtotal, discount_amount, total } = cart_data;
  const shippingCost = total >= 500 ? 0 : 50;
  const finalTotal = total + shippingCost;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="bg-[#4682B4] text-white p-4 rounded-2xl shadow-lg inline-block mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-[#2C3E50] mb-2">Shared Cart</h1>
            <p className="text-[#2C3E50]/80 text-lg">
              {cart_metadata.original_user_name && (
                <>Shared by {cart_metadata.original_user_name}</>
              )}
              {cart_metadata.message && (
                <span className="block mt-2 text-sm italic text-[#4682B4]">"{cart_metadata.message}"</span>
              )}
            </p>
            <div className="flex items-center justify-center text-sm text-[#2C3E50]/60 mt-4">
              <Clock className="w-4 h-4 mr-2" />
              Expires: {new Date(expires_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${
                      currentStep >= step.id 
                        ? 'bg-[#4682B4] text-white' 
                        : 'bg-[#F8F9FA] text-[#2C3E50]/60 border border-gray-200'
                    }`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <span className={`ml-3 text-sm font-semibold ${
                      currentStep >= step.id ? 'text-[#4682B4]' : 'text-[#2C3E50]/60'
                    }`}>
                      {step.name}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-20 h-1 mx-6 rounded-full ${
                        currentStep > step.id ? 'bg-[#4682B4]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-8 flex items-center">
                  <Package className="w-6 h-6 mr-3 text-[#4682B4]" />
                  Review Items
                </h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-6 p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                      <div className="flex-shrink-0">
                        <ImageWithFallback
                          src={item.image_url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#2C3E50] truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-[#2C3E50]/60">
                          {item.brand && `${item.brand} • `}
                          SKU: {item.sku}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-[#2C3E50]/60 mt-1">
                            {Object.entries(item.variant).map(([key, value]) => 
                              `${key}: ${value}`
                            ).join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-[#4682B4]">
                          R{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-[#2C3E50]/60">
                          R{item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full bg-[#4682B4] text-white py-4 px-6 rounded-xl hover:bg-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:ring-offset-2 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-8 flex items-center">
                  <Truck className="w-6 h-6 mr-3 text-[#4682B4]" />
                  Shipping Information
                </h2>
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Province *
                      </label>
                      <select
                        required
                        value={shippingInfo.province}
                        onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                      >
                        <option value="">Select Province</option>
                        {provinces.map((province) => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-8 py-3 border border-gray-300 rounded-xl text-[#2C3E50] hover:bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-[#4682B4] text-white rounded-xl hover:bg-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-all duration-300 font-semibold shadow-lg"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-8 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-[#4682B4]" />
                  Payment Information
                </h2>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-8">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 border border-gray-300 rounded-xl text-[#2C3E50] hover:bg-[#F8F9FA] focus:outline-none focus:ring-2 focus:ring-[#4682B4] transition-colors font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={checkoutLoading}
                      className="px-8 py-3 bg-[#4682B4] text-white rounded-xl hover:bg-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#4682B4] disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-lg transition-all duration-300"
                    >
                      {checkoutLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Complete Payment'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-12 text-center">
                <div className="w-24 h-24 bg-[#28A745] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[#2C3E50] mb-4">Payment Successful!</h2>
                <p className="text-[#2C3E50]/80 text-lg mb-8">
                  Thank you for completing the payment. The original cart owner has been notified.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-[#4682B4] text-white px-8 py-4 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 font-semibold shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sticky top-8">
              <h3 className="text-xl font-bold text-[#2C3E50] mb-6 flex items-center">
                <Package className="w-5 h-5 mr-2 text-[#4682B4]" />
                Order Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#2C3E50]/80">Subtotal:</span>
                  <span className="font-semibold text-[#2C3E50]">R{subtotal.toFixed(2)}</span>
                </div>
                
                {discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-[#28A745]">
                    <span>Discount:</span>
                    <span className="font-semibold">-R{discount_amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-[#2C3E50]/80">Shipping:</span>
                  <span className="font-semibold text-[#2C3E50]">{shippingCost === 0 ? 'Free' : `R${shippingCost.toFixed(2)}`}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-[#2C3E50]">Total:</span>
                    <span className="text-[#4682B4]">R{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {currentStep >= 2 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-semibold text-[#2C3E50] mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#4682B4]" />
                    Shipping to:
                  </h4>
                  <p className="text-sm text-[#2C3E50]/80">
                    {shippingInfo.firstName} {shippingInfo.lastName}<br />
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.postalCode}<br />
                    {shippingInfo.province}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
