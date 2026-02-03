import React, { useEffect, useState } from 'react';
import { Type, Save, Eye, Sparkles, CheckCircle, ChevronRight, Monitor, Languages, Hash } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useFont } from '../../components/FontProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const ARABIC_FAMILIES = [
  { name: 'Cairo', label: 'Cairo', style: "'Cairo', sans-serif" },
  { name: 'Amiri', label: 'Amiri', style: "'Amiri', serif" },
  { name: 'Scheherazade New', label: 'Scheherazade', style: "'Scheherazade New', serif" },
  { name: 'Almarai', label: 'Almarai', style: "'Almarai', sans-serif" },
  { name: 'Noto Naskh Arabic', label: 'KFGQPC / Noto Naskh', style: "'Noto Naskh Arabic', serif" },
  { name: 'El Messiri', label: 'El Messiri', style: "'El Messiri', sans-serif" },
  { name: 'Noto Sans Arabic', label: 'Noto Sans Arabic', style: "'Noto Sans Arabic', sans-serif" },
  { name: 'Tajawal', label: 'Tajawal', style: "'Tajawal', sans-serif" }
];

const LATIN_FAMILIES = [
  { name: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { name: 'Inter', label: 'Inter' },
  { name: 'Roboto', label: 'Roboto' },
  { name: 'System Default', label: 'System Default' }
];

const FONT_SIZES = [
  { value: 'text-base', label: 'Kecil (16px)' },
  { value: 'text-lg', label: 'Normal (18px)' },
  { value: 'text-xl', label: 'Sedang (20px)' },
  { value: 'text-2xl', label: 'Besar (24px)' },
  { value: 'text-3xl', label: 'Sangat Besar (30px)' },
  { value: 'text-4xl', label: 'Judul (36px)' },
  { value: 'text-5xl', label: 'Jumbo (48px)' }
];

const FontEditor = () => {
  const { config, updateFontConfig } = useFont();
  const [localConfig, setLocalConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (config && !localConfig) {
      setLocalConfig({ ...config });
    }
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
        await updateFontConfig(localConfig);
        toast.success('Tipografi portal berhasil diperbarui! ✨');
    } catch (err) {
        toast.error('Gagal menyimpan perubahan.');
    } finally {
        setSaving(false);
    }
  };

  if (!localConfig) return (
    <div className="py-24 text-center">
        <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Konfigurasi Font...</p>
    </div>
  );

  const fontStyle = ARABIC_FAMILIES.find(f => f.name === localConfig.fontFamily)?.style;
  const latinStyle = localConfig.latinFontFamily || 'Plus Jakarta Sans';

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
              <Type className="w-3 h-3" /> Tipografi Sistem
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Editor Font</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Atur estetika teks dan keterbacaan di seluruh website.</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="group flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
          {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Selection */}
        <div className="lg:col-span-8 space-y-8">
            {/* Arabic Font Family */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600">
                            <Languages className="w-6 h-6" />
                        </div>
                        Keluarga Font Arab
                    </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ARABIC_FAMILIES.map(font => (
                        <button
                            key={font.name}
                            onClick={() => setLocalConfig({ ...localConfig, fontFamily: font.name })}
                            className={cn(
                                "p-6 rounded-[2rem] border-2 text-right transition-all group relative overflow-hidden",
                                localConfig.fontFamily === font.name 
                                    ? "bg-teal-500 border-teal-500 text-white shadow-xl shadow-teal-500/20 scale-[1.02]" 
                                    : "bg-white dark:bg-black/20 border-slate-100 dark:border-white/5 text-slate-400 hover:border-teal-500/30"
                            )}
                        >
                            <div className="flex flex-row-reverse justify-between items-start mb-4">
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                    localConfig.fontFamily === font.name ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-white/5 text-slate-500"
                                )}>
                                    {font.label}
                                </span>
                                {localConfig.fontFamily === font.name && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <p 
                                className={cn(
                                    "text-3xl dir-rtl arabic-content",
                                    localConfig.fontFamily === font.name ? "text-white" : "text-slate-900 dark:text-white"
                                )}
                                style={{ fontFamily: font.style }}
                            >
                                تَعَلَّمِ الْعَرَبِيَّةَ
                            </p>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Latin Font Family Selection */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
            >
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                        <Type className="w-6 h-6" />
                    </div>
                    Font Alfabet (Latin)
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {LATIN_FAMILIES.map(font => (
                        <button
                            key={font.name}
                            onClick={() => setLocalConfig({ ...localConfig, latinFontFamily: font.name })}
                            className={cn(
                                "p-6 rounded-[2rem] border-2 transition-all group text-center",
                                localConfig.latinFontFamily === font.name 
                                    ? "bg-blue-500 border-blue-500 text-white shadow-xl shadow-blue-500/20 scale-[1.05]" 
                                    : "bg-white dark:bg-black/20 border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-500/30"
                            )}
                            style={{ fontFamily: font.name === 'System Default' ? 'sans-serif' : font.name }}
                        >
                            <p className={cn(
                                "text-2xl font-black mb-1",
                                localConfig.latinFontFamily === font.name ? "text-white" : "text-slate-900 dark:text-white"
                            )}>Aa</p>
                            <p className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                localConfig.latinFontFamily === font.name ? "text-white/80" : "text-slate-500"
                            )}>{font.label}</p>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Font Size Settings */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
            >
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                        <Hash className="w-6 h-6" />
                    </div>
                    Pengaturan Skala Font
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { id: 'titleSize', label: 'Judul Halaman', icon: Type },
                        { id: 'contentSize', label: 'Konten Materi (Arab)', icon: Languages },
                        { id: 'sidebarSize', label: 'Logo Sidebar', icon: Monitor },
                        { id: 'sidebarLinkSize', label: 'Menu Sidebar', icon: ChevronRight },
                        { id: 'indexTopicSize', label: 'Topik Halaman Depan', icon: Sparkles }
                    ].map(field => (
                        <div key={field.id} className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">{field.label}</label>
                            <div className="relative">
                                <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={localConfig[field.id] || 'text-lg'}
                                    onChange={(e) => setLocalConfig({ ...localConfig, [field.id]: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none appearance-none transition-all cursor-pointer"
                                >
                                    {FONT_SIZES.map(size => (
                                        <option key={size.value} value={size.value} className="bg-white dark:bg-slate-900">{size.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>

        {/* Right Column: Dynamic Preview */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-8 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -mr-16 -mt-16"></div>
                
                <h2 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest flex items-center gap-3">
                    <Eye className="w-4 h-4" /> Live Preview
                </h2>
                
                <div className="space-y-8 relative">
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Judul {localConfig.titleSize}</p>
                        <p className={cn(localConfig.titleSize, "text-slate-900 dark:text-white leading-tight")} style={{ fontFamily: fontStyle }}>الدرس الأول</p>
                    </div>
                    
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Konten {localConfig.contentSize}</p>
                        <p className={cn(localConfig.contentSize, "text-slate-900 dark:text-white leading-relaxed dir-rtl arabic-content")} style={{ fontFamily: fontStyle }}>
                            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                        </p>
                    </div>
                    
                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Identity {localConfig.sidebarSize}</p>
                        <p className={cn(localConfig.sidebarSize, "text-slate-900 dark:text-white font-black")} style={{ fontFamily: fontStyle }}>اللغة العربية</p>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Latin Style</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: latinStyle === 'System Default' ? 'sans-serif' : latinStyle }}>
                            The Arabic Language
                        </p>
                    </div>
                </div>

                <div className="pt-4 px-2">
                    <div className="flex items-center gap-3 text-amber-500 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/10">
                        <Sparkles className="w-10 h-10 shrink-0" />
                        <p className="text-[10px] font-bold leading-relaxed">Preview mencerminkan tampilan di berbagai bagian portal secara real-time.</p>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FontEditor;
