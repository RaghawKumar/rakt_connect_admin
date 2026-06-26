const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('raktsetu_admin_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = data.error || 'Something went wrong';
    throw new Error(error);
  }
  return data;
};

export const api = {
  auth: {
    sendOtp: async (phone_number, role) => {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number, role }),
      });
      return handleResponse(res);
    },
    verifyOtp: async (phone_number, role, otp_code) => {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number, role, otp_code }),
      });
      const data = await handleResponse(res);
      if (data.token) {
        localStorage.setItem('raktsetu_admin_token', data.token);
        localStorage.setItem('raktsetu_admin_user', JSON.stringify(data.user));
      }
      return data;
    },
    getCurrentUser: () => {
      try {
        const userStr = localStorage.getItem('raktsetu_admin_user');
        return userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        return null;
      }
    },
    logout: () => {
      localStorage.removeItem('raktsetu_admin_token');
      localStorage.removeItem('raktsetu_admin_user');
    },
    isAuthenticated: () => {
      const token = localStorage.getItem('raktsetu_admin_token');
      const user = api.auth.getCurrentUser();
      return !!(token && user && user.role === 'admin');
    }
  },

  admin: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getUsers: async () => {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateUser: async (id, data) => {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    deleteUser: async (id) => {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getBloodRequests: async () => {
      const res = await fetch(`${API_BASE}/admin/blood-requests`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateBloodRequest: async (id, data) => {
      const res = await fetch(`${API_BASE}/admin/blood-requests/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    deleteBloodRequest: async (id) => {
      const res = await fetch(`${API_BASE}/admin/blood-requests/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getStocks: async () => {
      const res = await fetch(`${API_BASE}/admin/stocks`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateStock: async (id, units_in_stock) => {
      const res = await fetch(`${API_BASE}/admin/stocks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ units_in_stock }),
      });
      return handleResponse(res);
    }
  }
};
