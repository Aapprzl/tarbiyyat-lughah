import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { Save, Layout, Type, MousePointer, Image, Upload, Trash2, Target, BookOpen, Star, Zap, Activity, Box, Award, Hexagon, Layers, Smile, Sparkles, ChevronRight, CheckCircle, Globe, Monitor } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

// Helper to render icon by name
const IconPreview = ({ name, className }) => {
    const icons = { BookOpen, Layout, Star, Zap, Activity, Box, Award, Hexagon, Layers, Smile };
    const Icon = icons[name] || BookOpen;
    return <Icon className={cn("w-6 h-6", className)} />;
};

const HomeEditor = () => {
  const [config, setConfig] = useState({
    heroTitleArabic: '', heroTitleLatin: '', heroDescription: '', heroButtonText: '',
    footerText: '', siteTitle: '', siteLogoType: 'icon', siteLogoIcon: 'BookOpen',
    siteLogoUrl: '', sidebarTitle: '', headerTitleSize: 'text-lg', sidebarTitleSize: 'text-xl'
  });
  const [initialConfig, setInitialConfig] = useState(null); // GC Tracking
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await contentService.getHomeConfig();
        setConfig(data);
        setInitialConfig(data);
      } catch (err) {
        toast.error("Gagal memuat konfigurasi beranda.");
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
        if (initialConfig && initialConfig.siteLogoUrl && initialConfig.siteLogoUrl !== config.siteLogoUrl) {
            if (initialConfig.siteLogoUrl.includes('firebasestorage')) {
                storageService.deleteFile(initialConfig.siteLogoUrl).catch(e => console.warn(e));
            }
        }
        await contentService.saveHomeConfig(config);
        setInitialConfig(config);
        toast.success('Konfigurasi Beranda berhasil diperbarui! ✨');
    } catch (err) {
        toast.error('Gagal menyimpan perubahan.');
    } finally {
        setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-24 text-center">
        <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Editor Beranda...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
              <Monitor className="w-3 h-3" /> Manajemen Tampilan
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Editor Beranda</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Sesuaikan identitas dan konten utama portal Anda.</p>
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
        {/* --- Site Identity Section --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
        >
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <Globe className="w-6 h-6" />
                </div>
                Identitas Website
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Judul Header (Desktop)</label>
                    <input 
                        type="text" 
                        value={config.siteTitle || ''}
                        onChange={(e) => setConfig({...config, siteTitle: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                        placeholder="Bahasa Arab Praktis"
                    />
                    <div className="flex items-center gap-3 px-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran:</span>
                        <div className="flex gap-1">
                            {['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setConfig({...config, headerTitleSize: size})}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                                        config.headerTitleSize === size 
                                            ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" 
                                            : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {size.split('-')[1].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Judul Sidebar (Mobile/Admin)</label>
                    <input 
                        type="text" 
                        value={config.sidebarTitle || ''}
                        onChange={(e) => setConfig({...config, sidebarTitle: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all text-right font-arabic"
                        placeholder="اللغة العربية"
                    />
                    <div className="flex items-center gap-3 px-4 justify-end">
                        <div className="flex gap-1">
                            {['text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setConfig({...config, sidebarTitleSize: size})}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                                        config.sidebarTitleSize === size 
                                            ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" 
                                            : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {size.split('-')[1].toUpperCase()}
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran:</span>
                    </div>
                </div>
            </div>

            <div className="pt-6 space-y-8">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Konfigurasi Logo</label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    <div className="md:col-span-4 flex flex-col gap-3">
                         <button
                                type="button" 
                                onClick={() => setConfig({...config, siteLogoType: 'icon'})}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                                    config.siteLogoType === 'icon' 
                                        ? "bg-teal-500 border-teal-500 text-white shadow-xl shadow-teal-500/20" 
                                        : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-teal-500/30"
                                )}
                         >
                            <div className="flex items-center gap-3">
                                <Star className={cn("w-5 h-5", config.siteLogoType === 'icon' ? "text-white" : "text-slate-400 group-hover:text-teal-500")} />
                                <span className="text-xs font-black uppercase tracking-widest">Gunakan Ikon</span>
                            </div>
                            {config.siteLogoType === 'icon' && <CheckCircle className="w-4 h-4" />}
                         </button>
                         <button
                                type="button" 
                                onClick={() => setConfig({...config, siteLogoType: 'image'})}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                                    config.siteLogoType === 'image' 
                                        ? "bg-teal-500 border-teal-500 text-white shadow-xl shadow-teal-500/20" 
                                        : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-teal-500/30"
                                )}
                         >
                            <div className="flex items-center gap-3">
                                <Image className={cn("w-5 h-5", config.siteLogoType === 'image' ? "text-white" : "text-slate-400 group-hover:text-teal-500")} />
                                <span className="text-xs font-black uppercase tracking-widest">Upload Gambar</span>
                            </div>
                            {config.siteLogoType === 'image' && <CheckCircle className="w-4 h-4" />}
                         </button>
                    </div>

                    <div className="md:col-span-8">
                        <AnimatePresence mode="wait">
                            {config.siteLogoType === 'image' ? (
                                <motion.div 
                                    key="image-upload"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="relative group"
                                >
                                    {!config.siteLogoUrl ? (
                                        <label className="block border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[2.5rem] p-10 text-center hover:bg-slate-50 dark:hover:bg-white/5 hover:border-teal-500/30 transition-all cursor-pointer">
                                            <input 
                                                type="file" accept="image/*" disabled={saving} className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        try {
                                                            setSaving(true);
                                                            const url = await storageService.uploadFile(file, 'identity');
                                                            setConfig(prev => ({...prev, siteLogoUrl: url}));
                                                            toast.success('Logo berhasil diunggah!');
                                                        } catch (err) { toast.error('Gagal upload gambar.'); } 
                                                        finally { setSaving(false); }
                                                    }
                                                }}
                                            />
                                            <Upload className="w-10 h-10 mx-auto text-slate-200 mb-3 group-hover:scale-110 transition-transform" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Link Gambar Logo (PNG/JPG)</p>
                                        </label>
                                    ) : (
                                        <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 flex flex-col items-center gap-6">
                                            <img src={config.siteLogoUrl} alt="Logo" className="h-20 object-contain drop-shadow-xl" />
                                            <button 
                                                type="button" onClick={() => setConfig({...config, siteLogoUrl: ''})}
                                                className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                            >
                                                <Trash2 className="w-4 h-4" /> Hapus Logo
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="icon-picker"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10"
                                >
                                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                                        {['BookOpen', 'Layout', 'Star', 'Zap', 'Activity', 'Box', 'Award', 'Hexagon', 'Layers', 'Smile'].map(iconName => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setConfig({...config, siteLogoIcon: iconName})}
                                                className={cn(
                                                    "aspect-square rounded-2xl flex items-center justify-center transition-all border-2",
                                                    config.siteLogoIcon === iconName 
                                                        ? "bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20 scale-110" 
                                                        : "bg-white dark:bg-black/20 border-transparent text-slate-400 hover:border-teal-500/30"
                                                )}
                                                title={iconName}
                                            >
                                                <IconPreview name={iconName} className={config.siteLogoIcon === iconName ? "text-white" : "text-slate-400"} />
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">Pilih ikon Lucide yang mewakili identitas portal Anda.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* --- Hero Section --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
        >
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600">
                    <Type className="w-6 h-6" />
                </div>
                Hero Section (Konten Utama)
            </h2>
            
            <div className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Judul Utama (Arabic)</label>
                    <input 
                        type="text" 
                        value={config.heroTitleArabic}
                        onChange={(e) => setConfig({...config, heroTitleArabic: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-8 py-5 text-slate-900 dark:text-white font-black text-2xl focus:ring-2 focus:ring-teal-500 shadow-sm outline-none text-right font-arabic"
                        placeholder="Contoh: تَعَلَّمِ اللُّغَةَ الْعَرَبِيَّةَ"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Sub-Judul (Latin)</label>
                    <input 
                        type="text" 
                        value={config.heroTitleLatin}
                        onChange={(e) => setConfig({...config, heroTitleLatin: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-8 py-5 text-slate-900 dark:text-white font-black text-xl focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        placeholder="Belajar Bahasa Arab dengan Mudah"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Deskripsi Portal</label>
                    <textarea 
                        value={config.heroDescription}
                        onChange={(e) => setConfig({...config, heroDescription: e.target.value})}
                        rows="3"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2.5rem] px-8 py-6 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 shadow-sm outline-none leading-relaxed"
                        placeholder="Jelaskan secara singkat tentang website Anda..."
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-white/5">
                   <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Tombol Utama (CTA)</label>
                        <div className="relative">
                           <MousePointer className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                           <input 
                             type="text" 
                             value={config.heroButtonText}
                             onChange={(e) => setConfig({...config, heroButtonText: e.target.value})}
                             className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                             placeholder="Mulai Belajar"
                           />
                        </div>
                   </div>
                   <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Tombol Sekunder</label>
                        <input 
                          type="text" 
                          value={config.heroButtonSecondaryText || 'Tentang Kami'}
                          onChange={(e) => setConfig({...config, heroButtonSecondaryText: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                          placeholder="Tentang Kami"
                        />
                   </div>
                </div>
            </div>
        </motion.div>

        {/* --- Branding & Footer --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
        >
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                    <Sparkles className="w-6 h-6" />
                </div>
                Informasi Pelengkap
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Judul Seksi Program</label>
                    <input 
                      type="text" 
                      value={config.programsSectionTitle || 'Program Unggulan'}
                      onChange={(e) => setConfig({...config, programsSectionTitle: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Teks Hak Cipta (Footer)</label>
                    <input 
                        type="text" 
                        value={config.footerText}
                        onChange={(e) => setConfig({...config, footerText: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        placeholder="© 2024 Bahasa Arab Praktis"
                    />
                </div>
            </div>
        </motion.div>
      </form>
    </div>
  );
};

export default HomeEditor;
