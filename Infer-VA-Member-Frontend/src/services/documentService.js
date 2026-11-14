const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const documentService = {
  async getDocuments() {
    // TODO: Connect with backend GET /api/documents
    return { success: true, data: [] };
  },

  async getFolders() {
    // TODO: Connect with backend GET /api/folders
    return { success: true, data: [] };
  },

  async getChats() {
    // TODO: Connect with backend GET /api/chats
    return { success: true, data: [] };
  }
};