import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { CloudGuardLogo } from '../ui/cloudguard-logo';
import { AuthVisualPanel } from './AuthVisualPanel';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="premium-shell flex min-h-screen w-full overflow-hidden">
      <AuthVisualPanel
        title="See cloud waste, risk, and remediation in one command center."
        description="A focused operating surface for teams that need cloud cost discipline without losing security context."
      />

      <div className="flex min-w-0 w-full max-w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:p-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-md min-w-0"
        >
          <div className="mb-9">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <CloudGuardLogo size={42} />
              <div>
                <p className="font-semibold text-white">CloudGuard</p>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">Sentry Suite</p>
              </div>
            </div>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-300/16 bg-cyan-300/10 text-cyan-100 shadow-lg shadow-cyan-500/10">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">Welcome back</h1>
            <p className="mt-3 max-w-full text-sm leading-6 text-slate-400">
              Sign in to review savings, security posture, and queued remediations.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="mb-6 flex items-start gap-3 overflow-hidden rounded-lg border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-200" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-slate-300">Email</label>
              <div className="group relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="premium-input w-full rounded-lg px-10 py-3 text-white placeholder:text-slate-600"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-sm font-medium text-slate-300">Password</label>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-200" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="premium-input w-full rounded-lg px-10 py-3 text-white placeholder:text-slate-600"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="premium-button mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3.5 font-semibold"
            >
              {isLoading ? (
                <div className="h-5 w-5 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Do not have an account?{' '}
            <Link to="/signup" className="font-semibold text-cyan-100 transition-colors hover:text-white">
              Create one
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
