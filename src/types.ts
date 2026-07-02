export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  department: string;
  enrollmentDate: string;
  status: 'Active' | 'Inactive';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
}

export interface Grade {
  id: string;
  enrollmentId: string;
  studentId: string;
  courseId: string;
  quiz: number;
  midterm: number;
  final: number;
  total: number;
  letter: 'A' | 'B' | 'C' | 'D' | 'F';
  gpa: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late';
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  averageGpa: number;
  averageAttendance: number;
  departmentDistribution: { name: string; value: number }[];
  gpaTrend: { name: string; gpa: number }[];
  attendanceRate: { date: string; rate: number }[];
}
