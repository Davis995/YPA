import React, { useState, useEffect } from 'react';
import { ShoppingCart, Phone, Plus, Minus, X, Check, Utensils, Clock, Star, Users, Sparkles, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { menuApi, categoriesApi, cartApi, waiterRequestsApi } from '../../data/api';
import { paymentService } from '../../services/PaymentService';
import toast from 'react-hot-toast';

// Enhanced Type definitions
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: number;
  categoryName: string;
  is_available: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  specialRequests?: string;
  subtotal: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const CustomerOrdering: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State management
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cash',
      name: 'Cash',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Pay with cash when order arrives'
    },
    {
      id: 'mtn_momo',
      name: 'MTN Mobile Money',
      icon: <Smartphone className="h-6 w-6 text-yellow-600" />,
      description: 'Pay with MTN MoMo'
    },
    {
      id: 'airtel_money',
      name: 'Airtel Money',
      icon: <Smartphone className="h-6 w-6 text-red-600" />,
      description: 'Pay with Airtel Money'
    }
  ];

  // API Queries
  const { data: menuData, isLoading: menuLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: menuApi.getAll,
    refetchInterval: 30000 // Refresh menu every 30 seconds
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    refetchInterval: 30000
  });

  // Order status polling
  const { data: orderStatusData } = useQuery({
    queryKey: ['order-status', currentOrderId],
    queryFn: async () => {
      if (!currentOrderId) return null;
      // Poll the table orders to get current status
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/menuOrder`);
      const orders = await response.json();
      return orders.find((order: any) => order.id === currentOrderId);
    },
    enabled: !!currentOrderId,
    refetchInterval: 3000, // Poll every 3 seconds
    refetchIntervalInBackground: true
  });

  // Mutations
  const orderMutation = useMutation({
    mutationFn: cartApi.create,
    onSuccess: (response) => {
      const orderId = response.data?.id || Date.now(); // Fallback ID
      setCurrentOrderId(orderId);
      setOrderStatus('pending');
      setCart([]);
      setShowPayment(false);
      toast.success('Order placed successfully!');
      // Redirect to order status page
      setTimeout(() => {
        navigate(`/order-status/${tableId}/${orderId}`);
      }, 1500);
    },
    onError: () => {
      toast.error('Failed to place order. Please try again.');
    }
  });

  const waiterCallMutation = useMutation({
    mutationFn: waiterRequestsApi.create,
    onSuccess: () => {
      toast.success('Waiter has been notified!');
    },
    onError: () => {
      toast.error('Failed to call waiter. Please try again.');
    }
  });

  // Effects
  useEffect(() => {
    if (orderStatusData) {
      setOrderStatus(orderStatusData.status);
    }
  }, [orderStatusData]);

  // Helper functions
  const menuItems = menuData?.data || [];
  const categories = categoriesData?.data || [];

  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item: MenuItem) => item.category === selectedCategory)
    : menuItems;

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Cart management
  const addToCart = (menuItem: MenuItem, quantity: number, specialRequests?: string) => {
    const existingItemIndex = cart.findIndex(item => 
      item.id === menuItem.id && item.specialRequests === specialRequests
    );

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].quantity * menuItem.price;
      setCart(updatedCart);
    } else {
      const cartItem: CartItem = {
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
        specialRequests,
        subtotal: quantity * menuItem.price
      };
      setCart([...cart, cartItem]);
    }
    
    toast.success(`${menuItem.name} added to cart!`);
  };

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }

    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    updatedCart[index].subtotal = newQuantity * updatedCart[index].price;
    setCart(updatedCart);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    toast.success('Item removed from cart');
  };

  // Order placement
  const handlePlaceOrder = async () => {
    if (!tableId || cart.length === 0) {
      toast.error('Please add items to cart before placing order');
      return;
    }

    if (!customerDetails.name || !customerDetails.phone) {
      toast.error('Please provide your name and phone number');
      return;
    }

    const orderData = {
      table_id: tableId,
      total_amount: getCartTotal(),
      status: 'pending',
      payment_method: selectedPaymentMethod,
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone,
      customer_email: customerDetails.email,
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price.toString(),
        special_requests: item.specialRequests || ''
      }))
    };

    orderMutation.mutate(orderData);
  };

  // Waiter call
  const callWaiter = () => {
    if (!tableId) return;
    
    waiterCallMutation.mutate({
      table_number: tableId,
      message: 'Customer needs assistance',
      status: 'pending'
    });
  };

  // Payment processing using PaymentService
  const processPayment = async () => {
    if (!tableId || cart.length === 0) {
      toast.error('Please add items to cart before placing order');
      return;
    }

    if (!customerDetails.name || !customerDetails.phone) {
      toast.error('Please provide your name and phone number');
      return;
    }

    try {
      const paymentRequest = {
        amount: getCartTotal(),
        currency: 'UGX',
        phoneNumber: customerDetails.phone,
        paymentMethod: selectedPaymentMethod as 'cash' | 'mtn_momo' | 'airtel_money',
        orderId: `TABLE_${tableId}_${Date.now()}`,
        customerName: customerDetails.name,
        description: `Order for Table ${tableId} - ${cart.length} items`
      };

      // Validate phone number for mobile money
      if (selectedPaymentMethod !== 'cash') {
        if (!paymentService.validatePhoneNumber(customerDetails.phone)) {
          toast.error('Please enter a valid phone number for mobile money payment');
          return;
        }
      }

      toast.loading('Processing payment...', { id: 'payment' });

      const paymentResponse = await paymentService.processPayment(paymentRequest);

      toast.dismiss('payment');

      if (paymentResponse.success) {
        toast.success(paymentResponse.message);
        handlePlaceOrder();
      } else {
        toast.error(paymentResponse.message);
      }
    } catch (error) {
      toast.dismiss('payment');
      toast.error('Payment processing failed. Please try again.');
      console.error('Payment error:', error);
    }
  };

  // Order status display
  const getOrderStatusDisplay = () => {
    if (!orderStatus) return null;

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Order Received', icon: Clock },
      confirmed: { color: 'bg-blue-100 text-blue-800', text: 'Order Confirmed', icon: Check },
      preparing: { color: 'bg-orange-100 text-orange-800', text: 'Being Prepared', icon: Utensils },
      ready: { color: 'bg-green-100 text-green-800', text: 'Ready for Pickup', icon: Star },
      delivered: { color: 'bg-gray-100 text-gray-800', text: 'Delivered', icon: Check },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled', icon: X }
    };

    const config = statusConfig[orderStatus as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg ${config.color}`}>
        <div className="flex items-center justify-center">
          <Icon className="h-5 w-5 mr-2" />
          <span className="font-medium">{config.text}</span>
        </div>
      </div>
    );
  };

  if (menuLoading || categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {getOrderStatusDisplay()}
      
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Table {tableId}</h1>
              <p className="text-gray-600">Select items from our menu</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={callWaiter}
                disabled={waiterCallMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Phone className="h-4 w-4 mr-2" />
                {waiterCallMutation.isPending ? 'Calling...' : 'Call Waiter'}
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Items
          </button>
          {categories.map((category: Category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredMenuItems.map((item: MenuItem) => (
            <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onProceedToPayment={() => {
            setShowCart(false);
            setShowPayment(true);
          }}
          total={getCartTotal()}
        />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          total={getCartTotal()}
          paymentMethods={paymentMethods}
          selectedPaymentMethod={selectedPaymentMethod}
          onSelectPaymentMethod={setSelectedPaymentMethod}
          customerDetails={customerDetails}
          onUpdateCustomerDetails={setCustomerDetails}
          onClose={() => setShowPayment(false)}
          onConfirmOrder={processPayment}
          isProcessing={orderMutation.isPending}
        />
      )}
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard: React.FC<{
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity: number, specialRequests?: string) => void;
}> = ({ item, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="relative h-48">
          <img
            src={item.image ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${item.image}` : '/placeholder-food.jpg'}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-food.jpg';
            }}
          />
          {!item.is_available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-2">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-orange-600">{formatPrice(item.price)}</span>
            <button
              onClick={() => setShowDetails(true)}
              disabled={!item.is_available}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <img
                src={item.image ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${item.image}` : '/placeholder-food.jpg'}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <p className="text-gray-600 mb-4">{item.description}</p>
              <p className="text-2xl font-bold text-orange-600 mb-4">{formatPrice(item.price)}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any special instructions..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onAddToCart(item, quantity, specialRequests);
                      setShowDetails(false);
                      setQuantity(1);
                      setSpecialRequests('');
                    }}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Cart Modal Component
const CartModal: React.FC<{
  cart: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToPayment: () => void;
  total: number;
}> = ({ cart, onClose, onUpdateQuantity, onRemoveItem, onProceedToPayment, total }) => {
  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      {item.specialRequests && (
                        <p className="text-sm text-gray-600">Note: {item.specialRequests}</p>
                      )}
                      <p className="text-orange-600 font-semibold">{formatPrice(item.price)} each</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="text-lg font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="p-1 rounded bg-gray-100 hover:bg-gray-200"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(item.subtotal)}</p>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">{formatPrice(total)}</span>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={onProceedToPayment}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Modal Component
const PaymentModal: React.FC<{
  cart: CartItem[];
  total: number;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string;
  onSelectPaymentMethod: (method: string) => void;
  customerDetails: { name: string; phone: string; email: string };
  onUpdateCustomerDetails: (details: { name: string; phone: string; email: string }) => void;
  onClose: () => void;
  onConfirmOrder: () => void;
  isProcessing: boolean;
}> = ({
  cart,
  total,
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  customerDetails,
  onUpdateCustomerDetails,
  onClose,
  onConfirmOrder,
  isProcessing
}) => {
  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Order</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Customer Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => onUpdateCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => onUpdateCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+256 XXX XXX XXX"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => onUpdateCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={() => onSelectPaymentMethod(method.id)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    {method.icon}
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && (
                    <Check className="h-5 w-5 text-orange-600 ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-orange-600">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isProcessing}
            >
              Back to Cart
            </button>
            <button
              onClick={onConfirmOrder}
              disabled={isProcessing || !customerDetails.name || !customerDetails.phone}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                `Confirm Order - ${formatPrice(total)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrdering;
