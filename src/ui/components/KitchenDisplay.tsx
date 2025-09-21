import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, CheckCircle, AlertCircle, Utensils, Users, Timer, Bell, User, Phone } from 'lucide-react';
import { tableOrdersApi, waitersApi } from '../../data/api';
import { OrderMenu, Waiter } from '../../data/types';
import { useNotifications } from '../../services/NotificationService';
import toast from 'react-hot-toast';

const KitchenDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const queryClient = useQueryClient();
  const { notifications } = useNotifications();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Audio alert for new waiter calls
  useEffect(() => {
    const waiterRequests = notifications.filter(n => n.type === 'waiter_request');
    const currentCount = waiterRequests.length;
    
    // Play sound if new waiter call detected
    if (currentCount > lastNotificationCount && lastNotificationCount > 0) {
      // Play notification sound (using browser's notification sound)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIF2m98OScTgwOUarm7LdnHgU2jdXzzn0vBSF1xe/eizEIHWq+8+OWT');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Fallback: show toast if audio fails
          toast.success('🔔 New waiter call received!', {
            duration: 3000,
            position: 'top-center'
          });
        });
      } catch (error) {
        // Fallback notification
        toast.success('🔔 New waiter call received!', {
          duration: 3000,
          position: 'top-center'
        });
      }
    }
    
    setLastNotificationCount(currentCount);
  }, [notifications, lastNotificationCount]);

  // Fetch orders with aggressive polling for real-time updates
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: tableOrdersApi.getAll,
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: true
  });

  // Fetch waiters with polling for real-time status updates
  const { data: waitersData } = useQuery({
    queryKey: ['waiters'],
    queryFn: waitersApi.getAll,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderMenu['status'] }) => 
      tableOrdersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
      toast.success('Order status updated');
    },
    onError: () => {
      toast.error('Failed to update order status');
    }
  });

  // Waiter status update mutation
  const updateWaiterStatusMutation = useMutation({
    mutationFn: ({ waiter_id, status }: { waiter_id: number; status: string }) => 
      waitersApi.updateStatus(waiter_id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiters'] });
      toast.success('Waiter status updated');
    },
    onError: () => {
      toast.error('Failed to update waiter status');
    }
  });

  const orders = ordersData?.data || [];
  
  // Filter orders for kitchen display (exclude delivered and cancelled)
  const kitchenOrders = orders.filter((order: OrderMenu) => 
    !['delivered', 'cancelled'].includes(order.status)
  );

  // Group orders by status
  const ordersByStatus = {
    pending: kitchenOrders.filter((order: OrderMenu) => order.status === 'pending'),
    confirmed: kitchenOrders.filter((order: OrderMenu) => order.status === 'confirmed'),
    preparing: kitchenOrders.filter((order: OrderMenu) => order.status === 'preparing'),
    ready: kitchenOrders.filter((order: OrderMenu) => order.status === 'ready')
  };

  // Calculate time elapsed since order creation
  const getTimeElapsed = (createdAt: string) => {
    const created = new Date(createdAt);
    const elapsed = Math.floor((currentTime.getTime() - created.getTime()) / 1000 / 60);
    return elapsed;
  };

  // Get priority based on elapsed time
  const getPriority = (minutes: number) => {
    if (minutes > 30) return { level: 'urgent', color: 'bg-red-500', textColor: 'text-red-600' };
    if (minutes > 20) return { level: 'high', color: 'bg-orange-500', textColor: 'text-orange-600' };
    if (minutes > 10) return { level: 'medium', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { level: 'normal', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  // Handle status updates
  const handleStatusUpdate = (orderId: number, newStatus: OrderMenu['status']) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  // Get next status for an order
  const getNextStatus = (currentStatus: OrderMenu['status']): OrderMenu['status'] | null => {
    const statusFlow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered'
    };
    return statusFlow[currentStatus] || null;
  };

  // Audio notification for new orders
  useEffect(() => {
    const newPendingOrders = ordersByStatus.pending.length;
    if (newPendingOrders > 0) {
      // Play notification sound (you can add actual audio file)
      console.log('🔔 New orders pending!');
    }
  }, [ordersByStatus.pending.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <Utensils className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading kitchen display...</p>
        </div>
      </div>
    );
  }

  // Get kitchen-relevant notifications
  const waiterRequests = notifications.filter(n => n.type === 'waiter_request').slice(0, 8);
  const newOrders = notifications.filter(n => n.type === 'new_order').slice(0, 3);
  
  // Separate kitchen alerts from regular waiter requests
  const kitchenAlerts = waiterRequests.filter(n => n.data?.alert_kitchen);
  const regularWaiterRequests = waiterRequests.filter(n => !n.data?.alert_kitchen);
  const allWaiterRequests = [...kitchenAlerts, ...regularWaiterRequests];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 sm:p-4">
      {/* WAITER CALL NOTIFICATIONS - Most Prominent */}
      {allWaiterRequests.length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-red-900 to-orange-900 border-2 border-red-400 rounded-xl p-4 mb-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="bg-red-500 rounded-full p-2 mr-3 animate-pulse">
                  <Bell className="h-6 w-6 text-white animate-bounce" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-100">🔔 WAITER CALLS</h2>
                  <p className="text-sm text-red-300">Tables need immediate service</p>
                </div>
              </div>
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {allWaiterRequests.length} Active
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allWaiterRequests.map(notif => {
                const isUrgent = notif.data?.alert_kitchen;
                const timeAgo = Math.floor((Date.now() - notif.timestamp) / 1000 / 60);
                
                return (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg border-2 ${
                      isUrgent 
                        ? 'bg-red-800 border-red-400 animate-pulse' 
                        : 'bg-orange-800 border-orange-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span className="text-2xl mr-2">
                            {isUrgent ? '🚨' : '🛎️'}
                          </span>
                          <span className="font-bold text-lg text-white">
                            Table {notif.tableId}
                          </span>
                        </div>
                        <p className={`text-sm ${isUrgent ? 'text-red-200' : 'text-orange-200'} mb-2`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-medium ${isUrgent ? 'text-red-100' : 'text-orange-100'}`}>
                            {timeAgo} min ago
                          </span>
                          {isUrgent && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-bounce">
                              URGENT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-red-800/50 rounded-lg border border-red-600">
              <p className="text-sm text-red-200 font-medium">
                📋 <strong>Kitchen Staff Action:</strong> Please notify waiters immediately about table service requests
              </p>
              <p className="text-xs text-red-300 mt-1">
                • Urgent calls (🚨) require immediate attention
                • Regular calls (🛎️) should be handled within 5 minutes
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WAITER STATUS CARDS */}
      {waitersData && waitersData.length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 border-2 border-blue-400 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full p-2 mr-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-100">👥 WAITER STATUS</h2>
                  <p className="text-sm text-blue-300">Current staff availability</p>
                </div>
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                {waitersData.filter((w: Waiter) => w.status === 'available').length} Available
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {waitersData.map((waiter: Waiter) => {
                const statusColors = {
                  available: 'bg-green-800 border-green-400 text-green-100',
                  busy: 'bg-orange-800 border-orange-400 text-orange-100',
                  break: 'bg-yellow-800 border-yellow-400 text-yellow-100',
                  offline: 'bg-gray-800 border-gray-400 text-white'
                };
                
                const statusIcons = {
                  available: '✅',
                  busy: '⏰',
                  break: '☕',
                  offline: '❌'
                };
                
                const lastActiveTime = new Date(waiter.last_active);
                const minutesAgo = Math.floor((Date.now() - lastActiveTime.getTime()) / 1000 / 60);
                
                return (
                  <div 
                    key={waiter.id}
                    className={`p-3 rounded-lg border-2 ${statusColors[waiter.status]} transition-all duration-300`}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <User className="h-8 w-8 text-current mr-2" />
                        <span className="text-2xl">{statusIcons[waiter.status]}</span>
                      </div>
                      
                      <h3 className="font-bold text-sm text-white mb-1">
                        {waiter.name || waiter.username}
                      </h3>
                      
                      <div className="text-xs text-current mb-2">
                        <div className="font-medium">{waiter.status_display}</div>
                        {waiter.phone && (
                          <div className="flex items-center justify-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            <span>{waiter.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-white font-medium">
                        {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}
                      </div>
                      
                      {/* Quick status change buttons */}
                      <div className="mt-2 flex gap-1">
                        {waiter.status !== 'available' && (
                          <button
                            onClick={() => updateWaiterStatusMutation.mutate({ waiter_id: waiter.id, status: 'available' })}
                            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                            disabled={updateWaiterStatusMutation.isPending}
                          >
                            ✅
                          </button>
                        )}
                        {waiter.status !== 'busy' && (
                          <button
                            onClick={() => updateWaiterStatusMutation.mutate({ waiter_id: waiter.id, status: 'busy' })}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                            disabled={updateWaiterStatusMutation.isPending}
                          >
                            ⏰
                          </button>
                        )}
                        {waiter.status !== 'break' && (
                          <button
                            onClick={() => updateWaiterStatusMutation.mutate({ waiter_id: waiter.id, status: 'break' })}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs font-bold transition-colors"
                            disabled={updateWaiterStatusMutation.isPending}
                          >
                            ☕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 p-3 bg-blue-800/50 rounded-lg border border-blue-600">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="text-green-400 font-bold text-lg">
                    {waitersData.filter((w: Waiter) => w.status === 'available').length}
                  </div>
                  <div className="text-blue-200 font-medium">Available</div>
                </div>
                <div>
                  <div className="text-orange-400 font-bold text-lg">
                    {waitersData.filter((w: Waiter) => w.status === 'busy').length}
                  </div>
                  <div className="text-blue-200 font-medium">Busy</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-bold text-lg">
                    {waitersData.filter((w: Waiter) => w.status === 'break').length}
                  </div>
                  <div className="text-blue-200 font-medium">On Break</div>
                </div>
                <div>
                  <div className="text-white font-bold text-lg">
                    {waitersData.filter((w: Waiter) => w.status === 'offline').length}
                  </div>
                  <div className="text-blue-200">Offline</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Orders Notifications */}
      {newOrders.length > 0 && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-3 mb-4">
          <div className="flex items-start">
            <Utensils className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-200 mb-2">🍽️ New Orders</h3>
              <div className="space-y-1">
                {newOrders.map(notif => (
                  <div key={notif.id} className="text-sm text-green-300">
                    📋 {notif.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">Kitchen Display System</h1>
            <p className="text-sm sm:text-base text-gray-400">Real-time order management</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-lg sm:text-xl lg:text-2xl font-mono text-green-400">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              {currentTime.toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4">
          <div className="bg-red-600 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold">{ordersByStatus.pending.length}</div>
            <div className="text-xs sm:text-sm">New Orders</div>
          </div>
          <div className="bg-blue-600 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold">{ordersByStatus.confirmed.length}</div>
            <div className="text-xs sm:text-sm">Confirmed</div>
          </div>
          <div className="bg-orange-600 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold">{ordersByStatus.preparing.length}</div>
            <div className="text-xs sm:text-sm">Preparing</div>
          </div>
          <div className="bg-green-600 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-2xl font-bold">{ordersByStatus.ready.length}</div>
            <div className="text-xs sm:text-sm">Ready</div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Pending Orders */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-red-400 flex items-center">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-pulse" />
            <span className="hidden sm:inline">New Orders ({ordersByStatus.pending.length})</span>
            <span className="sm:hidden">New ({ordersByStatus.pending.length})</span>
          </h2>
          {ordersByStatus.pending.map((order: OrderMenu) => (
            <OrderCard
              key={order.id}
              order={order}
              timeElapsed={getTimeElapsed(order.created_at)}
              priority={getPriority(getTimeElapsed(order.created_at))}
              onStatusUpdate={handleStatusUpdate}
              nextStatus={getNextStatus(order.status)}
            />
          ))}
        </div>

        {/* Confirmed Orders */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-blue-400 flex items-center">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Confirmed ({ordersByStatus.confirmed.length})</span>
            <span className="sm:hidden">Conf ({ordersByStatus.confirmed.length})</span>
          </h2>
          {ordersByStatus.confirmed.map((order: OrderMenu) => (
            <OrderCard
              key={order.id}
              order={order}
              timeElapsed={getTimeElapsed(order.created_at)}
              priority={getPriority(getTimeElapsed(order.created_at))}
              onStatusUpdate={handleStatusUpdate}
              nextStatus={getNextStatus(order.status)}
            />
          ))}
        </div>

        {/* Preparing Orders */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-orange-400 flex items-center">
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Preparing ({ordersByStatus.preparing.length})</span>
            <span className="sm:hidden">Prep ({ordersByStatus.preparing.length})</span>
          </h2>
          {ordersByStatus.preparing.map((order: OrderMenu) => (
            <OrderCard
              key={order.id}
              order={order}
              timeElapsed={getTimeElapsed(order.created_at)}
              priority={getPriority(getTimeElapsed(order.created_at))}
              onStatusUpdate={handleStatusUpdate}
              nextStatus={getNextStatus(order.status)}
            />
          ))}
        </div>

        {/* Ready Orders */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-green-400 flex items-center">
            <Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="hidden sm:inline">Ready ({ordersByStatus.ready.length})</span>
            <span className="sm:hidden">Ready ({ordersByStatus.ready.length})</span>
          </h2>
          {ordersByStatus.ready.map((order: OrderMenu) => (
            <OrderCard
              key={order.id}
              order={order}
              timeElapsed={getTimeElapsed(order.created_at)}
              priority={getPriority(getTimeElapsed(order.created_at))}
              onStatusUpdate={handleStatusUpdate}
              nextStatus={getNextStatus(order.status)}
            />
          ))}
        </div>
      </div>

      {/* Empty State */}
      {kitchenOrders.length === 0 && (
        <div className="text-center py-12">
          <Utensils className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">No active orders</h3>
          <p className="text-gray-600">All caught up! New orders will appear here.</p>
        </div>
      )}
    </div>
  );
};

// Order Card Component
const OrderCard: React.FC<{
  order: OrderMenu;
  timeElapsed: number;
  priority: { level: string; color: string; textColor: string };
  onStatusUpdate: (orderId: number, status: OrderMenu['status']) => void;
  nextStatus: OrderMenu['status'] | null;
}> = ({ order, timeElapsed, priority, onStatusUpdate, nextStatus }) => {
  const formatPrice = (price: number) => `UGX ${price.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-red-600',
      confirmed: 'bg-blue-600',
      preparing: 'bg-orange-600',
      ready: 'bg-green-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-600';
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'NEW ORDER',
      confirmed: 'CONFIRMED',
      preparing: 'COOKING',
      ready: 'READY'
    };
    return texts[status as keyof typeof texts] || status.toUpperCase();
  };

  const getNextStatusText = (status: OrderMenu['status'] | null) => {
    const texts = {
      confirmed: 'Confirm Order',
      preparing: 'Start Cooking',
      ready: 'Mark Ready',
      delivered: 'Complete'
    };
    return status ? texts[status] || 'Next Step' : null;
  };

  return (
    <div className={`bg-gray-800 rounded-lg border-l-4 ${priority.color} shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="p-3 sm:p-4">
        {/* Order Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1 flex-wrap">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-base sm:text-lg font-bold text-white">Table {order.table}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)} text-white`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-400 flex-wrap">
              <Clock className="h-3 w-3" />
              <span>{timeElapsed} min ago</span>
              <span className={`font-medium ${priority.textColor}`}>
                {priority.level.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-base sm:text-lg font-bold text-green-400">{formatPrice(order.total_price)}</div>
            <div className="text-xs text-gray-400">{order.payment_method_display}</div>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="bg-gray-700 rounded p-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm sm:text-base truncate">{item.item}</div>
                  {item.special_request && (
                    <div className="text-xs sm:text-sm text-yellow-400 mt-1 break-words">
                      ⚠️ {item.special_request}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold text-sm sm:text-base">x{item.quantity}</div>
                  <div className="text-xs text-gray-400">
                    {formatPrice(item.subtotal)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {nextStatus && (
          <button
            onClick={() => onStatusUpdate(order.id, nextStatus)}
            className={`w-full py-2 px-3 sm:px-4 rounded text-sm sm:text-base font-semibold text-white transition-colors ${
              order.status === 'pending' ? 'bg-red-600 hover:bg-red-700' :
              order.status === 'confirmed' ? 'bg-blue-600 hover:bg-blue-700' :
              order.status === 'preparing' ? 'bg-orange-600 hover:bg-orange-700' :
              'bg-green-600 hover:bg-green-700'
            }`}
          >
            {getNextStatusText(nextStatus)}
          </button>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
