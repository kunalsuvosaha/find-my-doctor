
import { Router } from 'express';
import { createPrescription, getPrescription } from '../controllers/prescriptionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', createPrescription);
router.get('/:id', getPrescription);

export default router;
