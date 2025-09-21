import React, { useState, useEffect } from 'react';
import { ShoppingCart, Phone, Plus, Minus, X, Check, Utensils, Clock, Star, Users, Sparkles, Loader2, CreditCard, Smartphone } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { waiterRequestsApi } from '../../data/api';
import { paymentService } from '../../services/PaymentService';
import { notificationService } from '../../services/NotificationService';
import toast from 'react-hot-toast';

const baseUrl = import.meta.env.VITE_API_URL
// Type definitions
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: number;
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
}

interface MenuItemProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem & { quantity: number; specialRequests?: string }) => void;
}

const MenuItemCard: React.FC<MenuItemProps> = ({ item, onAddToCart }) => {
  // Format price for display (Ugandan Shillings)
  const formatPrice = (price: number) => {
    return `UGX ${price.toLocaleString()}`;
  };
  
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const handleAddToCart = () => {
    onAddToCart({
      ...item,
      quantity,
      specialRequests
    });
    setQuantity(1);
    setSpecialRequests('');
    setShowModal(false);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-amber-100 hover:border-amber-200 overflow-hidden">
        {/* Image Section */}
        <div className="relative h-40 sm:h-48 overflow-hidden">
          <img 
            src={`${baseUrl}${item.image}`} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTQwSDYwVjEyMEgxNDBWMTQwSDEwMFpNMTAwIDEwMEM5MS43ODk5IDEwMCA4NC40ODI3IDk2Ljg5MjkgNzkuMzkzNCA5MS42MDY2Qzc0LjMwNDEgODYuMzIwMyA3MS4yNSA3OC45MTMgNzEuMjUgNzEuMjVDNzEuMjUgNjMuNTg3IDc0LjMwNDEgNTYuMTc5NyA3OS4zOTM0IDUwLjg5MzRDODQuNDgyNyA0NS42MDcxIDkxLjc4OTkgNDIuNSAxMDAgNDIuNUMxMDguMjEgNDIuNSAxMTUuNTE3IDQ1LjYwNzEgMTIwLjYwNyA1MC44OTM0QzEyNS42OTYgNTYuMTc5NyAxMjguNzUgNjMuNTg3IDEyOC43NSA3MS4yNUMxMjguNzUgNzguOTEzIDEyNS42OTYgODYuMzIwMyAxMjAuNjA3IDkxLjYwNjZDMTE1LjUxNyA5Ni44OTI5IDEwOC4yMSAxMDAgMTAwIDEwMFpNMTAwIDkwQzEwNS41MjMgOTAgMTEwLjc4MSA4Ny42MzM5IDExNC42NDkgODMuNzEzMkMxMTguNTE3IDc5Ljc5MjUgMTIwLjgzMyA3NC40NTY1IDEyMC44MzMgNjguNzVDMTIwLjgzMyA2My4wNDM1IDExOC41MTcgNTcuNzA3NSAxMTQuNjQ5IDUzLjc4NjhDMTEwLjc4MSA0OS44NjYxIDEwNS41MjMgNDcuNSAxMDAgNDcuNUM5NC40NzcgNDcuNSA4OS4yMTkgNDkuODY2MSA4NS4zNTA1IDUzLjc4NjhDODEuNDgyIDU3LjcwNzUgNzkuMTY2NyA2My4wNDM1IDc5LjE2NjcgNjguNzVDNzkuMTY2NyA3NC40NTY1IDgxLjQ4MiA3OS43OTI1IDg1LjM1MDUgODMuNzEzMkM4OS4yMTkgODcuNjMzOSA5NC40NzcgOTAgMzIgOTBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-3 right-3">
            <div className="bg-white/95 backdrop-blur-sm text-amber-800 px-3 py-1 rounded-xl text-sm font-bold border border-amber-200 shadow-lg">
              {formatPrice(item.price)}
            </div>
          </div>
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm">
                Currently Unavailable
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-amber-900 transition-colors duration-300 line-clamp-2">{item.name}</h3>
          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">{item.description}</p>
          
          <button
            onClick={() => setShowModal(true)}
            disabled={!item.is_available}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none text-sm sm:text-base"
          >
            <Plus size={16} />
            <span>{item.is_available ? 'Add to Order' : 'Unavailable'}</span>
            {item.is_available && <Sparkles size={12} className="opacity-80" />}
          </button>
        </div>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 sm:gap-4 flex-1 min-w-0">
                  {/* Item Image in Modal */}
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
                    <img 
                      src={`${baseUrl}${item.image}`} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0NEgxOVY0MEg0NVY0NEgzMlpNMzIgMzJDMjkuMzUgMzIgMjYuODc1IDMwLjg5NSAyNS4wNjYgMjkuMDg2QzIzLjI1NyAyNy4yNzcgMjIuMTUyIDI0LjggMjIuMTUyIDIyLjE1MkMyMi4xNTIgMTkuNTA0IDIzLjI1NyAxNy4wMjcgMjUuMDY2IDE1LjIxOEMyNi44NzUgMTMuNDA5IDI5LjM1IDEyLjMwNCAzMiAxMi4zMDRDMzQuNjUgMTIuMzA0IDM3LjEyNSAxMy40MDkgMzguOTM0IDE1LjIxOEM0MC43NDMgMTcuMDI3IDQxLjg0OCAxOS41MDQgNDEuODQ4IDIyLjE1MkM0MS44NDggMjQuOCA0MC43NDMgMjcuMjc3IDM4LjkzNCAyOS4wODZDMzcuMTI1IDMwLjg5NSAzNC42NSAzMiAzMiAzMlpNMzIgMjguOEMzMy43NjggMjguOCAzNS40NjQgMjguMjE4IDM2Ljc0IDI3LjA5NkMzOC4wMTYgMjUuOTc0IDM4Ljc2NCAyNC4zNzUgMzguNzY0IDIyLjRDMzguNzY0IDIwLjQyNSAzOC4wMTYgMTguODI2IDM2Ljc0IDE3LjcwNEMzNS40NjQgMTYuNTgyIDMzLjc2OCAxNiAzMiAxNkMzMC4yMzIgMTYgMjguNTM2IDE2LjU4MiAyNy4yNiAxNy43MDRDMjUuOTg0IDE4LjgyNiAyNS4yMzYgMjAuNDI1IDI1LjIzNiAyMi40QzI1LjIzNiAyNC4zNzUgMjUuOTg0IDI1Ljk3NCAyNy4yNiAyNy4wOTZDMjguNTM2IDI4LjIxOCAzMC4yMzIgMjguOCAzMiAyOC44WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">Customize Order</h3>
                    <p className="text-amber-700 font-medium text-sm sm:text-base truncate">{item.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors flex-shrink-0 ml-2"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center hover:from-amber-50 hover:to-orange-50 hover:border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <Minus size={16} className="text-gray-700" />
                  </button>
                  <span className="text-2xl sm:text-3xl font-bold px-4 text-gray-900 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-center hover:from-amber-100 hover:to-orange-100 hover:border-amber-300 transition-all duration-200"
                  >
                    <Plus size={16} className="text-amber-700" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any dietary requirements, cooking preferences, or special instructions..."
                  className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none h-20 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200 text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {formatPrice(item.price * quantity)}
                  </span>
                  <p className="text-gray-600 text-sm">Total amount</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const RestaurantMenu: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate(); // Typing useParams
  const [tableIda, setTableId] = useState<number | undefined>(undefined); // Initialize as number or undefined

  useEffect(() => {
    // Convert tableId to a number when the component mounts or when tableId changes
    if (tableId) {
      const id = parseInt(tableId, 10);
      if (!isNaN(id)) {
        setTableId(id); // Set the state only if it's a valid number
      }
    }
  }, [tableId]); // Run effect when tableId changes
  // API Queries with proper error handling
  const { data: menuItems, isLoading: menuLoading, error: menuError } = useQuery({
    queryKey: ["menu"],
    refetchInterval:5000,
    queryFn: () => (
      fetch(`${baseUrl}/api/menu/`, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => {
        if (!res.ok) throw new Error('Failed to fetch menu');
        return res.json();
      })
    )
  });

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => (
      fetch(`${baseUrl}/api/categories/`, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(res => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      })
    ),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Waiter call mutation
  const waiterCallMutation = useMutation({
    mutationFn: waiterRequestsApi.create,
    onSuccess: () => {
      toast.success('Waiter has been notified!');
    },
    onError: () => {
      toast.error('Failed to call waiter. Please try again.');
    }
  });

  // Payment methods
  const paymentMethods = [
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

  // Format price for display (Ugandan Shillings)
  const formatPrice = (price: number) => {
    return `UGX ${price.toLocaleString()}`;
  };

  // State declarations
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Order status polling when there's an active order
  const { data: orderStatusData } = useQuery({
    queryKey: ['current-order-status', currentOrderId],
    queryFn: async () => {
      if (!currentOrderId) return null;
      try {
        const response = await fetch(`${baseUrl}/api/menuOrder`);
        if (!response.ok) return null;
        const orders = await response.json();
        return orders.find((order: any) => order.id === currentOrderId) || null;
      } catch (error) {
        console.error('Error fetching order status:', error);
        return null;
      }
    },
    enabled: !!currentOrderId,
    refetchInterval: currentOrderId ? 3000 : false, // Only poll when there's an active order
    refetchIntervalInBackground: true,
    retry: false, // Don't retry failed requests
    refetchOnWindowFocus: false
  });

  // Update order status when data changes
  useEffect(() => {
    if (orderStatusData) {
      const newStatus = orderStatusData.status;
      
      // Only update if status actually changed
      if (newStatus !== orderStatus) {
        setOrderStatus(newStatus);
        
        // Show toast notification for status changes
        const statusMessages = {
          confirmed: '✅ Order confirmed by kitchen!',
          preparing: '👨‍🍳 Your food is being prepared!',
          ready: '🍽️ Order ready for pickup!',
          delivered: '🎉 Order delivered! Enjoy your meal!'
        };
        
        const message = statusMessages[newStatus as keyof typeof statusMessages];
        if (message) {
          toast.success(message, { duration: 4000 });
        }
      }
      
      // If order is delivered, reset the interface after 8 seconds
      if (newStatus === 'delivered') {
        setTimeout(() => {
          setCurrentOrderId(null);
          setOrderStatus(null);
          setOrderSubmitted(false);
          toast.success('Thank you! You can place another order.', { duration: 6000 });
        }, 8000);
      }
    }
  }, [orderStatusData, orderStatus]);


  useEffect(() => {
    if (categories && categories.length > 0 && activeCategory === null) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const addToCart = (item: MenuItem & { quantity: number; specialRequests?: string }) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        specialRequests: item.specialRequests
      }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (selectedPaymentMethod !== 'cash' && !customerDetails.phone) {
      toast.error('Please provide your phone number for mobile money payment');
      return;
    }

    setLoading(true);
    
    try {
      // Process payment first
      const paymentRequest = {
        amount: getTotalPrice(),
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
          setLoading(false);
          return;
        }
      }

      toast.loading('Processing payment...', { id: 'payment' });
      const paymentResponse = await paymentService.processPayment(paymentRequest);
      toast.dismiss('payment');

      if (!paymentResponse.success) {
        toast.error(paymentResponse.message);
        setLoading(false);
        return;
      }

      toast.success(paymentResponse.message);

      // Submit order after successful payment
       const orderData = {
        table_id: tableId,
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
          price: item.price,
        special_requests: item.specialRequests || null
      })),
      total_amount: getTotalPrice(),
        status: 'pending',
        payment_method: selectedPaymentMethod,
        customer_name: customerDetails.name || 'Table Customer',
        customer_phone: customerDetails.phone || '',
        customer_email: customerDetails.email || ''
      };

      const response = await fetch(`${baseUrl}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      
      if (data) {
        const orderId = data.id || Date.now();
        setCurrentOrderId(orderId);
           setOrderSubmitted(true);
        setOrderStatus('pending');
    setCart([]);
    setShowCart(false);
        setShowPayment(false);
        toast.success('Order placed successfully! Tracking status...');

        // Send notifications to admin and kitchen
        notificationService.notifyNewOrder(tableId!, orderId, getTotalPrice());
        notificationService.notifyPaymentSuccess(tableId!, orderId, selectedPaymentMethod, getTotalPrice());
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
    setLoading(false);
    }
  };

  const callWaiter = () => {
    if (!tableId) return;
    
    waiterCallMutation.mutate({
      table_number: tableId,
      message: 'Customer needs assistance',
      status: 'pending'
    });

    // Send notifications to admin, kitchen, and waiter management
    notificationService.notifyWaiterRequest(tableId, 'Customer needs assistance - Please respond promptly');
    
    // Additional kitchen-specific notification
    notificationService.notify({
      type: 'waiter_request',
      title: `🚨 Service Alert - Table ${tableId}`,
      message: 'Customer called waiter - May affect order timing',
      tableId,
      priority: 'high',
      data: { tableId, source: 'customer_call', alert_kitchen: true }
    });
  };

  // Filter menu items by active category
  const activeMenuItems = menuItems?.filter((item: MenuItem) => item.category === activeCategory) || [];

  // Helper function to find menu item by ID for cart images
  const findMenuItem = (id: number): MenuItem | undefined => {
    return menuItems?.find((item: MenuItem) => item.id === id);
  };

  // Get order status display with progress bar
  const getOrderStatusDisplay = () => {
    if (!orderStatus || !currentOrderId) return null;

    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-500', text: 'Order Received', icon: '⏳', progress: 20 },
      confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-500', text: 'Order Confirmed', icon: '✅', progress: 40 },
      preparing: { color: 'bg-orange-100 text-orange-800 border-orange-500', text: 'Being Prepared', icon: '👨‍🍳', progress: 70 },
      ready: { color: 'bg-green-100 text-green-800 border-green-500', text: 'Ready for Pickup', icon: '🍽️', progress: 90 },
      delivered: { color: 'bg-gray-100 text-gray-800 border-gray-500', text: 'Delivered - Thank You!', icon: '🎉', progress: 100 }
    };

    const config = statusConfig[orderStatus as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <div className={`fixed top-4 left-4 right-4 z-50 rounded-lg shadow-lg border-l-4 ${config.color}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl mr-3">{config.icon}</span>
              <div>
                <div className="font-semibold text-sm sm:text-base">{config.text}</div>
                <div className="text-xs sm:text-sm opacity-75">Order #{currentOrderId} • Table {tableId}</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${config.progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="opacity-75">{config.progress}% Complete</span>
            {orderStatus !== 'delivered' && (
              <span className="opacity-75">Estimated: {Math.max(1, Math.ceil((100 - config.progress) / 20))} min</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading states
  if (menuLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 size={32} className="text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Menu</h2>
          <p className="text-gray-600">Preparing your dining experience...</p>
        </div>
      </div>
    );
  }

  // Error states
  if (menuError || categoriesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl border border-red-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <X size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">Unable to load the menu. Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-12 max-w-lg w-full text-center border border-amber-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-white" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-base sm:text-xl text-gray-600 mb-6">
            Your delicious order for Table {tableId} is now being prepared with care.
          </p>
          <div className="flex items-center justify-center gap-3 text-amber-600 mb-6 bg-amber-50 py-3 px-4 rounded-xl border border-amber-100">
            <Clock size={20} />
            <span className="text-sm sm:text-lg font-semibold">15-30 minutes</span>
          </div>
          <button 
            onClick={() => setOrderSubmitted(false)}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue Ordering
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-orange-50/30">
      {/* Modern Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-amber-100 sticky top-0 z-40 shadow-lg">
        {/* Order Progress Bar (if active order) */}
        {orderStatus && currentOrderId && (
          <div className={`border-b transition-all duration-500 ${
            orderStatus === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' :
            orderStatus === 'confirmed' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' :
            orderStatus === 'preparing' ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200' :
            orderStatus === 'ready' ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' :
            'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
              {(() => {
                const statusConfig = {
                  pending: { 
                    text: 'Order Received', 
                    icon: '⏳', 
                    progress: 20, 
                    color: 'from-yellow-400 to-yellow-500',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-300',
                    textColor: 'text-yellow-800'
                  },
                  confirmed: { 
                    text: 'Order Confirmed', 
                    icon: '✅', 
                    progress: 40, 
                    color: 'from-blue-400 to-blue-500',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-300',
                    textColor: 'text-blue-800'
                  },
                  preparing: { 
                    text: 'Being Prepared', 
                    icon: '👨‍🍳', 
                    progress: 70, 
                    color: 'from-orange-400 to-orange-500',
                    bgColor: 'bg-orange-50',
                    borderColor: 'border-orange-300',
                    textColor: 'text-orange-800'
                  },
                  ready: { 
                    text: 'Ready for Pickup', 
                    icon: '🍽️', 
                    progress: 90, 
                    color: 'from-green-400 to-green-500',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-300',
                    textColor: 'text-green-800'
                  },
                  delivered: { 
                    text: 'Delivered - Thank You!', 
                    icon: '🎉', 
                    progress: 100, 
                    color: 'from-purple-400 to-purple-500',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-300',
                    textColor: 'text-purple-800'
                  }
                };
                
                const config = statusConfig[orderStatus as keyof typeof statusConfig];
                if (!config) return null;
                
                return (
                  <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-3 sm:p-4`}>
                    {/* Status Header - Mobile Responsive */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <span className="text-lg sm:text-xl mr-2 flex-shrink-0">{config.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold text-sm sm:text-base ${config.textColor} truncate`}>
                            {config.text}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Order #{currentOrderId}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold ${config.textColor} flex-shrink-0`}>
                        {config.progress}%
                      </div>
                    </div>
                    
                    {/* Progress Bar with Animation */}
                    <div className="relative">
                      <div className="w-full bg-gray-300 rounded-full h-2 sm:h-3 overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${config.color} h-full rounded-full transition-all duration-2000 ease-out shadow-sm`}
                          style={{ 
                            width: `${config.progress}%`,
                            boxShadow: config.progress > 0 ? 'inset 0 1px 2px rgba(255,255,255,0.3)' : 'none'
                          }}
                        >
                          {/* Animated shimmer effect for active progress */}
                          {orderStatus !== 'delivered' && (
                            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress indicators */}
                      <div className="flex justify-between mt-1">
                        <div className="text-xs text-gray-500">Table {tableId}</div>
                        <div className="text-xs text-gray-500">
                          {orderStatus === 'delivered' ? 'Complete!' : `~${Math.max(1, Math.ceil((100 - config.progress) / 25))} min left`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Utensils size={24} className="text-white sm:w-8 sm:h-8" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles size={8} className="text-white sm:w-3 sm:h-3" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent truncate">
                 YPAMubuzichoma
                </h1>
                <div className="flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Users size={14} className="text-amber-500 sm:w-4 sm:h-4" />
                    <span className="text-gray-700 font-semibold text-xs sm:text-base">Table {tableId}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span className="text-gray-600 text-sm">Premium Dining</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-white hover:bg-amber-50 text-gray-900 font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 flex items-center gap-2 border border-gray-200 hover:border-amber-200 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              
              <button
                onClick={callWaiter}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              >
                <Phone size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Call Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Category Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-[80px] sm:top-[120px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto py-3 sm:py-6 gap-3 sm:gap-4 scrollbar-hide">
            {categories?.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 sm:px-8 py-2 sm:py-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 border-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] text-sm sm:text-base ${
                  activeCategory === category.id
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500 shadow-amber-200'
                    : 'bg-white hover:bg-amber-50 text-gray-700 border-gray-200 hover:border-amber-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {activeCategory && categories?.find((cat: Category) => cat.id === activeCategory) && (
          <div>
            {/* Category Header */}
            {/* <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">
                {categories.find((cat: Category) => cat.id === activeCategory)?.name}
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
                {categories.find((cat: Category) => cat.id === activeCategory)?.description}
              </p>
            </div> */}

            {/* Menu Items Grid */}
            {activeMenuItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {activeMenuItems.map((item: MenuItem) => (
                  <MenuItemCard key={item.id} item={item} onAddToCart={addToCart} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Utensils size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No items available</h3>
                <p className="text-gray-600">This category doesn't have any items right now.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modern Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-8 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Order</h3>
                  <p className="text-amber-700 font-medium">Table {tableId}</p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 sm:p-3 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <X size={24} className="text-gray-600 sm:w-7 sm:h-7" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {cart.length === 0 ? (
                <div className="text-center py-8 sm:py-16">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
                    <ShoppingCart size={32} className="text-gray-400 sm:w-10 sm:h-10" />
                  </div>
                  <p className="text-gray-500 text-xl sm:text-2xl font-medium mb-2">Your cart is empty</p>
                  <p className="text-gray-400 text-sm sm:text-base">Add some delicious items to get started!</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {cart.map((item) => {
                    const menuItem = findMenuItem(item.id);
                    return (
                      <div key={item.id} className="bg-gradient-to-r from-gray-50 to-amber-50/50 rounded-xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex gap-3 sm:gap-4 items-start">
                          {/* Cart Item Image */}
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                            <img 
                              src={menuItem?.image ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${menuItem.image}` : '/placeholder-image.png'} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0NEgxOVY0MEg0NVY0NEgzMlpNMzIgMzJDMjkuMzUgMzIgMjYuODc1IDMwLjg5NSAyNS4wNjYgMjkuMDg2QzIzLjI1NyAyNy4yNzcgMjIuMTUyIDI0LjggMjIuMTUyIDIyLjE1MkMyMi4xNTIgMTkuNTA0IDIzLjI1NyAxNy4wMjcgMjUuMDY2IDE1LjIxOEMyNi44NzUgMTMuNDA5IDI5LjM1IDEyLjMwNCAzMiAxMi4zMDRDMzQuNjUgMTIuMzA0IDM3LjEyNSAxMy40MDkgMzguOTM0IDE1LjIxOEM0MC43NDMgMTcuMDI3IDQxLjg0OCAxOS41MDQgNDEuODQ4IDIyLjE1MkM0MS44NDggMjQuOCA0MC43NDMgMjcuMjc3IDM4LjkzNCAyOS4wODZDMzcuMTI1IDMwLjg5NSAzNC42NSAzMiAzMiAzMlpNMzIgMjguOEMzMy43NjggMjguOCAzNS40NjQgMjguMjE4IDM2Ljc0IDI3LjA5NkMzOC4wMTYgMjUuOTc0IDM4Ljc2NCAyNC4zNzUgMzguNzY0IDIyLjRDMzguNzY0IDIwLjQyNSAzOC4wMTYgMTguODI2IDM2Ljc0IDE3LjcwNEMzNS40NjQgMTYuNTgyIDMzLjc2OCAxNiAzMiAxNkMzMC4yMzIgMTYgMjguNTM2IDE2LjU4MiAyNy4yNiAxNy43MDRDMjUuOTg0IDE4LjgyNiAyNS4yMzYgMjAuNDI1IDI1LjIzNiAyMi40QzI1LjIzNiAyNC4zNzUgMjUuOTg0IDI1Ljk3NCAyNy4yNiAyNy4wOTZDMjguNTM2IDI4LjIxOCAzMC4yMzIgMjguOCAzMiAyOC44WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-base sm:text-xl mb-1 sm:mb-2 truncate">{item.name}</h4>
                            <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">{formatPrice(item.price)} each</p>
                            {item.specialRequests && (
                              <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 sm:p-3 mt-2 sm:mt-3">
                                <p className="text-xs text-amber-700 font-semibold mb-1">Special Requests:</p>
                                <p className="text-xs sm:text-sm text-amber-800 break-words">{item.specialRequests}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border-2 border-gray-200 hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
                              >
                                <Minus size={14} className="text-gray-700" />
                              </button>
                              <span className="font-bold px-2 sm:px-4 text-gray-900 min-w-[40px] text-center text-base sm:text-xl">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-100 flex items-center justify-center transition-all duration-200"
                              >
                                <Plus size={14} className="text-amber-700" />
                              </button>
                            </div>
                            <div className="text-right flex items-center gap-2 sm:gap-3">
                              <span className="font-bold text-base sm:text-xl min-w-[80px] sm:min-w-[120px] text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 flex items-center justify-center transition-all border border-red-200 hover:border-red-300"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-4 sm:p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-amber-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-2xl sm:text-4xl font-bold text-gray-900 block">
                      {formatPrice(getTotalPrice())}
                    </span>
                    <p className="text-gray-600 text-sm sm:text-lg mt-1">{getTotalItems()} items total</p>
                  </div>
                  <button
                    onClick={() => setShowPayment(true)}
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 sm:py-5 px-6 sm:px-10 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 sm:gap-4 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-lg"
                  >
                      <Check size={20} className="sm:w-6 sm:h-6" />
                    <span>Proceed to Payment</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Complete Your Order</h2>
                <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Customer Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {selectedPaymentMethod !== 'cash' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                        <span className="text-xs text-gray-500 ml-1">(Required for {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name})</span>
                      </label>
                      <input
                        type="tel"
                        value={customerDetails.phone}
                        onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="+256 XXX XXX XXX"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedPaymentMethod === 'mtn_momo' && 'MTN numbers: 077, 078, 076'}
                        {selectedPaymentMethod === 'airtel_money' && 'Airtel numbers: 075, 070, 074'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="your.email@example.com (for receipt)"
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
                        onChange={() => setSelectedPaymentMethod(method.id)}
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
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-3 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPayment(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Back to Cart
                </button>
                <button
                  onClick={submitOrder}
                  disabled={loading || (selectedPaymentMethod !== 'cash' && !customerDetails.phone)}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Confirm Order - ${formatPrice(getTotalPrice())}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenu;