import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Clock, Users, Mail, Phone, Trash2, CheckCircle, XCircle, Package, Truck, CheckSquare } from 'lucide-react';
import { ordersApi } from '../../data/api';
import { Order } from '../../data/types';
import toast from 'react-hot-toast';

const AdminOrders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAll,
    refetchInterval:5000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) => 
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete order');
    }
  });

  const handleStatusUpdate = (id: number, status: Order['status']) => {
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
    : orders.filter((order:any) => order.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return CheckCircle;
      case 'preparing': return Package;
      case 'ready': return CheckSquare;
      case 'delivered': return Truck;
      case 'cancelled': return XCircle;
      default: return ShoppingCart;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'delivered';
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600">Manage customer orders and delivery status</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-300 border-2 text-black rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredOrders.map((order:any) => {
            const StatusIcon = getStatusIcon(order.status);
            const nextStatus = getNextStatus(order.status);
            
            return (
              <li key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <StatusIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Order #{order.id.toString().slice(-6)}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {order.customer_name}
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {order.customer_email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {order.customer_phone}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {order.items.length} items
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">${parseFloat(order.total).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {nextStatus && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {nextStatus === 'confirmed' && 'Confirm'}
                        {nextStatus === 'preparing' && 'Start Preparing'}
                        {nextStatus === 'ready' && 'Mark Ready'}
                        {nextStatus === 'delivered' && 'Mark Delivered'}
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details - #{selectedOrder.id.toString().slice(-6)}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Customer Information</h4>
                  <p className="text-sm text-gray-600">Name: {selectedOrder.customer_name}</p>
                  <p className="text-sm text-gray-600">Email: {selectedOrder.customer_email}</p>
                  <p className="text-sm text-gray-600">Phone: {selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Order Information</h4>
                  <p className="text-sm text-gray-600">Date: {formatDate(selectedOrder.created_at)}</p>
                  <p className="text-sm text-gray-600">Status: {selectedOrder.status}</p>
                  <p className="text-sm text-gray-600">Total: ${parseFloat(selectedOrder.total).toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium text-gray-900">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ShoppingCart className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'No orders have been placed yet.' 
              : `No ${statusFilter} orders found.`
            }
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => {
          const StatusIcon = getStatusIcon(status);
          const count = orders.filter((o:any) => o.status === status).length;
          const totalRevenue = orders
            .filter((o:any) => o.status === status)
            .reduce((sum:any, order:any) => sum + parseFloat(order.total), 0);
          
          return (
            <div key={status} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`inline-flex items-center justify-center h-8 w-8 rounded-md ${getStatusColor(status).replace('text-', 'bg-').replace('bg-gray-100', 'bg-gray-500')} text-white`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate capitalize">{status}</dt>
                      <dd className="text-lg font-medium text-gray-900">{count}</dd>
                      {status !== 'cancelled' && (
                        <dd className="text-xs text-gray-500">${totalRevenue.toFixed(2)}</dd>
                      )}
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminOrders;




