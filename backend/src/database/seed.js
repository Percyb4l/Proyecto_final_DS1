import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const hash = await bcrypt.hash('admin123', 10);

    const users = [
      { email: 'admin@danceacademy.com', role: 'admin' },
      { email: 'carlos.instructor@danceacademy.com', role: 'instructor' },
      { email: 'maria.instructor@danceacademy.com', role: 'instructor' },
      { email: 'ana.estudiante@danceacademy.com', role: 'student' },
      { email: 'juan.estudiante@danceacademy.com', role: 'student' },
      { email: 'laura.estudiante@danceacademy.com', role: 'student' },
    ];

    const userIds = {};
    for (const u of users) {
      const result = await client.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE SET password_hash = $2
         RETURNING id, email, role`,
        [u.email, hash, u.role]
      );
      userIds[u.email] = result.rows[0].id;
    }

    await client.query(
      `INSERT INTO instructors (user_id, first_name, last_name, document_id, phone, specialty, bio)
       VALUES ($1, 'Carlos', 'Mendoza', '1001234567', '3001234567', 'Salsa y Bachata', 'Instructor con 10 años de experiencia en bailes latinos')
       ON CONFLICT (document_id) DO NOTHING`,
      [userIds['carlos.instructor@danceacademy.com']]
    );
    await client.query(
      `INSERT INTO instructors (user_id, first_name, last_name, document_id, phone, specialty, bio)
       VALUES ($1, 'María', 'García', '1002345678', '3002345678', 'Hip Hop y Contemporáneo', 'Bailarina profesional y coreógrafa')
       ON CONFLICT (document_id) DO NOTHING`,
      [userIds['maria.instructor@danceacademy.com']]
    );

    const students = [
      [userIds['ana.estudiante@danceacademy.com'], 'Ana', 'Rodríguez', '1003456789', '3003456789'],
      [userIds['juan.estudiante@danceacademy.com'], 'Juan', 'Pérez', '1004567890', '3004567890'],
      [userIds['laura.estudiante@danceacademy.com'], 'Laura', 'Martínez', '1005678901', '3005678901'],
    ];
    for (const s of students) {
      await client.query(
        `INSERT INTO students (user_id, first_name, last_name, document_id, phone)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (document_id) DO NOTHING`,
        s
      );
    }

    const instructors = await client.query('SELECT id, specialty FROM instructors');
    const styles = await client.query('SELECT id, name FROM dance_styles');
    const classrooms = await client.query('SELECT id FROM classrooms LIMIT 1');

    const carlos = instructors.rows.find((i) => i.specialty?.includes('Salsa'));
    const maria = instructors.rows.find((i) => i.specialty?.includes('Hip Hop'));
    const salsa = styles.rows.find((s) => s.name === 'Salsa');
    const bachata = styles.rows.find((s) => s.name === 'Bachata');
    const hiphop = styles.rows.find((s) => s.name === 'Hip Hop');
    const classroom = classrooms.rows[0]?.id;

    if (carlos && salsa && classroom) {
      await client.query(
        `INSERT INTO classes (name, dance_style_id, instructor_id, classroom_id, day_of_week, start_time, end_time, max_students, monthly_fee, description)
         VALUES ('Salsa Principiantes', $1, $2, $3, 1, '18:00', '19:30', 25, 120000, 'Clase de salsa para principiantes')
         ON CONFLICT DO NOTHING`,
        [salsa.id, carlos.id, classroom]
      );
    }
    if (carlos && bachata && classroom) {
      await client.query(
        `INSERT INTO classes (name, dance_style_id, instructor_id, classroom_id, day_of_week, start_time, end_time, max_students, monthly_fee, description)
         VALUES ('Bachata Intermedio', $1, $2, $3, 3, '19:00', '20:30', 20, 130000, 'Perfecciona tu técnica de bachata')
         ON CONFLICT DO NOTHING`,
        [bachata.id, carlos.id, classroom]
      );
    }
    if (maria && hiphop && classroom) {
      await client.query(
        `INSERT INTO classes (name, dance_style_id, instructor_id, classroom_id, day_of_week, start_time, end_time, max_students, monthly_fee, description)
         VALUES ('Hip Hop Urbano', $1, $2, $3, 5, '17:00', '18:30', 18, 140000, 'Estilo urbano con coreografías modernas')
         ON CONFLICT DO NOTHING`,
        [hiphop.id, maria.id, classroom]
      );
    }

    const studentRows = await client.query('SELECT id FROM students LIMIT 2');
    const classRows = await client.query('SELECT id, monthly_fee FROM classes LIMIT 2');

    for (let i = 0; i < Math.min(studentRows.rows.length, classRows.rows.length); i++) {
      const enrollResult = await client.query(
        `INSERT INTO enrollments (student_id, class_id)
         VALUES ($1, $2)
         ON CONFLICT (student_id, class_id) DO NOTHING
         RETURNING id`,
        [studentRows.rows[i].id, classRows.rows[i].id]
      );
      if (enrollResult.rows[0]) {
        await client.query(
          `INSERT INTO payments (enrollment_id, amount, due_date, status, paid_date, payment_method)
           VALUES ($1, $2, CURRENT_DATE + 15, 'paid', CURRENT_DATE, 'Efectivo')
           ON CONFLICT DO NOTHING`,
          [enrollResult.rows[0].id, classRows.rows[i].monthly_fee]
        );
      }
    }

    await client.query('COMMIT');
    console.log('✅ Datos semilla insertados correctamente');
    console.log('   Usuarios de prueba (contraseña: admin123):');
    console.log('   - admin@danceacademy.com (Administrador)');
    console.log('   - carlos.instructor@danceacademy.com (Instructor)');
    console.log('   - ana.estudiante@danceacademy.com (Estudiante)');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en seed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
