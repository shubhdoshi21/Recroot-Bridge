import { Router } from "express";
import {
  getInbox,
  getMessageController,
  sendMessageController,
  starMessageController,
  unstarMessageController,
  archiveMessageController,
  unarchiveMessageController,
  getLabelsController,
  getMessagesByLabelController,
  downloadAttachmentController,
} from "../controllers/gmailController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.get("/inbox", verifyToken, getInbox);
router.get("/message/:id", verifyToken, getMessageController);
router.post("/send", verifyToken, upload.any(), sendMessageController);

// Star/Unstar
router.patch("/message/:id/star", verifyToken, starMessageController);
router.patch("/message/:id/unstar", verifyToken, unstarMessageController);
// Archive/Unarchive
router.patch("/message/:id/archive", verifyToken, archiveMessageController);
router.patch("/message/:id/unarchive", verifyToken, unarchiveMessageController);

router.get("/labels", verifyToken, getLabelsController);
router.get("/label/:labelId", verifyToken, getMessagesByLabelController);

router.get(
  "/message/:messageId/attachment/:attachmentId",
  verifyToken,
  downloadAttachmentController
);

export default router;
