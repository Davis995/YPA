import { MenuItem, Category, Booking, Order, ContactMessage, AdminUser } from './types';

// API Base URL - Update this to match your Django backend
const baseUrl = import.meta.env.VITE_API_URL
const API_BASE_URL = `${baseUrl}/api`;

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();''
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

// Authentication API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await makeRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response;
  },

  logout: async () => {
    const response = await makeRequest('/auth/logout/', {
      method: 'POST',
    });
    return response;
  },

  getProfile: async () => {
    const response = await makeRequest('/auth/profile/');
    return response;
  },

  updateProfile: async (data: { first_name: string; last_name: string; email: string }) => {
    const response = await makeRequest('/auth/profile/', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response;
  },

  changePassword: async (data: { old_password: string; new_password: string }) => {
    const response = await makeRequest('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
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

