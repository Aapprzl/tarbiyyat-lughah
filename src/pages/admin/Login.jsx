import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Lock, Mail, Key, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await contentService.login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Akses ditolak. Periksa kredensial anda.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030712] flex items-center justify-center p-6 overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-teal-500/10 blur-[120px] rounded-full animate-aurora"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[120px] rounded-full animate-aurora [animation-delay:2s]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-amber-500/5 blur-[120px] rounded-full animate-aurora [animation-delay:4s]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="bg-white/5 backdrop-blur-2xl p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl space-y-12">
          {/* Logo Section */}
          <div className="text-center space-y-6">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative inline-block"
            >
                <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-teal-400 to-indigo-600 w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center text-white shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Lock className="w-10 h-10 group-hover:scale-110 transition-transform" />
                </div>
            </motion.div>
            
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                   Admin Portal <Sparkles className="w-5 h-5 text-amber-500" />
                </h1>
                <p className="text-slate-400 font-medium">Autentikasi diperlukan untuk akses kontrol.</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Email Address</label>
                <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-teal-400 transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-white font-bold placeholder-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all shadow-inner"
                        placeholder="admin@tarbiyatullughah.id"
                        required
                    />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Secured Password</label>
                <div className="relative group/input">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-teal-400 transition-colors">
                        <Key className="w-5 h-5" />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-white font-bold placeholder-slate-600 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all shadow-inner"
                        placeholder="••••••••••••"
                        required
                    />
                </div>
              </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-[1.5rem] text-sm font-bold flex items-center gap-3 overflow-hidden shadow-lg shadow-red-500/5"
                    >
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-600 transition-all group-hover:scale-105 active:scale-95 rounded-[2rem]"></div>
                <div className="relative py-6 text-white font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>Masuk Dashboard <Sparkles className="w-4 h-4" /></>
                    )}
                </div>
            </button>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <Link to="/" className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
               <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
               Website Utama
            </Link>
            <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
               Port of Al-Azhar © 2024
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
