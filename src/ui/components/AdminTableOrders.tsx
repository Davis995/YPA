import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Users, CreditCard, Trash2, CheckCircle, XCircle, Package, Truck, ChefHat, ExternalLink, Bell } from 'lucide-react';
import { tableOrdersApi } from '../../data/api';
import { OrderMenu } from '../../data/types';
import { useNotifications } from '../../services/NotificationService';
import toast from 'react-hot-toast';

const AdminTableOrders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();
  const { notifications } = useNotifications();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['table-orders'],
    queryFn: tableOrdersApi.getAll,
    refetchInterval: 3000 // Refresh every 3 seconds for real-time updates
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderMenu['status'] }) => 
      tableOrdersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-orders'] });
      toast.success('Order status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: tableOrdersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-orders'] });
      toast.success('Order deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete order');
    }
  });

  const handleStatusUpdate = (id: number, status: OrderMenu['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteMutation.mutate(id);
    }
  };

  const orders = ordersData?.data || [];
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter((order: OrderMenu) => order.status === statusFilter);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Get recent waiter requests and new orders
  const recentWaiterRequests = notifications.filter(n => n.type === 'waiter_request').slice(0, 3);
  const recentNewOrders = notifications.filter(n => n.type === 'new_order').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {(recentWaiterRequests.length > 0 || recentNewOrders.length > 0) && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-start">
            <Bell className="h-5 w-5 text-red-400 mt-0.5 mr-3 animate-pulse" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-2">Recent Notifications</h3>
              <div className="space-y-1">
                {recentWaiterRequests.map(notif => (
                  <div key={notif.id} className="text-sm text-red-700">
                    🛎️ {notif.title}: {notif.message}
                  </div>
                ))}
                {recentNewOrders.map(notif => (
                  <div key={notif.id} className="text-sm text-red-700">
                    🍽️ {notif.title}: {notif.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Table Orders</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage orders placed from restaurant tables</p>
        </div>
        <div>
          <a
            href="/#/kitchen"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg text-sm sm:text-base"
          >
            <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Kitchen Display
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-2" />
          </a>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-2 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="hidden sm:inline">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
            {status !== 'all' && (
              <span className="ml-1 bg-white bg-opacity-20 px-1 rounded text-xs">
                {orders.filter((order: OrderMenu) => order.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredOrders.map((order: OrderMenu) => (
          <div key={order.id} className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
            {/* Order Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Table {order.table}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Order #{order.id}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium self-start ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </span>
              </div>
            </div>

            {/* Order Details */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              {/* Payment Method */}
              <div className="flex items-center mb-3">
                {getPaymentMethodIcon(order.payment_method)}
                <span className="ml-2 text-xs sm:text-sm text-gray-600">
                  {order.payment_method_display}
                </span>
              </div>

              {/* Total Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Total:</span>
                <span className="text-base sm:text-lg font-bold text-green-600">
                  UGX {order.total_price.toLocaleString()}
                </span>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700">Items:</h4>
                <div className="max-h-24 sm:max-h-32 overflow-y-auto">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start text-xs sm:text-sm gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 truncate block">{item.item}</span>
                        {item.special_request && (
                          <p className="text-xs text-gray-500 italic truncate">
                            Note: {item.special_request}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-gray-600 text-xs sm:text-sm">x{item.quantity}</span>
                        <p className="text-xs text-gray-500">
                          UGX {item.subtotal.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Time */}
              <p className="text-xs text-gray-500 mb-4">
                Ordered: {new Date(order.created_at).toLocaleString()}
              </p>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {/* Status Update Buttons */}
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                    className="flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Confirm</span>
                    <span className="sm:hidden">✓</span>
                  </button>
                )}
                
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'preparing')}
                    className="flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 transition-colors"
                    disabled={updateStatusMutation.isPending}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Start Preparing</span>
                    <span className="sm:hidden">Cook</span>
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'ready')}
                    className="flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Mark Ready</span>
                    <span className="sm:hidden">Ready</span>
                  </button>
                )}
                
                {order.status === 'ready' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'delivered')}
                    className="flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                    disabled={updateStatusMutation.isPending}
                  >
                    <Truck className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Mark Delivered</span>
                    <span className="sm:hidden">Done</span>
                  </button>
                )}

                {/* Cancel Button (if not delivered or cancelled) */}
                {!['delivered', 'cancelled'].includes(order.status) && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                    className="flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Cancel</span>
                    <span className="sm:hidden">✕</span>
                  </button>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(order.id)}
                  className="flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-gray-500 text-white text-xs font-medium rounded hover:bg-gray-600 transition-colors ml-auto"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">🗑</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No table orders</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'No table orders have been placed yet.' 
              : `No ${statusFilter} orders found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminTableOrders;
