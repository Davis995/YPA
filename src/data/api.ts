import { MenuItem, Category, Booking, Order, ContactMessage, AdminUser, OrderMenu, WaiterRequest } from './types';

// API Base URL - Update this to match your Django backend
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = `${baseUrl}/api`;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
};

// Helper function to make authenticated requests
const makeRequest = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Include cookies for session authentication
    headers: {
      ...options.headers,
    },
  };

  // Don't set Content-Type for FormData, let the browser set it with boundary
  if (!(options.body instanceof FormData)) {
    config.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  return handleResponse(response);
};

// Authentication API - SIMPLIFIED FOR TESTING (NO CSRF/AUTH REQUIRED)
export const authApi = {
  login: async (username: string, password: string) => {
    // For testing - just simulate successful login
    // In production, implement proper Django authentication
    if (username === 'admin' && password === 'admin123') {
      return { success: true, message: 'Login successful', token: 'test-token' };
    }
    throw new Error('Invalid credentials');
  },

  logout: async () => {
    // For testing - just simulate successful logout
    return { success: true, message: 'Logout successful' };
  },

  checkAuth: async () => {
    // For testing - always return authenticated since auth is disabled
    try {
      const response = await makeRequest('/dashboard/');
      return { authenticated: true, user: response };
    } catch {
      // Even if dashboard fails, allow access for testing
      return { authenticated: true };
    }
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    const response = await makeRequest('/dashboard/');
    return response;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await makeRequest('/categories/');
    return { data: response, success: true, message: 'Success' };
  },

  create: async (category:FormData) => {
    const response = await makeRequest('/categories/', {
      method: 'POST',
      body: category,
    });
    return { data: response, success: true, message: 'Category created successfully' };
  },

  update: async (id: number, updates: FormData) => {
    const response = await makeRequest(`/categories/${id}/`, {
      method: 'PUT',
      body: updates,
    });
    return { data: response, success: true, message: 'Category updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/categories/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Category deleted successfully' };
  },
};

// Menu API
export const menuApi = {
  getAll: async () => {
    const response = await makeRequest('/menu/');
    return { data: response, success: true, message: 'Success' };
  },

  create: async (item: FormData) => {
    const response = await makeRequest('/menu/', {
      method: 'POST',
      body: item,
    });
    return { data: response, success: true, message: 'Menu item created successfully' };
  },

  update: async (id: number, updates: FormData) => {
    const response = await makeRequest(`/menu/${id}/`, {
      method: 'PUT',
      body: updates,
    });
    return { data: response, success: true, message: 'Menu item updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/menu/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Menu item deleted successfully' };
  },
};

// Bookings API
export const bookingsApi = {
  getAll: async () => {
    const response = await makeRequest('/bookings/');
    return { data: response, success: true, message: 'Success' };
  },

  create: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await makeRequest('/bookings/', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
    return { data: response, success: true, message: 'Booking created successfully' };
  },

  updateStatus: async (id: number, status: Booking['status']) => {
    const response = await makeRequest(`/bookings/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { data: response, success: true, message: 'Booking status updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/bookings/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Booking deleted successfully' };
  },
};

// Orders API
export const ordersApi = {
  getAll: async () => {
    const response = await makeRequest('/orders/');
    return { data: response, success: true, message: 'Success' };
  },

  create: async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await makeRequest('/orders/', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    return { data: response, success: true, message: 'Order created successfully' };
  },

  updateStatus: async (id: number, status: Order['status']) => {
    const response = await makeRequest(`/orders/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { data: response, success: true, message: 'Order status updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/orders/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Order deleted successfully' };
  },
};

// Contacts API
export const contactsApi = {
  getAll: async () => {
    const response = await makeRequest('/contacts/');
    return { data: response, success: true, message: 'Success' };
  },

  create: async (contact: Omit<ContactMessage, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await makeRequest('/contacts/', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
    return { data: response, success: true, message: 'Contact message created successfully' };
  },

  updateStatus: async (id: number, status: ContactMessage['status']) => {
    const response = await makeRequest(`/contacts/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { data: response, success: true, message: 'Contact status updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/contacts/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Contact message deleted successfully' };
  },
};

// Admin Users API
export const adminUsersApi = {
  getAll: async () => {
    const response = await makeRequest('/admin-users/');
    return { data: response, success: true, message: 'Success' };
  },

  create: async (user: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await makeRequest('/admin-users/', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    return { data: response, success: true, message: 'Admin user created successfully' };
  },

  update: async (id: number, updates: Partial<AdminUser>) => {
    const response = await makeRequest(`/admin-users/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return { data: response, success: true, message: 'Admin user updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/admin-users/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Admin user deleted successfully' };
  },
};

// Table Orders API (OrderMenu)
export const tableOrdersApi = {
  getAll: async () => {
    const response = await makeRequest('/menuOrder');
    return { data: response, success: true, message: 'Success' };
  },

  updateStatus: async (id: number, status: OrderMenu['status']) => {
    const response = await makeRequest(`/menuOrder/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { data: response, success: true, message: 'Order status updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/menuOrder/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Order deleted successfully' };
  },
};

// Cart Management API
export const cartApi = {
  create: async (cartData: {
    table_id: string;
    total_amount: number;
    status: string;
    payment_method?: string;
    items: Array<{
      menu_item_id: number;
      quantity: number;
      price: string;
      special_requests?: string;
    }>;
  }) => {
    const response = await makeRequest('/cart', {
      method: 'POST',
      body: JSON.stringify(cartData),
    });
    return { data: response, success: true, message: 'Order created successfully' };
  },
};

// Waiter Requests API
export const waiterRequestsApi = {
  getAll: async () => {
    const response = await makeRequest('/waiter-request');
    return { data: response, success: true, message: 'Success' };
  },

  create: async (request: Omit<WaiterRequest, 'id' | 'created_at' | 'acknowledged_at' | 'completed_at' | 'status_display'>) => {
    const response = await makeRequest('/waiter-request', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return { data: response, success: true, message: 'Waiter request created successfully' };
  },

  updateStatus: async (id: number, status: WaiterRequest['status']) => {
    const response = await makeRequest(`/waiter-request/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return { data: response, success: true, message: 'Request status updated successfully' };
  },

  delete: async (id: number) => {
    await makeRequest(`/waiter-request/${id}/`, {
      method: 'DELETE',
    });
    return { data: null, success: true, message: 'Request deleted successfully' };
  },
};

// Waiters API
export const waitersApi = {
  getAll: async () => {
    const response = await makeRequest('/waiters/');
    return { data: response.data, success: true, message: 'Success' };
  },

  updateStatus: async (waiter_id: number, status: string) => {
    const response = await makeRequest('/waiters/', {
      method: 'POST',
      body: JSON.stringify({ waiter_id, status }),
    });
    return { data: response.data, success: true, message: 'Waiter status updated successfully' };
  },
};

