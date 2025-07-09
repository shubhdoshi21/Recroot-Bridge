import { User } from "../models/User.js";
import { Client } from "../models/Client.js";
import { SubscriptionModel } from "../models/SubscriptionModel.js";
import { Op } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const getUsers = async (options = {}) => {
  try {
    console.log("[userRepository] getUsers called with options:", options);
    const { role, isActive, search, clientId } = options;
    console.log(clientId + "clientID");

    // If clientId is null, return empty results
    if (clientId === null) {
      return {
        users: [],
        clients: [],
      };
    }

    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (clientId !== undefined) where.clientId = clientId;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    console.log("[userRepository] Query where clause:", where);

    // First, get all users to find which clients are assigned to admins
    const allUsers = await User.findAll({
      where: { role: "admin" },
      attributes: ["clientId"],
    });

    // Create a set of client IDs that are assigned to admins
    const assignedClientIds = new Set(
      allUsers.map((user) => user.clientId).filter((id) => id !== null)
    );

    // Get all clients with their subscription details
    const clients = await Client.findAll({
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

    // Add assignedToAdmin flag to each client
    const clientsWithAssignmentInfo = clients.map((client) => ({
      ...client.toJSON(),
      assignedToAdmin: assignedClientIds.has(client.id),
    }));

    // Get users with their client information
    const users = await User.findAll({
      where,
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Client,
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
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log("[userRepository] Retrieved users:", users.length);
    return {
      users,
      clients: clientsWithAssignmentInfo,
    };
  } catch (error) {
    console.log("[userRepository] Error in getUsers:", error);
    throw new Error("Failed to fetch users");
  }
};

export const getUserById = async (userId) => {
  try {
    console.log("[userRepository] getUserById called with userId:", userId);
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      console.log("[userRepository] User not found for id:", userId);
      throw new Error("User not found");
    }

    console.log("[userRepository] Found user:", user.id);
    return user;
  } catch (error) {
    console.log("[userRepository] Error in getUserById:", error);
    throw error;
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    console.log("[userRepository] updateUserRole called with:", {
      userId,
      newRole,
    });
    const user = await User.findByPk(userId);

    if (!user) {
      console.log("[userRepository] User not found for role update:", userId);
      throw new Error("User not found");
    }

    console.log("[userRepository] Current user role:", user.role);
    await user.update({ role: newRole.toLowerCase() });
    console.log(
      "[userRepository] Updated user role to:",
      newRole.toLowerCase()
    );

    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    console.log("[userRepository] Error in updateUserRole:", error);
    throw error;
  }
};

export const updateUserClient = async (userId, clientId) => {
  try {
    console.log("[userRepository] updateUserClient called with:", {
      userId,
      clientId,
    });
    const user = await User.findByPk(userId);

    if (!user) {
      console.log("[userRepository] User not found for client update:", userId);
      throw new Error("User not found");
    }

    // Only validate clientId if it's not null (for removing assignments)
    if (clientId !== null) {
      console.log("[userRepository] Validating client ID:", clientId);
      const client = await sequelize.query(
        "SELECT id FROM clients WHERE id = :clientId",
        {
          replacements: { clientId },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      if (!client || client.length === 0) {
        console.log("[userRepository] Invalid client ID:", clientId);
        throw new Error("Invalid client ID - client does not exist");
      }
    }

    console.log("[userRepository] Current user client:", user.clientId);
    await user.update({ clientId });
    console.log("[userRepository] Updated user client to:", clientId);

    // Fetch the updated user with the Client model included
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Client,
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
        },
      ],
    });

    return updatedUser.toJSON();
  } catch (error) {
    console.log("[userRepository] Error in updateUserClient:", error);
    throw error;
  }
};

export const getUserCountsByRole = async (clientId) => {
  try {
    console.log(
      "[userRepository] getUserCountsByRole called with clientId:",
      clientId
    );
    const counts = await User.findAll({
      attributes: [
        "role",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        isActive: true,
        clientId: clientId,
      },
      group: ["role"],
    });

    console.log("[userRepository] Raw role counts:", counts);

    const roleCounts = counts.reduce((acc, curr) => {
      acc[curr.role] = parseInt(curr.getDataValue("count"));
      return acc;
    }, {});

    // Ensure all roles are present in the response
    const allRoles = ["admin", "manager", "recruiter", "user", "guest"];
    allRoles.forEach((role) => {
      if (!roleCounts[role]) {
        roleCounts[role] = 0;
      }
    });

    console.log("[userRepository] Final role counts:", roleCounts);
    return roleCounts;
  } catch (error) {
    console.log("[userRepository] Error in getUserCountsByRole:", error);
    throw new Error("Failed to get user counts by role");
  }
};

export const createUser = async (userData) => {
  try {
    console.log("[userRepository] createUser called with data:", {
      ...userData,
      password: "[REDACTED]",
    });

    const user = await User.create(userData);
    console.log("[userRepository] User created successfully:", user.id);

    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  } catch (error) {
    console.log("[userRepository] Error in createUser:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    console.log("[userRepository] updateUser called with:", {
      userId,
      userData: {
        ...userData,
        password: userData.password ? "[REDACTED]" : undefined,
      },
    });

    const user = await User.findByPk(userId);
    if (!user) {
      console.log("[userRepository] User not found for update:", userId);
      throw new Error("User not found");
    }

    // Only allow updating specific fields
    const allowedFields = [
      "fullName",
      "firstName",
      "lastName",
      "email",
      "phone",
      "role",
      "status",
      "isActive",
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (userData[field] !== undefined) {
        updateData[field] = userData[field];
      }
    }

    console.log("[userRepository] Applying updates:", updateData);
    await user.update(updateData);

    // Fetch the updated user with all necessary relations
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Client,
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
        },
      ],
    });

    console.log("[userRepository] User updated successfully:", {
      userId,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    return updatedUser.toJSON();
  } catch (error) {
    console.log("[userRepository] Error in updateUser:", error);
    throw error;
  }
};

export const getUsersForSuperAdmin = async () => {
  try {
    console.log("[userRepository] getUsersForSuperAdmin called");

    // Get all clients with their subscription details
    console.log("[userRepository] Fetching clients...");
    const clients = await Client.findAll({
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
    console.log("[userRepository] Found clients:", clients.length);

    // Get all users with their client information
    console.log("[userRepository] Fetching users...");
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Client,
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
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    console.log("[userRepository] Found users:", users.length);

    console.log(
      "[userRepository] Retrieved users for super admin:",
      users.length
    );
    return {
      users,
      clients: clients.map((client) => client.toJSON()),
    };
  } catch (error) {
    console.log("[userRepository] Error in getUsersForSuperAdmin:", error);
    console.log("[userRepository] Error stack:", error.stack);
    throw new Error("Failed to fetch users for super admin: " + error.message);
  }
};
