import express from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.email FROM instructors i JOIN users u ON i.user_id = u.id ORDER BY i.last_name`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener instructores' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.email FROM instructors i JOIN users u ON i.user_id = u.id WHERE i.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Instructor no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { email, password, firstName, lastName, documentId, phone, specialty, bio } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash(password || 'instructor123', 10);
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [email, hash, 'instructor']
    );
    const instructorResult = await client.query(
      `INSERT INTO instructors (user_id, first_name, last_name, document_id, phone, specialty, bio)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userResult.rows[0].id, firstName, lastName, documentId, phone, specialty, bio]
    );
    await client.query('COMMIT');
    res.status(201).json(instructorResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ error: 'Email o documento duplicado' });
    res.status(500).json({ error: 'Error al crear instructor' });
  } finally {
    client.release();
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { firstName, lastName, phone, specialty, bio } = req.body;
  try {
    const result = await pool.query(
      `UPDATE instructors SET first_name=$1, last_name=$2, phone=$3, specialty=$4, bio=$5
       WHERE id=$6 RETURNING *`,
      [firstName, lastName, phone, specialty, bio, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Instructor no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const instructor = await pool.query('SELECT user_id FROM instructors WHERE id = $1', [req.params.id]);
    if (!instructor.rows[0]) return res.status(404).json({ error: 'Instructor no encontrado' });
    await pool.query('DELETE FROM users WHERE id = $1', [instructor.rows[0].user_id]);
    res.json({ message: 'Instructor eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

export default router;
