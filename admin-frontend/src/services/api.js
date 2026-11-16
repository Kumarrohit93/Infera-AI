/**
 * Infera AI - Real Backend API Client
 * Strictly Zero Mock Data.
 * Connects directly to backend API as specified in Infera Documentation (Chapter 5).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Helper function to handle standard JSON API requests
async function request(endpoint, options = {}, baseUrl = API_BASE_URL) {
  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Needed for httpOnly refresh cookies (Chapter 5.1)
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || 'API request failed');
  }

  // Documentation specifies success envelope: { success: true, data: [...] }
  return data.data !== undefined ? data.data : data;
}

// ==========================================
// 1. Documents API (Documentation Chapter 5.6 - Port 4000)
// ==========================================
export const documentApi = {
  // GET /api/documents
  getDocuments: async (folderId) => {
    const query = folderId && folderId !== 'All' ? `?folderId=${folderId}` : '';
    return request(`/documents${query}`);
  },

  // POST /api/documents/upload (multipart/form-data)
  uploadDocument: async (formData) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: formData, // Browser automatically sets Content-Type with boundary
    });

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please log in again.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.message || 'Upload failed');
    }
    return data.data;
  },

  // DELETE /api/documents/:id
  deleteDocument: async (id) => {
    return request(`/documents/${id}`, { method: 'DELETE' });
  },
};

// ==========================================
// 2. Folders API (Documentation Chapter 5.5 - Port 4000)
// ==========================================
export const folderApi = {
  // GET /api/folders
  getFolders: async () => {
    return request('/folders');
  },

  // POST /api/folders
  createFolder: async (folderData) => {
    return request('/folders', {
      method: 'POST',
      body: JSON.stringify(folderData),
    });
  },

  // DELETE /api/folders/:id
  deleteFolder: async (id) => {
    return request(`/folders/${id}`, { method: 'DELETE' });
  },
};

// ==========================================
// 3. Organization Employees & Departments API (Auth/DB Backend - Port 3000)
// ==========================================
export const employeeApi = {
  // GET /api/employees
  getEmployees: async () => {
    return request('/employees', {}, AUTH_API_BASE_URL);
  },

  // POST /api/employees
  createEmployee: async (employeeData) => {
    return request(
      '/employees',
      {
        method: 'POST',
        body: JSON.stringify(employeeData),
      },
      AUTH_API_BASE_URL
    );
  },

  // DELETE /api/employees/:id
  deleteEmployee: async (id) => {
    return request(`/employees/${id}`, { method: 'DELETE' }, AUTH_API_BASE_URL);
  },
};

export const departmentApi = {
  // GET /api/departments
  getDepartments: async () => {
    return request('/departments', {}, AUTH_API_BASE_URL);
  },

  // POST /api/departments
  createDepartment: async (departmentData) => {
    return request(
      '/departments',
      {
        method: 'POST',
        body: JSON.stringify(departmentData),
      },
      AUTH_API_BASE_URL
    );
  },
};

// ==========================================
// 4. Team Members & Invitations API (Documentation Chapter 5.4)
// ==========================================
export const memberApi = {
  // GET /api/users
  getMembers: async () => {
    return request('/users');
  },

  // POST /api/users/invitations
  inviteMember: async (memberData) => {
    return request('/users/invitations', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  // DELETE /api/users/:id
  removeMember: async (id) => {
    return request(`/users/${id}`, { method: 'DELETE' });
  },
};

// ==========================================
// 5. Feedback API (Documentation Chapter 5.8)
// ==========================================
export const feedbackApi = {
  // GET /api/admin/feedback
  getFeedback: async () => {
    return request('/admin/feedback');
  },
};