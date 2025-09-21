import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Utensils, Star, Truck, X, Phone, RefreshCw } from 'lucide-react';
import { tableOrdersApi, waiterRequestsApi } from '../../data/api';
import { OrderMenu } from '../../data/types';
import toast from 'react-hot-toast';

const OrderStatusTracker: React.FC = () => {
  const { tableId, orderId } = useParams<{ tableId: string; orderId: string }>();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch order status with aggressive polling
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['order-status', orderId],
    queryFn: async () => {
      const response = await tableOrdersApi.getAll();
      return response.data.find((order: OrderMenu) => order.id === parseInt(orderId || '0'));
    },
    enabled: !!orderId,
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true
  });

  const order = ordersData;

  // Status configuration
  const statusSteps = [
    {
      key: 'pending',
      title: 'Order Received',
      description: 'Your order has been received and is being reviewed',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-500'
    },
    {
      key: 'confirmed',
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and sent to the kitchen',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-500'
    },
    {
      key: 'preparing',
      title: 'Being Prepared',
      description: 'Our chefs are preparing your delicious meal',
      icon: Utensils,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-500'
    },
    {
      key: 'ready',
      title: 'Ready for Pickup',
      description: 'Your order is ready! A waiter will bring it to your table',
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-500'
    },
    {
      key: 'delivered',
      title: 'Delivered',
      description: 'Enjoy your meal! Thank you for dining with us',
      icon: Truck,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-500'
    }
  ];

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusSteps.findIndex(step => step.key === order.status);
  };

  // Calculate time elapsed since order
  const getTimeElapsed = () => {
    if (!order) return 0;
    const orderTime = new Date(order.created_at);
    return Math.floor((currentTime.getTime() - orderTime.getTime()) / 1000 / 60);
  };

  // Get estimated delivery time
  const getEstimatedTime = () => {
    if (!order) return null;
    
    const baseTime = {
      pending: 25,
      confirmed: 20,
      preparing: 15,
      ready: 5,
      delivered: 0
    };

    return baseTime[order.status as keyof typeof baseTime] || 0;
  };

  // Call waiter function
  const callWaiter = async () => {
    if (!tableId) return;
    
    try {
      await waiterRequestsApi.create({
        table_number: tableId,
        message: 'Customer needs assistance with their order',
        status: 'pending'
      });
      toast.success('Waiter has been notified!');
    } catch (error) {
      toast.error('Failed to call waiter. Please try again.');
    }
  };

  // Manual refresh
  const handleRefresh = () => {
    refetch();
    toast.success('Status updated!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(`/menu/${tableId}`)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const timeElapsed = getTimeElapsed();
  const estimatedTime = getEstimatedTime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Status</h1>
              <p className="text-sm sm:text-base text-gray-600">Table {tableId} • Order #{order.id}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={handleRefresh}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
              >
                <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">↻</span>
              </button>
              <button
                onClick={callWaiter}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Phone className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Call Waiter</span>
                <span className="sm:hidden">📞</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Order Summary</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Placed {timeElapsed} minutes ago • {order.payment_method_display}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                UGX {order.total_price.toLocaleString()}
              </div>
              {estimatedTime > 0 && (
                <div className="text-sm text-orange-600 font-medium">
                  ~{estimatedTime} min remaining
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">{item.item}</h3>
                  {item.special_request && (
                    <p className="text-xs sm:text-sm text-orange-600 mt-1 break-words">
                      Special request: {item.special_request}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">x{item.quantity}</div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    UGX {item.subtotal.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Order Progress</h2>
          
          <div className="space-y-4 sm:space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="flex items-start space-x-3 sm:space-x-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? `${step.bgColor} ${step.borderColor}`
                          : 'bg-gray-100 border-gray-300'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          isCompleted ? step.color : 'text-gray-400'
                        } ${isCurrent ? 'animate-pulse' : ''}`}
                      />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 sm:h-16 mt-2 transition-colors ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6 sm:pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1 gap-1 sm:gap-0">
                      <h3
                        className={`text-base sm:text-lg font-semibold ${
                          isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {isCurrent && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            Current
                          </span>
                        )}
                        {isCompleted && !isCurrent && (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs sm:text-sm ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </p>
                    {isCurrent && estimatedTime > 0 && (
                      <div className="mt-2 text-xs sm:text-sm text-orange-600 font-medium">
                        Estimated time: {estimatedTime} minutes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate(`/menu/${tableId}`)}
            className="px-4 py-3 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Order More Items
          </button>
          {order.status === 'delivered' && (
            <button
              onClick={() => navigate(`/menu/${tableId}`)}
              className="px-4 py-3 sm:px-6 sm:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base"
            >
              Place Another Order
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-6 sm:mt-8 bg-blue-50 rounded-xl p-4 sm:p-6 text-center">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-sm sm:text-base text-blue-700 mb-4">
            If you have any questions about your order or need assistance, our staff is here to help.
          </p>
          <button
            onClick={callWaiter}
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            <Phone className="h-4 w-4 mr-1 sm:mr-2" />
            Call Waiter
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusTracker;
