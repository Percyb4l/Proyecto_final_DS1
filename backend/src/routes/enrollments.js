import express from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT e.*, s.first_name || ' ' || s.last_name as student_name, s.document_id,
             c.name as class_name, c.monthly_fee, ds.name as dance_style
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN classes c ON e.class_id = c.id
      JOIN dance_styles ds ON c.dance_style_id = ds.id
    `;
    const params = [];

    if (req.user.role === 'student') {
      const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (!student.rows[0]) return res.json([]);
      query += ' WHERE e.student_id = $1';
      params.push(student.rows[0].id);
    }

    query += ' ORDER BY e.enrollment_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inscripciones' });
  }
});

router.post('/', authenticate, authorize('admin', 'student'), async (req, res) => {
  let { studentId, classId } = req.body;

  if (req.user.role === 'student') {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (!student.rows[0]) return res.status(400).json({ error: 'Perfil de estudiante no encontrado' });
    studentId = student.rows[0].id;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const classInfo = await client.query(
      `SELECT c.*, (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id AND e.status = 'active') as enrolled
       FROM classes c WHERE c.id = $1 AND c.is_active = true`,
      [classId]
    );
    if (!classInfo.rows[0]) {
      return res.status(404).json({ error: 'Clase no encontrada' });
    }
    if (classInfo.rows[0].enrolled >= classInfo.rows[0].max_students) {
      return res.status(400).json({ error: 'La clase está llena' });
    }

    const enrollResult = await client.query(
      `INSERT INTO enrollments (student_id, class_id) VALUES ($1, $2) RETURNING *`,
      [studentId, classId]
    );

    await client.query(
      `INSERT INTO payments (enrollment_id, amount, due_date, status)
       VALUES ($1, $2, CURRENT_DATE + 5, 'pending')`,
      [enrollResult.rows[0].id, classInfo.rows[0].monthly_fee]
    );

    await client.query('COMMIT');
    res.status(201).json(enrollResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'El estudiante ya está inscrito en esta clase' });
    res.status(500).json({ error: 'Error al inscribir' });
  } finally {
    client.release();
  }
});

router.patch('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE enrollments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Inscripción no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

export default router;
