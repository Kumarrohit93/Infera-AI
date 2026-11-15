/**
 * Infera AI - Real Backend API Client
 * Strictly Zero Mock Data.
 * Connects directly to backend API as specified in Infera Documentation (Chapter 5).
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper function to handle standard JSON API requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Needed for httpOnly refresh cookies (Chapter 5.1)
  });

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'API request failed');
  }

  // Documentation specifies success envelope: { success: true, data: [...] }
  return data.data !== undefined ? data.data : data;
}

// ==========================================
// 1. Documents API (Documentation Chapter 5.6)
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

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Upload failed');
    }
    return data.data;
  },

  // DELETE /api/documents/:id
  deleteDocument: async (id) => {
    return request(`/documents/${id}`, { method: 'DELETE' });
  },
};

// ==========================================
// 2. Folders API (Documentation Chapter 5.5)
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
// 3. Team Members API (Documentation Chapter 5.4)
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
// 4. Feedback API (Documentation Chapter 5.8)
// ==========================================
export const feedbackApi = {
  // GET /api/admin/feedback
  getFeedback: async () => {
    return request('/admin/feedback');
  },
};