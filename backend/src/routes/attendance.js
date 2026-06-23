import express from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/class/:classId', authenticate, authorize('admin', 'instructor'), async (req, res) => {
  const { date } = req.query;
  const classDate = date || new Date().toISOString().split('T')[0];

  try {
    const result = await pool.query(
      `SELECT e.id as enrollment_id, s.first_name || ' ' || s.last_name as student_name,
              a.id as attendance_id, a.status, a.class_date
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       LEFT JOIN attendance a ON a.enrollment_id = e.id AND a.class_date = $2
       WHERE e.class_id = $1 AND e.status = 'active'
       ORDER BY s.last_name`,
      [req.params.classId, classDate]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
});

router.post('/', authenticate, authorize('admin', 'instructor'), async (req, res) => {
  const { enrollmentId, classDate, status, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO attendance (enrollment_id, class_date, status, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (enrollment_id, class_date)
       DO UPDATE SET status = $3, notes = $4, recorded_by = $5
       RETURNING *`,
      [enrollmentId, classDate, status || 'present', notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar asistencia' });
  }
});

router.post('/bulk', authenticate, authorize('admin', 'instructor'), async (req, res) => {
  const { records } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const r of records) {
      const result = await client.query(
        `INSERT INTO attendance (enrollment_id, class_date, status, recorded_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (enrollment_id, class_date)
         DO UPDATE SET status = $3, recorded_by = $4
         RETURNING *`,
        [r.enrollmentId, r.classDate, r.status, req.user.id]
      );
      results.push(result.rows[0]);
    }
    await client.query('COMMIT');
    res.json(results);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Error al registrar asistencia' });
  } finally {
    client.release();
  }
});

export default router;
