import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Award, CheckSquare, GraduationCap } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { DashboardStats } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  statsTrigger?: number;
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export default function Dashboard({ onNavigate, statsTrigger }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [statsTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-lg">
        <p className="font-semibold">Error loading stats</p>
        <p className="text-sm">{error || 'Could not retrieve database statistics.'}</p>
      </div>
    );
  }

  const cards = [
    {
      id: 'students',
      name: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Enrolled students'
    },
    {
      id: 'courses',
      name: 'Active Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Department offerings'
    },
    {
      id: 'gpa',
      name: 'Average GPA',
      value: `${stats.averageGpa.toFixed(2)} / 4.0`,
      icon: Award,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Cumulative performance'
    },
    {
      id: 'attendance',
      name: 'Attendance Rate',
      value: `${stats.averageAttendance}%`,
      icon: CheckSquare,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Overall active engagement'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back to the Student Management System. Here is an overview of university performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.id === 'gpa' ? 'grades' : card.id)}
              className="text-left bg-white overflow-hidden shadow-xs border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200 focus:outline-hidden group cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 truncate">{card.name}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.textColor} group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs font-medium text-gray-500">{card.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* GPA Trend by Course */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-500" />
              Course Academic Performance
            </h2>
            <span className="text-xs font-medium text-gray-400 uppercase">Average GPA</span>
          </div>
          <div className="h-72 w-full">
            {stats.gpaTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.gpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 4.0]} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} 
                    labelClassName="font-bold text-gray-800"
                  />
                  <Bar dataKey="gpa" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={45}>
                    {stats.gpaTrend.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No graded enrollments yet.</div>
            )}
          </div>
        </div>

        {/* Department Student Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              Department Student Distribution
            </h2>
            <span className="text-xs font-medium text-gray-400 uppercase">Enrolled count</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around h-72">
            <div className="w-full sm:w-1/2 h-full">
              {stats.departmentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.departmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No student records.</div>
              )}
            </div>
            <div className="w-full sm:w-1/2 flex flex-col gap-2 p-2 sm:p-0 overflow-y-auto max-h-64">
              {stats.departmentDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-600 font-medium truncate max-w-[120px]">{entry.name}</span>
                  </div>
                  <span className="text-gray-900 font-bold">{entry.value} students</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Rate Over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-purple-500" />
              Daily Attendance Performance
            </h2>
            <span className="text-xs font-medium text-gray-400 uppercase">Attendance rate (%)</span>
          </div>
          <div className="h-64 w-full">
            {stats.attendanceRate.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #f3f4f6' }}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">No attendance records registered yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
