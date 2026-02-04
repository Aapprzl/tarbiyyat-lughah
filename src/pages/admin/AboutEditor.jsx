import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { Save, Info, Mail, Phone, Sparkles, ChevronRight, CheckCircle, ClipboardList, Globe, Orbit } from 'lucide-react';
import { useToast } from '../../components/Toast';
import RichTextEditor from '../../components/RichTextEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const AboutEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
     title: '', description: '', content: '', email: '', phone: ''
  });
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await contentService.getAboutConfig();
        setConfig(data);
      } catch (err) {
        toast.error("Gagal memuat konfigurasi halaman.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        await contentService.saveAboutConfig(config);
        toast.success('Halaman Tentang Kami berhasil diperbarui! ✨');
    } catch (err) {
        toast.error('Gagal menyimpan perubahan.');
    } finally {
        setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-24 text-center">
        <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Editor Halaman...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
              <Info className="w-3 h-3" /> Informasi Portal
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Editor Tentang Kami</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Sampaikan visi, misi, dan informasi lengkap portal anda.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="group flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-10">
           {/* Section 1: Basic Info */}
           <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
           >
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600">
                        <ClipboardList className="w-6 h-6" />
                    </div>
                    Informasi Utama
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Judul Halaman</label>
                        <input 
                            type="text" 
                            value={config.title || ''}
                            onChange={(e) => setConfig({...config, title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                            placeholder="Tentang Kami"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Deskripsi Singkat (Header)</label>
                        <input 
                            type="text" 
                            value={config.description || ''}
                            onChange={(e) => setConfig({...config, description: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                            placeholder="Visi dan Misi Singkat"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Isi Konten Utama</label>
                        <div className="bg-slate-50 dark:bg-black/20 rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5">
                            <RichTextEditor
                                value={config.content}
                                onChange={(newContent) => setConfig({...config, content: newContent})}
                                placeholder="Jelaskan secara mendalam tentang portal ini..."
                            />
                        </div>
                    </div>
                </div>
           </motion.div>

           {/* Section 2: Contact Info */}
           <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
           >
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Orbit className="w-6 h-6" />
                    </div>
                    Kontak Publik
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Email Kontak</label>
                        <div className="relative">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="email" 
                                value={config.email || ''}
                                onChange={(e) => setConfig({...config, email: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                                placeholder="nama@portal.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Telepon / WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={config.phone || ''}
                                onChange={(e) => setConfig({...config, phone: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                                placeholder="+62 812..."
                            />
                        </div>
                    </div>
                </div>
           </motion.div>
      </form>
    </div>
  );
};

export default AboutEditor;
