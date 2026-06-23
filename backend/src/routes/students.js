import express from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, authorize('admin', 'instructor'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.email, u.is_active
       FROM students s JOIN users u ON s.user_id = u.id
       ORDER BY s.last_name, s.first_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { email, password, firstName, lastName, documentId, phone, birthDate, address, emergencyContact } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash(password || 'student123', 10);
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hash, 'student']
    );
    const studentResult = await client.query(
      `INSERT INTO students (user_id, first_name, last_name, document_id, phone, birth_date, address, emergency_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userResult.rows[0].id, firstName, lastName, documentId, phone, birthDate, address, emergencyContact]
    );
    await client.query('COMMIT');
    res.status(201).json(studentResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Email o documento duplicado' });
    res.status(500).json({ error: 'Error al crear estudiante' });
  } finally {
    client.release();
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { firstName, lastName, phone, birthDate, address, emergencyContact } = req.body;
  try {
    const result = await pool.query(
      `UPDATE students SET first_name=$1, last_name=$2, phone=$3, birth_date=$4, address=$5, emergency_contact=$6
       WHERE id=$7 RETURNING *`,
      [firstName, lastName, phone, birthDate, address, emergencyContact, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Estudiante no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const student = await pool.query('SELECT user_id FROM students WHERE id = $1', [req.params.id]);
    if (!student.rows[0]) return res.status(404).json({ error: 'Estudiante no encontrado' });
    await pool.query('DELETE FROM users WHERE id = $1', [student.rows[0].user_id]);
    res.json({ message: 'Estudiante eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

export default router;
