import express from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, s.first_name || ' ' || s.last_name as student_name, c.name as class_name
       FROM payments p
       JOIN enrollments e ON p.enrollment_id = e.id
       JOIN students s ON e.student_id = s.id
       JOIN classes c ON e.class_id = c.id
       ORDER BY p.due_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const student = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (!student.rows[0]) return res.json([]);

    const result = await pool.query(
      `SELECT p.*, c.name as class_name
       FROM payments p
       JOIN enrollments e ON p.enrollment_id = e.id
       JOIN classes c ON e.class_id = c.id
       WHERE e.student_id = $1
       ORDER BY p.due_date DESC`,
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pagos' });
  }
});

router.patch('/:id/pay', authenticate, authorize('admin'), async (req, res) => {
  const { paymentMethod, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE payments SET status = 'paid', paid_date = CURRENT_DATE, payment_method = $1, notes = $2
       WHERE id = $3 RETURNING *`,
      [paymentMethod || 'Efectivo', notes, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar pago' });
  }
});

export default router;
