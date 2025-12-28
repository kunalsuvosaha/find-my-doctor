
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const createPrescription = async (req: AuthRequest, res: Response) => {
    try {
        const { appointmentId, medications, instructions } = req.body;
        // Verify doctor owns appointment logic can be added here

        const prescription = await prisma.prescription.create({
            data: {
                appointmentId,
                medications,
                instructions
            }
        });

        // Update appointment status to COMPLETED
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' }
        });

        res.status(201).json(prescription);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPrescription = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'ID required' });

        const prescription = await prisma.prescription.findUnique({
            where: { id }, // Prisma might strict check unique input. If id is just string it is fine.
            include: { appointment: true }
        });
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
