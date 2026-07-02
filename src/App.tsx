import React, { useState } from 'react';
import { Menu, GraduationCap, ShieldCheck, ShieldAlert, Lock, Unlock, Terminal, X, Eye } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StudentsList from './components/StudentsList';
import CoursesList from './components/CoursesList';
import GradesManager from './components/GradesManager';
import AttendanceTracker from './components/AttendanceTracker';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [statsTrigger, setStatsTrigger] = useState<number>(0);
  
  // Admin Mode states
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleRefreshStats = () => {
    setStatsTrigger(prev => prev + 1);
  };

  const handleTriggerAdmin = () => {
    if (isAdmin) {
      // Toggle off directly if already admin
      setIsAdmin(false);
      setPasscode('');
      setPasscodeError('');
    } else {
      setShowAdminModal(true);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '3072415') {
      setIsAdmin(true);
      setShowAdminModal(false);
      setPasscode('');
      setPasscodeError('');
    } else {
      setPasscodeError('Invalid Security Key. Access Denied.');
    }
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard statsTrigger={statsTrigger} onNavigate={setCurrentTab} />;
      case 'students':
        return <StudentsList onRefreshStats={handleRefreshStats} isAdmin={isAdmin} />;
      case 'courses':
        return <CoursesList onRefreshStats={handleRefreshStats} isAdmin={isAdmin} />;
      case 'grades':
        return <GradesManager onRefreshStats={handleRefreshStats} isAdmin={isAdmin} />;
      case 'attendance':
        return <AttendanceTracker onRefreshStats={handleRefreshStats} isAdmin={isAdmin} />;
      default:
        return <Dashboard statsTrigger={statsTrigger} onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        onNavigate={setCurrentTab} 
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        isAdmin={isAdmin}
        onTriggerAdmin={handleTriggerAdmin}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin mode floating banner (if active) */}
        {isAdmin && (
          <div className="bg-indigo-600 px-4 py-2 text-white text-xs font-semibold flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
              <span>ADMINISTRATIVE TERMINAL MODE UNLOCKED — All Modification, Grading, and Deletion privileges are fully active.</span>
            </div>
            <button 
              onClick={() => setIsAdmin(false)} 
              className="text-indigo-200 hover:text-white transition-colors cursor-pointer text-[10px] bg-indigo-700/60 px-2.5 py-1 rounded-lg border border-indigo-500/30"
            >
              Lock Panel
            </button>
          </div>
        )}

        {/* Top Header Navigation (Mobile Only Header, Hidden on Large Desktop screens) */}
        <header className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between shrink-0 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-gray-900 text-sm tracking-wide">Academica</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {isAdmin ? (
              <span className="text-indigo-600 flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
            ) : (
              <span>Standard Portal</span>
            )}
          </div>
        </header>

        {/* Content Section Container */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* SECRET ADMIN TERMINAL ENTRY MODAL */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 overflow-hidden">
            {/* Design accents */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm">
                <Terminal className="h-5 w-5 animate-pulse" />
                <span>academica_gate_secure</span>
              </div>
              <button 
                onClick={() => {
                  setShowAdminModal(false);
                  setPasscode('');
                  setPasscodeError('');
                }}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 mb-3">
                <Lock className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Security Core Authenticator</h3>
              <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
                Unauthorized access is logged. Please supply the administrative passcode to unlock management capabilities.
              </p>
            </div>

            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                  Administrative Security Key
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (passcodeError) setPasscodeError('');
                    }}
                    placeholder="Enter security passcode..."
                    autoFocus
                    className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white rounded-xl py-3 px-4 text-sm outline-hidden font-mono tracking-wider transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
                {passcodeError && (
                  <p className="text-xs text-rose-500 font-medium font-mono mt-2 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                    {passcodeError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setPasscode('');
                    setPasscodeError('');
                  }}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all cursor-pointer border border-slate-700/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Unlock className="h-4 w-4" />
                  Unlock Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
