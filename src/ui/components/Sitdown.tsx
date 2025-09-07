import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Clock, Users, Utensils, Trash2, CheckCircle, XCircle, Package, Truck, CheckSquare } from 'lucide-react';
import { tableOrdersApi } from '../../data/api';
import { TableOrder } from '../../data/types';
import toast from 'react-hot-toast';

interface TableOrderItem {
  item: string;
  quantity: number;
  price: number;
  special_request: string | null;
  subtotal: number;
}

interface TableOrderType {
  id: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_price: number;
  table: string;
  items: TableOrderItem[];
  created_at: string;
  updated_at?: string;
}

const AdminTableOrders: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<TableOrderType | null>(null);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['table-orders'],
    queryFn: tableOrdersApi.getAll,
    refetchInterval: 5000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TableOrderType['status'] }) => 
      tableOrdersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-orders'] });
      toast.success('Table order status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update table order status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: tableOrdersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['table-orders'] });
      toast.success('Table order deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete table order');
    }
  });

  const handleStatusUpdate = (id: number, status: TableOrderType['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this table order?')) {
      deleteMutation.mutate(id);
    }
  };

  const orders = ordersData?.data || [];
  const filteredOrders = orders.filter((order: TableOrderType) => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const tableMatch = tableFilter === 'all' || order.table === tableFilter;
    return statusMatch && tableMatch;
  });

  const uniqueTables = [...new Set(orders.map((order: TableOrderType) => order.table))].sort();

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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getNextStatus = (currentStatus: TableOrderType['status']): TableOrderType['status'] | null => {
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
        <h1 className="text-2xl font-bold text-gray-900">Table Orders Management</h1>
        <p className="text-gray-600">Manage sit-down restaurant table orders and service status</p>
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
            <option value="delivered">Served</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <label className="text-sm font-medium text-gray-700">Filter by table:</label>
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="border-gray-300 border-2 text-black rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Tables</option>
            {uniqueTables.map((table) => (
              <option key={table} value={table}>Table {table}</option>
            ))}
          </select>
          
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} table orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredOrders.map((order: TableOrderType) => {
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
                          Order #{order.id.toString().padStart(4, '0')}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status === 'delivered' ? 'served' : order.status}
                        </span>
                        <div className="flex items-center bg-indigo-50 px-2 py-1 rounded-md">
                          <Utensils className="h-4 w-4 mr-1 text-indigo-600" />
                          <span className="text-sm font-medium text-indigo-700">Table {order.table}</span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {order.items.length} items
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">UGX {order.total_price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(order.created_at)} at {formatTime(order.created_at)}
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
                        {nextStatus === 'confirmed' && 'Confirm Order'}
                        {nextStatus === 'preparing' && 'Start Cooking'}
                        {nextStatus === 'ready' && 'Mark Ready'}
                        {nextStatus === 'delivered' && 'Mark Served'}
                      </button>
                    )}
                    {order.status === 'pending' && !isUpdating && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        disabled={isUpdating}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
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
                Table Order Details - #{selectedOrder.id.toString().padStart(4, '0')}
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
                  <h4 className="font-medium text-gray-900">Table Information</h4>
                  <div className="flex items-center mt-1">
                    <Utensils className="h-5 w-5 mr-2 text-indigo-600" />
                    <span className="text-lg font-semibold text-indigo-700">Table {selectedOrder.table}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Order Information</h4>
                  <p className="text-sm text-gray-600">Date: {formatDate(selectedOrder.created_at)}</p>
                  <p className="text-sm text-gray-600">Time: {formatTime(selectedOrder.created_at)}</p>
                  <p className="text-sm text-gray-600">Status: {selectedOrder.status === 'delivered' ? 'served' : selectedOrder.status}</p>
                  <p className="text-sm text-gray-600">Total: UGX {selectedOrder.total_price.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.item}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {item.special_request && (
                          <p className="text-xs text-orange-600 mt-1">
                            <span className="font-medium">Special Request:</span> {item.special_request}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">UGX {item.subtotal.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">@{item.price.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Utensils className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No table orders found</h3>
          <p className="text-sm text-gray-500">
            {statusFilter === 'all' && tableFilter === 'all'
              ? 'No table orders have been placed yet.' 
              : `No ${statusFilter !== 'all' ? statusFilter : ''} ${tableFilter !== 'all' ? `table ${tableFilter}` : ''} orders found.`
            }
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-6">
        {['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map((status) => {
          const StatusIcon = getStatusIcon(status);
          const count = orders.filter((o: TableOrder) => o.status === status).length;
          const totalRevenue = orders
            .filter((o: TableOrder) => o.status === status)
            .reduce((sum: number, order: TableOrder) => sum + order.total_price, 0);
          
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
                      <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                        {status === 'delivered' ? 'served' : status}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">{count}</dd>
                      {status !== 'cancelled' && (
                        <dd className="text-xs text-gray-500">UGX {totalRevenue.toLocaleString()}</dd>
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

export default AdminTableOrders;