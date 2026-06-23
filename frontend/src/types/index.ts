export interface User {
  id: number;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  profile?: Student | Instructor;
}

export interface Student {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  document_id: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  emergency_contact?: string;
  email?: string;
}

export interface Instructor {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  document_id: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  email?: string;
}

export interface DanceClass {
  id: number;
  name: string;
  dance_style: string;
  difficulty_level?: string;
  instructor_name: string;
  classroom_name?: string;
  day_of_week: number;
  day_name?: string;
  start_time: string;
  end_time: string;
  max_students: number;
  enrolled_count?: number;
  monthly_fee: number;
  description?: string;
  is_active?: boolean;
  dance_style_id?: number;
  instructor_id?: number;
  classroom_id?: number;
}

export interface Enrollment {
  id: number;
  student_id: number;
  class_id: number;
  student_name: string;
  class_name: string;
  dance_style: string;
  monthly_fee: number;
  enrollment_date: string;
  status: 'active' | 'cancelled' | 'completed';
  document_id?: string;
}

export interface Payment {
  id: number;
  enrollment_id: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue';
  payment_method?: string;
  student_name?: string;
  class_name?: string;
  notes?: string;
}

export interface DanceStyle {
  id: number;
  name: string;
  description?: string;
  difficulty_level: string;
}

export interface Classroom {
  id: number;
  name: string;
  capacity: number;
  location?: string;
}

export interface DashboardStats {
  students: number;
  instructors: number;
  classes: number;
  activeEnrollments: number;
  totalRevenue: number;
  pendingPayments: number;
}

export interface AttendanceRecord {
  enrollment_id: number;
  student_name: string;
  attendance_id?: number;
  status?: string;
  class_date?: string;
}
