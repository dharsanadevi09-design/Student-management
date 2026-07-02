import React, { useEffect, useState, FormEvent } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Mail, Phone, Calendar, BookOpen, 
  X, AlertCircle, Filter, ShieldCheck, ShieldAlert 
} from 'lucide-react';
import { Student, Course, Enrollment } from '../types';

interface StudentsListProps {
  onRefreshStats: () => void;
  isAdmin?: boolean;
}

export default function StudentsList({ onRefreshStats, isAdmin = false }: StudentsListProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Custom Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    studentId?: string;
    enrollmentId?: string;
    name?: string;
    type: 'student' | 'unenroll';
  }>({ isOpen: false, type: 'student' });

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    department: 'Computer Science',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedEnrollStudent, setSelectedEnrollStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/courses'),
        fetch('/api/enrollments')
      ]);

      if (!studentsRes.ok || !coursesRes.ok || !enrollmentsRes.ok) {
        throw new Error('Failed to load some resources');
      }

      const [studentsData, coursesData, enrollmentsData] = await Promise.all([
        studentsRes.json(),
        coursesRes.json(),
        enrollmentsRes.json()
      ]);

      setStudents(studentsData);
      setCourses(coursesData);
      setEnrollments(enrollmentsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    if (!isAdmin) return;
    setFormMode('add');
    setSelectedStudentId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      dob: '',
      department: 'Computer Science',
      status: 'Active'
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (student: Student) => {
    if (!isAdmin) return;
    setFormMode('edit');
    setSelectedStudentId(student.id);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob,
      department: student.department,
      status: student.status
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const url = formMode === 'add' ? '/api/students' : `/api/students/${selectedStudentId}`;
    const method = formMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save student record');

      await fetchData();
      onRefreshStats();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('Error saving student. Please check input formats.');
    }
  };

  const handleDeleteStudent = (id: string) => {
    if (!isAdmin) return;
    const student = students.find(s => s.id === id);
    if (!student) return;
    setDeleteConfirm({
      isOpen: true,
      studentId: id,
      name: student.name,
      type: 'student'
    });
  };

  const confirmDeleteStudent = async () => {
    const id = deleteConfirm.studentId;
    if (!id) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');

      await fetchData();
      onRefreshStats();
      setDeleteConfirm({ isOpen: false, type: 'student' });
    } catch (err) {
      console.error(err);
      alert('Could not delete student record.');
    }
  };

  const handleOpenEnrollModal = (student: Student) => {
    setSelectedEnrollStudent(student);
    setShowEnrollModal(true);
  };

  const handleEnrollInCourse = async (courseId: string) => {
    if (!selectedEnrollStudent || !isAdmin) return;
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedEnrollStudent.id,
          courseId
        })
      });
      if (!res.ok) throw new Error('Failed to enroll student');
      await fetchData();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnenrollFromCourse = (enrollmentId: string) => {
    if (!isAdmin) return;
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return;
    const studentName = selectedEnrollStudent?.name || '';
    const course = courses.find(c => c.id === enrollment.courseId);
    const courseName = course ? course.name : 'this course';
    
    setDeleteConfirm({
      isOpen: true,
      enrollmentId,
      name: `Unenroll ${studentName} from ${courseName}`,
      type: 'unenroll'
    });
  };

  const confirmUnenroll = async () => {
    const id = deleteConfirm.enrollmentId;
    if (!id) return;
    try {
      const res = await fetch(`/api/enrollments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to unenroll student');
      await fetchData();
      onRefreshStats();
      setDeleteConfirm({ isOpen: false, type: 'student' });
    } catch (err) {
      console.error(err);
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.email.toLowerCase().includes(search.toLowerCase()) ||
                          student.id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || student.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Unique departments for filter dropdown
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Business'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Maintain and manage student accounts, registration, courses, and state details.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer w-full md:w-auto self-start md:self-center"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Student
          </button>
        )}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-gray-400"
            placeholder="Search by ID, name, or email..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Department Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
            <ShieldCheck className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Students Directory Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const studentEnrollments = enrollments.filter(e => e.studentId === student.id);
            return (
              <div 
                key={student.id} 
                className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Visual Accent Header based on Status */}
                <div className={`h-2.5 w-full ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                        {student.id}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-2 hover:text-indigo-600 transition-colors duration-200">
                        {student.name}
                      </h3>
                      <p className="text-xs font-semibold text-gray-400 uppercase mt-0.5">{student.department}</p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      student.status === 'Active' 
                        ? 'bg-emerald-55 text-emerald-700 bg-emerald-50' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {student.status === 'Active' ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="h-3.5 w-3.5 text-gray-500" />
                      )}
                      {student.status}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3.5 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                    {student.dob && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                        <span>DOB: {student.dob}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 border-t border-gray-50 pt-4 mt-4">
                      <BookOpen className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                      <span className="font-semibold text-gray-700">
                        {studentEnrollments.length} Course{studentEnrollments.length !== 1 && 's'} Enrolled
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex items-center justify-between gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEnrollModal(student)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    {isAdmin ? 'Manage Courses' : 'View Courses'}
                  </button>

                  {isAdmin && (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <button
                        onClick={() => handleOpenEditForm(student)}
                        className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-55 rounded-lg transition-all cursor-pointer"
                        title="Edit Student Info"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-55 rounded-lg transition-all cursor-pointer"
                        title="Delete Student Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white text-center py-16 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No students found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            Try adjusting your search filters or unlock Admin panel to add a student directory.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAddForm}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-xs cursor-pointer hover:bg-indigo-700"
            >
              Add New Student
            </button>
          )}
        </div>
      )}

      {/* Slide-over Form Sidebar Panel */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex justify-end">
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in">
            {/* Form Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {formMode === 'add' ? 'Add Student Record' : 'Edit Student Record'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Provide comprehensive details below</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Student Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">University Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                  placeholder="e.g. name@university.edu"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                    placeholder="e.g. +1 (555) 019-2834"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 cursor-pointer"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData({ ...formData, status: 'Active' })}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                    <input
                      type="radio"
                      checked={formData.status === 'Inactive'}
                      onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    Inactive
                  </label>
                </div>
              </div>
            </form>

            {/* Form Footer Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleFormSubmit}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs cursor-pointer"
              >
                {formMode === 'add' ? 'Register Student' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Enrollments Management Modal */}
      {showEnrollModal && selectedEnrollStudent && (
        <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Course Registration</h3>
                <p className="text-xs text-gray-500 mt-1">Manage enrollments for <span className="font-bold text-indigo-600">{selectedEnrollStudent.name}</span></p>
              </div>
              <button 
                onClick={() => { setShowEnrollModal(false); setSelectedEnrollStudent(null); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Enrolled Courses */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Enrolled Courses</h4>
                {enrollments.filter(e => e.studentId === selectedEnrollStudent.id).length > 0 ? (
                  <div className="space-y-2.5">
                    {enrollments
                      .filter(e => e.studentId === selectedEnrollStudent.id)
                      .map((enrollment) => {
                        const course = courses.find(c => c.id === enrollment.courseId);
                        if (!course) return null;
                        return (
                          <div key={enrollment.id} className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100/30 rounded-xl">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm">{course.code}</span>
                                <p className="text-sm font-bold text-gray-800">{course.name}</p>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">{course.credits} Credits • {course.instructor}</p>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={() => handleUnenrollFromCourse(enrollment.id)}
                                className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-55 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                Drop Course
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">This student is not enrolled in any courses.</p>
                )}
              </div>

              {/* Available Courses to Enroll (Only show if Admin, otherwise keep view simple) */}
              {isAdmin ? (
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Available Departments Offerings</h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 animate-fade-in">
                    {courses
                      .filter(c => !enrollments.some(e => e.studentId === selectedEnrollStudent.id && e.courseId === c.id))
                      .map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-gray-50/20 transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm">{course.code}</span>
                              <p className="text-sm font-bold text-gray-800">{course.name}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{course.credits} Credits • {course.instructor}</p>
                          </div>
                          <button
                            onClick={() => handleEnrollInCourse(course.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Enroll
                          </button>
                        </div>
                      ))}
                    {courses.filter(c => !enrollments.some(e => e.studentId === selectedEnrollStudent.id && e.courseId === c.id)).length === 0 && (
                      <p className="text-sm text-gray-400 italic">This student has already registered for all available campus courses.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                  ⚠️ Additional course registrations require Administrative privileges. Toggle Admin mode to enroll this student in courses.
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end shrink-0">
              <button
                onClick={() => { setShowEnrollModal(false); setSelectedEnrollStudent(null); }}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold text-sm rounded-xl cursor-pointer"
              >
                Close Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Sleek In-App Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full p-6 shadow-2xl relative animate-scale-up">
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 rounded-t-2xl"></div>
            
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to proceed with: <span className="font-bold text-gray-900">"{deleteConfirm.name}"</span>? 
              {deleteConfirm.type === 'student' 
                ? ' This action will permanently delete this student record and cascade delete all their registered courses, midterm/final grades, and daily attendance histories.' 
                : ' This will unenroll the student and permanently discard their grades and performance history in this course.'}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, type: 'student' })}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteConfirm.type === 'student' ? confirmDeleteStudent : confirmUnenroll}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/10 transition-all cursor-pointer"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
