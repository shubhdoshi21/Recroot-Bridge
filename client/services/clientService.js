import { api } from "../config/api";
import axios from "axios";

export const clientService = {
  getAllClients: async (options = {}) => {
    try {
      const { page = 1, limit = 10, isActive, search } = options;
      const params = new URLSearchParams({
        page,
        limit,
        ...(isActive !== undefined && { isActive }),
        ...(search && { search }),
      });

      const response = await axios.get(`${api.clients.getAll()}?${params}`);
      return response.data;
    } catch (error) {
      console.log("Error fetching clients:", error);
      throw error.response?.data || error.message;
    }
  },

  getClientById: async (id) => {
    try {
      const response = await axios.get(api.clients.getById(id));
      return response.data;
    } catch (error) {
      console.log("Error fetching client:", error);
      throw error.response?.data || error.message;
    }
  },

  createClient: async (clientData) => {
    try {
      const response = await axios.post(api.clients.create(), clientData);
      return response.data;
    } catch (error) {
      console.log("Error creating client:", error);
      throw error.response?.data || error.message;
    }
  },

  updateClient: async (id, clientData) => {
    try {
      const response = await axios.put(api.clients.update(id), clientData);
      return response.data;
    } catch (error) {
      console.log("Error updating client:", error);
      throw error.response?.data || error.message;
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await axios.delete(api.clients.delete(id));
      return response.data;
    } catch (error) {
      console.log("Error deleting client:", error);
      throw error.response?.data || error.message;
    }
  },

  deactivateClient: async (id) => {
    try {
      const response = await axios.patch(api.clients.deactivate(id));
      return response.data;
    } catch (error) {
      console.log("Error deactivating client:", error);
      throw error.response?.data || error.message;
    }
  },

  reactivateClient: async (id) => {
    try {
      const response = await axios.patch(api.clients.reactivate(id));
      return response.data;
    } catch (error) {
      console.log("Error reactivating client:", error);
      throw error.response?.data || error.message;
    }
  },
};
