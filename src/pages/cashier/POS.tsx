import React, { useState } from 'react';
import { 
  Scan, 
  ShoppingCart, 
  CreditCard, 
  Percent, 
  Users, 
  Calculator,
  Trash2,
  Plus,
  Minus,
  Receipt,
  DollarSign,
  UserCheck,
  Gift,
  Settings,
  Printer,
  Mail,
  X,
  Delete
} from 'lucide-react';

export default function EnhancedPOS() {
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardTarget, setKeyboardTarget] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [activeInput, setActiveInput] = useState('');

  // Sample products database
  const products = {
    '123456789': { name: 'Coca Cola 500ml', price: 15.99, category: 'Beverages' },
    '987654321': { name: 'White Bread', price: 22.50, category: 'Bakery' },
    '555666777': { name: 'Milk 1L', price: 18.75, category: 'Dairy' },
    '111222333': { name: 'Apples 1kg', price: 35.00, category: 'Fresh Produce' },
    '444555666': { name: 'Chicken Breast 1kg', price: 89.99, category: 'Meat' }
  };

  // Sample customers database
  const customers = {
    '0821234567': { name: 'John Smith', email: 'john@email.com', points: 150 },
    '0739876543': { name: 'Sarah Johnson', email: 'sarah@email.com', points: 220 },
    'customer@demo.com': { name: 'Demo Customer', email: 'customer@demo.com', points: 500 }
  };

  const handleBarcodeInput = (value) => {
    const product = products[value];
    if (product) {
      const existingItem = cartItems.find(item => item.barcode === value);
      if (existingItem) {
        setCartItems(cartItems.map(item =>
          item.barcode === value 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCartItems([...cartItems, {
          barcode: value,
          ...product,
          quantity: 1,
          id: Date.now()
        }]);
      }
      setBarcodeInput('');
    }
  };

  const handleCustomerSearch = (query) => {
    const foundCustomer = customers[query];
    if (foundCustomer) {
      setCustomer(foundCustomer);
      setCustomerSearch('');
    }
  };

  const updateQuantity = (id, change) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount;

  const OnScreenKeyboard = ({ onKeyPress, onClose, target }) => {
    const keys = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '@'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '.', '-', '_']
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-[#2C3E50]">
              {target === 'barcode' ? 'Enter Barcode' : target === 'customer' ? 'Customer Search' : 'Manual Entry'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <input
              type="text"
              value={target === 'barcode' ? barcodeInput : target === 'customer' ? customerSearch : paymentAmount}
              readOnly
              className="w-full p-4 text-xl border-2 border-gray-200 rounded-xl bg-gray-50 text-center font-mono"
              placeholder={target === 'barcode' ? 'Barcode will appear here' : target === 'customer' ? 'Search query' : 'Amount'}
            />
          </div>

          <div className="space-y-3">
            {keys.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center space-x-2">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className="bg-[#4682B4] text-white p-4 rounded-xl hover:bg-[#2C3E50] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 min-w-[48px] font-semibold"
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={() => onKeyPress('SPACE')}
              className="bg-gray-200 text-[#2C3E50] px-8 py-4 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Space
            </button>
            <button
              onClick={() => onKeyPress('BACKSPACE')}
              className="bg-red-500 text-white px-6 py-4 rounded-xl hover:bg-red-600 transition-all duration-200 font-semibold flex items-center"
            >
              <Delete className="h-5 w-5 mr-2" />
              Delete
            </button>
            <button
              onClick={() => onKeyPress('ENTER')}
              className="bg-green-500 text-white px-8 py-4 rounded-xl hover:bg-green-600 transition-all duration-200 font-semibold"
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleKeyPress = (key) => {
    if (key === 'BACKSPACE') {
      if (keyboardTarget === 'barcode') {
        setBarcodeInput(prev => prev.slice(0, -1));
      } else if (keyboardTarget === 'customer') {
        setCustomerSearch(prev => prev.slice(0, -1));
      } else if (keyboardTarget === 'payment') {
        setPaymentAmount(prev => prev.slice(0, -1));
      }
    } else if (key === 'ENTER') {
      if (keyboardTarget === 'barcode') {
        handleBarcodeInput(barcodeInput);
      } else if (keyboardTarget === 'customer') {
        handleCustomerSearch(customerSearch);
      }
      setShowKeyboard(false);
      setKeyboardTarget('');
    } else if (key === 'SPACE') {
      if (keyboardTarget === 'customer') {
        setCustomerSearch(prev => prev + ' ');
      }
    } else {
      if (keyboardTarget === 'barcode') {
        setBarcodeInput(prev => prev + key);
      } else if (keyboardTarget === 'customer') {
        setCustomerSearch(prev => prev + key);
      } else if (keyboardTarget === 'payment') {
        setPaymentAmount(prev => prev + key);
      }
    }
  };

  const openKeyboard = (target) => {
    setKeyboardTarget(target);
    setShowKeyboard(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#87CEEB]/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2C3E50]">Point of Sale</h1>
              <p className="text-[#2C3E50]/80 mt-2">Process in-store sales and transactions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-[#4682B4] text-white p-4 rounded-2xl shadow-lg">
                <Scan className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Scanner & Customer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barcode Scanner */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-[#2C3E50] mb-6">Barcode Scanner</h2>
              <div className="border-2 border-dashed border-[#4682B4]/30 rounded-xl p-8 text-center bg-gradient-to-br from-[#87CEEB]/10 to-transparent">
                <Scan className="h-16 w-16 text-[#4682B4] mx-auto mb-4" />
                <p className="text-xl font-medium text-[#2C3E50] mb-2">Ready to Scan</p>
                <p className="text-[#2C3E50]/80 mb-6">Use barcode scanner or enter product code manually</p>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleBarcodeInput(barcodeInput)}
                    placeholder="Enter barcode or product code..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent text-center font-mono"
                  />
                  <button
                    onClick={() => openKeyboard('barcode')}
                    className="bg-[#4682B4] text-white px-6 py-3 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Calculator className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              {/* Quick Product Buttons */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(products).map(([barcode, product]) => (
                  <button
                    key={barcode}
                    onClick={() => handleBarcodeInput(barcode)}
                    className="p-4 bg-gradient-to-br from-[#4682B4]/10 to-[#87CEEB]/20 rounded-xl hover:from-[#4682B4]/20 hover:to-[#87CEEB]/30 transition-all duration-300 border border-[#4682B4]/20 hover:border-[#4682B4]/40"
                  >
                    <div className="text-sm font-semibold text-[#2C3E50]">{product.name}</div>
                    <div className="text-[#4682B4] font-bold">R{product.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Search */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-[#2C3E50] mb-6">Customer Lookup</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomerSearch(customerSearch)}
                    placeholder="Search by phone, email, or name..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => openKeyboard('customer')}
                  className="bg-[#4682B4] text-white px-4 py-3 rounded-xl hover:bg-[#2C3E50] transition-all duration-300"
                >
                  <Calculator className="h-6 w-6" />
                </button>
                <button
                  onClick={() => handleCustomerSearch(customerSearch)}
                  className="bg-[#4682B4] text-white px-6 py-3 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Search
                </button>
              </div>
              
              {customer && (
                <div className="bg-gradient-to-r from-[#4682B4]/10 to-[#87CEEB]/20 rounded-xl p-4 border border-[#4682B4]/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserCheck className="h-8 w-8 text-[#4682B4]" />
                      <div>
                        <h3 className="font-bold text-[#2C3E50]">{customer.name}</h3>
                        <p className="text-[#2C3E50]/80">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-[#4682B4] text-white px-4 py-2 rounded-xl">
                        <Gift className="h-5 w-5 inline mr-2" />
                        {customer.points} points
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Cart & Checkout */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-4">
              <h2 className="text-2xl font-semibold text-[#2C3E50] mb-6">Transaction</h2>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-[#4682B4]/30 rounded-xl mb-6 bg-gradient-to-br from-[#87CEEB]/10 to-transparent">
                  <ShoppingCart className="h-12 w-12 text-[#4682B4] mx-auto mb-3" />
                  <p className="text-[#2C3E50]">No items scanned</p>
                  <p className="text-sm text-[#2C3E50]/80 mt-1">Scan products to add to cart</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-gradient-to-r from-[#87CEEB]/10 to-transparent rounded-xl p-4 border border-[#4682B4]/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#2C3E50]">{item.name}</h4>
                          <p className="text-sm text-[#2C3E50]/80">{item.category}</p>
                          <p className="text-[#4682B4] font-bold">R{item.price} each</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-bold text-[#2C3E50] min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="bg-green-500 text-white p-1 rounded-lg hover:bg-green-600"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="font-bold text-[#2C3E50]">R{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowDiscountModal(true)}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-[#4682B4]/30 rounded-xl hover:bg-[#87CEEB]/10 transition-all duration-300 text-[#2C3E50] font-semibold"
                >
                  <Percent className="h-5 w-5 mr-2" />
                  Apply Discount ({discountPercent}%)
                </button>
                <button
                  onClick={() => openKeyboard('manual')}
                  className="w-full flex items-center justify-center px-4 py-3 border-2 border-[#4682B4]/30 rounded-xl hover:bg-[#87CEEB]/10 transition-all duration-300 text-[#2C3E50] font-semibold"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Manual Entry
                </button>
              </div>

              {/* Total Display */}
              <div className="border-t-2 border-[#4682B4]/20 pt-4 mb-6 space-y-2">
                <div className="flex justify-between text-[#2C3E50]">
                  <span>Subtotal:</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountPercent}%):</span>
                    <span>-R{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl font-bold text-[#2C3E50] border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>R{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-3">
                <button
                  disabled={cartItems.length === 0}
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold flex items-center justify-center"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Cash Payment
                </button>
                <button
                  disabled={cartItems.length === 0}
                  className="w-full bg-gradient-to-r from-[#4682B4] to-[#2C3E50] text-white py-4 px-4 rounded-xl hover:from-[#2C3E50] hover:to-[#1a252f] transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold flex items-center justify-center"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Card Payment
                </button>
              </div>

              {/* Additional Actions */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="bg-[#87CEEB]/20 text-[#2C3E50] py-3 px-4 rounded-xl hover:bg-[#87CEEB]/30 transition-all duration-300 font-semibold flex items-center justify-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Print
                </button>
                <button className="bg-[#87CEEB]/20 text-[#2C3E50] py-3 px-4 rounded-xl hover:bg-[#87CEEB]/30 transition-all duration-300 font-semibold flex items-center justify-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Discount Modal */}
        {showDiscountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-[#2C3E50] mb-6">Apply Discount</h3>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#2C3E50] mb-2">Discount Percentage</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4682B4] focus:border-transparent"
                  placeholder="Enter discount percentage..."
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="flex-1 bg-gray-200 text-[#2C3E50] py-3 px-4 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDiscountModal(false)}
                  className="flex-1 bg-[#4682B4] text-white py-3 px-4 rounded-xl hover:bg-[#2C3E50] transition-all duration-300 font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* On-Screen Keyboard */}
        {showKeyboard && (
          <OnScreenKeyboard
            onKeyPress={handleKeyPress}
            onClose={() => {
              setShowKeyboard(false);
              setKeyboardTarget('');
            }}
            target={keyboardTarget}
          />
        )}
      </div>
    </div>
  );
}