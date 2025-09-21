import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, Mail, Phone, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { bookingsApi } from '../../data/api';
import { Booking } from '../../data/types';
import toast from 'react-hot-toast';

const AdminBookings: React.FC = () => {
  const baseurl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingsApi.getAll,
    refetchInterval:5000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Booking['status'] }) => 
      bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update booking status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: bookingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete booking');
    }
  });

  const handleStatusUpdate = (id: number, status: Booking['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteMutation.mutate(id);
    }
  };

  const bookings = bookingsData?.data || [];
  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter((booking:any) => booking.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString;
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
        <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
        <p className="text-gray-600">Manage restaurant reservations and bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-300 rounded-md text-black border-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Bookings</option>
            <option value="new">New</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="text-sm text-gray-500">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredBookings.map((booking:any) => (
            <li key={booking.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.name}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(booking.date)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(booking.time)}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {booking.guests} guests
                      </div>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {booking.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {booking.phone}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {booking.status === 'new' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'No bookings have been made yet.' 
              : `No ${statusFilter} bookings found.`
            }
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Bookings</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.filter((b:any) => b.status === 'new').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Confirmed</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.filter((b:any) => b.status === 'confirmed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white">
                  <XCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Cancelled</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {bookings.filter((b:any) => b.status === 'cancelled').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;






