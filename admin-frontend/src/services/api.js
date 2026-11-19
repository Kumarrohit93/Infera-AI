/**
 * Infera AI - Real Backend API Client
 * Strictly Zero Mock Data.
 * Fully connected to:
 * 1. Infera-Backend (Auth, Users, Employees, Departments on Port 9000)
 * 2. Infera-RAG-Backend (Documents, Folders, Vector Search, AI Chat on Port 7000)
 */

const AUTH_API_BASE_URL = (import.meta.env.VITE_AUTH_URL || 'https://infera-ai.onrender.com/api').replace(/\/$/, '');
const RAG_API_BASE_URL = (import.meta.env.VITE_RAG_API_URL || import.meta.env.VITE_API_URL || 'https://infera-rag-ai.onrender.com/api').replace(/\/$/, '');

function handleUnauthorized() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isAdminAuth');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

async function fetchWithSession(url, options = {}) {
  const send = () => {
    const token = localStorage.getItem('accessToken');
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
  };

  let response = await send();
  if (response.status !== 401) return response;

  const refreshResponse = await fetch(`${AUTH_API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  const refreshed = await refreshResponse.json().catch(() => null);
  if (refreshResponse.ok && refreshed?.data?.accessToken) {
    localStorage.setItem('accessToken', refreshed.data.accessToken);
    response = await send();
    return response;
  }

  handleUnauthorized();
  throw new Error('Session expired. Please log in again.');
}

// Helper function to handle standard JSON API requests
async function request(endpoint, options = {}, baseUrl = RAG_API_BASE_URL) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetchWithSession(`${baseUrl}${endpoint}`, {
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

async function consumeEventStream(response, onEvent) {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error?.message || payload?.message || 'The assistant request failed.'
    );
  }
  if (!response.body) {
    throw new Error('Streaming is not supported by this browser.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let completed = null;
  const dispatch = (block) => {
    if (!block.trim()) return;
    let eventName = 'message';
    const dataLines = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) eventName = line.slice(6).trim();
      if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;

    const data = JSON.parse(dataLines.join('\n'));
    if (eventName === 'error') {
      throw new Error(data.message || 'The assistant request failed.');
    }
    if (eventName === 'done') completed = data;
    onEvent(eventName, data);
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || '';
      blocks.forEach(dispatch);
      if (done) break;
    }
    if (buffer.trim()) dispatch(buffer);
  } finally {
    reader.releaseLock();
  }

  if (!completed) throw new Error('The assistant stream ended before completion.');
  return completed;
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
      const uploadedAt = document.uploadedAt || document.uploadDate;
      const parsedUploadDate = uploadedAt ? new Date(uploadedAt) : null;
      const uploadStatuses = {
        queued: 'Queued',
        processing: 'Processing',
        ready: 'Completed',
        failed: 'Failed',
      };
      const displayStatus = uploadStatuses[rawStatus] || 'Pending';

      return {
        ...document,
        name: filename,
        extension: filename.includes('.') ? filename.split('.').pop().toUpperCase() : '',
        folder: document.folderName || document.folder || '',
        size: document.size || `${((document.sizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: parsedUploadDate && !Number.isNaN(parsedUploadDate.getTime())
          ? parsedUploadDate.toLocaleDateString()
          : '',
        uploadStatus: displayStatus,
        processingStatus: rawStatus,
        status: displayStatus,
      };
    });
  },

  // POST /api/documents/upload (multipart/form-data)
  uploadDocument: async (formData) => {
    const response = await fetchWithSession(`${RAG_API_BASE_URL}/documents/upload`, {
      method: 'POST',
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

  uploadVersion: async (id, formData) => {
    const response = await fetchWithSession(
      `${RAG_API_BASE_URL}/documents/${encodeURIComponent(id)}/versions`,
      { method: 'PUT', body: formData }
    );
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please log in again.');
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error?.message || data?.message || `Version upload failed (${response.status})`);
    }
    return data.data;
  },

  getVersions: async (id) => {
    const versions = await request(
      `/documents/${encodeURIComponent(id)}/versions`,
      {},
      RAG_API_BASE_URL
    );
    if (!Array.isArray(versions)) {
      throw new Error('The document version API returned an unexpected response.');
    }
    return versions;
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

export const analyticsApi = {
  getDashboard: async () => {
    const analytics = await request('/feedback/admin/analytics/dashboard', {}, RAG_API_BASE_URL);
    if (
      !analytics ||
      !Array.isArray(analytics.chartData) ||
      !Array.isArray(analytics.recentActivities)
    ) {
      throw new Error('The dashboard analytics API returned an unexpected response.');
    }
    return analytics;
  },
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

  askQuestionStream: async ({ question, conversationId, onEvent }) => {
    const response = await fetchWithSession(`${RAG_API_BASE_URL}/rag/ask/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        ...(conversationId ? { conversationId } : {}),
      }),
    });
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired. Please log in again.');
    }
    return consumeEventStream(response, onEvent || (() => {}));
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
    return request('/feedback/admin/list', {}, RAG_API_BASE_URL);
  },
  getMonitoring: async () => request('/feedback/admin/monitoring', {}, RAG_API_BASE_URL),
};
