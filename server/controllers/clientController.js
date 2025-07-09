import * as clientService from "../services/clientService.js";

export const createClient = async (req, res) => {
  try {
    const clientData = req.body;
    const client = await clientService.createClient(clientData);
    res.status(201).json(client);
  } catch (error) {
    console.log("Error in createClient controller:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await clientService.getClientById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    console.log("Error in getClientById controller:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const { search, status } = req.query;
    const options = {
      search,
      status,
    };
    const result = await clientService.getAllClients(options);
    res.json(result);
  } catch (error) {
    console.log("Error in getAllClients controller:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const clientData = req.body;
    const client = await clientService.updateClient(id, clientData);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    console.log("Error in updateClient controller:", error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientService.deleteClient(id);
    if (!result) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.log("Error in deleteClient controller:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deactivateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientService.deactivateClient(id);
    if (!result) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client deactivated successfully" });
  } catch (error) {
    console.log("Error in deactivateClient controller:", error);
    res.status(500).json({ message: error.message });
  }
};

export const reactivateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientService.reactivateClient(id);
    if (!result) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client reactivated successfully" });
  } catch (error) {
    console.log("Error in reactivateClient controller:", error);
    res.status(500).json({ message: error.message });
  }
};
