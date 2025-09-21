import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Clock, CheckCircle, Trash2, MessageSquare, User } from 'lucide-react';
import { waiterRequestsApi } from '../../data/api';
import { WaiterRequest } from '../../data/types';
import toast from 'react-hot-toast';

const AdminWaiterRequests: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['waiter-requests'],
    queryFn: waiterRequestsApi.getAll,
    refetchInterval: 2000 // Refresh every 2 seconds for real-time updates
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: WaiterRequest['status'] }) => 
      waiterRequestsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-requests'] });
      toast.success('Request status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update request status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: waiterRequestsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-requests'] });
      toast.success('Request deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete request');
    }
  });

  const handleStatusUpdate = (id: number, status: WaiterRequest['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      deleteMutation.mutate(id);
    }
  };

  const requests = requestsData?.data || [];
  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter((request: WaiterRequest) => request.status === statusFilter);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-red-100 text-red-800 border-red-200',
      acknowledged: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Bell className="h-4 w-4" />;
      case 'acknowledged': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityLevel = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
    
    if (diffMinutes > 15) return { level: 'high', color: 'text-red-600', text: 'High Priority' };
    if (diffMinutes > 5) return { level: 'medium', color: 'text-yellow-600', text: 'Medium Priority' };
    return { level: 'normal', color: 'text-green-600', text: 'Normal' };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const pendingCount = requests.filter((r: WaiterRequest) => r.status === 'pending').length;
  const acknowledgedCount = requests.filter((r: WaiterRequest) => r.status === 'acknowledged').length;
  const completedCount = requests.filter((r: WaiterRequest) => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Waiter Requests</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage service requests from restaurant tables</p>
        </div>
        
        {/* Real-time notification badge */}
        {pendingCount > 0 && (
          <div className="flex items-center bg-red-100 text-red-800 px-3 py-2 rounded-lg">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-pulse" />
            <span className="font-semibold text-sm sm:text-base">
              <span className="hidden sm:inline">{pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}</span>
              <span className="sm:hidden">{pendingCount} Pending</span>
            </span>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'All', count: requests.length },
          { key: 'pending', label: 'Pending', count: pendingCount },
          { key: 'acknowledged', label: 'Acknowledged', count: acknowledgedCount },
          { key: 'completed', label: 'Completed', count: completedCount }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {label}
            <span className="ml-1 bg-white bg-opacity-20 px-1 rounded">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request: WaiterRequest) => {
          const priority = getPriorityLevel(request.created_at);
          
          return (
            <div
              key={request.id}
              className={`bg-white border-l-4 shadow-lg rounded-lg p-6 ${
                request.status === 'pending' ? 'border-l-red-500 bg-red-50' :
                request.status === 'acknowledged' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Request Header */}
                  <div className="flex items-center mb-3">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Table {request.table_number}
                    </h3>
                    <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1">{request.status_display}</span>
                    </span>
                    <span className={`ml-2 text-xs font-medium ${priority.color}`}>
                      {priority.text}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="flex items-start mb-4">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-gray-700">{request.message}</p>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>
                      <Clock className="inline h-4 w-4 mr-1" />
                      Requested: {new Date(request.created_at).toLocaleString()}
                    </p>
                    {request.acknowledged_at && (
                      <p>
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        Acknowledged: {new Date(request.acknowledged_at).toLocaleString()}
                      </p>
                    )}
                    {request.completed_at && (
                      <p>
                        <CheckCircle className="inline h-4 w-4 mr-1 text-green-500" />
                        Completed: {new Date(request.completed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'acknowledged')}
                      className="flex items-center px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 transition-colors"
                      disabled={updateStatusMutation.isPending}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Acknowledge
                    </button>
                  )}
                  
                  {request.status === 'acknowledged' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'completed')}
                      className="flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors"
                      disabled={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Complete
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(request.id)}
                    className="flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No waiter requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'No service requests have been made yet.' 
              : `No ${statusFilter} requests found.`
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{acknowledgedCount}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWaiterRequests;
