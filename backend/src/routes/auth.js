import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  try {
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    let profile = null;
    if (user.role === 'student') {
      const s = await pool.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      profile = s.rows[0];
    } else if (user.role === 'instructor') {
      const i = await pool.query('SELECT * FROM instructors WHERE user_id = $1', [user.id]);
      profile = i.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, profile },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, documentId, phone } = req.body;
  if (!email || !password || !firstName || !lastName || !documentId) {
    return res.status(400).json({ error: 'Todos los campos obligatorios son requeridos' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const hash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hash, 'student']
    );
    const user = userResult.rows[0];
    const studentResult = await client.query(
      `INSERT INTO students (user_id, first_name, last_name, document_id, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user.id, firstName, lastName, documentId, phone]
    );
    await client.query('COMMIT');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: { ...user, profile: studentResult.rows[0] },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email o documento ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  } finally {
    client.release();
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userResult.rows[0];
    let profile = null;

    if (user.role === 'student') {
      const s = await pool.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      profile = s.rows[0];
    } else if (user.role === 'instructor') {
      const i = await pool.query('SELECT * FROM instructors WHERE user_id = $1', [user.id]);
      profile = i.rows[0];
    }

    res.json({ ...user, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router;
