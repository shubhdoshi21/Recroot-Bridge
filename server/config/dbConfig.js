import { sequelize } from "./sequelize.js";
import { SetupAssociations } from "./Association.js"

export const dbConnect = async () => {
  return await sequelize.authenticate();
};

export const dbSync = async () => {
  try {
    // Setup associations before syncing
    SetupAssociations();

    // Use force: false by default to prevent recreating the database each time
    console.log("Syncing database...");
    return await sequelize.sync({ force: false });
  } catch (error) {
    console.log("Initial sync failed, trying with alter...", error.message);

    // If the initial sync fails, try with alter: true
    try {
      return await sequelize.sync({ alter: true });
    } catch (alterError) {
      console.log("Database sync failed completely:", alterError.message);
      throw alterError;
    }
  }
};