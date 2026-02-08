import React, { useEffect, useState } from 'react';
import { Type, Save, Eye, Sparkles, CircleCheckBig, ChevronRight, Monitor, Languages, Hash, Diamond } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { useFont } from '../../components/providers/FontProvider';
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
  { value: 'text-xs', label: 'Ekstra Kecil (12px)' },
  { value: 'text-sm', label: 'Kecil (14px)' },
  { value: 'text-base', label: 'Standar (16px)' },
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
        <div className="w-12 h-12 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Memuat konfigurasi...</p>
    </div>
  );

  const fontStyle = ARABIC_FAMILIES.find(f => f.name === localConfig.fontFamily)?.style;
  const latinStyle = localConfig.latinFontFamily || 'Plus Jakarta Sans';

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Editor Font</h1>
           <p className="text-sm text-slate-500 mt-1">Atur tipografi website</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selection */}
        <div className="lg:col-span-8 space-y-6">
            {/* Arabic Font Family */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center text-teal-600">
                        <Languages className="w-5 h-5" />
                    </div>
                    Font Arab (Arabic)
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ARABIC_FAMILIES.map(font => (
                        <button
                            key={font.name}
                            onClick={() => setLocalConfig({ ...localConfig, fontFamily: font.name })}
                            className={cn(
                                "p-4 rounded-lg border-2 text-right transition-colors group relative overflow-hidden",
                                localConfig.fontFamily === font.name 
                                    ? "bg-teal-500 border-teal-500 text-white" 
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-teal-500/50"
                            )}
                        >
                            <div className="flex flex-row-reverse justify-between items-start mb-3">
                                <span className={cn(
                                    "text-xs font-medium px-2 py-1 rounded-md",
                                    localConfig.fontFamily === font.name ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                )}>
                                    {font.label}
                                </span>
                                {localConfig.fontFamily === font.name && <CircleCheckBig className="w-4 h-4 text-white" />}
                            </div>
                            <p 
                                className={cn(
                                    "text-2xl dir-rtl arabic-content",
                                    localConfig.fontFamily === font.name ? "text-white" : "text-slate-900 dark:text-white"
                                )}
                                style={{ fontFamily: font.style }}
                            >
                                تَعَلَّمِ الْعَرَبِيَّةَ
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Latin Font Family Selection */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <Type className="w-5 h-5 text-blue-600" />
                    Font Alfabet (Latin)
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {LATIN_FAMILIES.map(font => (
                        <button
                            key={font.name}
                            onClick={() => setLocalConfig({ ...localConfig, latinFontFamily: font.name })}
                            className={cn(
                                "p-4 rounded-lg border-2 transition-colors text-center",
                                localConfig.latinFontFamily === font.name 
                                    ? "bg-blue-500 border-blue-500 text-white" 
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-500/50"
                            )}
                            style={{ fontFamily: font.name === 'System Default' ? 'sans-serif' : font.name }}
                        >
                            <p className={cn(
                                "text-xl font-semibold mb-1",
                                localConfig.latinFontFamily === font.name ? "text-white" : "text-slate-900 dark:text-white"
                            )}>Aa</p>
                            <p className={cn(
                                "text-xs font-medium",
                                localConfig.latinFontFamily === font.name ? "text-white/80" : "text-slate-500"
                            )}>{font.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Font Size Settings */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <Hash className="w-5 h-5 text-purple-600" />
                    Pengaturan Skala Font
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: 'titleSize', label: 'Judul Halaman (Page Title)', icon: Type, options: FONT_SIZES },
                        { id: 'contentSize', label: 'Konten Materi (Arabic)', icon: Languages, options: FONT_SIZES },
                        { id: 'sidebarSize', label: 'Logo Sidebar (Admin)', icon: Monitor, options: FONT_SIZES },
                        { id: 'sidebarLinkSize', label: 'Menu Navigasi (Mobile/Admin)', icon: ChevronRight, options: FONT_SIZES },
                        { id: 'indexTopicSize', label: 'Topik Halaman Depan', icon: Sparkles, options: FONT_SIZES },
                        { 
                            id: 'mobileNavScale', 
                            label: 'Skala Menu Mobile (Bottom Bar)', 
                            icon: Monitor,
                            options: [
                                { value: '0.6', label: 'Compact (60%)' },
                                { value: '0.7', label: 'Kecil (70%)' },
                                { value: '0.75', label: 'Sedang (75%)' },
                                { value: '0.8', label: 'Proporsional (80%) [Default]' },
                                { value: '0.9', label: 'Besar (90%)' },
                                { value: '1.0', label: 'Penuh (100%)' }
                            ]
                        }
                    ].map(field => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">{field.label}</label>
                            <div className="relative">
                                <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={localConfig[field.id] || (field.id === 'mobileNavScale' ? '0.8' : 'text-lg')}
                                    onChange={(e) => setLocalConfig({ ...localConfig, [field.id]: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 outline-none appearance-none transition-colors cursor-pointer"
                                >
                                    {field.options.map(size => (
                                        <option key={size.value} value={size.value} className="bg-white dark:bg-slate-900">{size.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Dynamic Preview */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
            <div 
                className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 space-y-6 relative"
                style={{ fontFamily: latinStyle === 'System Default' ? 'sans-serif' : latinStyle }}
            >
                <h2 className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Live Preview
                </h2>
                
                <div className="space-y-4 relative">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Judul {localConfig.titleSize}</p>
                        <p className={cn(localConfig.titleSize, "text-slate-900 dark:text-white leading-tight")} style={{ fontFamily: fontStyle }}>الدرس الأول</p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Konten {localConfig.contentSize}</p>
                        <p className={cn(localConfig.contentSize, "text-slate-900 dark:text-white leading-relaxed dir-rtl arabic-content")} style={{ fontFamily: fontStyle }}>
                           التَّرْبِيَّةُ اللُّغَوِيَّةُ
                        </p>
                    </div>
                    
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Navigasi {localConfig.sidebarLinkSize}</p>
                        <p className={cn(localConfig.sidebarLinkSize, "text-slate-900 dark:text-white text-center")} style={{ fontFamily: latinStyle === 'System Default' ? 'sans-serif' : latinStyle }}>
                           Beranda &nbsp; Materi &nbsp; Profil
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Latin Style</p>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white" style={{ fontFamily: latinStyle === 'System Default' ? 'sans-serif' : latinStyle }}>
                            Tarbiyyat Al-Lughah
                        </p>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-200 dark:border-amber-500/20">
                        <Diamond className="w-8 h-8 shrink-0" />
                        <p className="text-xs font-medium leading-relaxed">Preview mencerminkan tampilan di berbagai bagian portal secara real-time.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FontEditor;
