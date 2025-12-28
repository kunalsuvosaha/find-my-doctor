
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const listDoctors = async (req: AuthRequest, res: Response) => {
    try {
        const doctors = await prisma.doctorProfile.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getDoctorProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'ID required' });

        const doctor = await prisma.doctorProfile.findFirst({
            where: {
                OR: [
                    { id: id },
                    { userId: id }
                ]
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        const { specialization, bio, availableSlots } = req.body;

        const profile = await prisma.doctorProfile.update({
            where: { userId },
            data: {
                specialization,
                bio,
                availableSlots
            }
        });

        res.json(profile);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
