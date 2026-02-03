import React, { useEffect, useState } from 'react';
import { Save, User, FileText, Upload, Trash2, Mail, Globe, Linkedin, Instagram, Link as LinkIcon, Sparkles, MapPin, ChevronRight, CheckCircle, AlertCircle, Layout, Activity, Star } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import PdfViewer from '../../components/PdfViewer';
import { useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { cn } from '../../utils/cn';

const ProfileEditor = () => {
    const [config, setConfig] = useState(null);
    const [initialConfig, setInitialConfig] = useState(null); // GC Tracking
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const toast = useToast();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await contentService.getProfileConfig();
            const configWithDefaults = {
                name: '', title: '', bio: '', photoUrl: '', email: '', pdfUrl: '', location: '',
                showStats: true,
                ...data,
                socials: { instagram: '', linkedin: '', website: '', ...(data.socials || {}) },
                stats: { projects: '0', hours: '0', rating: '0', ...(data.stats || {}) }
            };
            setConfig(configWithDefaults);
            setInitialConfig(configWithDefaults);
            setPhotoPreview(configWithDefaults.photoUrl);
        } catch {
            toast.error("Gagal memuat konfigurasi profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (initialConfig) {
                const toDelete = [];
                if (initialConfig.photoUrl && initialConfig.photoUrl !== config.photoUrl && initialConfig.photoUrl.includes('firebasestorage')) {
                    toDelete.push(initialConfig.photoUrl);
                }
                if (initialConfig.pdfUrl && initialConfig.pdfUrl !== config.pdfUrl && initialConfig.pdfUrl.includes('firebasestorage')) {
                    toDelete.push(initialConfig.pdfUrl);
                }
                if (toDelete.length > 0) {
                    await Promise.allSettled(toDelete.map(url => storageService.deleteFile(url)));
                }
            }

            await contentService.saveProfileConfig(config);
            setInitialConfig(config);
            toast.success('Profil berhasil diperbarui! ✨');
        } catch {
            toast.error('Gagal menyimpan perubahan.');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.warning('Ukuran maksimal foto 2MB');
            return;
        }

        try {
            setSaving(true);
            const url = await storageService.uploadFile(file, 'profile/photos');
            setConfig(prev => ({ ...prev, photoUrl: url }));
            setPhotoPreview(url);
            toast.success('Foto profil diperbarui.');
        } catch {
            toast.error('Gagal upload foto.');
        } finally {
            setSaving(false);
        }
    };

    const handlePdfChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
             toast.warning('Ukuran maksimal PDF 5MB');
             return;
        }

        try {
            setSaving(true);
            const url = await storageService.uploadFile(file, 'profile/cv');
            setConfig(prev => ({ ...prev, pdfUrl: url }));
            toast.success('Dokumen PDF berhasil diupload.');
        } catch {
            toast.error('Gagal upload PDF.');
        } finally {
            setSaving(false);
        }
    };

    const updateSocial = (key, value) => {
        setConfig(prev => ({
            ...prev,
            socials: { ...prev.socials, [key]: value }
        }));
    };

    const updateStat = (key, value) => {
        setConfig(prev => ({
            ...prev,
            stats: { ...prev.stats, [key]: value }
        }));
    };

    if (loading) return (
        <div className="py-24 text-center">
            <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Editor Profil...</p>
        </div>
    );

    return (
        <div className="space-y-10 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                      <User className="w-3 h-3" /> Identitas Kreator
                   </div>
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Editor Profil</h1>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Informasi ini akan muncul di halaman publik.</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Photo Control */}
                <div className="lg:col-span-4 space-y-6">
                     <div className="bg-white dark:bg-white/5 p-8 rounded-[3rem] border border-slate-200 dark:border-white/10 shadow-sm text-center sticky top-24">
                        <div className="relative w-40 h-40 mx-auto mb-8 group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-indigo-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative w-full h-full rounded-[2.25rem] p-1.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/20 overflow-hidden shadow-xl transition-transform group-hover:scale-105">
                                 {photoPreview ? (
                                     <img src={photoPreview} alt="Preview" className="w-full h-full rounded-[2rem] object-cover bg-slate-100" />
                                 ) : (
                                     <div className="w-full h-full rounded-[2rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                                         <User className="w-16 h-16" />
                                     </div>
                                 )}
                                 <label className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                     <Upload className="w-8 h-8 text-white mb-2" />
                                     <span className="text-[10px] font-black text-white px-3 py-1 bg-white/20 rounded-full uppercase tracking-widest">Ganti Foto</span>
                                     <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                 </label>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Foto Profil</h3>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed px-4">Pastikan foto wajah terlihat jelas. Format JPG/PNG maksimal 2MB.</p>
                            
                            {config.photoUrl && (
                                <button 
                                    onClick={() => { setConfig({ ...config, photoUrl: '' }); setPhotoPreview(null); }}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-red-200"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Hapus Foto
                                </button>
                            )}
                        </div>
                     </div>
                </div>

                {/* Right Col: Form Fields */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Basic Info */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
                    >
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600">
                                <User className="w-6 h-6" />
                            </div>
                            Informasi Utama
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Nama Lengkap</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all placeholder:text-slate-300"
                                    value={config.name || ''}
                                    onChange={e => setConfig({...config, name: e.target.value})}
                                    placeholder="Nama Kreator"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Gelar / Profesi</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all placeholder:text-slate-300"
                                    value={config.title || ''}
                                    onChange={e => setConfig({...config, title: e.target.value})}
                                    placeholder="Contoh: Pengajar Bahasa Arab"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Email Kontak</label>
                                <input 
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all placeholder:text-slate-300"
                                    value={config.email || ''}
                                    onChange={e => setConfig({...config, email: e.target.value})}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Lokasi</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all placeholder:text-slate-300"
                                        value={config.location || ''}
                                        onChange={e => setConfig({...config, location: e.target.value})}
                                        placeholder="Jakarta, Indonesia"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Biografi Lengkap</label>
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-[2rem] px-6 py-5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all min-h-[160px] leading-relaxed"
                                    value={config.bio || ''}
                                    onChange={e => setConfig({...config, bio: e.target.value})}
                                    placeholder="Ceritakan pengalaman dan visi misi Anda..."
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Social Media Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
                    >
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600">
                                <Globe className="w-6 h-6" />
                            </div>
                            Jejaring Sosial
                        </h2>
                        
                        <div className="space-y-5">
                             <div className="group flex items-center gap-5">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
                                    <Instagram className="w-7 h-7" />
                                </div>
                                <input 
                                    className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                                    value={config.socials?.instagram || ''}
                                    onChange={e => updateSocial('instagram', e.target.value)}
                                    placeholder="https://instagram.com/user"
                                />
                             </div>
                             <div className="group flex items-center gap-5">
                                <div className="w-14 h-14 bg-[#0077b5] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Linkedin className="w-7 h-7" />
                                </div>
                                <input 
                                    className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                                    value={config.socials?.linkedin || ''}
                                    onChange={e => updateSocial('linkedin', e.target.value)}
                                    placeholder="https://linkedin.com/in/user"
                                />
                             </div>
                             <div className="group flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/20 group-hover:scale-110 transition-transform">
                                    <LinkIcon className="w-7 h-7" />
                                </div>
                                <input 
                                    className="flex-1 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                                    value={config.socials?.website || ''}
                                    onChange={e => updateSocial('website', e.target.value)}
                                    placeholder="https://yourwebsite.com"
                                />
                             </div>
                        </div>
                    </motion.div>

                    {/* Stats Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                Statistik Profil
                            </h2>
                            
                            {/* Toggle Visibility */}
                            <button 
                                onClick={() => setConfig(prev => ({ ...prev, showStats: !prev.showStats }))}
                                className={cn(
                                    "flex items-center gap-3 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border",
                                    config.showStats 
                                        ? "bg-teal-500/10 text-teal-600 border-teal-500/30 shadow-lg shadow-teal-500/5" 
                                        : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent"
                                )}
                            >
                                <div className={cn(
                                    "w-3 h-3 rounded-full transition-all",
                                    config.showStats ? "bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" : "bg-slate-300 dark:bg-slate-600"
                                )}></div>
                                {config.showStats ? "Tampilkan Statistik" : "Sembunyikan Statistik"}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Proyek Selesai</label>
                                <div className="relative">
                                    <Layout className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                                        value={config.stats?.projects || ''}
                                        onChange={e => updateStat('projects', e.target.value)}
                                        placeholder="Contoh: 15+"
                                    />
                                </div>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Jam Pengabdian</label>
                                <div className="relative">
                                    <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                                        value={config.stats?.hours || ''}
                                        onChange={e => updateStat('hours', e.target.value)}
                                        placeholder="Contoh: 2.5k"
                                    />
                                </div>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Rating Kepuasan</label>
                                <div className="relative">
                                    <Star className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl pl-14 pr-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none transition-all"
                                        value={config.stats?.rating || ''}
                                        onChange={e => updateStat('rating', e.target.value)}
                                        placeholder="Contoh: 5.0"
                                    />
                                </div>
                             </div>
                        </div>
                    </motion.div>

                    {/* PDF Document */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[3.5rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-10"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                Berkas Portofolio (PDF)
                            </h2>
                            {config.pdfUrl && (
                                <button 
                                    onClick={() => setConfig({...config, pdfUrl: ''})} 
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                >
                                    <Trash2 className="w-3 h-3" /> Hapus Portofolio
                                </button>
                            )}
                        </div>
                        
                        {!config.pdfUrl ? (
                            <label className="group block border-4 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem] p-16 text-center hover:bg-slate-50 dark:hover:bg-white/5 hover:border-teal-500/30 transition-all cursor-pointer relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfChange} />
                                <div className="relative pointer-events-none">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-white transition-all text-slate-300">
                                        <Upload className="w-10 h-10" />
                                    </div>
                                    <p className="text-lg font-black text-slate-700 dark:text-slate-200 mb-2">Pilih File PDF</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Maksimal 5MB • CV atau Profil</p>
                                </div>
                            </label>
                        ) : (
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full border border-green-500/20">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest leading-none">Status: Terunggah</span>
                                </div>
                                <div className="rounded-[2.5rem] overflow-hidden border-4 border-slate-50 dark:border-white/5 shadow-2xl h-[400px]">
                                     <PdfViewer src={config.pdfUrl} />
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
