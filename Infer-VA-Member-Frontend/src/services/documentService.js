import { fetchWithSession } from "./authService";

const API_URL = (import.meta.env.VITE_RAG_API_URL || "http://localhost:7000/api")
  .replace(/\/$/, "");

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function consumeEventStream(response, onEvent) {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(
      payload?.error?.message || payload?.message || "The assistant request failed."
    );
  }
  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let completed = null;

  function dispatch(block) {
    if (!block.trim()) return;
    let eventName = "message";
    const dataLines = [];
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;

    const data = JSON.parse(dataLines.join("\n"));
    if (eventName === "error") {
      throw new Error(data.message || "The assistant request failed.");
    }
    if (eventName === "done") completed = data;
    onEvent(eventName, data);
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || "";
      blocks.forEach(dispatch);
      if (done) break;
    }
    if (buffer.trim()) dispatch(buffer);
  } finally {
    reader.releaseLock();
  }

  if (!completed) throw new Error("The assistant stream ended before completion.");
  return completed;
}

async function getList(endpoint, resourceName) {
  const response = await fetchWithSession(`${API_URL}${endpoint}`, {
    headers: getAuthHeaders(),
  });
  const payload = await response.json().catch(() => null);

  if (response.status === 401) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    window.location.href = "/";
    throw new Error("Your session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        payload?.message ||
        `Failed to load ${resourceName}.`
    );
  }

  if (!Array.isArray(payload?.data)) {
    throw new Error(`The ${resourceName} API returned an unexpected response.`);
  }

  return payload.data;
}

export const documentService = {
  // Document Operations
  async getDocuments(folderId) {
    const query =
      folderId && folderId !== "All"
        ? `?folderId=${encodeURIComponent(folderId)}`
        : "";
    return getList(`/documents${query}`, "documents");
  },

  async getFolders() {
    return getList("/folders", "folders");
  },

  // Conversation & Chat History Operations
  async getConversations() {
    const res = await fetchWithSession(`${API_URL}/conversations`, {
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
    const res = await fetchWithSession(`${API_URL}/conversations`, {
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
    const res = await fetchWithSession(`${API_URL}/conversations/${conversationId}/messages`, {
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
    const res = await fetchWithSession(`${API_URL}/conversations/${conversationId}`, {
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
    const res = await fetchWithSession(`${API_URL}/rag/ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question,
        ...(conversationId ? { conversationId } : {}),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Failed to retrieve AI answer");
    }
    const json = await res.json();
    return json.data;
  },

  async askQuestionStream({ question, conversationId, onEvent }) {
    const response = await fetchWithSession(`${API_URL}/rag/ask/stream`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question,
        ...(conversationId ? { conversationId } : {}),
      }),
    });
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/";
      throw new Error("Your session expired. Please sign in again.");
    }
    return consumeEventStream(response, onEvent || (() => {}));
  },

  async submitFeedback(messageId, { helpful, comment = "" }) {
    const response = await fetchWithSession(`${API_URL}/feedback/${encodeURIComponent(messageId)}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ helpful, comment }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.error?.message || "Could not save your rating.");
    }
    return payload.data;
  },
};
