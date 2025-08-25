import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin, Check, ArrowLeft, Package, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

export default function Checkout() {
  const { items, subtotal, discount_amount, total, loyalty_points_used, loyalty_discount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
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

  const shippingCost = total >= 500 ? 0 : 50;
  const finalTotal = total + shippingCost;

  const steps = [
    { id: 1, name: 'Shipping', icon: Truck },
    { id: 2, name: 'Payment', icon: CreditCard },
    { id: 3, name: 'Review', icon: Check },
  ];

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate shipping info
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'postalCode', 'province'];
    const missing = required.filter(field => !shippingInfo[field as keyof typeof shippingInfo]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }

    setCurrentStep(2);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment info
    const required = ['cardNumber', 'expiryDate', 'cvv', 'cardName'];
    const missing = required.filter(field => !paymentInfo[field as keyof typeof paymentInfo]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in all payment fields: ${missing.join(', ')}`);
      return;
    }

    // Basic card number validation
    if (paymentInfo.cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Please enter a valid card number');
      return;
    }

    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const orderData = {
        items,
        subtotal,
        discount_amount,
        total_amount: finalTotal,
        shipping_amount: shippingCost,
        loyalty_points_used,
        loyalty_discount,
        shipping_info: shippingInfo,
      };

      // In a real app, this would make an API call to create the order
      console.log('Creating order:', orderData);
      
      // Clear cart and navigate to success page
      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-[#4682B4] hover:text-[#2C3E50] mb-6 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Cart
          </button>
          <div className="bg-[#4682B4] text-white p-4 rounded-2xl shadow-lg inline-block mb-4">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold text-[#2C3E50] mb-2">Secure Checkout</h1>
          <p className="text-[#2C3E50]/80 text-lg">Complete your order for professional cleaning supplies</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-[#4682B4] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <span className={`ml-3 font-semibold text-lg transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-[#4682B4]' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-2 ml-6 rounded-full transition-all duration-300 ${
                    currentStep > step.id ? 'bg-[#4682B4]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-[#4682B4] text-white p-3 rounded-xl mr-4">
                    <Truck className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2C3E50]">Shipping Information</h2>
                </div>
                
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        placeholder="+27 12 345 6789"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        placeholder="8001"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        Province *
                      </label>
                      <select
                        value={shippingInfo.province}
                        onChange={(e) => setShippingInfo({...shippingInfo, province: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        required
                      >
                        <option value="">Select Province</option>
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full bg-[#4682B4] text-white py-4 px-6 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-[#4682B4] text-white p-3 rounded-xl mr-4">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2C3E50]">Payment Information</h2>
                </div>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                        setPaymentInfo({...paymentInfo, cardNumber: value});
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                          setPaymentInfo({...paymentInfo, expiryDate: value});
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setPaymentInfo({...paymentInfo, cvv: value});
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent transition-all duration-300"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div className="mt-8 flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-2 border-[#4682B4] text-[#4682B4] py-4 px-6 rounded-xl hover:bg-[#4682B4] hover:text-white transition-all duration-300 text-lg font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#4682B4] text-white py-4 px-6 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      Review Order
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-[#4682B4] text-white p-3 rounded-xl mr-4">
                    <Check className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2C3E50]">Review Your Order</h2>
                </div>
                
                {/* Shipping Info Review */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-[#4682B4]" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                    <p className="font-semibold text-[#2C3E50] text-lg">{shippingInfo.firstName} {shippingInfo.lastName}</p>
                    <p className="text-[#2C3E50]/80 mt-1">{shippingInfo.address}</p>
                    <p className="text-[#2C3E50]/80">{shippingInfo.city}, {shippingInfo.province} {shippingInfo.postalCode}</p>
                    <p className="text-[#2C3E50]/80">{shippingInfo.phone}</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-[#4682B4] hover:text-[#2C3E50] font-medium mt-3 transition-colors duration-300"
                  >
                    Edit Shipping Information
                  </button>
                </div>

                {/* Payment Info Review */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-[#2C3E50] mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-[#4682B4]" />
                    Payment Method
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                    <p className="font-semibold text-[#2C3E50] text-lg">**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                    <p className="text-[#2C3E50]/80 mt-1">{paymentInfo.cardName}</p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-[#4682B4] hover:text-[#2C3E50] font-medium mt-3 transition-colors duration-300"
                  >
                    Edit Payment Information
                  </button>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 border-2 border-[#4682B4] text-[#4682B4] py-4 px-6 rounded-xl hover:bg-[#4682B4] hover:text-white transition-all duration-300 text-lg font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {loading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      'Complete Order'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sticky top-4">
              <div className="flex items-center mb-6">
                <div className="bg-[#4682B4] text-white p-3 rounded-xl mr-4">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C3E50]">Order Summary</h2>
              </div>
              
              {/* Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <ImageWithFallback
                      src={item.image_url || 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=60&h=60&fit=crop'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#2C3E50] truncate">{item.name}</p>
                      <p className="text-sm text-[#2C3E50]/60">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-lg font-bold text-[#2C3E50]">R{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex justify-between text-lg">
                  <span className="text-[#2C3E50]/80">Subtotal</span>
                  <span className="font-semibold text-[#2C3E50]">R{subtotal.toFixed(2)}</span>
                </div>
                
                {discount_amount > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="text-green-600">Discounts</span>
                    <span className="text-green-600 font-semibold">-R{discount_amount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg">
                  <span className="text-[#2C3E50]/80">Shipping</span>
                  <span className="font-semibold text-[#2C3E50]">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `R${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-2xl font-bold pt-4 border-t border-gray-200 text-[#2C3E50]">
                  <span>Total</span>
                  <span>R{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-8 text-center">
                <div className="flex items-center justify-center text-[#2C3E50]/60 bg-gray-50 py-3 px-4 rounded-xl border border-gray-200">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">256-bit SSL Encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}