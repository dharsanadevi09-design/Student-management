import fs from 'fs';
import path from 'path';
import { Student, Course, Enrollment, Grade, Attendance, DashboardStats } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  grades: Grade[];
  attendance: Attendance[];
}

const INITIAL_DATA: DatabaseSchema = {
  students: [
    {
      id: 'STU001',
      name: 'John Doe',
      email: 'john.doe@university.edu',
      phone: '+1 (555) 019-2834',
      dob: '2004-05-15',
      department: 'Computer Science',
      enrollmentDate: '2023-09-01',
      status: 'Active'
    },
    {
      id: 'STU002',
      name: 'Jane Smith',
      email: 'jane.smith@university.edu',
      phone: '+1 (555) 024-5678',
      dob: '2003-11-22',
      department: 'Mathematics',
      enrollmentDate: '2023-09-01',
      status: 'Active'
    },
    {
      id: 'STU003',
      name: 'Alex Johnson',
      email: 'alex.j@university.edu',
      phone: '+1 (555) 038-9102',
      dob: '2005-02-10',
      department: 'Computer Science',
      enrollmentDate: '2024-01-15',
      status: 'Active'
    },
    {
      id: 'STU004',
      name: 'Emily Brown',
      email: 'emily.b@university.edu',
      phone: '+1 (555) 042-4421',
      dob: '2004-08-30',
      department: 'Physics',
      enrollmentDate: '2023-09-01',
      status: 'Active'
    },
    {
      id: 'STU005',
      name: 'Michael Lee',
      email: 'm.lee@university.edu',
      phone: '+1 (555) 056-7788',
      dob: '2004-12-05',
      department: 'Engineering',
      enrollmentDate: '2023-09-01',
      status: 'Inactive'
    }
  ],
  courses: [
    {
      id: 'CRS101',
      code: 'CS101',
      name: 'Introduction to Computer Science',
      instructor: 'Dr. Alan Turing',
      credits: 4
    },
    {
      id: 'CRS102',
      code: 'MATH101',
      name: 'Calculus I',
      instructor: 'Dr. Ada Lovelace',
      credits: 4
    },
    {
      id: 'CRS103',
      code: 'PHYS101',
      name: 'College Physics',
      instructor: 'Dr. Albert Einstein',
      credits: 3
    },
    {
      id: 'CRS104',
      code: 'CS102',
      name: 'Web Development',
      instructor: 'Prof. Tim Berners-Lee',
      credits: 3
    }
  ],
  enrollments: [
    { id: 'ENR001', studentId: 'STU001', courseId: 'CRS101', enrollmentDate: '2023-09-05' },
    { id: 'ENR002', studentId: 'STU001', courseId: 'CRS104', enrollmentDate: '2023-09-05' },
    { id: 'ENR003', studentId: 'STU002', courseId: 'CRS102', enrollmentDate: '2023-09-06' },
    { id: 'ENR004', studentId: 'STU003', courseId: 'CRS101', enrollmentDate: '2024-01-20' },
    { id: 'ENR005', studentId: 'STU004', courseId: 'CRS103', enrollmentDate: '2023-09-05' },
    { id: 'ENR006', studentId: 'STU004', courseId: 'CRS102', enrollmentDate: '2023-09-05' }
  ],
  grades: [
    { id: 'GRD001', enrollmentId: 'ENR001', studentId: 'STU001', courseId: 'CRS101', quiz: 90, midterm: 85, final: 88, total: 87.5, letter: 'A', gpa: 4.0 },
    { id: 'GRD002', enrollmentId: 'ENR002', studentId: 'STU001', courseId: 'CRS104', quiz: 95, midterm: 92, final: 94, total: 93.5, letter: 'A', gpa: 4.0 },
    { id: 'GRD003', enrollmentId: 'ENR003', studentId: 'STU002', courseId: 'CRS102', quiz: 82, midterm: 78, final: 85, total: 82.3, letter: 'B', gpa: 3.0 },
    { id: 'GRD004', enrollmentId: 'ENR004', studentId: 'STU003', courseId: 'CRS101', quiz: 75, midterm: 80, final: 78, total: 77.9, letter: 'C', gpa: 2.0 },
    { id: 'GRD005', enrollmentId: 'ENR005', studentId: 'STU004', courseId: 'CRS103', quiz: 88, midterm: 90, final: 89, total: 89.1, letter: 'B', gpa: 3.0 },
    { id: 'GRD006', enrollmentId: 'ENR006', studentId: 'STU004', courseId: 'CRS102', quiz: 92, midterm: 88, final: 91, total: 90.5, letter: 'A', gpa: 4.0 }
  ],
  attendance: [
    { id: 'ATT001', studentId: 'STU001', courseId: 'CRS101', date: '2026-06-28', status: 'Present' },
    { id: 'ATT002', studentId: 'STU001', courseId: 'CRS104', date: '2026-06-28', status: 'Present' },
    { id: 'ATT003', studentId: 'STU002', courseId: 'CRS102', date: '2026-06-28', status: 'Present' },
    { id: 'ATT004', studentId: 'STU003', courseId: 'CRS101', date: '2026-06-28', status: 'Absent' },
    { id: 'ATT005', studentId: 'STU004', courseId: 'CRS103', date: '2026-06-28', status: 'Present' },
    { id: 'ATT006', studentId: 'STU001', courseId: 'CRS101', date: '2026-06-29', status: 'Present' },
    { id: 'ATT007', studentId: 'STU001', courseId: 'CRS104', date: '2026-06-29', status: 'Present' },
    { id: 'ATT008', studentId: 'STU002', courseId: 'CRS102', date: '2026-06-29', status: 'Late' },
    { id: 'ATT009', studentId: 'STU003', courseId: 'CRS101', date: '2026-06-29', status: 'Present' },
    { id: 'ATT010', studentId: 'STU004', courseId: 'CRS103', date: '2026-06-29', status: 'Present' },
    { id: 'ATT011', studentId: 'STU001', courseId: 'CRS101', date: '2026-06-30', status: 'Present' },
    { id: 'ATT012', studentId: 'STU001', courseId: 'CRS104', date: '2026-06-30', status: 'Absent' },
    { id: 'ATT013', studentId: 'STU002', courseId: 'CRS102', date: '2026-06-30', status: 'Present' },
    { id: 'ATT014', studentId: 'STU003', courseId: 'CRS101', date: '2026-06-30', status: 'Present' },
    { id: 'ATT015', studentId: 'STU004', courseId: 'CRS103', date: '2026-06-30', status: 'Present' }
  ]
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Error loading database, resetting to defaults:', e);
    }
    this.save(INITIAL_DATA);
    return INITIAL_DATA;
  }

  private save(data: DatabaseSchema): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  // --- Students API ---
  getStudents(): Student[] {
    return this.data.students;
  }

  getStudent(id: string): Student | undefined {
    return this.data.students.find(s => s.id === id);
  }

  addStudent(student: Omit<Student, 'id'>): Student {
    const nextId = 'STU' + String(this.data.students.length + 1).padStart(3, '0');
    const newStudent: Student = { ...student, id: nextId };
    this.data.students.push(newStudent);
    this.save(this.data);
    return newStudent;
  }

  updateStudent(id: string, updated: Partial<Student>): Student | undefined {
    const index = this.data.students.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.data.students[index] = { ...this.data.students[index], ...updated } as Student;
    this.save(this.data);
    return this.data.students[index];
  }

  deleteStudent(id: string): boolean {
    const initialLen = this.data.students.length;
    this.data.students = this.data.students.filter(s => s.id !== id);
    // Cascade delete enrollments, grades, and attendance
    this.data.enrollments = this.data.enrollments.filter(e => e.studentId !== id);
    this.data.grades = this.data.grades.filter(g => g.studentId !== id);
    this.data.attendance = this.data.attendance.filter(a => a.studentId !== id);
    this.save(this.data);
    return this.data.students.length < initialLen;
  }

  // --- Courses API ---
  getCourses(): Course[] {
    return this.data.courses;
  }

  getCourse(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id);
  }

  addCourse(course: Omit<Course, 'id'>): Course {
    const nextId = 'CRS' + String(this.data.courses.length + 101).padStart(3, '0');
    const newCourse: Course = { ...course, id: nextId };
    this.data.courses.push(newCourse);
    this.save(this.data);
    return newCourse;
  }

  updateCourse(id: string, updated: Partial<Course>): Course | undefined {
    const index = this.data.courses.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.data.courses[index] = { ...this.data.courses[index], ...updated } as Course;
    this.save(this.data);
    return this.data.courses[index];
  }

  deleteCourse(id: string): boolean {
    const initialLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    // Cascade delete enrollments, grades, and attendance
    this.data.enrollments = this.data.enrollments.filter(e => e.courseId !== id);
    this.data.grades = this.data.grades.filter(g => g.courseId !== id);
    this.data.attendance = this.data.attendance.filter(a => a.courseId !== id);
    this.save(this.data);
    return this.data.courses.length < initialLen;
  }

  // --- Enrollments API ---
  getEnrollments(): Enrollment[] {
    return this.data.enrollments;
  }

  enrollStudent(studentId: string, courseId: string): Enrollment {
    // Check if already enrolled
    const existing = this.data.enrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (existing) return existing;

    const nextId = 'ENR' + String(this.data.enrollments.length + 1).padStart(3, '0');
    const newEnrollment: Enrollment = {
      id: nextId,
      studentId,
      courseId,
      enrollmentDate: new Date().toISOString().split('T')[0]
    };
    this.data.enrollments.push(newEnrollment);

    // Auto-create a grade slot for the student in this course
    const gradeId = 'GRD' + String(this.data.grades.length + 1).padStart(3, '0');
    const newGrade: Grade = {
      id: gradeId,
      enrollmentId: nextId,
      studentId,
      courseId,
      quiz: 0,
      midterm: 0,
      final: 0,
      total: 0,
      letter: 'F',
      gpa: 0
    };
    this.data.grades.push(newGrade);

    this.save(this.data);
    return newEnrollment;
  }

  unenrollStudent(enrollmentId: string): boolean {
    const enrollment = this.data.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    this.data.enrollments = this.data.enrollments.filter(e => e.id !== enrollmentId);
    // Also delete grade of that enrollment
    this.data.grades = this.data.grades.filter(g => g.enrollmentId !== enrollmentId);
    this.save(this.data);
    return true;
  }

  // --- Grades API ---
  getGrades(): Grade[] {
    return this.data.grades;
  }

  updateGrade(id: string, quiz: number, midterm: number, final: number): Grade | undefined {
    const index = this.data.grades.findIndex(g => g.id === id);
    if (index === -1) return undefined;

    // Total total score = 20% quiz, 30% midterm, 50% final
    const total = Number((quiz * 0.2 + midterm * 0.3 + final * 0.5).toFixed(1));

    let letter: Grade['letter'] = 'F';
    let gpa = 0.0;

    if (total >= 90) { letter = 'A'; gpa = 4.0; }
    else if (total >= 80) { letter = 'B'; gpa = 3.0; }
    else if (total >= 70) { letter = 'C'; gpa = 2.0; }
    else if (total >= 60) { letter = 'D'; gpa = 1.0; }
    else { letter = 'F'; gpa = 0.0; }

    const updatedGrade: Grade = {
      ...this.data.grades[index],
      quiz,
      midterm,
      final,
      total,
      letter,
      gpa
    };

    this.data.grades[index] = updatedGrade;
    this.save(this.data);
    return updatedGrade;
  }

  // --- Attendance API ---
  getAttendance(): Attendance[] {
    return this.data.attendance;
  }

  recordAttendance(records: Omit<Attendance, 'id'>[]): Attendance[] {
    const results: Attendance[] = [];
    for (const record of records) {
      // If student already has attendance on this date for this course, update it
      const existingIndex = this.data.attendance.findIndex(
        a => a.studentId === record.studentId &&
             a.courseId === record.courseId &&
             a.date === record.date
      );

      if (existingIndex !== -1) {
        this.data.attendance[existingIndex].status = record.status;
        results.push(this.data.attendance[existingIndex]);
      } else {
        const nextId = 'ATT' + String(this.data.attendance.length + 1).padStart(3, '0');
        const newRecord: Attendance = {
          ...record,
          id: nextId
        };
        this.data.attendance.push(newRecord);
        results.push(newRecord);
      }
    }
    this.save(this.data);
    return results;
  }

  // --- Statistics ---
  getDashboardStats(): DashboardStats {
    const students = this.data.students;
    const courses = this.data.courses;
    const grades = this.data.grades;
    const attendance = this.data.attendance;

    // Average GPA (exclude F or count all GPAs)
    const validGrades = grades.filter(g => g.total > 0);
    const averageGpa = validGrades.length > 0 
      ? Number((validGrades.reduce((sum, g) => sum + g.gpa, 0) / validGrades.length).toFixed(2))
      : 0.0;

    // Average Attendance Rate
    const totalAttendance = attendance.length;
    const presentAttendance = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
    const averageAttendance = totalAttendance > 0
      ? Math.round((presentAttendance / totalAttendance) * 100)
      : 100;

    // Department Distribution
    const deptMap: { [key: string]: number } = {};
    students.forEach(s => {
      deptMap[s.department] = (deptMap[s.department] || 0) + 1;
    });
    const departmentDistribution = Object.keys(deptMap).map(key => ({
      name: key,
      value: deptMap[key]
    }));

    // GPA Trend (grouped by department or course as trend)
    const courseGpaMap: { [key: string]: { sum: number, count: number } } = {};
    grades.forEach(g => {
      const course = courses.find(c => c.id === g.courseId);
      if (course) {
        if (!courseGpaMap[course.code]) {
          courseGpaMap[course.code] = { sum: 0, count: 0 };
        }
        courseGpaMap[course.code].sum += g.gpa;
        courseGpaMap[course.code].count += 1;
      }
    });
    const gpaTrend = Object.keys(courseGpaMap).map(code => ({
      name: code,
      gpa: Number((courseGpaMap[code].sum / courseGpaMap[code].count).toFixed(2))
    }));

    // Daily attendance rate over last few days
    const dateMap: { [key: string]: { present: number, total: number } } = {};
    attendance.forEach(a => {
      if (!dateMap[a.date]) {
        dateMap[a.date] = { present: 0, total: 0 };
      }
      dateMap[a.date].total += 1;
      if (a.status === 'Present' || a.status === 'Late') {
        dateMap[a.date].present += 1;
      }
    });

    // Sort dates ascending
    const sortedDates = Object.keys(dateMap).sort();
    const attendanceRate = sortedDates.map(date => ({
      date: date.substring(5), // Just MM-DD for chart
      rate: Math.round((dateMap[date].present / dateMap[date].total) * 100)
    }));

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      averageGpa,
      averageAttendance,
      departmentDistribution,
      gpaTrend,
      attendanceRate
    };
  }
}

export const db = new Database();
