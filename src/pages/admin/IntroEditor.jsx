import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Save, 
  Plus, 
  Trash2, 
  Type, 
  Settings2, 
  Eye, 
  EyeOff,
  LayoutGrid,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { contentService } from '../../services/contentService';
import { useToast } from '../../components/Toast';
import { cn } from '../../utils/cn';

const IntroEditor = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    intro_active: true,
    intro_title_ar: '',
    intro_title_en: '',
    intro_typing_texts: [],
    intro_button_text: ''
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await contentService.getIntroConfig();
        setConfig(data);
      } catch (err) {
        error('Gagal memuat konfigurasi intro');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await contentService.saveIntroConfig(config);
      success('Konfigurasi Intro berhasil disimpan!');
    } catch (err) {
      error('Gagal menyimpan konfigurasi');
    } finally {
      setSaving(false);
    }
  };

  const addTypingLine = () => {
    setConfig(prev => ({
      ...prev,
      intro_typing_texts: [...prev.intro_typing_texts, 'Kalimat baru...']
    }));
  };

  const removeTypingLine = (index) => {
    const newTexts = config.intro_typing_texts.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, intro_typing_texts: newTexts }));
  };

  const updateTypingLine = (index, value) => {
    const newTexts = [...config.intro_typing_texts];
    newTexts[index] = value;
    setConfig(prev => ({ ...prev, intro_typing_texts: newTexts }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-teal-500/10 rounded-2xl">
            <Monitor className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Manajemen Intro</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Sesuaikan tampilan awal website Anda</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Basic Settings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Toggle */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-teal-500" />
                <h2 className="font-bold text-slate-800 dark:text-white">Status Intro</h2>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, intro_active: !prev.intro_active }))}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs uppercase tracking-widest",
                  config.intro_active 
                    ? "bg-teal-500/10 border-teal-500/50 text-teal-600" 
                    : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-white/5 dark:border-white/10"
                )}
              >
                {config.intro_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {config.intro_active ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Arab</label>
                  <input 
                    type="text"
                    value={config.intro_title_ar}
                    onChange={(e) => setConfig(prev => ({ ...prev, intro_title_ar: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl text-xl font-bold text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Judul Latin</label>
                  <input 
                    type="text"
                    value={config.intro_title_en}
                    onChange={(e) => setConfig(prev => ({ ...prev, intro_title_en: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl font-bold"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teks Tombol</label>
                <input 
                  type="text"
                  value={config.intro_button_text}
                  onChange={(e) => setConfig(prev => ({ ...prev, intro_button_text: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 rounded-2xl font-bold"
                />
              </div>
            </div>
          </div>

          {/* Typing Animation Sections */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-teal-500" />
                  <h2 className="font-bold text-slate-800 dark:text-white">Animasi Mengetik</h2>
                </div>
                <button 
                  onClick={addTypingLine}
                  className="p-2 bg-teal-500/10 text-teal-600 rounded-lg hover:bg-teal-500/20 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
             </div>

             <div className="space-y-4">
                {config.intro_typing_texts.map((text, idx) => (
                  <motion.div 
                    layout
                    key={idx} 
                    className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 group"
                  >
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 font-bold text-teal-500 text-xs bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                      {idx + 1}
                    </div>
                    <input 
                      type="text"
                      value={text}
                      onChange={(e) => updateTypingLine(idx, e.target.value)}
                      className="flex-1 bg-transparent border-none p-2 font-medium focus:ring-0"
                    />
                    <button 
                      onClick={() => removeTypingLine(idx)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                
                {config.intro_typing_texts.length === 0 && (
                   <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl">
                      <p className="text-slate-400 text-sm">Belum ada kalimat animasi</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Info & Preview Panel */}
        <div className="space-y-8">
           <div className="bg-teal-600 text-white p-8 rounded-[2.5rem] shadow-xl shadow-teal-600/20">
              <Sparkles className="w-8 h-8 mb-4 opacity-50" />
              <h3 className="text-lg font-black mb-2 leading-tight">Optimasi Intro</h3>
              <p className="text-teal-100 text-sm leading-relaxed mb-6">
                 Intro yang menarik memberikan kesan pertama yang profesional bagi pengunjung website Anda.
              </p>
              <div className="space-y-4 p-4 bg-white/10 rounded-2xl">
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span>Typing Animation</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span>Theme Support</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <span>Smooth Exit</span>
                 </div>
              </div>
           </div>

           <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-white/10">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                 <Eye className="w-4 h-4 text-teal-400" />
                 Tips Konten
              </h4>
              <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
                 <li className="flex gap-2">
                    <ChevronRight className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                    Gunakan kalimat yang singkat dan padat untuk animasi mengetik.
                 </li>
                 <li className="flex gap-2">
                    <ChevronRight className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                    Maksimal 4-5 kalimat agar pengunjung tidak menunggu terlalu lama.
                 </li>
                 <li className="flex gap-2">
                    <ChevronRight className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                    Pastikan judul Arab sudah benar secara harakat.
                 </li>
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
};

export default IntroEditor;
