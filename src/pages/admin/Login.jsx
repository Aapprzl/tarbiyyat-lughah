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
                <div className="bg-gradient-to-br from-teal-500 to-indigo-600 w-16 h-16 rounded-xl mx-auto flex items-center justify-center text-white">
                    <ShieldCheck className="w-8 h-8" />
                </div>
            </div>
            
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Autentikasi diperlukan untuk akses kontrol</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              {/* Name Field (Only for Register) */}
              <AnimatePresence>
                {isRegistering && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                    >
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-6">Full Name</label>
                        <div className="relative group/input">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-teal-500 dark:group-focus-within/input:text-teal-400 transition-colors">
                                <CircleUser className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-slate-100/50 dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-16 pr-8 py-5 text-base text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-500/50 outline-none transition-all"
                                placeholder="Admin Name"
                            />
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-6">Email Address</label>
                <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-teal-500 dark:group-focus-within/input:text-teal-400 transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-100/50 dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-slate-800 rounded-[2rem] pl-16 pr-8 py-5 text-base text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-500/50 outline-none transition-all"
                        placeholder="admin@tarbiyatullughah.id"
                        required
                    />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-6">Secured Password</label>
                <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within/input:text-teal-500 dark:group-focus-within/input:text-teal-400 transition-colors">
                        <Key className="w-5 h-5" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-100/50 dark:bg-white/[0.03] hover:bg-slate-100/80 dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-[2rem] pl-16 pr-14 py-5 text-base text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:focus:border-teal-500/50 outline-none transition-all shadow-inner"
                        placeholder="••••••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-500 transition-colors focus:outline-none"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                        className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 p-5 rounded-[1.5rem] text-sm font-bold flex items-center gap-3 overflow-hidden shadow-lg shadow-red-500/5"
                    >
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full relative group overflow-hidden rounded-[2rem] transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-indigo-600 to-teal-500 bg-[length:200%_100%] animate-aurora group-hover:bg-right transition-all duration-1000"></div>
                
                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                <div className="relative py-6 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <motion.div 
                            className="flex items-center gap-3"
                            initial={false}
                            animate={{ x: 0 }}
                            whileHover={{ x: 5 }}
                        >
                            {isRegistering ? 'Daftar Akun Baru' : 'Masuk Dashboard'} <Diamond className="w-4 h-4" />
                        </motion.div>
                    )}
                </div>
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
