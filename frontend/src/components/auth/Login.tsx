import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Shield } from 'lucide-react';
import { HeroParallax } from '../ui/hero-parallax';
import { MaskContainer } from '../ui/svg-mask-effect';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const products = [
    { title: "Dashboard Overview", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/moonbeam.png" },
    { title: "EC2 Instance Scanner", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/cursor.png" },
    { title: "Security Group Analysis", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/rogue.png" },
    { title: "IAM Role Monitor", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/editorfully.png" },
    { title: "S3 Bucket Security", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/editrix.png" },
    { title: "Cost Optimization", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/pixelperfect.png" },
    { title: "Vulnerability Reports", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/algochurn.png" },
    { title: "Automated Alerts", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/aceternityui.png" },
    { title: "Compliance Check", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png" },
    { title: "Real-time Monitoring", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/smartbridge.png" },
    { title: "Resource Graph", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/renderwork.png" },
    { title: "Threat Detection", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/cremedigital.png" },
    { title: "API Security", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/goldenbellsacademy.png" },
    { title: "Audit Logs", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/invoker.png" },
    { title: "Team Collaboration", link: "#", thumbnail: "https://aceternity.com/images/products/thumbnails/new/efreeinvoice.png" },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-950 overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-12">
            <MotionLogo />
            <div className="h-[10rem] w-full flex items-center justify-center  overflow-hidden">
              <MaskContainer
                revealText={
                  <div className="max-w-4xl mx-auto text-slate-100 text-center text-4xl font-bold">
                    Welcome <span className="text-indigo-500">Back!</span>
                  </div>
                }
                className="h-[10rem] rounded-md"
              >
                FIRST <span className="text-red-500">LOGIN</span>
              </MaskContainer>
            </div>
            <p className="text-slate-400 mt-4 text-lg">
              Empowering technical teams to secure their cloud visualy.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3 overflow-hidden text-red-200 text-sm mb-6"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-10 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-10 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
          <div className="mt-8 text-center text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-white hover:underline font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative flex-col overflow-hidden">
        <div className="absolute inset-0 bg-slate-950 z-0">
          <HeroParallax products={products} />
        </div>
      </div>
    </div>
  );
}

const MotionLogo = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.1 }}
    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-8"
  >
    <Shield className="w-6 h-6 text-black" fill="currentColor" />
  </motion.div>
);
