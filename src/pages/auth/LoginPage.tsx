import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth, getDashboardPath } from '@/context/AuthContext';
import { mockService } from '@/services/mockService';
import { Logo } from '@/components/ui/Logo';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const loggedInUser = mockService.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (loggedInUser) {
        navigate(getDashboardPath(loggedInUser.role));
      } else {
        navigate('/');
      }
    } else if (result.error === 'pending') {
      navigate('/pending-approval');
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  const fillDemo = (role: string) => {
    if (role === 'admin') { setEmail('admin@rescuelink.health'); setPassword('demo1234'); }
    if (role === 'hospital') { setEmail('admin@knh.health'); setPassword('demo1234'); }
    if (role === 'paramedic') { setEmail('grace.wanjiku@rescuelink.health'); setPassword('demo1234'); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #5B65DC 0%, transparent 50%)' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Logo size="lg" light />
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Connecting emergency<br />response with the right<br />care, instantly.
            </h1>
            <p className="text-navy-200 mt-4 text-lg max-w-md">
              Rescue Link bridges paramedic dispatch teams and hospitals for faster, smarter emergency healthcare coordination.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-navy-200">
                <ShieldCheck size={20} className="text-accent" />
                <span className="text-sm">Role-based access</span>
              </div>
              <div className="flex items-center gap-2 text-navy-200">
                <ShieldCheck size={20} className="text-accent" />
                <span className="text-sm">Real-time matching</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-navy-300">Demo environment — all data is mock and for illustration only.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo size="md" />
          </div>
          <h2 className="text-2xl font-bold text-navy-950">Welcome back</h2>
          <p className="text-sm text-navy-400 mt-1">Sign in to your Rescue Link account</p>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-navy-200 text-accent focus:ring-accent/30"
                />
                <span className="text-sm text-navy-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-accent hover:underline">
                Forgot password?
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full btn-lg"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-navy-400">
              New paramedic?{' '}
              <Link to="/register" className="text-accent font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-navy-50">
            <p className="text-xs text-navy-400 text-center mb-3">Quick demo login</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => fillDemo('admin')} className="btn-secondary text-xs py-2">Super Admin</button>
              <button onClick={() => fillDemo('hospital')} className="btn-secondary text-xs py-2">Health Partner</button>
              <button onClick={() => fillDemo('paramedic')} className="btn-secondary text-xs py-2">Paramedic</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
