import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { Save, Layout, Type, MousePointer, Image, Upload, Trash2, Target, BookOpen, Star, Zap, Activity, Box, Award, Hexagon, Layers, Smile } from 'lucide-react';
import { useToast } from '../../components/Toast';

// Helper to render icon by name
const IconPreview = ({ name }) => {
    const icons = { BookOpen, Layout, Star, Zap, Activity, Box, Award, Hexagon, Layers, Smile };
    const Icon = icons[name] || BookOpen;
    return <Icon className="w-6 h-6 text-teal-600" />;
};

const HomeEditor = () => {
  const [config, setConfig] = useState({
    heroTitleArabic: '',
    heroTitleLatin: '',
    heroDescription: '',
    heroButtonText: '',
    footerText: '',
    siteTitle: '',
    siteLogoType: 'icon',
    siteLogoIcon: 'BookOpen',
    siteLogoUrl: '',
    sidebarTitle: '',
    headerTitleSize: 'text-lg',
    sidebarTitleSize: 'text-xl'
  });
  const [initialConfig, setInitialConfig] = useState(null); // GC Tracking
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      const data = await contentService.getHomeConfig();
      setConfig(data);
      setInitialConfig(data); // Capture for GC
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // GC Logic: Compare initial vs current
    try {
        if (initialConfig && initialConfig.siteLogoUrl && initialConfig.siteLogoUrl !== config.siteLogoUrl) {
            // Only if it was a storage URL
            if (initialConfig.siteLogoUrl.includes('firebasestorage')) {
                console.log('[GC] Deleting old logo:', initialConfig.siteLogoUrl);
                storageService.deleteFile(initialConfig.siteLogoUrl).catch(e => console.warn(e));
            }
        }
    } catch (err) {
        console.warn("[GC] Error cleaning up logo", err);
    }

    await contentService.saveHomeConfig(config);
    setInitialConfig(config); // Update baseline
    setSaving(false);
    toast.success('Pengaturan Beranda berhasil disimpan!');
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Memuat pengaturan...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center">
          <Layout className="w-8 h-8 mr-3 text-teal-600" />
          Editor Beranda
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">Atur tampilan halaman depan website Anda.</p>
      </div>

      <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] p-6">
          <h2 className="font-bold text-[var(--color-text-main)] flex items-center">
             <Type className="w-4 h-4 mr-2 text-teal-600" />
             Hero Section (Bagian Utama)
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Ini adalah bagian paling atas yang pertama kali dilihat pengunjung.
          </p>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* --- Site Identity Section --- */}
           <div className="bg-[var(--color-bg-muted)]/50 p-4 rounded-xl border border-[var(--color-border)] mb-6">
               <h3 className="font-bold text-[var(--color-text-main)] mb-4 flex items-center">
                   <Target className="w-4 h-4 mr-2 text-blue-600" />
                   Identitas Website
               </h3>
               
               <div className="space-y-4">
                   {/* --- Header & Sidebar Titles --- */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Header Title */}
                       <div>
                            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Judul Header (Atas)</label>
                            <input 
                                type="text" 
                                value={config.siteTitle || ''}
                                onChange={(e) => setConfig({...config, siteTitle: e.target.value})}
                                className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] rounded-lg outline-none focus:border-blue-500 font-bold font-arabic"
                                placeholder="Bahasa Arab Praktis"
                            />
                            <div className="mt-2 flex items-center">
                                <span className="text-xs text-[var(--color-text-muted)] mr-2">Ukuran:</span>
                                <select 
                                    value={config.headerTitleSize || 'text-lg'}
                                    onChange={(e) => setConfig({...config, headerTitleSize: e.target.value})}
                                    className="p-1 border border-[var(--color-border)] rounded text-xs bg-[var(--color-bg-card)] text-[var(--color-text-main)] outline-none focus:border-blue-500"
                                >
                                    <option value="text-sm">Kecil (SM)</option>
                                    <option value="text-base">Sedang (Base)</option>
                                    <option value="text-lg">Besar (LG)</option>
                                    <option value="text-xl">X-Besar (XL)</option>
                                    <option value="text-2xl">Jumbo (2XL)</option>
                                </select>
                            </div>
                       </div>

                       {/* Sidebar Title */}
                       <div>
                            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Judul Sidebar (Menu Kiri)</label>
                            <input 
                                type="text" 
                                value={config.sidebarTitle || ''}
                                onChange={(e) => setConfig({...config, sidebarTitle: e.target.value})}
                                className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] rounded-lg outline-none focus:border-blue-500 font-bold font-arabic dir-rtl placeholder:dir-ltr"
                                placeholder="اللغة العربية"
                            />
                            <div className="mt-2 flex items-center">
                                <span className="text-xs text-[var(--color-text-muted)] mr-2">Ukuran:</span>
                                <select 
                                    value={config.sidebarTitleSize || 'text-xl'}
                                    onChange={(e) => setConfig({...config, sidebarTitleSize: e.target.value})}
                                    className="p-1 border border-[var(--color-border)] rounded text-xs bg-[var(--color-bg-card)] text-[var(--color-text-main)] outline-none focus:border-blue-500"
                                >
                                    <option value="text-base">Sedang (Base)</option>
                                    <option value="text-lg">Besar (LG)</option>
                                    <option value="text-xl">X-Besar (XL)</option>
                                    <option value="text-2xl">Jumbo (2XL)</option>
                                    <option value="text-3xl">Raksasa (3XL)</option>
                                </select>
                            </div>
                       </div>
                   </div>

                   {/* Logo Type Selector */}
                   <div>
                       <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Tipe Logo</label>
                       <div className="flex space-x-4">
                           <button
                                type="button" 
                                onClick={() => setConfig({...config, siteLogoType: 'icon'})}
                                className={`flex-1 p-3 rounded-lg border flex items-center justify-center transition-all ${config.siteLogoType === 'icon' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'}`}
                           >
                               <Star className="w-5 h-5 mr-2" />
                               Gunakan Ikon
                           </button>
                           <button
                                type="button" 
                                onClick={() => setConfig({...config, siteLogoType: 'image'})}
                                className={`flex-1 p-3 rounded-lg border flex items-center justify-center transition-all ${config.siteLogoType === 'image' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]'}`}
                           >
                               <Image className="w-5 h-5 mr-2" />
                               Upload Gambar
                           </button>
                       </div>
                   </div>

                   {/* Logic based on Type */}
                   {config.siteLogoType === 'image' ? (
                       <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-6 text-center hover:bg-[var(--color-bg-card)] transition-colors relative">
                           {config.siteLogoUrl ? (
                               <div className="relative group w-fit mx-auto">
                                   <img src={config.siteLogoUrl} alt="Logo" className="h-16 object-contain mx-auto" />
                                   <button 
                                     type="button"
                                     onClick={() => setConfig({...config, siteLogoUrl: ''})}
                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                   >
                                       <Trash2 className="w-3 h-3" />
                                   </button>
                               </div>
                           ) : (
                               <div className="cursor-pointer">
                                   <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                   <span className="text-sm text-gray-500">
                                       {saving ? 'Mengupload...' : 'Klik untuk upload logo (PNG/JPG)'}
                                   </span>
                               </div>
                           )}
                           <input 
                             type="file" 
                             accept="image/*" 
                             disabled={saving}
                             className="absolute inset-0 opacity-0 cursor-pointer"
                             onChange={async (e) => {
                                 const file = e.target.files[0];
                                 if (file) {
                                     try {
                                         setSaving(true);
                                         toast.info('Mengupload gambar...');
                                         const url = await storageService.uploadFile(file, 'identity');
                                         setConfig(prev => ({...prev, siteLogoUrl: url}));
                                         toast.success('Gambar berhasil diupload!');
                                     } catch (err) {
                                         toast.error('Gagal upload gambar.');
                                     } finally {
                                         setSaving(false);
                                     }
                                 }
                             }}
                           />
                       </div>
                   ) : (
                       <div>
                            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Nama Ikon (Lucide React)</label>
                            <div className="flex gap-2 items-center">
                                <div className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg">
                                    <IconPreview name={config.siteLogoIcon || 'BookOpen'} />
                                </div>
                                <select 
                                    value={config.siteLogoIcon || 'BookOpen'}
                                    onChange={(e) => setConfig({...config, siteLogoIcon: e.target.value})}
                                    className="flex-1 p-3 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-main)] rounded-lg outline-none"
                                >
                                    {['BookOpen', 'Layout', 'Star', 'Zap', 'Activity', 'Box', 'Award', 'Hexagon', 'Layers', 'Smile'].map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                    ))}
                                </select>
                            </div>
                       </div>
                   )}
               </div>
           </div>

           {/* --- Hero Section --- */}
           <div>
             <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Judul Utama (Arab)</label>
             <input 
               type="text" 
               value={config.heroTitleArabic}
               onChange={(e) => setConfig({...config, heroTitleArabic: e.target.value})}
               className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg font-arabic text-xl dir-rtl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
             />
           </div>

           {/* Latin Title */}
           <div>
             <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Sub-Judul (Latin)</label>
             <input 
               type="text" 
               value={config.heroTitleLatin}
               onChange={(e) => setConfig({...config, heroTitleLatin: e.target.value})}
               className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold outline-none"
             />
           </div>

           {/* Description */}
           <div>
             <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Deskripsi Singkat</label>
             <textarea 
               value={config.heroDescription}
               onChange={(e) => setConfig({...config, heroDescription: e.target.value})}
               rows="3"
               className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
             />
           </div>

           <div className="grid grid-cols-2 gap-6">
              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">tombol Utama (Mulai)</label>
                <div className="relative">
                   <MousePointer className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     value={config.heroButtonText}
                     onChange={(e) => setConfig({...config, heroButtonText: e.target.value})}
                     className="w-full p-3 pl-10 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                   />
                </div>
              </div>

               {/* Secondary Button Text */}
               <div>
                <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Tombol Kedua (Info)</label>
                <input 
                  type="text" 
                  value={config.heroButtonSecondaryText || 'Tentang Kami'}
                  onChange={(e) => setConfig({...config, heroButtonSecondaryText: e.target.value})}
                  className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
              </div>
           </div>
           
           {/* Section Titles */}
           <div className="pt-6 border-t border-[var(--color-border)]">
               <h3 className="font-bold text-[var(--color-text-main)] mb-4">Judul Bagian Halaman</h3>
               <div>
                   <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Judul Seksi Program</label>
                   <input 
                     type="text" 
                     value={config.programsSectionTitle || 'Program Unggulan'}
                     onChange={(e) => setConfig({...config, programsSectionTitle: e.target.value})}
                     className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg outline-none"
                   />
               </div>
           </div>

           {/* Footer */}
           <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Teks Footer (Hak Cipta)</label>
            <input 
                type="text" 
                value={config.footerText}
                onChange={(e) => setConfig({...config, footerText: e.target.value})}
                className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
            />
          </div>


           <div className="pt-6 border-t border-[var(--color-border)] flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-bold flex items-center transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default HomeEditor;
