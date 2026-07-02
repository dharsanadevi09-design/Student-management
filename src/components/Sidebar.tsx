import React, { useState } from 'react';
import { LayoutDashboard, Users, BookOpen, Award, CheckSquare, GraduationCap, Menu, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isAdmin: boolean;
  onTriggerAdmin: () => void;
}

export default function Sidebar({ currentTab, onNavigate, mobileOpen, setMobileOpen, isAdmin, onTriggerAdmin }: SidebarProps) {
  const [clicks, setClicks] = useState(0);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'courses', name: 'Courses', icon: BookOpen },
    { id: 'grades', name: 'Grades', icon: Award },
    { id: 'attendance', name: 'Attendance', icon: CheckSquare },
  ];

  const handleProfileClick = () => {
    setClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        onTriggerAdmin();
        return 0;
      }
      return next;
    });

    // Reset click count if they stop clicking
    const timer = setTimeout(() => {
      setClicks(0);
    }, 1500);

    return () => clearTimeout(timer);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Layout */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:h-screen shrink-0`}>
        {/* Top Logo and Name */}
        <div className="flex flex-col flex-1">
          <div className="h-20 px-6 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Academica</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Campus Hub</p>
              </div>
            </div>
            
            {/* Mobile close button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Menu Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Summary (Secret Admin Area) */}
        <div 
          onClick={handleProfileClick}
          className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0 select-none cursor-pointer hover:bg-slate-950/70 active:bg-slate-950 transition-all duration-200"
          title="Secret: Triple click to toggle Admin panel"
        >
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className={`h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-sm border transition-all duration-300 ${
              isAdmin 
                ? 'text-emerald-400 border-emerald-500/80 shadow-md shadow-emerald-500/20 scale-105 bg-slate-900' 
                : 'text-indigo-400 border-slate-700'
            }`}>
              {isAdmin ? 'AD' : 'AD'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white truncate">dharsanadevi</h4>
                {isAdmin && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className={`text-[10px] font-medium truncate ${isAdmin ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  {isAdmin ? 'System Admin (Unlocked)' : 'System Admin (Locked)'}
                </p>
                {isAdmin ? (
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-3 w-3 text-slate-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
