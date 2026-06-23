import express from 'express';
import pool from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, ds.name as dance_style, ds.difficulty_level,
              i.first_name || ' ' || i.last_name as instructor_name,
              cr.name as classroom_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id AND e.status = 'active') as enrolled_count
       FROM classes c
       JOIN dance_styles ds ON c.dance_style_id = ds.id
       JOIN instructors i ON c.instructor_id = i.id
       JOIN classrooms cr ON c.classroom_id = cr.id
       WHERE c.is_active = true
       ORDER BY c.day_of_week, c.start_time`
    );
    res.json(result.rows.map((c) => ({ ...c, day_name: DAYS[c.day_of_week] })));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clases' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.description, c.day_of_week, c.start_time, c.end_time,
              c.max_students, c.monthly_fee, ds.name as dance_style, ds.difficulty_level,
              i.first_name || ' ' || i.last_name as instructor_name,
              (SELECT COUNT(*) FROM enrollments e WHERE e.class_id = c.id AND e.status = 'active') as enrolled_count
       FROM classes c
       JOIN dance_styles ds ON c.dance_style_id = ds.id
       JOIN instructors i ON c.instructor_id = i.id
       WHERE c.is_active = true
       ORDER BY c.day_of_week, c.start_time`
    );
    res.json(result.rows.map((c) => ({ ...c, day_name: DAYS[c.day_of_week] })));
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clases' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, ds.name as dance_style, i.first_name || ' ' || i.last_name as instructor_name, cr.name as classroom_name
       FROM classes c
       JOIN dance_styles ds ON c.dance_style_id = ds.id
       JOIN instructors i ON c.instructor_id = i.id
       JOIN classrooms cr ON c.classroom_id = cr.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json({ ...result.rows[0], day_name: DAYS[result.rows[0].day_of_week] });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.post('/', authenticate, authorize('admin'), async (req, res) => {
  const { name, danceStyleId, instructorId, classroomId, dayOfWeek, startTime, endTime, maxStudents, monthlyFee, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO classes (name, dance_style_id, instructor_id, classroom_id, day_of_week, start_time, end_time, max_students, monthly_fee, description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, danceStyleId, instructorId, classroomId, dayOfWeek, startTime, endTime, maxStudents || 20, monthlyFee, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear clase' });
  }
});

router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  const { name, danceStyleId, instructorId, classroomId, dayOfWeek, startTime, endTime, maxStudents, monthlyFee, description, isActive } = req.body;
  try {
    const result = await pool.query(
      `UPDATE classes SET name=$1, dance_style_id=$2, instructor_id=$3, classroom_id=$4,
       day_of_week=$5, start_time=$6, end_time=$7, max_students=$8, monthly_fee=$9, description=$10, is_active=$11
       WHERE id=$12 RETURNING *`,
      [name, danceStyleId, instructorId, classroomId, dayOfWeek, startTime, endTime, maxStudents, monthlyFee, description, isActive ?? true, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Clase no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('UPDATE classes SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Clase desactivada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

export default router;
