import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import editorialImg from '../assets/signup-editorial-v6.png';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (username.length < 3) {
      setError('Handle must be at least 3 characters');
      return;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Security key must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Security keys do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.signup({ username, email, password });
      login(response.data.user, response.data.token, true); // Auto-login and remember
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to establish identity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 bg-background selection:bg-foreground selection:text-background overflow-hidden">
      {/* ─── IMAGE SIDE ─────────────────────────────────── */}
      <div className="hidden lg:block relative overflow-hidden border-r border-foreground/5 bg-black">
        <img 
          src={editorialImg} 
          alt="Editorial" 
          className="w-full h-full object-cover grayscale opacity-50 hover:opacity-100 transition-all duration-[2000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-12 left-12">
            <h2 className="font-serif italic text-white text-[5vw] leading-none blend-diff reveal-up">
              Shape the Void.
            </h2>
        </div>
      </div>

       {/* ─── FORM SIDE ──────────────────────────────────── */}
      <div className="flex flex-col justify-center px-6 sm:px-16 lg:px-24 pt-32 pb-12 relative h-full">

        <div className="max-w-md w-full mx-auto space-y-6">
          <header className="space-y-2 reveal-up">
            <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-foreground/30 font-black">
              Authentication // 02
            </span>
            <h1 className="font-sans font-black text-6xl tracking-tighter uppercase leading-none">
              Sign Up
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-foreground/40 leading-relaxed">
              Begin your archival journey today.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 reveal-up [animation-delay:0.2s]">
            {error && (
              <div className="p-4 border border-red-500/10 bg-red-500/5 text-red-500 text-[10px] uppercase tracking-widest font-black">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-[0.5em] font-black text-foreground/30 mb-1 group-focus-within:text-foreground transition-all">
                  Handle (Username)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-b border-foreground/15 py-3 focus:border-foreground outline-none transition-all font-sans text-lg tracking-tight"
                  placeholder="archivist_01"
                />
              </div>

              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-[0.5em] font-black text-foreground/30 mb-1 group-focus-within:text-foreground transition-all">
                  Identity (Email)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-foreground/15 py-3 focus:border-foreground outline-none transition-all font-sans text-lg tracking-tight"
                  placeholder="name@example.com"
                />
              </div>

              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-[0.5em] font-black text-foreground/30 mb-1 group-focus-within:text-foreground transition-all">
                  Security (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-foreground/15 py-3 pr-10 focus:border-foreground outline-none transition-all font-sans text-lg tracking-tight"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground transition-all"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group relative">
                <label className="block text-[10px] uppercase tracking-[0.5em] font-black text-foreground/30 mb-1 group-focus-within:text-foreground transition-all">
                  Confirm Security
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-foreground/15 py-3 pr-10 focus:border-foreground outline-none transition-all font-sans text-lg tracking-tight"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground transition-all"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full group inline-flex items-center justify-between gap-4 text-[11px] uppercase tracking-[0.6em] font-black
                  text-foreground border border-foreground/15 p-6 hover:bg-foreground hover:text-background transition-all duration-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto text-foreground" />
                ) : (
                  <>Initialize Identity <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-all" /></>
                )}
              </button>
            </div>
          </form>

          <footer className="pt-8 border-t border-foreground/5 reveal-up [animation-delay:0.4s]">
            <p className="text-[10px] uppercase tracking-[0.4em] font-black text-foreground/20">
              Already indexed?{' '}
              <Link to="/login" className="text-foreground/40 hover:text-foreground transition-all border-b border-foreground/10 hover:border-foreground pb-1">
                Verify Identity
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
