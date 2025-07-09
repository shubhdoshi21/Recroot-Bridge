import express from "express";
import {
  getAllTeams,
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  getTeamMemberById,
  updateTeamMember,
  removeTeamMember,
  getTeamJobs,
  assignJobToTeam,
  getTeamJobById,
  removeJobFromTeam,
  getTeamPerformance,
  getTeamHiringMetrics,
  getTeamMonthlyHires,
  getTeamTimeToHire,
  getTeamOfferAcceptance,
  getTeamCandidateSources,
  getTeamMemberPerformance,
  getTeamActivity,
  getDepartments,
  addDepartment,
  getLocations,
  addLocation,
  getTeamStats,
  searchTeams,
  getSubteams,
  addSubteam,
  removeSubteam,
  updateTeamLead,
} from "../controllers/teamController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { checkPermission } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Static routes should come before dynamic routes
// Filtering and Search
router.get("/search", verifyToken, checkPermission("teams.view"), searchTeams);

// Team Statistics and Reference Data
router.get("/stats", verifyToken, checkPermission("teams.view"), getTeamStats);
router.get("/departments", verifyToken, checkPermission("teams.view"), getDepartments);
router.post("/departments", verifyToken, checkPermission("teams.edit"), addDepartment);
router.get("/locations", verifyToken, checkPermission("teams.view"), getLocations);
router.post("/locations", verifyToken, checkPermission("teams.edit"), addLocation);

// Team List and Creation
router.get("/", verifyToken, checkPermission("teams.view"), getAllTeams);
router.post("/", verifyToken, checkPermission("teams.create"), createTeam);

// Dynamic routes with parameters
// Team Details
router.get("/:id", verifyToken, checkPermission("teams.view"), getTeamById);
router.put("/:id", verifyToken, checkPermission("teams.edit"), updateTeam);
router.delete("/:id", verifyToken, checkPermission("teams.delete"), deleteTeam);

// Team Lead Management
router.put("/:id/lead", verifyToken, checkPermission("teams.edit"), updateTeamLead);

// Team Members Management
router.get("/:id/members", verifyToken, checkPermission("teams.view"), getTeamMembers);
router.post("/:id/members", verifyToken, checkPermission("teams.edit"), addTeamMember);
router.get("/:id/members/:memberId", verifyToken, checkPermission("teams.view"), getTeamMemberById);
router.put("/:id/members/:memberId", verifyToken, checkPermission("teams.edit"), updateTeamMember);
router.delete("/:id/members/:memberId", verifyToken, checkPermission("teams.edit"), removeTeamMember);

// Team Jobs Management
router.get("/:id/jobs", verifyToken, checkPermission("teams.view"), getTeamJobs);
router.post("/:id/jobs", verifyToken, checkPermission("teams.edit"), assignJobToTeam);
router.get("/:id/jobs/:jobId", verifyToken, checkPermission("teams.view"), getTeamJobById);
router.delete("/:id/jobs/:jobId", verifyToken, checkPermission("teams.edit"), removeJobFromTeam);

// Team Performance and Metrics
router.get("/:id/performance", verifyToken, checkPermission("teams.view"), getTeamPerformance);
router.get("/:id/performance/hiring", verifyToken, checkPermission("teams.view"), getTeamHiringMetrics);
router.get("/:id/performance/monthly-hires", verifyToken, checkPermission("teams.view"), getTeamMonthlyHires);
router.get("/:id/performance/time-to-hire", verifyToken, checkPermission("teams.view"), getTeamTimeToHire);
router.get(
  "/:id/performance/offer-acceptance",
  verifyToken,
  checkPermission("teams.view"),
  getTeamOfferAcceptance
);
router.get(
  "/:id/performance/candidate-sources",
  verifyToken,
  checkPermission("teams.view"),
  getTeamCandidateSources
);
router.get("/:id/performance/members", verifyToken, checkPermission("teams.view"), getTeamMemberPerformance);

// Team Activity
router.get("/:id/activity", verifyToken, checkPermission("teams.view"), getTeamActivity);

// Subteams Management
router.get("/:id/subteams", verifyToken, checkPermission("teams.view"), getSubteams);
router.post("/:id/subteams", verifyToken, checkPermission("teams.edit"), addSubteam);
router.delete("/:id/subteams/:subteamId", verifyToken, checkPermission("teams.edit"), removeSubteam);

export default router;
