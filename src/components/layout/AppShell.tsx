import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Building2, UserCheck, Users, Activity,
  Ambulance, Siren, MapPin, Bell, Settings, LogOut,
  Menu, X, ChevronLeft, Stethoscope, BedDouble, FileText,
  ClipboardList, History, Plus, ShieldCheck,
} from 'lucide-react';
import { useAuth, getDashboardPath } from '@/context/AuthContext';
import { Logo } from '@/components/ui/Logo';
import { mockService } from '@/services/mockService';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}

const navByRole: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin/dashboard' },
    { label: 'Health Partners', icon: <Building2 size={18} />, path: '/admin/hospitals' },
    { label: 'Paramedic Approvals', icon: <UserCheck size={18} />, path: '/admin/approvals' },
    { label: 'User Management', icon: <Users size={18} />, path: '/admin/users' },
    { label: 'Activity Logs', icon: <Activity size={18} />, path: '/admin/activity' },
  ],
  health_partner: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/hospital/dashboard' },
    { label: 'Hospital Profile', icon: <Building2 size={18} />, path: '/hospital/profile' },
    { label: 'Services', icon: <Stethoscope size={18} />, path: '/hospital/services' },
    { label: 'Bed Availability', icon: <BedDouble size={18} />, path: '/hospital/beds' },
    { label: 'Ambulances', icon: <Ambulance size={18} />, path: '/hospital/ambulances' },
  ],
  paramedic: [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dispatch/dashboard' },
    { label: 'Emergency Cases', icon: <Siren size={18} />, path: '/dispatch/cases' },
    { label: 'New Emergency', icon: <Plus size={18} />, path: '/dispatch/new-case' },
    { label: 'Active Dispatches', icon: <Ambulance size={18} />, path: '/dispatch/active' },
    { label: 'Dispatch History', icon: <History size={18} />, path: '/dispatch/history' },
  ],
};

const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  health_partner: 'Health Partner',
  paramedic: 'Paramedic Dispatch',
};

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!user) return null;

  const navItems = navByRole[user.role] || [];
  const notifications = mockService.getNotifications(user.role, user.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === location.pathname) return true;
    return location.pathname.startsWith(path) && path !== `/${user.role.split('_')[0]}`;
  };

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-60';

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-navy-950/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 h-full ${sidebarWidth} bg-navy-950 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'left-0' : '-left-60 lg:left-0'
        }`}
      >
        <div className={`flex items-center h-16 border-b border-navy-800 ${sidebarCollapsed ? 'px-2 justify-center' : 'px-4'}`}>
          {sidebarCollapsed ? (
            <Logo size="sm" showText={false} light />
          ) : (
            <Logo size="sm" light />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    {item.icon}
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={`p-3 border-t border-navy-800 ${sidebarCollapsed ? 'hidden' : ''}`}>
          <div className="flex items-center gap-2 px-2 py-2 text-xs text-navy-300">
            <ShieldCheck size={14} />
            <span>Demo Environment</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-navy-50 flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg text-navy-600 hover:bg-navy-50"
            >
              <ChevronLeft size={20} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm font-medium text-navy-400">{roleLabels[user.role]}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-triage-red rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-elevated border border-navy-50 z-20 animate-slide-up max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-navy-50 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-navy-950">Notifications</h4>
                      <button
                        onClick={() => {
                          mockService.markAllNotificationsRead(user.role, user.id);
                          setNotifOpen(false);
                        }}
                        className="text-xs text-accent hover:underline"
                      >
                        Mark all read
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-navy-400 text-center">No notifications</p>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => mockService.markNotificationRead(n.id)}
                          className={`p-3 border-b border-navy-50/50 cursor-pointer hover:bg-navy-50/30 ${!n.read ? 'bg-accent/5' : ''}`}
                        >
                          <div className="flex items-start gap-2">
                            {!n.read && <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />}
                            <div className={n.read ? 'pl-4' : ''}>
                              <p className="text-sm font-medium text-navy-800">{n.title}</p>
                              <p className="text-xs text-navy-400 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-navy-300 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-navy-50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: user.avatar_color }}
                >
                  {user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-navy-800 leading-none">{user.full_name}</p>
                  <p className="text-xs text-navy-400 mt-0.5">{user.email}</p>
                </div>
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-navy-50 z-20 animate-slide-up py-2">
                    <div className="px-4 py-2 border-b border-navy-50">
                      <p className="text-sm font-medium text-navy-800">{user.full_name}</p>
                      <p className="text-xs text-navy-400">{roleLabels[user.role]}</p>
                    </div>
                    <button
                      onClick={() => { navigate(getDashboardPath(user.role)); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-navy-600 hover:bg-navy-50"
                    >
                      <Settings size={16} /> Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
