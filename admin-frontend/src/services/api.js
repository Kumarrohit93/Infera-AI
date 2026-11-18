/**
 * Infera AI - Real Backend API Client
 * Strictly Zero Mock Data.
 * Fully connected to:
 * 1. Infera-Backend (Auth, Users, Employees, Departments on Port 9000)
 * 2. Infera-RAG-Backend (Documents, Folders, Vector Search, AI Chat on Port 7000)
 */

const AUTH_API_BASE_URL = (import.meta.env.VITE_AUTH_URL || 'http://localhost:9000/api').replace(/\/$/, '');
const RAG_API_BASE_URL = (import.meta.env.VITE_RAG_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:7000/api').replace(/\/$/, '');

function handleUnauthorized() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isAdminAuth');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

// Helper function to handle standard JSON API requests
async function request(endpoint, options = {}, baseUrl = RAG_API_BASE_URL) {
  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Session expired. Please log in again.');
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`The API at ${baseUrl} returned an invalid response.`);
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `API request failed (${response.status})`);
  }

  return data?.data !== undefined ? data.data : data;
}

// ==========================================
// 1. Documents API (Infera-RAG-Backend - Port 7000)
// ==========================================
export const documentApi = {
  // GET /api/documents
  getDocuments: async (folderId) => {
    const query = folderId && folderId !== 'All'
      ? `?${new URLSearchParams({ folderId })}`
      : '';
    const result = await request(`/documents${query}`, {}, RAG_API_BASE_URL);
    const documents = Array.isArray(result) ? result : result?.documents;

    if (!Array.isArray(documents)) {
      throw new Error('The document API returned an unexpected response.');
    }

    return documents.map((document) => {
      const filename = document.originalFilename || document.name || '';
      const rawStatus = (document.status || 'pending').toLowerCase();
      const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
      const uploadedAt = document.uploadedAt || document.uploadDate;
      const parsedUploadDate = uploadedAt ? new Date(uploadedAt) : null;

      return {
        ...document,
        name: filename,
        extension: filename.includes('.') ? filename.split('.').pop().toUpperCase() : '',
        folder: document.folderName || document.folder || '',
        size: document.size || `${((document.sizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: parsedUploadDate && !Number.isNaN(parsedUploadDate.getTime())
          ? parsedUploadDate.toLocaleDateString()
          : '',
        uploadStatus: 'Completed',
        status,
      };
    });
  },

  // POST /api/documents/upload (multipart/form-data)
  uploadDocument: async (formData) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${RAG_API_BASE_URL}/documents/upload`, {
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
      throw new Error(data?.error?.message || data?.message || `Upload failed (${response.status})`);
    }
    return data.data;
  },

  // DELETE /api/documents/:id
  deleteDocument: async (id) => {
    return request(`/documents/${encodeURIComponent(id)}`, { method: 'DELETE' }, RAG_API_BASE_URL);
  },
};

// ==========================================
// 2. Folders API (Infera-RAG-Backend - Port 7000)
// ==========================================
export const folderApi = {
  // GET /api/folders
  getFolders: async () => {
    const folders = await request('/folders', {}, RAG_API_BASE_URL);
    if (!Array.isArray(folders)) {
      throw new Error('The folder API returned an unexpected response.');
    }
    return folders.map((folder) => ({
      ...folder,
      description: folder.description || '',
      docCount: folder.docCount ?? folder.documentCount ?? 0,
      visibility: folder.visibility || 'Restricted',
      members: Array.isArray(folder.members) ? folder.members : [],
    }));
  },

  // POST /api/folders
  createFolder: async (folderData) => {
    return request(
      '/folders',
      {
        method: 'POST',
        body: JSON.stringify(folderData),
      },
      RAG_API_BASE_URL
    );
  },

  updateFolder: async (id, folderData) => {
    return request(
      `/folders/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(folderData),
      },
      RAG_API_BASE_URL
    );
  },

  // DELETE /api/folders/:id
  deleteFolder: async (id) => {
    return request(`/folders/${encodeURIComponent(id)}`, { method: 'DELETE' }, RAG_API_BASE_URL);
  },
};

// ==========================================
// 3. Organization Employees & Departments API (Infera-Backend - Port 9000)
// ==========================================
export const employeeApi = {
  // GET /api/employees
  getEmployees: async () => {
    const employees = await request('/employees', {}, AUTH_API_BASE_URL);
    if (!Array.isArray(employees)) {
      throw new Error('The employee API returned an unexpected response.');
    }
    return employees;
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
    return request(`/employees/${encodeURIComponent(id)}`, { method: 'DELETE' }, AUTH_API_BASE_URL);
  },
};

export const departmentApi = {
  // GET /api/departments
  getDepartments: async () => {
    const departments = await request('/departments', {}, AUTH_API_BASE_URL);
    if (!Array.isArray(departments)) {
      throw new Error('The department API returned an unexpected response.');
    }
    return departments;
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

export const authApi = {
  getCurrentUser: async () => request('/auth/me', {}, AUTH_API_BASE_URL),
};

// ==========================================
// 4. Team Members & Invitations API (Infera-Backend - Port 9000)
// ==========================================
export const memberApi = {
  // GET /api/users
  getMembers: async () => {
    const members = await request('/users', {}, AUTH_API_BASE_URL);
    if (!Array.isArray(members)) {
      throw new Error('The team member API returned an unexpected response.');
    }
    return members.map((member) => ({
      ...member,
      name: member.name || member.email,
      role: member.role ? member.role[0].toUpperCase() + member.role.slice(1) : 'Member',
      status: member.status ? member.status[0].toUpperCase() + member.status.slice(1) : 'Active',
      joinedDate: member.joinedAt || member.createdAt || '',
      folders: Array.isArray(member.folders) ? member.folders : [],
    }));
  },

  // POST /api/users/invitations
  inviteMember: async ({ email, role = 'member' }) => {
    return request(
      '/users/invitations',
      {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      },
      AUTH_API_BASE_URL
    );
  },

  // DELETE /api/users/:id
  removeMember: async (id) => {
    return request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }, AUTH_API_BASE_URL);
  },
};

// ==========================================
// 5. RAG AI Assistant API (Infera-RAG-Backend - Port 7000)
// ==========================================
export const ragApi = {
  createConversation: async (title = 'New Conversation') => {
    return request(
      '/conversations',
      { method: 'POST', body: JSON.stringify({ title }) },
      RAG_API_BASE_URL
    );
  },

  // POST /api/rag/ask
  askQuestion: async ({ question, conversationId }) => {
    return request(
      '/rag/ask',
      {
        method: 'POST',
        body: JSON.stringify({ question, conversationId }),
      },
      RAG_API_BASE_URL
    );
  },

  // GET /api/conversations
  getConversations: async () => {
    const conversations = await request('/conversations', {}, RAG_API_BASE_URL);
    if (!Array.isArray(conversations)) {
      throw new Error('The conversation API returned an unexpected response.');
    }
    return conversations;
  },

  // GET /api/conversations/:id/messages
  getConversationMessages: async (conversationId) => {
    const messages = await request(`/conversations/${encodeURIComponent(conversationId)}/messages`, {}, RAG_API_BASE_URL);
    if (!Array.isArray(messages)) {
      throw new Error('The conversation message API returned an unexpected response.');
    }
    return messages;
  },

  // DELETE /api/conversations/:id
  deleteConversation: async (conversationId) => {
    return request(`/conversations/${encodeURIComponent(conversationId)}`, { method: 'DELETE' }, RAG_API_BASE_URL);
  },
};

// ==========================================
// 6. Feedback API
// ==========================================
export const feedbackApi = {
  getFeedback: async () => {
    return request('/admin/feedback', {}, RAG_API_BASE_URL);
  },
};
