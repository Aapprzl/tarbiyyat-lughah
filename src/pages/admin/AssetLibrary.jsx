import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleUser, Plus, Trash2, Upload, X, Check, AlertCircle, Loader2, ImageIcon, Users, Layers, Mountain, Sparkles } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';

const AssetLibrary = () => {
    const { success, error, warning } = useToast();
    const confirm = useConfirm();
    
    const [activeTab, setActiveTab] = useState('characters'); // 'characters' | 'backgrounds'
    const [characters, setCharacters] = useState([]);
    const [backgrounds, setBackgrounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        image: '',
        imageFile: null
    });

    useEffect(() => {
        loadAssets();
    }, []);

    const loadAssets = async () => {
        setLoading(true);
        try {
            const [chars, bgs] = await Promise.all([
                contentService.getCharacters(),
                contentService.getBackgrounds()
            ]);
            setCharacters(chars);
            setBackgrounds(bgs);
        } catch (err) {
            error('Gagal memuat daftar aset');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Both types now 1MB
            if (file.size > 1024 * 1024) {
                warning('Ukuran gambar maksimal 1MB');
                return;
            }
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, image: url, imageFile: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || (activeTab === 'characters' && !formData.role)) {
            warning(`Mohon isi nama ${activeTab === 'characters' ? 'dan peran karakter' : 'theme background'}`);
            return;
        }
        if (!formData.image && !formData.imageFile) {
            warning('Mohon pilih gambar aset');
            return;
        }

        setUploading(true);
        try {
            let imageUrl = formData.image;

            // 1. Upload new image if file exists
            if (formData.imageFile) {
                const folder = activeTab === 'characters' ? 'characters' : 'backgrounds';
                imageUrl = await storageService.uploadFile(formData.imageFile, folder);
            }

            // 2. Create new item
            const newItem = {
                id: `${activeTab === 'characters' ? 'char' : 'bg'}_${Date.now()}`,
                name: formData.name,
                image: imageUrl,
                createdAt: new Date().toISOString()
            };

            if (activeTab === 'characters') {
                newItem.role = formData.role;
                const updated = [newItem, ...characters];
                await contentService.saveCharacters(updated);
                setCharacters(updated);
            } else {
                const updated = [newItem, ...backgrounds];
                await contentService.saveBackgrounds(updated);
                setBackgrounds(updated);
            }
            
            success(`${activeTab === 'characters' ? 'Karakter' : 'Background'} berhasil ditambahkan!`);
            resetForm();
            setIsAdding(false);
        } catch (err) {
            error('Gagal menyimpan aset');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (item) => {
        const label = activeTab === 'characters' ? 'karakter' : 'background';
        const confirmed = await confirm(`Hapus ${label} "${item.name}"?`, 'Konfirmasi Hapus');
        if (confirmed) {
            try {
                if (item.image && item.image.includes('supabase')) {
                    await storageService.deleteFile(item.image);
                }

                if (activeTab === 'characters') {
                    const updated = characters.filter(c => c.id !== item.id);
                    await contentService.saveCharacters(updated);
                    setCharacters(updated);
                } else {
                    const updated = backgrounds.filter(b => b.id !== item.id);
                    await contentService.saveBackgrounds(updated);
                    setBackgrounds(updated);
                }
                success(`${activeTab === 'characters' ? 'Karakter' : 'Background'} berhasil dihapus`);
            } catch (err) {
                error('Gagal menghapus aset');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            role: '',
            image: '',
            imageFile: null
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Pustaka Aset...</p>
            </div>
        );
    }

    const currentItems = activeTab === 'characters' ? characters : backgrounds;

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm p-4 md:p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Sparkles className="w-32 h-32 text-teal-500" />
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4 min-w-fit">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                            <Layers className="w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Pustaka Aset</h1>
                            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manajemen Karakter & Background Global</p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-black/20 p-1 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/5 w-fit">
                        <button 
                            onClick={() => { setActiveTab('characters'); setIsAdding(false); resetForm(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === 'characters' ? "bg-white dark:bg-slate-800 text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <Users className="w-3 h-3 md:w-4 md:h-4" /> Karakter
                        </button>
                        <button 
                            onClick={() => { setActiveTab('backgrounds'); setIsAdding(false); resetForm(); }}
                            className={cn(
                                "flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-widest transition-all",
                                activeTab === 'backgrounds' ? "bg-white dark:bg-slate-800 text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <Mountain className="w-3 h-3 md:w-4 md:h-4" /> Background
                        </button>
                    </div>

                    <button 
                        onClick={() => { if (isAdding) resetForm(); setIsAdding(!isAdding); }}
                        className={cn(
                            "flex items-center justify-center gap-2 px-6 md:px-8 py-3 md:py-3.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-xl whitespace-nowrap",
                            isAdding 
                                ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" 
                                : "bg-teal-600 text-white hover:bg-teal-700 shadow-teal-500/20"
                        )}
                    >
                        {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isAdding ? 'Batal' : `Tambah ${activeTab === 'characters' ? 'Karakter' : 'Background'}`}
                    </button>
                </div>
            </div>

            {/* Add Asset Form */}
            <AnimatePresence mode="wait">
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-slate-900/50 backdrop-blur-md p-8 md:p-10 rounded-[3rem] border-2 border-teal-500/20 shadow-2xl relative overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                            <div className="grid md:grid-cols-3 gap-10 items-start">
                                {/* Image Upload Component */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                        <ImageIcon className="w-3 h-3 text-teal-500" /> Pratinjau Aset
                                    </label>
                                    <div className={cn(
                                        "relative group bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:border-teal-500/40",
                                        activeTab === 'characters' ? "aspect-[3/4]" : "aspect-video"
                                    )}>
                                        {formData.image ? (
                                            <div className="relative w-full h-full group">
                                                <img src={formData.image} className="w-full h-full object-contain p-4" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <label className="p-4 bg-white dark:bg-slate-800 rounded-2xl cursor-pointer hover:scale-110 transition-transform shadow-xl">
                                                        <Upload className="w-6 h-6 text-teal-600" />
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                    </label>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, image: '', imageFile: null })}
                                                        className="p-4 bg-white dark:bg-slate-800 rounded-2xl hover:text-red-500 hover:scale-110 transition-transform shadow-xl"
                                                    >
                                                        <Trash2 className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-teal-500/5 transition-colors group">
                                                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-lg border border-slate-100 dark:border-white/5 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                    {activeTab === 'characters' ? <CircleUser className="w-10 h-10 text-slate-300" /> : <Mountain className="w-10 h-10 text-slate-300" />}
                                                </div>
                                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center px-6 leading-relaxed">
                                                    Unggah {activeTab === 'characters' ? 'Karakter' : 'Background'}<br/>
                                                    <span className="text-[9px] text-teal-500/60 opacity-60">PNG/JPG Max 1MB</span>
                                                </span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-tighter italic opacity-60">
                                        {activeTab === 'characters' ? 'Rekomendasi: PNG transparan' : 'Rekomendasi: 1280x720 / 1920x1080'}
                                    </p>
                                </div>

                                {/* Form Inputs */}
                                <div className="md:col-span-2 space-y-10">
                                    <div className="grid sm:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-teal-500" /> Nama {activeTab === 'characters' ? 'Karakter' : 'Background'}
                                            </label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm"
                                                placeholder={activeTab === 'characters' ? "Contoh: Thariq, Sang Guru..." : "Contoh: Hutan Sahara, Istana Raja..."}
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        {activeTab === 'characters' && (
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                                    <Users className="w-3 h-3 text-teal-500" /> Peran / Role
                                                </label>
                                                <input 
                                                    type="text"
                                                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-[1.5rem] px-6 py-5 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm"
                                                    placeholder="Contoh: Narrator, Guide, Antagonist..."
                                                    value={formData.role}
                                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={uploading}
                                        className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs shadow-2xl shadow-teal-500/30 transition-all disabled:opacity-50 disabled:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-4 group"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Menyimpan Aset...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                                Simpan ke Pustaka {activeTab === 'characters' ? 'Karakter' : 'Background'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                    {currentItems.map((item) => (
                        <motion.div 
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-teal-500/40 transition-all hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col"
                        >
                            {/* Delete Button - Fixed Position */}
                            <button 
                                onClick={() => handleDelete(item)}
                                className="absolute top-4 right-4 z-20 p-3 bg-white/90 dark:bg-slate-800/90 text-red-500 rounded-2xl border border-slate-100 dark:border-white/5 shadow-lg opacity-80 hover:opacity-100 hover:scale-110 hover:bg-red-500 hover:text-white transition-all backdrop-blur-md"
                                title="Hapus Aset"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>

                            <div className={cn(
                                "bg-slate-50 dark:bg-black/20 relative overflow-hidden flex items-center justify-center transition-all duration-500",
                                activeTab === 'characters' ? "aspect-[3/4] p-6 md:p-8" : "aspect-video p-0"
                            )}>
                                {item.image ? (
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className={cn(
                                            "w-full h-full transition-transform duration-700 group-hover:scale-105",
                                            activeTab === 'characters' ? "object-contain filter drop-shadow-2xl" : "object-cover"
                                        )} 
                                    />
                                ) : (
                                    <ImageIcon className="w-16 h-16 text-slate-200 dark:text-slate-800" />
                                )}
                            </div>

                            <div className="p-5 md:p-6 text-center space-y-1 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 transition-colors flex-1 flex flex-col justify-center">
                                <h3 className="text-xs md:text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate px-2">{item.name}</h3>
                                {activeTab === 'characters' && (
                                    <p className="text-[9px] md:text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em] opacity-80">{item.role}</p>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State */}
                {currentItems.length === 0 && !isAdding && (
                    <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 backdrop-blur-sm">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                            {activeTab === 'characters' ? <Users className="w-12 h-12 text-slate-300" /> : <Mountain className="w-12 h-12 text-slate-300" />}
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pustaka Aset Kosong</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] max-w-sm mx-auto mt-4 leading-loose opacity-60">
                            Belum ada {activeTab === 'characters' ? 'karakter' : 'background'} yang terdaftar di pustaka global.
                        </p>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="mt-10 px-10 py-4 bg-teal-500/10 hover:bg-teal-500 text-teal-600 hover:text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-sm"
                        >
                            + Mulai Membangun Pustaka
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssetLibrary;
