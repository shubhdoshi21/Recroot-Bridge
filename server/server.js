import express from "express";
import dotenv from "dotenv";
import { dbConnect, dbSync } from "./config/dbConfig.js";
import bodyparser from "body-parser";
import {
  candidateRoutes,
  jobRoutes,
  authRoutes,
  recruiterRoutes,
  teamRoutes,
  companyRoutes,
  clientRoutes,
  userRoutes,
  pipelineRoutes,
  documentRoutes,
  interviewRoutes,
  gmailRoutes,
  atsRoutes,
  permissionRoutes,
  onboardingRoutes
} from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from "multer";
import fs from "fs";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { runAllScheduledTasks } from "./utils/scheduledTasks.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import communicationsRoutes from "./routes/communicationsRoutes.js";
// import { seedPermissions } from "./scripts/seedPermissions.js"

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pipelines", pipelineRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/gmail", gmailRoutes);
app.use("/api/communications", communicationsRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/onboarding", onboardingRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect()
    .then(() => {
      console.log("Database is connected");
      // Database sync and associations
      dbSync()
        .then(() =>
          console.log("Database is connected and synced with associations")
        )
        .catch((err) => console.log("Error syncing database:", err));
    })
    .catch((err) => console.log("Error connecting to database:", err));
  // seedPermissions();
  // Setup scheduled tasks
  cron.schedule("0 0 * * *", async () => {
    console.log("Running scheduled tasks...");
    try {
      await runAllScheduledTasks();
      console.log("Scheduled tasks completed successfully");
    } catch (error) {
      console.log("Error running scheduled tasks:", error);
    }
  });
});

export default app;
