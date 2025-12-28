import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import doctorRoutes from './routes/doctor';
import appointmentRoutes from './routes/appointment';
import prescriptionRoutes from './routes/prescription';

import morgan from 'morgan';

const app = express();

app.use(morgan('dev'));
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/doctors', doctorRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/prescriptions', prescriptionRoutes);

app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
});

app.listen(3000, () => {
    console.log('API running on http://localhost:3000');
});
