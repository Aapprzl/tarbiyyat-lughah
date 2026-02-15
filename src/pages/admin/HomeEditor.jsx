import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { Save, LayoutGrid, Type, MousePointer, Image, Upload, Trash2, Target, Library, Award, Rocket, LineChart, Package, Medal, Hexagon, Layers, Heart, Diamond, ChevronRight, CircleCheckBig, Orbit, Monitor, Info, MapPin, Trophy, BookOpen, Gamepad2 } from 'lucide-react';
import { useNavigate, useBlocker, useBeforeUnload } from 'react-router-dom';
import { useToast, useConfirm } from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

// Helper to render icon by name
const IconPreview = ({ name, className }) => {
    const icons = { 
        BookOpen: BookOpen, 
        Trophy: Trophy, 
        Gamepad2: Gamepad2, 
        Library: Library, 
        Layout: LayoutGrid, 
        Star: Award, 
        Zap: Rocket, 
        Activity: LineChart, 
        Box: Package, 
        Award: Medal, 
        Hexagon: Hexagon, 
        Layers: Layers, 
        Smile: Heart,
        Target: Target,
        Monitor: Monitor,
        Orbit: Orbit
    };
    const Icon = icons[name] || Library;
    return <Icon className={cn("w-6 h-6", className)} />;
};

const HomeEditor = () => {
  const [config, setConfig] = useState({
    heroTitleArabic: '', heroTitleLatin: '', 
    heroDescriptionArabic: '', heroDescriptionLatin: '',
    heroButton1Text: '', heroButton1TextLatin: '', heroButton1Icon: 'BookOpen',
    heroButton2Text: '', heroButton2TextLatin: '', heroButton2Icon: 'Trophy',
    footerText: '', siteTitle: '', siteLogoType: 'icon', siteLogoIcon: 'BookOpen',
    siteLogoUrl: '', sidebarTitle: '', headerTitleSize: 'text-lg', sidebarTitleSize: 'text-xl'
  });
  const [initialConfig, setInitialConfig] = useState(null); // GC Tracking
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const [isDirty, setIsDirty] = useState(false);
  const [pristineState, setPristineState] = useState('');

  // Navigation Guard: Block navigation if dirty
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle Blocker State
  useEffect(() => {
    if (blocker.state === "blocked") {
      const handleBlocked = async () => {
        const ok = await confirm(
          "Anda memiliki perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?",
          "Perubahan Belum Disimpan"
        );
        if (ok) {
          blocker.proceed();
        } else {
          blocker.reset();
        }
      };
      handleBlocked();
    }
  }, [blocker, confirm]);

  // Browser Navigation Guard: Tab close / refresh
  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (isDirty) {
          event.preventDefault();
        }
      },
      [isDirty]
    )
  );

  useEffect(() => {
    const load = async () => {
      try {
        const data = await contentService.getHomeConfig();
        setConfig(data);
        setInitialConfig(data);
        // Capture pristine state
        setPristineState(JSON.stringify(data));
      } catch (err) {
        toast.error("Gagal memuat konfigurasi beranda.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Detect changes relative to pristine state
  useEffect(() => {
    if (!loading && pristineState) {
      const current = JSON.stringify(config);
      setIsDirty(current !== pristineState);
    }
  }, [config, pristineState, loading]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    
    try {
        if (initialConfig && initialConfig.siteLogoUrl && initialConfig.siteLogoUrl !== config.siteLogoUrl) {
            if (initialConfig.siteLogoUrl.includes('firebasestorage')) {
                storageService.deleteFile(initialConfig.siteLogoUrl).catch(e => console.warn(e));
            }
        }
        await contentService.saveHomeConfig(config);
        setInitialConfig(config);
        setPristineState(JSON.stringify(config));
        setIsDirty(false);
        toast.success('Konfigurasi Beranda berhasil diperbarui! ✨');
    } catch (err) {
        toast.error('Gagal menyimpan perubahan.');
    } finally {
        setSaving(false);
    }
  };

  if (loading) return (
    <div className="py-24 text-center">
        <div className="w-12 h-12 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Memuat editor...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editor Beranda</h1>
           <p className="text-sm text-slate-500 mt-1">Sesuaikan identitas dan konten portal</p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Site Identity Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Identitas Website</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Judul Header (Desktop)</label>
                    <input 
                        type="text" 
                        value={config.siteTitle || ''}
                        onChange={(e) => setConfig({...config, siteTitle: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all font-arabic"
                        style={{ fontFamily: 'var(--font-arabic)' }}
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
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
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
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
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
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
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
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-teal-500/30"
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
                                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-teal-500/30"
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
                                        <label className="block border-4 border-dashed border-slate-100 dark:border-slate-700 rounded-[2.5rem] p-10 text-center hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-teal-500/30 transition-all cursor-pointer">
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
                                        <div className="p-10 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700 flex flex-col items-center gap-6">
                                            <img src={config.siteLogoUrl} alt="Logo" loading="lazy" className="h-20 object-contain drop-shadow-xl" />
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
                                    className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-700"
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
                                                        : "bg-white dark:bg-slate-800 border-transparent text-slate-400 hover:border-teal-500/30"
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
        </div>

        {/* --- Hero Section --- */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-600">
                    <Type className="w-5 h-5" />
                </div>
                Hero Section (Konten Utama)
            </h2>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Judul Utama (Arabic)</label>
                    <input 
                        type="text" 
                        value={config.heroTitleArabic}
                        onChange={(e) => setConfig({...config, heroTitleArabic: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-semibold text-right text-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dir-rtl arabic-title"
                        style={{ fontFamily: 'var(--font-arabic)' }}
                        placeholder="تَعَلَّمِ اللُّغَةَ الْعَرَبِيَّةَ"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Sub-Judul (Latin)</label>
                    <input 
                        type="text" 
                        value={config.heroTitleLatin}
                        onChange={(e) => setConfig({...config, heroTitleLatin: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-semibold text-lg focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                        style={{ fontFamily: 'var(--font-latin)' }}
                        placeholder="Belajar Bahasa Arab dengan Mudah"
                    />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-widest">Deskripsi Portal (Arabic)</label>
                        <textarea 
                            value={config.heroDescriptionArabic || ''}
                            onChange={(e) => setConfig({...config, heroDescriptionArabic: e.target.value})}
                            rows="2"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-colors leading-relaxed text-right font-arabic"
                            style={{ fontFamily: 'var(--font-arabic)', direction: 'rtl' }}
                            placeholder="...اكتب الوصف باللغة العربية هنا"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-widest">Deskripsi Portal (Latin)</label>
                        <textarea 
                            value={config.heroDescriptionLatin || ''}
                            onChange={(e) => setConfig({...config, heroDescriptionLatin: e.target.value})}
                            rows="2"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-colors leading-relaxed font-latin"
                            style={{ fontFamily: 'var(--font-latin)' }}
                            placeholder="Tulis deskripsi dalam bahasa Indonesia/Latin di sini..."
                        />
                    </div>
                </div>
                
                
                {/* --- Hero Buttons Management --- */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-8">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Manajemen Tombol Hero</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Button 1 */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white">
                                    <span className="font-bold text-xs text-black">1</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tombol Utama (Kiri)</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teks Tombol (Arabic)</label>
                                    <input 
                                        type="text" 
                                        value={config.heroButton1Text || ''}
                                        onChange={(e) => setConfig({...config, heroButton1Text: e.target.value})}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-right outline-none focus:ring-2 focus:ring-teal-500 font-arabic"
                                        style={{ fontFamily: 'var(--font-arabic)' }}
                                        placeholder="ابدأ Sekarang"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teks Tombol (Latin)</label>
                                    <input 
                                        type="text" 
                                        value={config.heroButton1TextLatin || ''}
                                        onChange={(e) => setConfig({...config, heroButton1TextLatin: e.target.value})}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-teal-500 font-latin"
                                        style={{ fontFamily: 'var(--font-latin)' }}
                                        placeholder="Start Now"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pilih Ikon</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {['BookOpen', 'Library', 'Star', 'Zap', 'Activity', 'Target'].map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setConfig({...config, heroButton1Icon: iconName})}
                                            className={cn(
                                                "aspect-square rounded-xl flex items-center justify-center transition-all border-2",
                                                config.heroButton1Icon === iconName 
                                                    ? "bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-500/20" 
                                                    : "bg-white dark:bg-slate-800 border-transparent text-slate-400 hover:border-teal-500/30"
                                            )}
                                        >
                                            <IconPreview name={iconName} className={config.heroButton1Icon === iconName ? "text-white w-5 h-5" : "text-slate-400 w-5 h-5"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Button 2 */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white">
                                    <span className="font-bold text-xs text-black">2</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Tombol Sekunder (Kanan)</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teks Tombol (Arabic)</label>
                                    <input 
                                        type="text" 
                                        value={config.heroButton2Text || ''}
                                        onChange={(e) => setConfig({...config, heroButton2Text: e.target.value})}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold text-right outline-none focus:ring-2 focus:ring-rose-500 font-arabic"
                                        style={{ fontFamily: 'var(--font-arabic)' }}
                                        placeholder="ادخل ساحة الألعاب"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Teks Tombol (Latin)</label>
                                    <input 
                                        type="text" 
                                        value={config.heroButton2TextLatin || ''}
                                        onChange={(e) => setConfig({...config, heroButton2TextLatin: e.target.value})}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-bold outline-none focus:ring-2 focus:ring-rose-500 font-latin"
                                        style={{ fontFamily: 'var(--font-latin)' }}
                                        placeholder="Game Arena"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Pilih Ikon</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {['Trophy', 'Gamepad2', 'Orbit', 'Monitor', 'Hexagon', 'Smile'].map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setConfig({...config, heroButton2Icon: iconName})}
                                            className={cn(
                                                "aspect-square rounded-xl flex items-center justify-center transition-all border-2",
                                                config.heroButton2Icon === iconName 
                                                    ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20" 
                                                    : "bg-white dark:bg-slate-800 border-transparent text-slate-400 hover:border-rose-500/30"
                                            )}
                                        >
                                            <IconPreview name={iconName} className={config.heroButton2Icon === iconName ? "text-white w-5 h-5" : "text-slate-400 w-5 h-5"} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- Branding & Footer --- */}
        {/* --- Vision Section --- */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                <Info className="w-5 h-5 text-teal-600" />
                Visi & Misi
            </h2>
            
            <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Judul Seksi</label>
                    <input 
                      type="text" 
                      value={config.visionTitle || ''}
                      onChange={(e) => setConfig({...config, visionTitle: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                      placeholder="Visi Tarbiyyat Al-Lughah"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Deskripsi Utama</label>
                    <textarea 
                        value={config.visionDesc || ''}
                        onChange={(e) => setConfig({...config, visionDesc: e.target.value})}
                        rows="3"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-colors leading-relaxed"
                        placeholder="Deskripsi visi..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Step 1</label>
                        <input
                            type="text"
                            value={config.visionStep1Title || ''}
                            onChange={(e) => setConfig({...config, visionStep1Title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium outline-none transition-colors mb-2"
                            placeholder="Judul Step 1"
                        />
                        <textarea
                            value={config.visionStep1Desc || ''}
                            onChange={(e) => setConfig({...config, visionStep1Desc: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-xs outline-none transition-colors h-24 resize-none"
                            placeholder="Deskripsi Step 1"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Step 2</label>
                        <input
                            type="text"
                            value={config.visionStep2Title || ''}
                            onChange={(e) => setConfig({...config, visionStep2Title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium outline-none transition-colors mb-2"
                            placeholder="Judul Step 2"
                        />
                         <textarea
                            value={config.visionStep2Desc || ''}
                            onChange={(e) => setConfig({...config, visionStep2Desc: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-xs outline-none transition-colors h-24 resize-none"
                            placeholder="Deskripsi Step 2"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Step 3</label>
                        <input
                            type="text"
                            value={config.visionStep3Title || ''}
                            onChange={(e) => setConfig({...config, visionStep3Title: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium outline-none transition-colors mb-2"
                            placeholder="Judul Step 3"
                        />
                        <textarea
                            value={config.visionStep3Desc || ''}
                            onChange={(e) => setConfig({...config, visionStep3Desc: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-xs outline-none transition-colors h-24 resize-none"
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
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
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
                                className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold outline-none"
                                placeholder="Developer"
                            />
                            <input
                                type="text"
                                value={config.devCampus || ''}
                                onChange={(e) => setConfig({...config, devCampus: e.target.value})}
                                className="w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 text-sm font-bold outline-none"
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
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                            placeholder="Skripsi Original Project"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* --- Footer & Contact --- */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                <MapPin className="w-5 h-5 text-purple-600" />
                Informasi Kontak & Footer
            </h2>
            
            <div className="space-y-4">
                {/* General Footer Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Nama Brand (Footer)</label>
                        <input 
                          type="text" 
                          value={config.programsSectionTitle || 'Tarbiyyat al-Lughah'}
                          onChange={(e) => setConfig({...config, programsSectionTitle: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Teks Pojok Kanan Bawah</label>
                        <input 
                          type="text" 
                          value={config.footerRightText || 'PBA IAIN Bone'}
                          onChange={(e) => setConfig({...config, footerRightText: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">Teks Hak Cipta (Footer)</label>
                    <input 
                        type="text" 
                        value={config.footerText}
                        onChange={(e) => setConfig({...config, footerText: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-teal-500 outline-none transition-colors"
                        placeholder="© 2024 Bahasa Arab Praktis"
                    />
                </div>

                {/* Development Stack Configuration */}
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl space-y-6 border border-slate-100 dark:border-slate-700">
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
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Sub-Judul 1 (Tools)</label>
                            <input 
                                type="text" 
                                value={config.footerToolsTitle || 'Tools & Editors'}
                                onChange={(e) => setConfig({...config, footerToolsTitle: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none mb-2"
                            />
                            <textarea
                                value={config.footerToolsList || 'VS Code • Google Antigravity • Sublime Text'}
                                onChange={(e) => setConfig({...config, footerToolsList: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium outline-none h-20 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Sub-Judul 2 (Backend)</label>
                             <input 
                                type="text" 
                                value={config.footerBackendTitle || 'Backend & Infrastructure'}
                                onChange={(e) => setConfig({...config, footerBackendTitle: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none mb-2"
                            />
                            <textarea
                                value={config.footerBackendList || 'Supabase • PostgreSQL • Vercel • Node.js'}
                                onChange={(e) => setConfig({...config, footerBackendList: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium outline-none h-20 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Sub-Judul 3 (AI)</label>
                             <input 
                                type="text" 
                                value={config.footerAiTitle || 'Powered by AI Technology'}
                                onChange={(e) => setConfig({...config, footerAiTitle: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold outline-none mb-2"
                            />
                            <textarea
                                value={config.footerAiList || 'ChatGPT • Gemini • GitHub Copilot'}
                                onChange={(e) => setConfig({...config, footerAiList: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-medium outline-none h-20 resize-none"
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
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        />
                    </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Email</label>
                        <input
                            type="text"
                            value={config.contactEmail || ''}
                            onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        />
                    </div>
                     <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Alamat</label>
                        <input
                            type="text"
                            value={config.contactAddress || ''}
                            onChange={(e) => setConfig({...config, contactAddress: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
};

export default HomeEditor;
