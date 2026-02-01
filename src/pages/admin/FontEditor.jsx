import React, { useEffect, useState } from 'react';
import { Type, Save, Eye } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useFont } from '../../components/FontProvider';

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
    await updateFontConfig(localConfig);
    setSaving(false);
    toast.success('Pengaturan font berhasil disimpan!');
  };

  if (!localConfig) return <div className="p-12 text-center text-gray-400">Loading Configuration...</div>;

  const fontStyle = ARABIC_FAMILIES.find(f => f.name === localConfig.fontFamily)?.style;
  const latinStyle = localConfig.latinFontFamily || 'Plus Jakarta Sans';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Pengaturan Font Arab</h1>
          <p className="text-[var(--color-text-muted)]">Kelola tampilan font Arab di seluruh website.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-lg flex items-center font-bold hover:bg-teal-700 transition-colors shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* Arabic Font Family Selection */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-6">
        <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4 flex items-center">
          <Type className="w-5 h-5 mr-2 text-teal-600" />
          Jenis Font Arab
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ARABIC_FAMILIES.map(font => (
            <button
              key={font.name}
              onClick={() => setLocalConfig({ ...localConfig, fontFamily: font.name })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                localConfig.fontFamily === font.name 
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                  : 'border-[var(--color-border)] hover:border-teal-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-medium text-[var(--color-text-main)] mb-2">{font.label}</p>
                {localConfig.fontFamily === font.name && <div className="w-2 h-2 rounded-full bg-teal-500"></div>}
              </div>
              <p 
                className="text-2xl text-[var(--color-text-muted)]" 
                style={{ fontFamily: font.style }}
              >
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Latin Font Family Selection */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-6">
        <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4 flex items-center">
          <Type className="w-5 h-5 mr-2 text-blue-600" />
          Jenis Font Alfabet (Latin)
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LATIN_FAMILIES.map(font => (
            <button
              key={font.name}
              onClick={() => setLocalConfig({ ...localConfig, latinFontFamily: font.name })}
              className={`p-3 rounded-xl border-2 transition-all ${
                localConfig.latinFontFamily === font.name 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-[var(--color-border)] hover:border-blue-300'
              }`}
              style={{ fontFamily: font.name === 'System Default' ? 'sans-serif' : font.name }}
            >
              <p className="text-sm font-bold text-center text-[var(--color-text-main)]">Aa</p>
              <p className="text-[10px] text-center text-[var(--color-text-muted)]">{font.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Settings */}
      <div className="bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-6">
        <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Ukuran Font</h2>
        
        <div className="space-y-6">
          {/* Title Size */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Ukuran Judul Halaman (Daftar Materi, dll)
            </label>
            <select
              value={localConfig.titleSize}
              onChange={(e) => setLocalConfig({ ...localConfig, titleSize: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              {FONT_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          {/* Content Size */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Ukuran Konten Materi (Teks Arab di dalam materi)
            </label>
            <select
              value={localConfig.contentSize}
              onChange={(e) => setLocalConfig({ ...localConfig, contentSize: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              {FONT_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          {/* Sidebar Size */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Ukuran Logo Sidebar (اللغة العربية)
            </label>
            <select
              value={localConfig.sidebarSize}
              onChange={(e) => setLocalConfig({ ...localConfig, sidebarSize: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              {FONT_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          {/* Sidebar Content Size */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Ukuran Link Materi di Sidebar
            </label>
            <select
              value={localConfig.sidebarLinkSize || 'text-lg'}
              onChange={(e) => setLocalConfig({ ...localConfig, sidebarLinkSize: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              {FONT_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>

          {/* Index Topic Size */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
              Ukuran Topik di Daftar Materi (Halaman Depan)
            </label>
            <select
              value={localConfig.indexTopicSize || 'text-xl'}
              onChange={(e) => setLocalConfig({ ...localConfig, indexTopicSize: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            >
              {FONT_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-teal-100 dark:border-teal-900/30">
        <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4 flex items-center">
          <Eye className="w-5 h-5 mr-2 text-teal-600" />
          Preview
        </h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Judul ({localConfig.titleSize})</p>
            <p 
              className={`${localConfig.titleSize} text-[var(--color-text-main)]`} 
              style={{ fontFamily: fontStyle }}
            >
              الدرس الأول
            </p>
          </div>
          
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Konten ({localConfig.contentSize})</p>
            <p 
              className={`${localConfig.contentSize} text-[var(--color-text-main)] leading-relaxed`} 
              style={{ fontFamily: fontStyle }}
            >
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ الحَمْدُ للهِ رَبِّ العَالَمِيْنَ
            </p>
          </div>
          
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Sidebar Logo ({localConfig.sidebarSize})</p>
            <p 
              className={`${localConfig.sidebarSize} text-[var(--color-text-main)]`} 
              style={{ fontFamily: fontStyle }}
            >
              اللغة العربية
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Link Sidebar ({localConfig.sidebarLinkSize || 'text-lg'})</p>
            <p 
              className={`${localConfig.sidebarLinkSize || 'text-lg'} text-[var(--color-text-main)]`} 
              style={{ fontFamily: fontStyle }}
            >
              إسم المذكر وإسم المؤنث
            </p>
          </div>

          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">Topik Daftar Materi ({localConfig.indexTopicSize || 'text-xl'})</p>
            <div className="flex items-center gap-4">
                <p 
                  className={`${localConfig.indexTopicSize || 'text-xl'} text-[var(--color-text-main)]`} 
                  style={{ fontFamily: fontStyle }}
                >
                  لغة الضad
                </p>
                <p className="text-sm text-[var(--color-text-muted)]" style={{ fontFamily: latinStyle === 'System Default' ? 'sans-serif' : latinStyle }}>
                    Sample Latin Text (ABC 123)
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontEditor;
