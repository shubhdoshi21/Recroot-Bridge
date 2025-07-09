import * as clientRepository from "../repositories/clientRepository.js";

export const createClient = async (clientData) => {
  try {
    // Validate required fields
    if (!clientData.companyName || !clientData.subscriptionModelId) {
      throw new Error("Company name and subscription model are required");
    }

    const client = await clientRepository.createClient(clientData);
    return client;
  } catch (error) {
    console.log("Error in createClient service:", error);
    throw error;
  }
};

export const getClientById = async (id) => {
  try {
    const client = await clientRepository.getClientById(id);
    return client;
  } catch (error) {
    console.log("Error in getClientById service:", error);
    throw error;
  }
};

export const getAllClients = async (options) => {
  try {
    const result = await clientRepository.getAllClients(options);
    return result;
  } catch (error) {
    console.log("Error in getAllClients service:", error);
    throw error;
  }
};

export const updateClient = async (id, clientData) => {
  try {
    // Validate company name if provided
    if (clientData.companyName === "") {
      throw new Error("Company name cannot be empty");
    }

    const client = await clientRepository.updateClient(id, clientData);
    return client;
  } catch (error) {
    console.log("Error in updateClient service:", error);
    throw error;
  }
};

export const deleteClient = async (id) => {
  try {
    const result = await clientRepository.deleteClient(id);
    return result;
  } catch (error) {
    console.log("Error in deleteClient service:", error);
    throw error;
  }
};

export const deactivateClient = async (id) => {
  try {
    const result = await clientRepository.deactivateClient(id);
    return result;
  } catch (error) {
    console.log("Error in deactivateClient service:", error);
    throw error;
  }
};

export const reactivateClient = async (id) => {
  try {
    const result = await clientRepository.reactivateClient(id);
    return result;
  } catch (error) {
    console.log("Error in reactivateClient service:", error);
    throw error;
  }
};
