
import { Router } from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createAppointment);
router.get('/', getAppointments);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
