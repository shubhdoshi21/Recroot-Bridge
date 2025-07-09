import { Client } from "../models/Client.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { sequelize } from "../config/sequelize.js";
import { User } from "../models/User.js";
import { Op } from "sequelize";

export const createClient = async (clientData) => {
  try {
    const client = await Client.create(clientData);
    return client;
  } catch (error) {
    throw new Error("Error creating client: " + error.message);
  }
};

export const getClientById = async (id) => {
  try {
    const client = await Client.findByPk(id, {
      include: [
        {
          model: SubscriptionModel,
          attributes: [
            "subscriptionPlan",
            "maxUsersAllowed",
            "maxJobPostsAllowed",
            "billingCycle",
            "paymentStatus",
            "isActive",
            "isTrial",
          ],
        },
      ],
    });

    if (!client) {
      throw new Error("Client not found");
    }

    return client;
  } catch (error) {
    throw new Error("Error finding client: " + error.message);
  }
};

export const getAllClients = async (options = {}) => {
  try {
    console.log(
      "[clientRepository] getAllClients called with options:",
      options
    );
    const { search, status } = options;

    // First, get all admin users and their client assignments
    console.log("[clientRepository] Fetching admin users...");
    const adminUsers = await User.findAll({
      where: { role: "admin" },
      attributes: ["id", "fullName", "clientId"],
    });

    console.log(
      "[clientRepository] Found admin users:",
      adminUsers.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        clientId: u.clientId,
      }))
    );

    // Create a map of client IDs to admin information
    const adminAssignmentsMap = adminUsers.reduce((acc, admin) => {
      if (admin.clientId) {
        acc[admin.clientId] = {
          adminId: admin.id,
          adminName: admin.fullName,
        };
      }
      return acc;
    }, {});

    console.log(
      "[clientRepository] Admin assignments map:",
      adminAssignmentsMap
    );

    // Get all clients
    console.log("[clientRepository] Fetching clients...");
    const clients = await Client.findAll({
      where: {
        ...(status && { status }),
        ...(search && {
          [Op.or]: [
            { companyName: { [Op.like]: `%${search}%` } },
            { companyEmail: { [Op.like]: `%${search}%` } },
          ],
        }),
      },
      include: [
        {
          model: SubscriptionModel,
          attributes: [
            "subscriptionPlan",
            "maxUsersAllowed",
            "maxJobPostsAllowed",
            "billingCycle",
            "paymentStatus",
            "isActive",
            "isTrial",
          ],
        },
      ],
    });

    console.log("[clientRepository] Found clients:", clients.length);

    // Add admin assignment information to each client
    const clientsWithAssignments = clients.map((client) => {
      const adminAssignment = adminAssignmentsMap[client.id];
      const clientData = client.toJSON();

      const assignmentInfo = {
        clientId: client.id,
        companyName: client.companyName,
        assignedToAdmin: !!adminAssignment,
        assignedAdminId: adminAssignment?.adminId || null,
        assignedAdminName: adminAssignment?.adminName || null,
      };

      console.log("[clientRepository] Client assignment info:", assignmentInfo);

      return {
        ...clientData,
        assignedToAdmin: assignmentInfo.assignedToAdmin,
        assignedAdminId: assignmentInfo.assignedAdminId,
        assignedAdminName: assignmentInfo.assignedAdminName,
      };
    });

    return {
      clients: clientsWithAssignments,
      totalClients: clientsWithAssignments.length,
    };
  } catch (error) {
    console.log("[clientRepository] Error in getAllClients:", error);
    throw error;
  }
};

export const updateClient = async (id, clientData) => {
  try {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error("Client not found");
    }

    // Only allow updating specific fields
    const allowedFields = [
      "companyName",
      "industry",
      "companySize",
      "location",
      "website",
      "status",
      "GSTIN",
      "PAN",
      "taxID",
      "registrationNumber",
      "addressLine1",
      "addressLine2",
      "city",
      "stateProvince",
      "postalCode",
      "country",
      "companyPhone",
      "companyEmail",
      "subscriptionModelId",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (clientData[field] !== undefined) {
        updateData[field] = clientData[field];
      }
    }

    await client.update(updateData);
    return await getClientById(id); // Return updated client with subscription details
  } catch (error) {
    throw new Error("Error updating client: " + error.message);
  }
};

export const deleteClient = async (id) => {
  try {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error("Client not found");
    }

    await client.destroy();
    return true;
  } catch (error) {
    throw new Error("Error deleting client: " + error.message);
  }
};

export const deactivateClient = async (id) => {
  try {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error("Client not found");
    }

    await client.update({ status: "inactive" });
    return true;
  } catch (error) {
    throw new Error("Error deactivating client: " + error.message);
  }
};

export const reactivateClient = async (id) => {
  try {
    const client = await Client.findByPk(id);
    if (!client) {
      throw new Error("Client not found");
    }

    await client.update({ status: "active" });
    return true;
  } catch (error) {
    throw new Error("Error reactivating client: " + error.message);
  }
};
