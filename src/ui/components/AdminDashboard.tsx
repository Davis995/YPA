import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Utensils, 
  Calendar, 
  ShoppingCart, 
  MessageSquare, 
  TrendingUp,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';
import { dashboardApi } from '../../data/api';
import { DashboardStats, Booking, Order } from '../../data/types';

const AdminDashboard: React.FC = () => {
  const { data: dashboardData } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval:5000
  });

  const stats = dashboardData ? [
    {
      name: 'Total Categories',
      value: dashboardData.total_categories,
      icon: Utensils,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Menu Items',
      value: dashboardData.total_menu_items,
      icon: Utensils,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      name: 'Active Bookings',
      value: dashboardData.active_bookings,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Pending Orders',
      value: dashboardData.pending_orders,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'New Messages',
      value: dashboardData.new_messages,
      icon: MessageSquare,
      color: 'bg-red-500',
      change: '+3%',
      changeType: 'positive'
    },
    {
      name: 'Total Revenue',
      value: `$${dashboardData.total_revenue}`,
      icon: DollarSign,
      color: 'bg-indigo-500',
      change: '+22%',
      changeType: 'positive'
    }
  ] : [];

  const recentBookings = dashboardData?.recent_bookings || [];
  const recentOrders = dashboardData?.recent_orders || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your restaurant admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-md ${stat.color} text-white`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-600 ml-1">{stat.change}</span>
                  <span className="text-sm text-gray-500 ml-2">from last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {recentBookings.map((booking: Booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{booking.name}</p>
                      <p className="text-sm text-gray-500">{booking.date} at {booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {recentOrders.map((order: Order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">${order.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

