import { dbConnect } from "../config/dbConfig.js";
import { seedDefaultPermissions } from "../services/permissionService.js";

export const seedPermissions = async () => {
    try {
        console.log("Starting permission seeding...");

        // Connect to database
        await dbConnect();
        console.log("Database connected successfully");

        // Seed permissions
        const result = await seedDefaultPermissions();
        console.log("Permission seeding completed:", result);

        process.exit(0);
    } catch (error) {
        console.log("Error seeding permissions:", error);
        process.exit(1);
    }
};

// Run the seeding
seedPermissions(); 