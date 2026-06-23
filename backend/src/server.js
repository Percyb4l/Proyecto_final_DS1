import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import instructorRoutes from './routes/instructors.js';
import classRoutes from './routes/classes.js';
import enrollmentRoutes from './routes/enrollments.js';
import paymentRoutes from './routes/payments.js';
import attendanceRoutes from './routes/attendance.js';
import catalogRoutes from './routes/catalog.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dance Academy API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api', catalogRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🩰 Dance Academy API corriendo en http://localhost:${PORT}`);
});
