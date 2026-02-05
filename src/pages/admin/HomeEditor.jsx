import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { Save, LayoutGrid, Type, MousePointer, Image, Upload, Trash2, Target, Library, Award, Rocket, LineChart, Package, Medal, Hexagon, Layers, Heart, Diamond, ChevronRight, CircleCheckBig, Orbit, Monitor, Info, MapPin } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

// Helper to render icon by name
const IconPreview = ({ name, className }) => {
    const icons = { BookOpen: Library, Layout: LayoutGrid, Star: Award, Zap: Rocket, Activity: LineChart, Box: Package, Award: Medal, Hexagon, Layers, Smile: Heart };
    const Icon = icons[name] || Library;
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
                    <Orbit className="w-6 h-6" />
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
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all font-arabic"
                        placeholder="Bahasa Arab Praktis"
                    />
                    <div className="flex flex-wrap items-center gap-3 px-2 md:px-4 justify-between sm:justify-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ukuran:</span>
                        <div className="flex flex-wrap gap-1">
                            {['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setConfig({...config, headerTitleSize: size})}
                                    className={cn(
                                        "px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all",
                                        config.headerTitleSize === size 
                                            ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" 
                                            : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {size === 'text-xs' ? 'XS' : size.split('-')[1].toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Sub-Judul Header (Juga Judul Sidebar)</label>
                    <input 
                        type="text" 
                        value={config.sidebarTitle || ''}
                        onChange={(e) => setConfig({...config, sidebarTitle: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                        style={{ fontFamily: 'var(--font-latin)' }}
                        placeholder="Platform Pembelajaran Modern"
                    />
                    <div className="flex flex-wrap items-center gap-3 px-2 md:px-4 justify-between sm:justify-end">
                        <div className="flex flex-wrap gap-1">
                            {['text-[10px]', 'text-xs', 'text-sm', 'text-base', 'text-lg'].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setConfig({...config, sidebarTitleSize: size})}
                                    className={cn(
                                        "px-2 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all",
                                        config.sidebarTitleSize === size 
                                            ? "bg-teal-500 text-white shadow-md shadow-teal-500/20" 
                                            : "bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {size === 'text-[10px]' ? 'MINI' : size.split('-')[1].toUpperCase()}
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
                                <Award className={cn("w-5 h-5", config.siteLogoType === 'icon' ? "text-white" : "text-slate-400 group-hover:text-teal-500")} />
                                <span className="text-xs font-black uppercase tracking-widest">Gunakan Ikon</span>
                            </div>
                            {config.siteLogoType === 'icon' && <CircleCheckBig className="w-4 h-4" />}
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
                            {config.siteLogoType === 'image' && <CircleCheckBig className="w-4 h-4" />}
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
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-black text-right text-2xl focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all dir-rtl font-arabic"
                        placeholder="تَعَلَّمِ اللُّغَةَ الْعَرَبِيَّةَ"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Sub-Judul (Latin)</label>
                    <input 
                        type="text" 
                        value={config.heroTitleLatin}
                        onChange={(e) => setConfig({...config, heroTitleLatin: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-8 py-5 text-slate-900 dark:text-white font-black text-xl focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        style={{ fontFamily: 'var(--font-latin)' }}
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
                        style={{ fontFamily: 'var(--font-latin)' }}
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
        {/* --- Vision Section --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
        >
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600">
                    <Info className="w-6 h-6" />
                </div>
                Visi & Misi
            </h2>
            
            <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Judul Seksi</label>
                    <input 
                      type="text" 
                      value={config.visionTitle || ''}
                      onChange={(e) => setConfig({...config, visionTitle: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                      placeholder="Visi Tarbiyyat Al-Lughah"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Deskripsi Utama</label>
                    <textarea 
                        value={config.visionDesc || ''}
                        onChange={(e) => setConfig({...config, visionDesc: e.target.value})}
                        rows="3"
                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2.5rem] px-8 py-6 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 shadow-sm outline-none leading-relaxed"
                        placeholder="Deskripsi visi..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Step 1</label>
                        <input
                            type="text"
                            value={config.visionStep1Title || ''}
                            onChange={(e) => setConfig({...config, visionStep1Title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none mb-2"
                            placeholder="Judul Step 1"
                        />
                        <textarea
                            value={config.visionStep1Desc || ''}
                            onChange={(e) => setConfig({...config, visionStep1Desc: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs outline-none h-24 resize-none"
                            placeholder="Deskripsi Step 1"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Step 2</label>
                        <input
                            type="text"
                            value={config.visionStep2Title || ''}
                            onChange={(e) => setConfig({...config, visionStep2Title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none mb-2"
                            placeholder="Judul Step 2"
                        />
                         <textarea
                            value={config.visionStep2Desc || ''}
                            onChange={(e) => setConfig({...config, visionStep2Desc: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs outline-none h-24 resize-none"
                            placeholder="Deskripsi Step 2"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Step 3</label>
                        <input
                            type="text"
                            value={config.visionStep3Title || ''}
                            onChange={(e) => setConfig({...config, visionStep3Title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-sm font-bold outline-none mb-2"
                            placeholder="Judul Step 3"
                        />
                        <textarea
                            value={config.visionStep3Desc || ''}
                            onChange={(e) => setConfig({...config, visionStep3Desc: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 text-xs outline-none h-24 resize-none"
                            placeholder="Deskripsi Step 3"
                        />
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Developer Name</label>
                        <input
                            type="text"
                            value={config.devName || ''}
                            onChange={(e) => setConfig({...config, devName: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                            placeholder="Muh. Aprizal"
                        />
                    </div>
                    <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Role & Campus</label>
                         <div className="flex gap-2">
                            <input
                                type="text"
                                value={config.devRole || ''}
                                onChange={(e) => setConfig({...config, devRole: e.target.value})}
                                className="w-1/2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none"
                                placeholder="Developer"
                            />
                            <input
                                type="text"
                                value={config.devCampus || ''}
                                onChange={(e) => setConfig({...config, devCampus: e.target.value})}
                                className="w-1/2 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-4 text-sm font-bold outline-none"
                                placeholder="PBA IAIN BONE"
                            />
                         </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                         <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Badge Text Override</label>
                         <input
                            type="text"
                            value={config.visionBadgeText || 'Skripsi Original Project'}
                            onChange={(e) => setConfig({...config, visionBadgeText: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                            placeholder="Skripsi Original Project"
                        />
                    </div>
                </div>
            </div>
        </motion.div>

        {/* --- Footer & Contact --- */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
        >
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                    <MapPin className="w-6 h-6" />
                </div>
                Informasi Kontak & Footer
            </h2>
            
            <div className="space-y-8">
                {/* General Footer Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Teks Pojok Kanan Bawah</label>
                        <input 
                          type="text" 
                          value={config.footerRightText || 'PBA IAIN Bone'}
                          onChange={(e) => setConfig({...config, footerRightText: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        />
                    </div>
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

                {/* Development Stack Configuration */}
                <div className="bg-slate-50 dark:bg-black/20 p-6 rounded-3xl space-y-6 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600">
                            <Layers className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Konfigurasi Development Stack</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Judul Kolom</label>
                        <input 
                            type="text" 
                            value={config.footerStackTitle || 'Development Stack'}
                            onChange={(e) => setConfig({...config, footerStackTitle: e.target.value})}
                            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Sub-Judul 1 (Tools)</label>
                            <input 
                                type="text" 
                                value={config.footerToolsTitle || 'Tools & Editors'}
                                onChange={(e) => setConfig({...config, footerToolsTitle: e.target.value})}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none mb-2"
                            />
                            <textarea
                                value={config.footerToolsList || 'VS Code • Google Antigravity • Sublime Text'}
                                onChange={(e) => setConfig({...config, footerToolsList: e.target.value})}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-medium outline-none h-20 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Sub-Judul 2 (Backend)</label>
                             <input 
                                type="text" 
                                value={config.footerBackendTitle || 'Backend & Infrastructure'}
                                onChange={(e) => setConfig({...config, footerBackendTitle: e.target.value})}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none mb-2"
                            />
                            <textarea
                                value={config.footerBackendList || 'Firebase Backend • Google Cloud Console • Git • Node.js'}
                                onChange={(e) => setConfig({...config, footerBackendList: e.target.value})}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-medium outline-none h-20 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Sub-Judul 3 (AI)</label>
                             <input 
                                type="text" 
                                value={config.footerAiTitle || 'Powered by AI Technology'}
                                onChange={(e) => setConfig({...config, footerAiTitle: e.target.value})}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none mb-2"
                            />
                            <textarea
                                value={config.footerAiList || 'ChatGPT • Gemini • GitHub Copilot'}
                                onChange={(e) => setConfig({...config, footerAiList: e.target.value})}
                                className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-medium outline-none h-20 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Nomor WhatsApp</label>
                        <input
                            type="text"
                            value={config.contactPhone || ''}
                            onChange={(e) => setConfig({...config, contactPhone: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        />
                    </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Email</label>
                        <input
                            type="text"
                            value={config.contactEmail || ''}
                            onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        />
                    </div>
                     <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Alamat</label>
                        <input
                            type="text"
                            value={config.contactAddress || ''}
                            onChange={(e) => setConfig({...config, contactAddress: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
      </form>
    </div>
  );
};

export default HomeEditor;
