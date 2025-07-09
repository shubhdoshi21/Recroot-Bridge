import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getAllEmailTemplates,
  getEmailTemplateById,
  getAllAutomatedMessages,
  createAutomatedMessage,
  updateAutomatedMessage,
  toggleAutomatedMessageStatus,
  deleteAutomatedMessage,
  triggerCandidateAutomation,
  getVariablesForContext,
  testAutomation,
  getAutomationTriggers,
  getAutomationVariablesList,
  getAutomationMessage,
  postAutomationMessage,
  editAutomationMessage,
  sendEmail
} from '../controllers/communicationsController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication middleware to all communications routes
router.use(protect);

// Email Templates
router.get('/email-templates', getAllEmailTemplates);
router.get('/email-templates/:id', getEmailTemplateById);

// Automated Messages (new and legacy routes)
router.get('/automated-messages', getAllAutomatedMessages);
router.post('/automated-messages', createAutomatedMessage);
router.put('/automated-messages/:id', updateAutomatedMessage);
router.patch('/automated-messages/:id/toggle-status', toggleAutomatedMessageStatus);
router.patch('/automated-messages/:id/toggle', toggleAutomatedMessageStatus); // alias for frontend
router.delete('/automated-messages/:id', deleteAutomatedMessage);

// Automation (new and legacy routes)
router.post('/automation/trigger', triggerCandidateAutomation);
router.get('/automation/variables', getVariablesForContext);
router.post('/automation/test', testAutomation);

// Additional automation endpoints
router.get('/automation/triggers', getAutomationTriggers);
router.get('/automation/variables/list', getAutomationVariablesList);
router.route('/automation/message')
  .get(getAutomationMessage)
  .post(postAutomationMessage);
router.route('/automation/edit-message')
  .post(editAutomationMessage)
  .put(editAutomationMessage);

router.post('/send-email', upload.array('attachments'), sendEmail);

export default router; 