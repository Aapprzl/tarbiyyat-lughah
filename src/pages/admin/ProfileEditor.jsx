import React, { useEffect, useState } from 'react';
import { Save, User, FileText, Upload, Trash2, Mail, Globe, Linkedin, Instagram, Link as LinkIcon } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import PdfViewer from '../../components/PdfViewer';
import { useToast } from '../../components/Toast';

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
            setConfig(data);
            setInitialConfig(data); // Capture for GC
            setPhotoPreview(data.photoUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // GC Logic: Compare initial vs current
            if (initialConfig) {
                const toDelete = [];
                // Check Photo
                if (initialConfig.photoUrl && initialConfig.photoUrl !== config.photoUrl) {
                    // Only if it was a storage URL
                    if (initialConfig.photoUrl.includes('firebasestorage')) {
                        toDelete.push(initialConfig.photoUrl);
                    }
                }
                // Check PDF
                if (initialConfig.pdfUrl && initialConfig.pdfUrl !== config.pdfUrl) {
                    if (initialConfig.pdfUrl.includes('firebasestorage')) {
                        toDelete.push(initialConfig.pdfUrl);
                    }
                }

                if (toDelete.length > 0) {
                    console.log('[GC] Cleaning up old profile files:', toDelete);
                    await Promise.allSettled(toDelete.map(url => storageService.deleteFile(url)));
                }
            }

            await contentService.saveProfileConfig(config);
            setInitialConfig(config); // Update baseline
            toast.success('Profil berhasil disimpan!');
        } catch (err) {
            console.error(err);
            toast.error('Gagal menyimpan profil.');
        }
        setSaving(false);
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
            toast.info('Mengupload foto...');
            const url = await storageService.uploadFile(file, 'profile/photos');
            setConfig(prev => ({ ...prev, photoUrl: url }));
            setPhotoPreview(url);
            toast.success('Foto berhasil diupload.');
        } catch (err) {
            console.error(err);
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
            toast.info('Mengupload PDF...');
            const url = await storageService.uploadFile(file, 'profile/cv');
            setConfig(prev => ({ ...prev, pdfUrl: url }));
            toast.success('PDF berhasil diunggah.');
        } catch (err) {
            console.error(err);
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

    if (loading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Editor Profil</h1>
                    <p className="text-[var(--color-text-muted)]">Kelola informasi profil pembuat.</p>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Photo & Basics */}
                <div className="md:col-span-1 space-y-6">
                     {/* Photo Upload */}
                     <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl border border-[var(--color-border)] text-center">
                        <div className="w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4 border-4 border-gray-50 dark:border-gray-700 shadow-sm relative group">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User className="w-12 h-12" />
                                </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Upload className="w-6 h-6 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                            </label>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                             <p className="text-xs text-[var(--color-text-muted)]">Klik foto untuk mengganti (Max 2MB)</p>
                             {config.photoUrl && (
                                <button 
                                    onClick={() => {
                                        setConfig({ ...config, photoUrl: '' });
                                        setPhotoPreview(null);
                                    }}
                                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" /> Hapus Foto
                                </button>
                             )}
                        </div>
                     </div>
                </div>

                {/* Right Col: Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
                        <h2 className="font-bold text-[var(--color-text-main)] flex items-center">
                            <User className="w-5 h-5 mr-2 text-teal-600" />
                            Informasi Dasar
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Nama Lengkap</label>
                                <input 
                                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-main)] outline-none focus:border-teal-500"
                                    value={config.name || ''}
                                    onChange={e => setConfig({...config, name: e.target.value})}
                                    placeholder="Nama Anda"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Gelar / Posisi</label>
                                <input 
                                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-main)] outline-none focus:border-teal-500"
                                    value={config.title || ''}
                                    onChange={e => setConfig({...config, title: e.target.value})}
                                    placeholder="Contoh: Pengajar Bahasa Arab"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Email</label>
                                <input 
                                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-main)] outline-none focus:border-teal-500"
                                    value={config.email || ''}
                                    onChange={e => setConfig({...config, email: e.target.value})}
                                    placeholder="email@example.com"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Bio Singkat</label>
                                <textarea 
                                    className="w-full bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-main)] outline-none focus:border-teal-500 min-h-[100px]"
                                    value={config.bio || ''}
                                    onChange={e => setConfig({...config, bio: e.target.value})}
                                    placeholder="Ceritakan sedikit tentang Anda..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
                        <h2 className="font-bold text-[var(--color-text-main)] flex items-center">
                            <Globe className="w-5 h-5 mr-2 text-blue-600" />
                            Media Sosial
                        </h2>
                        <div className="space-y-3">
                             <div className="flex items-center gap-3">
                                <Instagram className="w-5 h-5 text-pink-600" />
                                <input 
                                    className="flex-1 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-main)] outline-none focus:border-teal-500 text-sm"
                                    value={config.socials?.instagram || ''}
                                    onChange={e => updateSocial('instagram', e.target.value)}
                                    placeholder="Link Instagram"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <Linkedin className="w-5 h-5 text-blue-700" />
                                <input 
                                    className="flex-1 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-main)] outline-none focus:border-teal-500 text-sm"
                                    value={config.socials?.linkedin || ''}
                                    onChange={e => updateSocial('linkedin', e.target.value)}
                                    placeholder="Link LinkedIn"
                                />
                             </div>
                             <div className="flex items-center gap-3">
                                <LinkIcon className="w-5 h-5 text-gray-600" />
                                <input 
                                    className="flex-1 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg px-4 py-2 text-[var(--color-text-main)] outline-none focus:border-teal-500 text-sm"
                                    value={config.socials?.website || ''}
                                    onChange={e => updateSocial('website', e.target.value)}
                                    placeholder="Website Lainnya"
                                />
                             </div>
                        </div>
                    </div>

                     {/* PDF Upload */}
                    <div className="bg-[var(--color-bg-card)] p-6 rounded-2xl border border-[var(--color-border)] space-y-4">
                        <h2 className="font-bold text-[var(--color-text-main)] flex items-center justify-between">
                            <div className="flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-red-600" />
                                Dokumen Profil / CV
                            </div>
                            {config.pdfUrl && (
                                <button onClick={() => setConfig({...config, pdfUrl: ''})} className="text-red-500 text-xs hover:underline">Hapus PDF</button>
                            )}
                        </h2>
                        
                        {!config.pdfUrl ? (
                            <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center hover:bg-[var(--color-bg-muted)] transition-colors cursor-pointer relative">
                                <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePdfChange} />
                                <Upload className="w-8 h-8 mx-auto text-[var(--color-text-muted)] mb-2" />
                                <p className="text-sm text-[var(--color-text-muted)]">Klik atau Tarik file PDF di sini</p>
                                <p className="text-xs text-gray-400 mt-1">Maks 5MB</p>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 text-sm text-green-600 font-medium flex items-center">
                                    <FileText className="w-4 h-4 mr-2" />
                                    PDF Terupload
                                </div>
                                <div className="h-64 border border-[var(--color-border)] rounded-xl overflow-hidden">
                                     <PdfViewer src={config.pdfUrl} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditor;
