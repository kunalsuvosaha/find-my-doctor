
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';

export const createAppointment = async (req: AuthRequest, res: Response) => {
    try {
        const patientId = req.user?.userId;
        const { doctorId, date, issue } = req.body;

        if (!patientId) return res.sendStatus(401);

        if (new Date(date) <= new Date()) {
            return res.status(400).json({ error: 'Appointment date must be in the future' });
        }

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                date: new Date(date),
                issue,
                status: 'PENDING'
            }
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAppointments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        if (!userId) return res.sendStatus(401);

        const where = role === 'DOCTOR' ? { doctorId: userId } : { patientId: userId };

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                patient: { select: { name: true, email: true } },
                doctor: { select: { name: true, email: true, doctorProfile: { select: { specialization: true } } } },
                prescription: true
            },
            orderBy: { date: 'asc' }
        });

        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.sendStatus(401);
        if (!id) return res.status(400).json({ error: 'ID required' });

        // Only doctor can update status usually, or patient can cancel
        // ideally check if userId belongs to doctor or patient involved

        const appointmentCheck = await prisma.appointment.findUnique({ where: { id } });
        if (!appointmentCheck) return res.sendStatus(404);

        const data: any = { status };

        // 1. Doctor Reschedules
        if (status === 'RESCHEDULED') {
            const { date } = req.body;
            if (date) {
                const newDate = new Date(date);
                if (newDate <= new Date()) {
                    return res.status(400).json({ error: 'Rescheduled date must be in the future' });
                }
                data.rescheduledDate = newDate;
            }
        }

        // 2. Patient Accepts Reschedule
        if (status === 'CONFIRMED' && appointmentCheck.status === 'RESCHEDULED' && (appointmentCheck as any).rescheduledDate) {
            data.date = (appointmentCheck as any).rescheduledDate;
            data.rescheduledDate = null;
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data
        });

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
