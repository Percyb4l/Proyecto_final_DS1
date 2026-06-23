import express from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/dance-styles', authenticate, async (req, res) => {
  const result = await pool.query('SELECT * FROM dance_styles ORDER BY name');
  res.json(result.rows);
});

router.get('/dance-styles/public', async (req, res) => {
  const result = await pool.query('SELECT * FROM dance_styles ORDER BY name');
  res.json(result.rows);
});

router.get('/classrooms', authenticate, async (req, res) => {
  const result = await pool.query('SELECT * FROM classrooms ORDER BY name');
  res.json(result.rows);
});

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [students, instructors, classes, enrollments, payments] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query('SELECT COUNT(*) FROM instructors'),
      pool.query('SELECT COUNT(*) FROM classes WHERE is_active = true'),
      pool.query("SELECT COUNT(*) FROM enrollments WHERE status = 'active'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'paid'"),
    ]);

    const pendingPayments = await pool.query("SELECT COUNT(*) FROM payments WHERE status = 'pending'");
    const recentEnrollments = await pool.query(
      `SELECT e.enrollment_date, s.first_name || ' ' || s.last_name as student_name, c.name as class_name
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN classes c ON e.class_id = c.id
       ORDER BY e.enrollment_date DESC LIMIT 5`
    );

    res.json({
      stats: {
        students: parseInt(students.rows[0].count),
        instructors: parseInt(instructors.rows[0].count),
        classes: parseInt(classes.rows[0].count),
        activeEnrollments: parseInt(enrollments.rows[0].count),
        totalRevenue: parseFloat(payments.rows[0].total),
        pendingPayments: parseInt(pendingPayments.rows[0].count),
      },
      recentEnrollments: recentEnrollments.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
});

export default router;
