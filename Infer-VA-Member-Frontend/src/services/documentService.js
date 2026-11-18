const API_URL = import.meta.env.VITE_RAG_API_URL || "http://localhost:7000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const documentService = {
  // Document Operations
  async getDocuments(folderId) {
    const query = folderId && folderId !== "All" ? `?folderId=${folderId}` : "";
    const res = await fetch(`${API_URL}/documents${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch documents");
    return res.json();
  },

  async getFolders() {
    const res = await fetch(`${API_URL}/folders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch folders");
    return res.json();
  },

  // Conversation & Chat History Operations
  async getConversations() {
    const res = await fetch(`${API_URL}/conversations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to load conversations");
    }
    const json = await res.json();
    return json.data || [];
  },

  async createConversation(title = "New Conversation") {
    const res = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to create conversation");
    }
    const json = await res.json();
    return json.data;
  },

  async getConversationMessages(conversationId) {
    const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to load conversation messages");
    }
    const json = await res.json();
    return json.data || [];
  },

  async deleteConversation(conversationId) {
    const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to delete conversation");
    }
    return true;
  },

  // Ask RAG Assistant (with persistent conversation tracking)
  async askQuestion({ question, conversationId }) {
    const res = await fetch(`${API_URL}/rag/ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ question, conversationId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to retrieve AI answer");
    }
    const json = await res.json();
    return json.data;
  },
};
