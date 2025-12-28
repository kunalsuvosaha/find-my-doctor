
import { Router } from 'express';
import { listDoctors, getDoctorProfile, updateProfile } from '../controllers/doctorController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', listDoctors);
router.get('/:id', getDoctorProfile);
router.patch('/profile', authenticateToken, updateProfile);

export default router;
