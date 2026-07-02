import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/database';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json());

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // Students endpoints
  app.get('/api/students', (req, res) => {
    try {
      res.json(db.getStudents());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/students/:id', (req, res) => {
    try {
      const student = db.getStudent(req.params.id);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      res.json(student);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/students', (req, res) => {
    try {
      const { name, email, phone, dob, department, enrollmentDate, status } = req.body;
      if (!name || !email || !department) {
        return res.status(400).json({ error: 'Name, email and department are required' });
      }
      const student = db.addStudent({
        name,
        email,
        phone: phone || '',
        dob: dob || '',
        department,
        enrollmentDate: enrollmentDate || new Date().toISOString().split('T')[0],
        status: status || 'Active'
      });
      res.status(201).json(student);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/students/:id', (req, res) => {
    try {
      const student = db.updateStudent(req.params.id, req.body);
      if (!student) return res.status(404).json({ error: 'Student not found' });
      res.json(student);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/students/:id', (req, res) => {
    try {
      const deleted = db.deleteStudent(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Student not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Courses endpoints
  app.get('/api/courses', (req, res) => {
    try {
      res.json(db.getCourses());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/courses', (req, res) => {
    try {
      const { code, name, instructor, credits } = req.body;
      if (!code || !name || credits === undefined) {
        return res.status(400).json({ error: 'Code, name, and credits are required' });
      }
      const course = db.addCourse({
        code,
        name,
        instructor: instructor || 'Staff',
        credits: Number(credits)
      });
      res.status(201).json(course);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/courses/:id', (req, res) => {
    try {
      const course = db.updateCourse(req.params.id, req.body);
      if (!course) return res.status(404).json({ error: 'Course not found' });
      res.json(course);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/courses/:id', (req, res) => {
    try {
      const deleted = db.deleteCourse(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Course not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Enrollments endpoints
  app.get('/api/enrollments', (req, res) => {
    try {
      res.json(db.getEnrollments());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/enrollments', (req, res) => {
    try {
      const { studentId, courseId } = req.body;
      if (!studentId || !courseId) {
        return res.status(400).json({ error: 'Student ID and Course ID are required' });
      }
      const enrollment = db.enrollStudent(studentId, courseId);
      res.status(201).json(enrollment);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete('/api/enrollments/:id', (req, res) => {
    try {
      const unrolled = db.unenrollStudent(req.params.id);
      if (!unrolled) return res.status(404).json({ error: 'Enrollment not found' });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Grades endpoints
  app.get('/api/grades', (req, res) => {
    try {
      res.json(db.getGrades());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put('/api/grades/:id', (req, res) => {
    try {
      const { quiz, midterm, final } = req.body;
      if (quiz === undefined || midterm === undefined || final === undefined) {
        return res.status(400).json({ error: 'Quiz, Midterm, and Final grades are required' });
      }
      const grade = db.updateGrade(req.params.id, Number(quiz), Number(midterm), Number(final));
      if (!grade) return res.status(404).json({ error: 'Grade slot not found' });
      res.json(grade);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Attendance endpoints
  app.get('/api/attendance', (req, res) => {
    try {
      res.json(db.getAttendance());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/attendance', (req, res) => {
    try {
      const { records } = req.body; // Array of { studentId, courseId, date, status }
      if (!records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Records array is required' });
      }
      const updated = db.recordAttendance(records);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Stats endpoints
  app.get('/api/stats', (req, res) => {
    try {
      res.json(db.getDashboardStats());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- Serve Frontend ---

  if (process.env.NODE_ENV !== 'production') {
    // In dev, use Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built static files from 'dist'
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
