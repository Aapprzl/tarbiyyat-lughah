import React, { useEffect, useState } from 'react';
import { User, Mail, Globe, Linkedin, Instagram, FileText, ArrowLeft, Download, Bookmark, Sparkles, MapPin, Layout, Star, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import PdfViewer from '../components/PdfViewer';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { cn } from '../utils/cn';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const Profile = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
             const data = await contentService.getProfileConfig();
             setConfig(data);
             setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-teal-500">
                        <User className="w-6 h-6 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!config || (!config.name && !config.bio)) {
         return (
             <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#030712]">
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-white dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-slate-200 dark:border-white/10 mb-8"
                 >
                    <User className="w-12 h-12 text-slate-300" />
                 </motion.div>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Profil Belum Tersedia</h2>
                 <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm">Informasi profil pembuat belum ditambahkan ke database.</p>
                 <Link to="/" className="px-8 py-4 bg-teal-600 text-white rounded-[2rem] font-bold shadow-2xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all">Kembali ke Beranda</Link>
             </div>
         );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] pb-32 overflow-hidden selection:bg-teal-500/30">
             {/* --- Premium Cinematic Hero --- */}
             {/* Header Section (Aurora Hero) - Immersive & Truly Full Width */}
             <div className="relative h-[550px] overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors duration-500">
                {/* Advanced Aurora Gradient Overlay - Lighter for Light Mode */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-indigo-500/10 to-transparent dark:from-teal-900/40 dark:via-indigo-900/40 dark:to-slate-900/40 animate-aurora"></div>
                
                {/* Immersive Floating Elements with Adaptive Opacity */}
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.15, 0.3, 0.15]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -right-1/4 w-[1000px] h-[1000px] bg-teal-500/20 dark:bg-teal-500/30 rounded-full blur-[140px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1.3, 1, 1.3],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-1/4 -left-1/4 w-[1100px] h-[1100px] bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full blur-[140px]"
                />

                {/* Refined Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 dark:opacity-30 pointer-events-none mix-blend-overlay"></div>
                
                {/* Seamless Transition Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-50 dark:from-[#030712] to-transparent z-[5]"></div>
                
                <div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-start pt-32 z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 text-slate-400 dark:text-white/50 mb-2"
                    >
                        <Link to="/" className="hover:text-teal-600 transition-colors flex items-center gap-2 font-black uppercase tracking-[0.3em] text-[10px]">
                           <ArrowLeft className="w-3 h-3" /> Beranda
                        </Link>
                        <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-white/20 rounded-full"></div>
                        <span className="font-black uppercase tracking-[0.3em] text-[10px] text-teal-600 dark:text-teal-400">Verifikasi Registry Publik</span>
                    </motion.div>
                </div>
             </div>

             <div className="max-w-7xl mx-auto px-6 -mt-64 relative z-10">
                 <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                 >
                     {/* --- Left Column: Profile Master Card --- */}
                     <motion.div variants={itemVariants} className="lg:col-span-4 transition-all">
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-2xl p-10 md:p-12 sticky top-12 border-b-8 border-b-teal-500/50 group overflow-hidden">
                            {/* Accent Background */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/5 blur-[80px] rounded-full group-hover:bg-teal-500/10 transition-colors"></div>

                            {/* Photo Visualization */}
                            <div className="relative w-56 h-56 mx-auto mb-10">
                                <motion.div 
                                    animate={{ rotate: [0, 5, 0, -5, 0] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-indigo-600/20 rounded-[3.5rem] blur-2xl group-hover:scale-110 transition-transform"
                                />
                                <div className="relative w-full h-full rounded-[3rem] p-2 bg-white/50 dark:bg-white/10 border border-white dark:border-white/20 overflow-hidden shadow-2xl">
                                     {config.photoUrl ? (
                                         <img src={config.photoUrl} alt={config.name} className="w-full h-full rounded-[2.5rem] object-cover bg-slate-100 transition-transform duration-700 group-hover:scale-110" />
                                     ) : (
                                         <div className="w-full h-full rounded-[2.5rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300">
                                             <User className="w-24 h-24" />
                                         </div>
                                     )}
                                     
                                     {/* Floating Badge */}
                                     <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl border border-slate-100 dark:border-white/10 rotate-12 transition-transform group-hover:rotate-0">
                                        <Sparkles className="w-8 h-8 text-teal-500 drop-shadow-[0_0_8px_rgba(20,184,166,0.3)]" />
                                     </div>
                                </div>
                            </div>

                            <div className="text-center space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">{config.name}</h1>
                                    <div className="inline-flex items-center gap-2 px-5 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-teal-500/20 shadow-sm animate-pulse">
                                        <Bookmark className="w-3 h-3" /> {config.title || 'Master Architect'}
                                    </div>
                                </div>
                                
                                {config.location && (
                                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold tracking-tight">
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-teal-500" />
                                        </div>
                                        {config.location}
                                    </div>
                                )}
                                
                                <div className="pt-10 grid grid-cols-1 gap-4">
                                     {config.email && (
                                         <a href={`mailto:${config.email}`} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white group/link transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
                                             <div className="flex items-center gap-4">
                                                 <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover/link:scale-110 transition-transform">
                                                     <Mail className="w-5 h-5" />
                                                 </div>
                                                 <div className="text-left">
                                                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Connect Via Email</div>
                                                     <span className="text-xs font-black">Kirim Pesan</span>
                                                 </div>
                                             </div>
                                             <ArrowRight className="w-4 h-4 text-slate-300 group-hover/link:text-teal-500 group-hover/link:translate-x-1 transition-all" />
                                         </a>
                                     )}
                                     
                                     <div className="flex justify-center gap-4 pt-6">
                                         {[
                                             { icon: Instagram, color: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500', url: config.socials?.instagram },
                                             { icon: Linkedin, color: 'bg-[#0077b5]', url: config.socials?.linkedin },
                                             { icon: Globe, color: 'bg-slate-900', url: config.socials?.website }
                                         ].filter(s => s.url).map((social, i) => (
                                             <motion.a 
                                                key={i}
                                                whileHover={{ y: -8, scale: 1.1 }} 
                                                href={social.url} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className={cn(
                                                    "w-14 h-14 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all border border-white/10",
                                                    social.color
                                                )}
                                             >
                                                 <social.icon className="w-6 h-6" />
                                             </motion.a>
                                         ))}
                                     </div>
                                </div>
                            </div>
                        </div>
                     </motion.div>

                     {/* --- Right Column: Depth Content --- */}
                     <div className="lg:col-span-8 space-y-12">
                         {/* Bio Section */}
                         <motion.div variants={itemVariants} className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-[3.5rem] border border-white dark:border-white/10 shadow-2xl p-10 md:p-16 relative overflow-hidden group">
                              {/* Decorative Icon */}
                              <div className="absolute -top-12 -right-12 p-12 opacity-5 scale-[2] rotate-12 transition-transform duration-1000 group-hover:rotate-0">
                                 <Sparkles className="w-48 h-48 text-teal-500" />
                              </div>

                              <div className="relative z-10">
                                  <div className="flex items-center gap-5 mb-12">
                                       <div className="w-16 h-16 bg-teal-500/10 rounded-[1.75rem] flex items-center justify-center shadow-inner border border-teal-500/20">
                                           <User className="w-8 h-8 text-teal-600" />
                                       </div>
                                       <div>
                                           <div className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em] mb-1">Inspirasi & Visi</div>
                                           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Kisah Di Balik Layar</h2>
                                       </div>
                                  </div>
                                  
                                  <div className="prose prose-xl prose-teal dark:prose-invert max-w-none">
                                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-[2.4] whitespace-pre-wrap text-lg md:text-xl font-sans opacity-90 first-letter:text-6xl first-letter:font-black first-letter:text-teal-500 first-letter:mr-3 first-letter:float-left">
                                          {config.bio || 'Membangun masa depan melalui edukasi dan inovasi digital.'}
                                      </p>
                                  </div>

                                  {/* Stats/Highlights section */}
                                  {config.showStats && (
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-16">
                                          {[
                                              { label: 'Proyek Selesai', value: config.stats?.projects || '0', icon: Layout },
                                              { label: 'Jam Pengabdian', value: config.stats?.hours || '0', icon: Activity },
                                              { label: 'Rating Kepuasan', value: config.stats?.rating || '0', icon: Star }
                                          ].map((stat, i) => (
                                              <motion.div 
                                                key={i} 
                                                variants={itemVariants}
                                                className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10 group/stat hover:bg-teal-500/10 transition-colors"
                                              >
                                                  <stat.icon className="w-5 h-5 text-teal-500 mb-4 transition-transform group-hover/stat:scale-110" />
                                                  <div className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{stat.value}</div>
                                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                              </motion.div>
                                          ))}
                                      </div>
                                  )}
                              </div>
                         </motion.div>

                         {/* PDF Preview Section */}
                         {config.pdfUrl && (
                              <motion.div variants={itemVariants} className="bg-white/80 dark:bg-[#1e293b] rounded-[4rem] shadow-3xl p-10 md:p-16 relative overflow-hidden border border-slate-200 dark:border-white/5 transition-colors duration-500">
                                   {/* Adaptive Background Gradient for PDF Section */}
                                   <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-white/50 dark:from-indigo-900/50 dark:to-slate-950/50"></div>
                                   <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] rounded-full"></div>

                                  <div className="relative z-10">
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                                          <div className="flex items-center gap-5">
                                               <div className="w-16 h-16 bg-red-500/10 rounded-[1.75rem] flex items-center justify-center text-red-600 dark:text-red-400 border border-red-500/20">
                                                   <FileText className="w-8 h-8" />
                                               </div>
                                               <div>
                                                    <div className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-[0.3em] mb-1">Dokumen Resmi</div>
                                                   <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Portofolio & CV</h2>
                                               </div>
                                          </div>
                                          
                                          <motion.a 
                                            whileHover={{ scale: 1.05, y: -4 }}
                                            whileTap={{ scale: 0.95 }}
                                            href={config.pdfUrl} 
                                            download="Profil-Creator.pdf" 
                                            className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-teal-600 to-teal-700 dark:from-red-500 dark:to-rose-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-teal-500/20 dark:shadow-red-500/40 relative overflow-hidden group/btn"
                                          >
                                              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
                                              <Download className="w-5 h-5 relative z-10" /> 
                                              <span className="relative z-10">Simpan PDF</span>
                                          </motion.a>
                                      </div>
                                      
                                       <div className="rounded-[3rem] overflow-hidden border-8 border-slate-100 dark:border-white/5 shadow-2xl relative bg-white dark:bg-white/5 backdrop-blur-sm group/viewer transition-colors">
                                            <div className="absolute inset-0 bg-teal-500/0 group-hover/viewer:bg-teal-500/5 transition-colors pointer-events-none z-10"></div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 flex items-center gap-4 transition-colors">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex-1 text-center">Interactive PDF Engine</div>
                                            </div>
                                           <PdfViewer src={config.pdfUrl} height={800} />
                                      </div>
                                  </div>
                             </motion.div>
                         )}
                     </div>
                 </motion.div>
             </div>
        </div>
    );
};

export default Profile;

