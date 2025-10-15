import express from 'express';
import { requireAnyStaff, requireAuth } from '../middleware/authz.js';
import { getTodaysAppointments } from "../controllers/jobProgressController.js";
import { getJobHistoryByVehicleReg } from '../controllers/jobProgressController.js'; 
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getActiveJobs,
  getJobHistory,
  getDashboardStats,
  updateJobStage,
  addJobNote,
  getJobNotes,
  updateJobNote,
  deleteJobNote,
  getJobsByCustomer,
} from '../controllers/jobProgressController.js';

const router = express.Router();

// IMPORTANT: More specific routes MUST come before generic /:id routes
// Otherwise Express will match /:id first and treat 'history', 'active', etc. as IDs

// Staff-only routes (specific paths first)
router.get('/active', requireAnyStaff, getActiveJobs);
router.get('/stats', requireAnyStaff, getDashboardStats);
router.get("/todays-jobs", requireAnyStaff, getTodaysAppointments);

// Customer-accessible routes (specific paths)
router.get('/customer/:customerId', requireAuth, getJobsByCustomer);
router.get('/history', requireAuth, getJobHistory); // Both staff and customers can view history

// Staff-only modification routes (must be before /:id routes)
router.post('/', requireAnyStaff, createJob);
router.put('/:id/stage', requireAnyStaff, updateJobStage);
router.put('/:id', requireAnyStaff, updateJob);
router.delete('/:id', requireAnyStaff, deleteJob);

// Note management routes (specific paths before /:id)
router.post('/:id/notes', requireAnyStaff, addJobNote);
router.put('/:id/notes/:noteId', requireAnyStaff, updateJobNote);
router.delete('/:id/notes/:noteId', requireAnyStaff, deleteJobNote);

// View-only routes accessible by both staff and customers (with ownership check in controller)
router.get('/:id/notes', requireAuth, getJobNotes);
router.get('/:id', requireAuth, getJobById);

export default router;