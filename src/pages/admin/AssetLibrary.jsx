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

  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Memuat Pustaka Aset...</p>
      </div>
    );
  }

  const currentItems = activeTab === 'characters' ? characters : backgrounds;

  return (
    <div className="space-y-6 pb-16">
      {/* Minimalist Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Pustaka Aset</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Karakter & Latar Belakang</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Compact Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
            <button 
              onClick={() => { setActiveTab('characters'); setIsAdding(false); resetForm(); }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                activeTab === 'characters' ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              Karakter
            </button>
            <button 
              onClick={() => { setActiveTab('backgrounds'); setIsAdding(false); resetForm(); }}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                activeTab === 'backgrounds' ? "bg-white dark:bg-slate-700 text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              Background
            </button>
          </div>

          <button 
            onClick={() => { if (isAdding) resetForm(); setIsAdding(!isAdding); }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              isAdding 
                ? "bg-slate-50 dark:bg-white/5 text-slate-400" 
                : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20"
            )}
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {isAdding ? 'Batal' : 'Tambah'}
          </button>
        </div>
      </div>

      {/* Modern Add Form */}
      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl border border-teal-500/20 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-4 gap-6 items-start">
                {/* Upload Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pratinjau</label>
                  <div className={cn(
                    "relative group bg-slate-50 dark:bg-black/20 border border-dashed border-slate-200 dark:border-white/10 rounded-xl overflow-hidden transition-all hover:border-teal-500/40",
                    activeTab === 'characters' ? "aspect-square" : "aspect-video"
                  )}>
                    {formData.image ? (
                      <div className="relative w-full h-full group">
                        <img src={formData.image} className="w-full h-full object-contain p-2" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="p-2 bg-white dark:bg-slate-800 rounded-lg cursor-pointer hover:scale-110 transition-transform">
                            <Upload className="w-4 h-4 text-teal-600" />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                          </label>
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '', imageFile: null })}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:text-red-500 hover:scale-110 transition-transform"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-teal-500/5 transition-colors">
                        <div className="w-10 h-10 bg-white dark:bg-slate-700/50 rounded-xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-white/5 mb-2">
                          {activeTab === 'characters' ? <CircleUser className="w-5 h-5 text-slate-300" /> : <Mountain className="w-5 h-5 text-slate-300" />}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center px-4 leading-tight">
                          Unggah File<br/>
                          <span className="text-teal-500/60 opacity-60">Max 1MB</span>
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="md:col-span-3 space-y-6 pt-2">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nama Aset</label>
                      <input 
                        type="text"
                        dir={isArabic(formData.name) ? "rtl" : "ltr"}
                        className={cn(
                          "w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-dashed border-slate-200 dark:border-white/10 focus:border-teal-500/50 focus:border-solid py-1 outline-none transition-all",
                          isArabic(formData.name) && "arabic-content"
                        )}
                        placeholder={activeTab === 'characters' ? "Contoh: Thariq" : "Contoh: Hutan"}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    {activeTab === 'characters' && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Peran / Role</label>
                        <input 
                          type="text"
                          className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 border-b border-dashed border-slate-200 dark:border-white/10 focus:border-teal-500/50 focus:border-solid py-1 outline-none transition-all"
                          placeholder="Contoh: Narrator"
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value })}
                        />
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Simpan ke Pustaka
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimalist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {currentItems.map((item) => (
            <motion.div 
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden hover:border-teal-500/40 transition-all hover:shadow-lg flex flex-col"
            >
              <button 
                onClick={() => handleDelete(item)}
                className="absolute top-2 left-2 z-10 p-1.5 bg-white/95 dark:bg-slate-800/95 text-slate-300 hover:text-red-500 rounded-lg border border-slate-100 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                title="Hapus Aset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className={cn(
                "bg-slate-50 dark:bg-black/10 relative overflow-hidden flex items-center justify-center",
                activeTab === 'characters' ? "aspect-square p-4" : "aspect-video"
              )}>
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className={cn(
                      "w-full h-full transition-transform duration-500 group-hover:scale-105",
                      activeTab === 'characters' ? "object-contain" : "object-cover"
                    )} 
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-200 dark:text-slate-800" />
                )}
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-white/5">
                <h3 
                  dir={isArabic(item.name) ? "rtl" : "ltr"}
                  className={cn(
                    "text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate",
                    isArabic(item.name) && "arabic-content"
                  )}
                >
                  {item.name}
                </h3>
                {activeTab === 'characters' && (
                  <p className="text-[9px] font-bold text-teal-600/70 dark:text-teal-500/60 uppercase tracking-widest mt-0.5">{item.role}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Minimalist Empty State */}
        {currentItems.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              {activeTab === 'characters' ? <Users className="w-6 h-6 text-slate-300" /> : <Mountain className="w-6 h-6 text-slate-300" />}
            </div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-white uppercase tracking-tight">Pustaka Kosong</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Belum ada {activeTab === 'characters' ? 'karakter' : 'background'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetLibrary;
