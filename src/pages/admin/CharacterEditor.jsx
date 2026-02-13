import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleUser, Plus, Trash2, Upload, X, Check, AlertCircle, Loader2, ImageIcon, Users } from 'lucide-react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { useToast } from '../../components/ui/Toast';
import { useConfirm } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';

const CharacterEditor = () => {
    const { success, error, warning } = useToast();
    const confirm = useConfirm();
    
    const [characters, setCharacters] = useState([]);
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
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            const data = await contentService.getCharacters();
            setCharacters(data);
        } catch (err) {
            error('Gagal memuat daftar karakter');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 500 * 1024) {
                warning('Ukuran gambar maksimal 500KB');
                return;
            }
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, image: url, imageFile: file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.role) {
            warning('Mohon isi nama dan peran karakter');
            return;
        }

        setUploading(true);
        try {
            let imageUrl = formData.image;

            // 1. Upload new image if file exists
            if (formData.imageFile) {
                imageUrl = await storageService.uploadFile(formData.imageFile, 'characters');
            }

            // 2. Create new character object
            const newChar = {
                id: `char_${Date.now()}`,
                name: formData.name,
                role: formData.role,
                image: imageUrl,
                createdAt: new Date().toISOString()
            };

            // 3. Save to global config
            const updatedCharacters = [newChar, ...characters];
            await contentService.saveCharacters(updatedCharacters);
            
            setCharacters(updatedCharacters);
            success('Karakter berhasil ditambahkan!');
            resetForm();
            setIsAdding(false);
        } catch (err) {
            error('Gagal menyimpan karakter');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (char) => {
        const confirmed = await confirm(`Hapus karakter "${char.name}"?`, 'Konfirmasi Hapus');
        if (confirmed) {
            try {
                // Delete image from storage if it's a storage URL
                if (char.image && char.image.includes('supabase')) {
                    await storageService.deleteFile(char.image);
                }

                const updatedCharacters = characters.filter(c => c.id !== char.id);
                await contentService.saveCharacters(updatedCharacters);
                setCharacters(updatedCharacters);
                success('Karakter berhasil dihapus');
            } catch (err) {
                error('Gagal menghapus karakter');
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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Karakter...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-16">
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Pustaka Karakter</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manajemen Aset Karakter Global</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => {
                        if (isAdding) resetForm();
                        setIsAdding(!isAdding);
                    }}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                        isAdding 
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300" 
                            : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20"
                    )}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? 'Batal' : 'Tambah Karakter'}
                </button>
            </div>

            {/* Add Character Form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-teal-500/20 shadow-xl relative overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
                            <div className="grid md:grid-cols-3 gap-8 items-start">
                                {/* Image Preview & Upload */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Visual Karakter</label>
                                    <div className="relative group aspect-[3/4] bg-slate-50 dark:bg-black/20 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden transition-all hover:border-teal-500/40">
                                        {formData.image ? (
                                            <div className="relative w-full h-full group">
                                                <img src={formData.image} className="w-full h-full object-contain p-4" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <label className="p-3 bg-white dark:bg-slate-800 rounded-2xl cursor-pointer hover:scale-110 transition-transform">
                                                        <Upload className="w-5 h-5 text-teal-600" />
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                                    </label>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, image: '', imageFile: null })}
                                                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl hover:text-red-500 hover:scale-110 transition-transform"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-teal-500/5 transition-colors group">
                                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                                    <ImageIcon className="w-8 h-8 text-slate-300" />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-4">
                                                    Pilih Foto<br/>Transparent PNG
                                                </span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-tighter italic">Recomended: PNG/SVG transparent background</p>
                                </div>

                                {/* Inputs */}
                                <div className="md:col-span-2 space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Nama Karakter</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                                                placeholder="Contoh: Sang Guru, Thariq..."
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Peran / Role</label>
                                            <input 
                                                type="text"
                                                className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all"
                                                placeholder="Contoh: Narrator, Guide, Antagonist..."
                                                value={formData.role}
                                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <button 
                                            type="submit"
                                            disabled={uploading}
                                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50 disabled:translate-y-0 active:scale-95 flex items-center justify-center gap-4"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5" />
                                                    Daftarkan Karakter Baru
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Characters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {characters.map((char) => (
                    <motion.div 
                        layout
                        key={char.id}
                        className="group relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-teal-500/40 transition-all hover:shadow-xl hover:shadow-teal-500/5"
                    >
                        <div className="aspect-[3/4] bg-slate-50 dark:bg-black/10 relative overflow-hidden flex items-center justify-center p-6">
                            {char.image ? (
                                <img src={char.image} alt={char.name} className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <CircleUser className="w-20 h-20 text-slate-200 dark:text-slate-800" />
                            )}
                            
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleDelete(char)}
                                    className="p-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="p-5 text-center space-y-1">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate px-2">{char.name}</h3>
                            <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">{char.role}</p>
                        </div>
                    </motion.div>
                ))}

                {/* Empty State */}
                {characters.length === 0 && !isAdding && (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Pustaka Kosong</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] max-w-xs mx-auto mt-2 leading-loose">
                            Daftarkan karakter pertama Anda untuk mulai bercerita.
                        </p>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="mt-8 text-teal-500 font-black text-xs uppercase tracking-widest border-b-2 border-teal-500/20 hover:border-teal-500 transition-colors pb-1"
                        >
                            + Mulai Tambahkan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharacterEditor;
