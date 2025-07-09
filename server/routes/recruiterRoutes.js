import express from 'express';
import {
    getAllRecruiters,
    createRecruiter,
    getRecruiterById,
    updateRecruiter,
    deleteRecruiter,
    getRecruiterPerformance,
    getAllRecruitersPerformance,
    getRecruiterJobs,
    assignJobToRecruiter,
    removeJobFromRecruiter,
    searchRecruiters,
    getRecruiterStats,
    getAvailableJobsForRecruiter
} from '../controllers/recruiterController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { checkPermission } from '../middlewares/permissionMiddleware.js';

const router = express.Router();

// Static routes should come before dynamic routes
// Filtering and Search
router.get('/search', verifyToken, checkPermission('recruiters.view'), searchRecruiters);

// Recruiter Statistics
router.get('/stats', verifyToken, checkPermission('recruiters.view'), getRecruiterStats);

// Recruiter Performance (general)
router.get('/performance', verifyToken, checkPermission('recruiters.view'), getAllRecruitersPerformance);

// Recruiter List and Creation
router.get('/', verifyToken, checkPermission('recruiters.view'), getAllRecruiters);
router.post('/', verifyToken, checkPermission('recruiters.create'), createRecruiter);

// Dynamic routes with parameters
// Recruiter Performance (specific)
router.get('/:id/performance', verifyToken, checkPermission('recruiters.view'), getRecruiterPerformance);

// Recruiter Job Assignments
router.get('/:id/jobs', verifyToken, checkPermission('recruiters.view'), getRecruiterJobs);
router.post('/:id/jobs', verifyToken, checkPermission('recruiters.edit'), assignJobToRecruiter);
router.delete('/:id/jobs/:jobId', verifyToken, checkPermission('recruiters.edit'), removeJobFromRecruiter);

// Recruiter Resource Management
router.get('/:id', verifyToken, checkPermission('recruiters.view'), getRecruiterById);
router.put('/:id', verifyToken, checkPermission('recruiters.edit'), updateRecruiter);
router.delete('/:id', verifyToken, checkPermission('recruiters.delete'), deleteRecruiter);

// New route for getting available jobs for a recruiter
router.get('/:id/available-jobs', verifyToken, checkPermission('recruiters.view'), getAvailableJobsForRecruiter);

export default router; 