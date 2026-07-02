import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Check, HelpCircle, Save, Search, TableProperties } from 'lucide-react';
import { Course, Student, Grade, Enrollment } from '../types';

interface GradesManagerProps {
  onRefreshStats: () => void;
  isAdmin?: boolean;
}

interface GradeRow {
  gradeId: string;
  studentId: string;
  studentName: string;
  quiz: number;
  midterm: number;
  final: number;
  total: number;
  letter: string;
  gpa: number;
  isSaving?: boolean;
  hasChanged?: boolean;
}

export default function GradesManager({ onRefreshStats, isAdmin = false }: GradesManagerProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, studentsRes, enrollmentsRes, gradesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/students'),
        fetch('/api/enrollments'),
        fetch('/api/grades')
      ]);

      if (!coursesRes.ok || !studentsRes.ok || !enrollmentsRes.ok || !gradesRes.ok) {
        throw new Error('Failed to load gradebook systems');
      }

      const [coursesData, studentsData, enrollmentsData, gradesData] = await Promise.all([
        coursesRes.json(),
        studentsRes.json(),
        enrollmentsRes.json(),
        gradesRes.json()
      ]);

      setCourses(coursesData);
      setStudents(studentsData);
      setEnrollments(enrollmentsData);
      setGrades(gradesData);

      if (coursesData.length > 0) {
        setSelectedCourseId(coursesData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Build grid rows when selected course or search parameters change
  useEffect(() => {
    if (!selectedCourseId) return;

    // 1. Get enrollments in this course
    const courseEnrollments = enrollments.filter(e => e.courseId === selectedCourseId);

    // 2. Map to student & grades
    const rows: GradeRow[] = courseEnrollments.map(enrollment => {
      const student = students.find(s => s.id === enrollment.studentId);
      const grade = grades.find(g => g.enrollmentId === enrollment.id);

      return {
        gradeId: grade?.id || '',
        studentId: enrollment.studentId,
        studentName: student?.name || 'Unknown Student',
        quiz: grade ? grade.quiz : 0,
        midterm: grade ? grade.midterm : 0,
        final: grade ? grade.final : 0,
        total: grade ? grade.total : 0,
        letter: grade ? grade.letter : 'F',
        gpa: grade ? grade.gpa : 0.0,
        hasChanged: false
      };
    });

    setGradeRows(rows);
  }, [selectedCourseId, enrollments, students, grades]);

  // Compute calculated values locally when fields are modified
  const handleGradeChange = (studentId: string, field: 'quiz' | 'midterm' | 'final', valueStr: string) => {
    if (!isAdmin) return;
    const value = Math.max(0, Math.min(100, parseFloat(valueStr) || 0));

    setGradeRows(prev => prev.map(row => {
      if (row.studentId === studentId) {
        const nextRow = { ...row, [field]: value, hasChanged: true };
        
        // Calculate total grade based on formulas: 20% quiz, 30% midterm, 50% final exam
        const total = Number((nextRow.quiz * 0.2 + nextRow.midterm * 0.3 + nextRow.final * 0.5).toFixed(1));
        let letter = 'F';
        let gpa = 0.0;

        if (total >= 90) { letter = 'A'; gpa = 4.0; }
        else if (total >= 80) { letter = 'B'; gpa = 3.0; }
        else if (total >= 70) { letter = 'C'; gpa = 2.0; }
        else if (total >= 60) { letter = 'D'; gpa = 1.0; }
        else { letter = 'F'; gpa = 0.0; }

        nextRow.total = total;
        nextRow.letter = letter;
        nextRow.gpa = gpa;

        return nextRow;
      }
      return row;
    }));
  };

  // Save changes for a single student row
  const handleSaveGrade = async (row: GradeRow) => {
    if (!isAdmin) return;
    setGradeRows(prev => prev.map(r => r.studentId === row.studentId ? { ...r, isSaving: true } : r));
    try {
      const res = await fetch(`/api/grades/${row.gradeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: row.quiz,
          midterm: row.midterm,
          final: row.final
        })
      });

      if (!res.ok) throw new Error('Failed to update grades');
      const updatedGrade = await res.json();

      // Update static state
      setGrades(prev => prev.map(g => g.id === updatedGrade.id ? updatedGrade : g));
      onRefreshStats();

      setGradeRows(prev => prev.map(r => 
        r.studentId === row.studentId 
          ? { ...r, isSaving: false, hasChanged: false } 
          : r
      ));
    } catch (err) {
      console.error(err);
      alert('Error updating grade scores.');
      setGradeRows(prev => prev.map(r => r.studentId === row.studentId ? { ...r, isSaving: false } : r));
    }
  };

  const filteredRows = gradeRows.filter(row => 
    row.studentName.toLowerCase().includes(search.toLowerCase()) ||
    row.studentId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Grades</h1>
        <p className="text-sm text-gray-500 mt-1">
          Input quiz, mid-term, and final exam grades. Total scores, GPA indexes, and letters calculate automatically.
        </p>
      </div>

      {/* Selector Controls */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Course Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <BookOpen className="h-5 w-5 text-gray-400 shrink-0" />
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="block w-full sm:w-80 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.code} - {course.name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-4 py-2 text-xs text-gray-900 bg-gray-50 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-gray-400"
            placeholder="Search class list..."
          />
        </div>
      </div>

      {/* Spreadsheet Main Grid Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : selectedCourseId && filteredRows.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-4 py-4 w-28 text-center">Quiz (20%)</th>
                  <th className="px-4 py-4 w-28 text-center">Midterm (30%)</th>
                  <th className="px-4 py-4 w-28 text-center">Final (50%)</th>
                  <th className="px-4 py-4 w-24 text-center bg-indigo-50/10">Total (%)</th>
                  <th className="px-4 py-4 w-20 text-center bg-indigo-50/20">Letter</th>
                  <th className="px-4 py-4 w-20 text-center bg-indigo-50/30">GPA</th>
                  {isAdmin && <th className="px-6 py-4 w-28 text-center animate-fade-in">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredRows.map((row) => (
                  <tr key={row.studentId} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="font-bold text-gray-800">{row.studentName}</div>
                      <div className="text-xs font-semibold text-gray-400 mt-0.5">{row.studentId}</div>
                    </td>
                    
                    {/* Quiz */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.quiz}
                        disabled={!isAdmin}
                        onChange={(e) => handleGradeChange(row.studentId, 'quiz', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-center text-sm font-semibold rounded-lg border focus:outline-hidden transition-all ${
                          isAdmin 
                            ? 'border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50 text-gray-850 cursor-text' 
                            : 'border-transparent bg-transparent text-gray-500 select-none cursor-default'
                        }`}
                      />
                    </td>

                    {/* Midterm */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.midterm}
                        disabled={!isAdmin}
                        onChange={(e) => handleGradeChange(row.studentId, 'midterm', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-center text-sm font-semibold rounded-lg border focus:outline-hidden transition-all ${
                          isAdmin 
                            ? 'border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50 text-gray-850 cursor-text' 
                            : 'border-transparent bg-transparent text-gray-500 select-none cursor-default'
                        }`}
                      />
                    </td>

                    {/* Final */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.final}
                        disabled={!isAdmin}
                        onChange={(e) => handleGradeChange(row.studentId, 'final', e.target.value)}
                        className={`w-16 px-2 py-1.5 text-center text-sm font-semibold rounded-lg border focus:outline-hidden transition-all ${
                          isAdmin 
                            ? 'border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50 text-gray-850 cursor-text' 
                            : 'border-transparent bg-transparent text-gray-500 select-none cursor-default'
                        }`}
                      />
                    </td>

                    {/* Total Score */}
                    <td className="px-4 py-4 text-center bg-indigo-50/10">
                      <span className="font-bold text-gray-900">{row.total}%</span>
                    </td>

                    {/* Letter Grade */}
                    <td className="px-4 py-4 text-center bg-indigo-50/20">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                        row.letter === 'A' ? 'bg-emerald-50 text-emerald-700' :
                        row.letter === 'B' ? 'bg-blue-50 text-blue-700' :
                        row.letter === 'C' ? 'bg-amber-50 text-amber-700' :
                        row.letter === 'D' ? 'bg-orange-50 text-orange-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {row.letter}
                      </span>
                    </td>

                    {/* GPA Index */}
                    <td className="px-4 py-4 text-center bg-indigo-50/30">
                      <span className="font-extrabold text-indigo-700">{row.gpa.toFixed(1)}</span>
                    </td>

                    {/* Update button */}
                    {isAdmin && (
                      <td className="px-6 py-4 text-center animate-fade-in">
                        <button
                          onClick={() => handleSaveGrade(row)}
                          disabled={!row.hasChanged || row.isSaving}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            row.isSaving 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : row.hasChanged
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md cursor-pointer'
                                : 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
                          }`}
                        >
                          {row.isSaving ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                          ) : row.hasChanged ? (
                            <Save className="h-3.5 w-3.5" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          {row.isSaving ? 'Saving' : row.hasChanged ? 'Save' : 'Saved'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-medium text-gray-400 gap-2">
            <div className="flex items-center gap-1.5">
              <TableProperties className="h-4 w-4" />
              <span>Spreadsheet auto-weighting rule is activated. {!isAdmin && ' (Read-only mode)'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Quiz: 20%</span>
              <span>•</span>
              <span>Midterm: 30%</span>
              <span>•</span>
              <span>Final Exam: 50%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white text-center py-16 rounded-2xl border border-gray-100 shadow-xs flex flex-col items-center justify-center p-6">
          <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No students enrolled</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm">
            To assign grades, enroll students in this course from the <strong>Students</strong> directory tab first.
          </p>
        </div>
      )}
    </div>
  );
}
