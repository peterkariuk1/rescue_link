import { ShieldAlert } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth, getDashboardPath } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function AccessDeniedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>
        <div className="card p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-navy-950">Access Denied</h2>
          <p className="text-sm text-navy-400 mt-2">
            You do not have permission to view this page. Your role may not include access to this section.
          </p>
          {user && (
            <button
              onClick={() => navigate(getDashboardPath(user.role))}
              className="btn-primary w-full btn-lg mt-6 inline-flex"
            >
              Go to your dashboard
            </button>
          )}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn-secondary w-full btn-lg mt-3 inline-flex"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
