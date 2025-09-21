import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Mail, Phone, User, Clock, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { contactsApi } from '../../data/api';
import { ContactMessage } from '../../data/types';
import toast from 'react-hot-toast';

const AdminMessages: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const queryClient = useQueryClient();

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
    refetchInterval:5000
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: any; status: ContactMessage['status'] }) => 
      contactsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Message status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update message status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: contactsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Message deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete message');
    }
  });

  const handleStatusUpdate = (id: string, status: ContactMessage['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id: any) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(id);
    }
  };

  const messages = messagesData?.data || [];
  const filteredMessages = statusFilter === 'all' 
    ? messages 
    : messages.filter((message:any) => message.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'handled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
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
        <h1 className="text-2xl font-bold text-gray-900">Messages Management</h1>
        <p className="text-gray-600">Manage customer contact messages and inquiries</p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-black text-black rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="handled">Handled</option>
          </select>
          <div className="text-sm text-gray-500">
            Showing {filteredMessages.length} of {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredMessages.map((message:any) => (
            <li key={message.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {message.name}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {message.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {message.phone}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(message.createdAt)} at {formatTime(message.createdAt)}
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {message.status === 'new' && (
                    <button
                      onClick={() => handleStatusUpdate(message.id, 'handled')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Handled
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
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

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Message from {selectedMessage.name}
              </h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Contact Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedMessage.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedMessage.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedMessage.phone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Message Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDate(selectedMessage.created_at)} at {formatTime(selectedMessage.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                        {selectedMessage.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">Message</h4>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                {selectedMessage.status === 'new' && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedMessage.id, 'handled');
                      setSelectedMessage(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Handled
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <MessageSquare className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">No messages found</h3>
          <p className="text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'No messages have been received yet.' 
              : `No ${statusFilter} messages found.`
            }
          </p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">New Messages</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {messages.filter((m:any) => m.status === 'new').length}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Handled Messages</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {messages.filter((m:any) => m.status === 'handled').length}
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

export default AdminMessages;






