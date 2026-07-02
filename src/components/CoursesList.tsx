import React, { useEffect, useState, FormEvent } from 'react';
import { 
  BookOpen, Plus, Edit2, Trash2, User, Award, Layers, 
  X, AlertCircle, Search 
} from 'lucide-react';
import { Course, Enrollment } from '../types';

interface CoursesListProps {
  onRefreshStats: () => void;
  isAdmin?: boolean;
}

export default function CoursesList({ onRefreshStats, isAdmin = false }: CoursesListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Custom Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    courseId?: string;
    code?: string;
    name?: string;
  }>({ isOpen: false });

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    instructor: '',
    credits: 3
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/enrollments')
      ]);

      if (!coursesRes.ok || !enrollmentsRes.ok) throw new Error('Failed to load courses data');

      const [coursesData, enrollmentsData] = await Promise.all([
        coursesRes.json(),
        enrollmentsRes.json()
      ]);

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
    setSelectedCourseId(null);
    setFormData({
      code: '',
      name: '',
      instructor: '',
      credits: 3
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (course: Course) => {
    if (!isAdmin) return;
    setFormMode('edit');
    setSelectedCourseId(course.id);
    setFormData({
      code: course.code,
      name: course.name,
      instructor: course.instructor,
      credits: course.credits
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const url = formMode === 'add' ? '/api/courses' : `/api/courses/${selectedCourseId}`;
    const method = formMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save course');

      await fetchData();
      onRefreshStats();
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert('Error saving course info. Make sure Credits is a positive number.');
    }
  };

  const handleDeleteCourse = (course: Course) => {
    if (!isAdmin) return;
    setDeleteConfirm({
      isOpen: true,
      courseId: course.id,
      code: course.code,
      name: course.name
    });
  };

  const confirmDeleteCourse = async () => {
    const id = deleteConfirm.courseId;
    if (!id) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');

      await fetchData();
      onRefreshStats();
      setDeleteConfirm({ isOpen: false });
    } catch (err) {
      console.error(err);
      alert('Could not delete course.');
    }
  };

  const filteredCourses = courses.filter(course => {
    return course.name.toLowerCase().includes(search.toLowerCase()) || 
           course.code.toLowerCase().includes(search.toLowerCase()) ||
           course.instructor.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure courses catalogs, assign professors, set learning credits, and track active catalogs.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer w-full md:w-auto self-start md:self-center"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Course
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-gray-400"
            placeholder="Search by code, title or instructor..."
          />
        </div>
      </div>

      {/* Grid of Courses */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const enrolledCount = enrollments.filter(e => e.courseId === course.id).length;
            return (
              <div 
                key={course.id} 
                className="bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-md transition-shadow duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Accent line */}
                <div className="h-1.5 w-full bg-indigo-600/85 shrink-0" />

                <div className="p-6 flex-1">
                  {/* Badge & Credits */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                      {course.code}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Award className="h-4 w-4 text-amber-500" />
                      {course.credits} Credits
                    </span>
                  </div>

                  {/* Title & Instructor */}
                  <h3 className="text-lg font-bold text-gray-900 mt-4 leading-snug">{course.name}</h3>
                  
                  <div className="mt-6 space-y-3.5 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 text-gray-400 rounded-lg shrink-0">
                        <User className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase">Instructor</p>
                        <p className="font-medium text-gray-800">{course.instructor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50/50 text-indigo-500 rounded-lg shrink-0">
                        <Layers className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase">Enrolled Capacity</p>
                        <p className="font-bold text-gray-800">{enrolledCount} active student{enrolledCount !== 1 && 's'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                {isAdmin && (
                  <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl shrink-0 animate-fade-in">
                    <button
                      onClick={() => handleOpenEditForm(course)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-55 rounded-lg transition-all cursor-pointer"
                      title="Edit Course Info"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-55 rounded-lg transition-all cursor-pointer"
                      title="Delete Course Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white text-center py-16 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            Try adjusting your search filters or unlock Admin panel to create courses.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAddForm}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-xl shadow-xs cursor-pointer hover:bg-indigo-700"
            >
              Add Course
            </button>
          )}
        </div>
      )}

      {/* Slideover Form Modal */}
      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-in">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {formMode === 'add' ? 'Create New Course' : 'Edit Course Details'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Configure university course offerings details</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS101"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Introduction to Programming"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lead Instructor / Professor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ada Lovelace"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Credits Value *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="10"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })}
                  className="block w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50"
                />
              </div>
            </form>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
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
                {formMode === 'add' ? 'Create Offering' : 'Save Offerings'}
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
              Are you sure you want to permanently delete course <span className="font-bold text-gray-900">{deleteConfirm.code} - "{deleteConfirm.name}"</span>? 
              <br /><br />
              This will cascade delete all student course registrations, gradebook entries, and past attendance logs for this course. This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false })}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCourse}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/10 transition-all cursor-pointer"
              >
                Yes, Delete Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
