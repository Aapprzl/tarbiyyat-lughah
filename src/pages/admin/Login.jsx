import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { ShieldCheck, Mail, Key, MoveLeft, Diamond, Eye, EyeOff, CircleUser } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useEffect } from 'react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Toggle Register Mode
  const [footerText, setFooterText] = useState('Port of Al-Azhar © 2024');
  const navigate = useNavigate();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await contentService.getHomeConfig();
        if (config && config.footerText) {
          setFooterText(config.footerText);
        }
      } catch (err) {
        console.warn("Failed to load footer config for login page:", err);
      }
    };
    loadConfig();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
          await contentService.register(email, password);
          // Auto login or ask user to login? Supabase usually logs in after signup if confirm disabled.
          // Let's assume auto-login or redirect.
          // navigate('/admin/dashboard'); 
          // For safety, let's login explicitly or if register returns user, we are good.
      } else {
          await contentService.login(email, password);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError(isRegistering ? 'Gagal mendaftar. Email mungkin sudah dipakai.' : 'Akses ditolak. Periksa kredensial anda.');
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center p-4 md:p-6 min-h-[calc(100vh-5rem)]">
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg border border-slate-200 dark:border-slate-700 space-y-8">
          {/* Logo Section */}
          <div className="text-center space-y-4">
            <div className="inline-block">
                <div className="bg-teal-600 w-12 h-12 rounded-lg mx-auto flex items-center justify-center text-white">
                    <ShieldCheck className="w-6 h-6" />
                </div>
            </div>
            
            <div className="space-y-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Autentikasi diperlukan untuk akses kontrol</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              {/* Name Field (Only for Register) */}
              <AnimatePresence>
                {isRegistering && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                    >
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                        <div className="relative group/input">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-teal-600 dark:group-focus-within/input:text-teal-400 transition-colors">
                                <CircleUser className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-base text-slate-900 dark:text-white font-semibold placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                                placeholder="Admin Name"
                            />
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Email Address</label>
                <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-teal-600 dark:group-focus-within/input:text-teal-400 transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-base text-slate-900 dark:text-white font-semibold placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                        placeholder="admin@tarbiyatullughah.id"
                        required
                    />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Password</label>
                <div className="relative group/input">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-teal-600 dark:group-focus-within/input:text-teal-400 transition-colors">
                        <Key className="w-5 h-5" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-10 py-3 text-base text-slate-900 dark:text-white font-semibold placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-colors"
                        placeholder="••••••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 overflow-hidden border border-red-200 dark:border-red-500/20"
                    >
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        {isRegistering ? 'Daftar Akun Baru' : 'Masuk Dashboard'} <Diamond className="w-4 h-4" />
                    </>
                )}
            </motion.button>
            
            {/* Registration Hidden for Security after Initial Setup */}
            {/* 
            <div className="text-center">
                <button
                    type="button" 
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError('');
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-teal-500 transition-colors uppercase tracking-widest"
                >
                    {isRegistering ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
                </button>
            </div>
            */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
