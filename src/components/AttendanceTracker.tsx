import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Calendar, Check, HelpCircle, Save, Search, 
  UserCheck, AlertCircle 
} from 'lucide-react';
import { Course, Student, Attendance, Enrollment } from '../types';

interface AttendanceTrackerProps {
  onRefreshStats: () => void;
  isAdmin?: boolean;
}

interface AttendanceRow {
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late';
  attendanceId: string; // empty if not created yet
}

export default function AttendanceTracker({ onRefreshStats, isAdmin = false }: AttendanceTrackerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, studentsRes, enrollmentsRes, attendanceRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/students'),
        fetch('/api/enrollments'),
        fetch('/api/attendance')
      ]);

      if (!coursesRes.ok || !studentsRes.ok || !enrollmentsRes.ok || !attendanceRes.ok) {
        throw new Error('Failed to load roster systems');
      }

      const [coursesData, studentsData, enrollmentsData, attendanceData] = await Promise.all([
        coursesRes.json(),
        studentsRes.json(),
        enrollmentsRes.json(),
        attendanceRes.json()
      ]);

      setCourses(coursesData);
      setStudents(studentsData);
      setEnrollments(enrollmentsData);
      setAttendance(attendanceData);

      if (coursesData.length > 0) {
        setSelectedCourseId(coursesData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build the student roster attendance rows when date or course selection updates
  useEffect(() => {
    if (!selectedCourseId || !selectedDate) return;

    // Get all enrollments in the selected course
    const courseEnrollments = enrollments.filter(e => e.courseId === selectedCourseId);

    // Map each enrollment to student info and find matching attendance record for the date
    const rows: AttendanceRow[] = courseEnrollments.map(enrollment => {
      const student = students.find(s => s.id === enrollment.studentId);
      
      const attRecord = attendance.find(a => 
        a.enrollmentId === enrollment.id && 
        a.date === selectedDate
      );

      return {
        studentId: enrollment.studentId,
        studentName: student?.name || 'Unknown Student',
        status: attRecord ? attRecord.status : 'Present', // default to Present if not recorded
        attendanceId: attRecord ? attRecord.id : ''
      };
    });

    setAttendanceRows(rows);
  }, [selectedCourseId, selectedDate, enrollments, students, attendance]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    if (!isAdmin) return;
    setSuccess(false);
    setAttendanceRows(prev => prev.map(row => 
      row.studentId === studentId ? { ...row, status } : row
    ));
  };

  const handleBulkMark = (status: 'Present' | 'Absent' | 'Late') => {
    if (!isAdmin) return;
    setSuccess(false);
    setAttendanceRows(prev => prev.map(row => ({ ...row, status })));
  };

  const handleSaveAttendance = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setSuccess(false);

    try {
      // Send updates for each attendance row
      const savePromises = attendanceRows.map(async (row) => {
        const enrollment = enrollments.find(e => 
          e.studentId === row.studentId && 
          e.courseId === selectedCourseId
        );

        if (!enrollment) return;

        const body = {
          enrollmentId: enrollment.id,
          date: selectedDate,
          status: row.status
        };

        if (row.attendanceId) {
          // Put existing
          const res = await fetch(`/api/attendance/${row.attendanceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          return res.json();
        } else {
          // Post new
          const res = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          return res.json();
        }
      });

      const results = await Promise.all(savePromises);
      
      // Re-fetch attendance database state to ensure correct IDs mapping
      const res = await fetch('/api/attendance');
      if (res.ok) {
        const attendanceData = await res.json();
        setAttendance(attendanceData);
      }

      setSuccess(true);
      onRefreshStats();
    } catch (err) {
      console.error(err);
      alert('Error saving campus attendance records.');
    } finally {
      setSaving(false);
    }
  };

  const filteredRows = attendanceRows.filter(row => 
    row.studentName.toLowerCase().includes(search.toLowerCase()) ||
    row.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select courses and pick calendar dates to take digital daily roster checks with bulk fast marking shortcuts.
        </p>
      </div>

      {/* Selectors card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          {/* Course select */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <BookOpen className="h-5 w-5 text-gray-400 shrink-0" />
            <select
              value={selectedCourseId}
              onChange={(e) => { setSelectedCourseId(e.target.value); setSuccess(false); }}
              className="block w-full sm:w-72 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden cursor-pointer"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Calendar className="h-5 w-5 text-gray-400 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSuccess(false); }}
              className="block w-full sm:w-44 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden cursor-pointer"
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4.5 w-4.5 text-gray-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 text-xs text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden placeholder-gray-400"
            placeholder="Search roster..."
          />
        </div>
      </div>

      {/* Main Checklist Container */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : selectedCourseId && filteredRows.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          {/* Quick Shortcuts bar */}
          {isAdmin && (
            <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-gray-100/50 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <UserCheck className="h-4 w-4 text-indigo-500" />
                Roster shortcuts:
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleBulkMark('Present')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  All Present
                </button>
                <button
                  onClick={() => handleBulkMark('Absent')}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  All Absent
                </button>
                <button
                  onClick={() => handleBulkMark('Late')}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  All Late
                </button>
              </div>
            </div>
          )}

          {/* Table List of Roster Checklist */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredRows.map((row) => (
                <div key={row.studentId} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4.5 gap-4 hover:bg-gray-50/20 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-gray-400 block tracking-wider uppercase">{row.studentId}</span>
                    <h4 className="text-base font-bold text-gray-800 mt-1">{row.studentName}</h4>
                  </div>

                  {/* Toggle controls */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={!isAdmin}
                      onClick={() => handleStatusChange(row.studentId, 'Present')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        row.status === 'Present'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100/80'
                      } ${!isAdmin ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                    >
                      Present
                    </button>
                    <button
                      disabled={!isAdmin}
                      onClick={() => handleStatusChange(row.studentId, 'Late')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        row.status === 'Late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100/80'
                      } ${!isAdmin ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                    >
                      Late
                    </button>
                    <button
                      disabled={!isAdmin}
                      onClick={() => handleStatusChange(row.studentId, 'Absent')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        row.status === 'Absent'
                          ? 'bg-red-500 text-white shadow-xs'
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100/80'
                      } ${!isAdmin ? 'cursor-default opacity-85' : 'cursor-pointer'}`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions banner */}
            <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {success ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 animate-fade-in">
                    <Check className="h-4 w-4" />
                    Roster checks saved successfully!
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    {isAdmin ? 'Please review checks before saving.' : '⚠️ Read-only mode: login to Admin to modify attendance rosters.'}
                  </span>
                )}
              </div>

              {isAdmin && (
                <button
                  onClick={handleSaveAttendance}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer hover:shadow-lg hover:shadow-indigo-600/20 active:scale-98"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white text-center py-16 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center p-6">
          <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No students enrolled</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            To register attendance checks, enroll students in this course from the <strong>Students</strong> directory tab first.
          </p>
        </div>
      )}
    </div>
  );
}
