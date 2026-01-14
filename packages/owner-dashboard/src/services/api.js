const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get auth token from localStorage
const getToken = () => localStorage.getItem('authToken');

// API Request wrapper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Auth API
export const authApi = {
    login: async (email, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    register: async (name, email, password) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password, role: 'staff' }),
        });
    },

    me: async () => {
        return apiRequest('/auth/me');
    },

    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMe');
    },

    getStoredUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!getToken();
    },

    updateProfile: async (name, email) => {
        const data = await apiRequest('/auth/update', {
            method: 'PUT',
            body: JSON.stringify({ name, email }),
        });
        // Update stored user
        localStorage.setItem('user', JSON.stringify(data));
        return data;
    },
};

// Transactions API
export const transactionsApi = {
    getAll: async () => {
        return apiRequest('/transactions');
    },

    getDetails: async () => {
        return apiRequest('/transactions/details');
    },

    getToday: async () => {
        return apiRequest('/transactions/today');
    },

    getById: async (id) => {
        return apiRequest(`/transactions/${id}`);
    },

    create: async (transactionData) => {
        return apiRequest('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });
    },

    update: async (id, transactionData) => {
        return apiRequest(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transactionData),
        });
    },

    delete: async (id) => {
        return apiRequest(`/transactions/${id}`, {
            method: 'DELETE',
        });
    },
};

// Categories API
export const categoriesApi = {
    getAll: async () => {
        return apiRequest('/categories');
    },

    getByType: async (type) => {
        return apiRequest(`/categories?type=${type}`);
    },
};

// Stats API
export const statsApi = {
    getSummary: async () => {
        return apiRequest('/stats/summary');
    },

    getToday: async () => {
        return apiRequest('/stats/today');
    },

    getChart: async (days = 7) => {
        return apiRequest(`/stats/chart?days=${days}`);
    },
};

// Upload API
export const uploadApi = {
    uploadFile: async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64 = reader.result;
                    const data = await apiRequest('/upload', {
                        method: 'POST',
                        body: JSON.stringify({
                            file: base64,
                            filename: file.name,
                            mimetype: file.type,
                        }),
                    });
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
};

export default { authApi, transactionsApi, categoriesApi, statsApi, uploadApi };

