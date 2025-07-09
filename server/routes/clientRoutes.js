import express from "express";
import * as clientController from "../controllers/clientController.js";
// import { verifyToken, checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Client routes are now public
// router.use(verifyToken);
// router.use(checkRole("admin"));

// Create a new client
router.post("/", clientController.createClient);

// Get all clients with pagination and filters
router.get("/", clientController.getAllClients);

// Get a specific client by ID
router.get("/:id", clientController.getClientById);

// Update a client
router.put("/:id", clientController.updateClient);

// Delete a client
router.delete("/:id", clientController.deleteClient);

// Deactivate a client
router.patch("/:id/deactivate", clientController.deactivateClient);

// Reactivate a client
router.patch("/:id/reactivate", clientController.reactivateClient);

export default router;
