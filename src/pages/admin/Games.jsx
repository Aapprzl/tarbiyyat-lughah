import React, { useEffect, useState } from 'react';
import { contentService } from '../../services/contentService';
import { Edit2, Award, Plus, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Trash2, ChevronDown, Diamond, FolderPlus, Crosshair, CheckSquare, Sliders, Orbit, X, ShieldCheck, DoorOpen, Trophy, Gamepad, PlayCircle } from 'lucide-react';
import { useConfirm, useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

const iconMap = {
  Gamepad2: Trophy, 
  Star: Award, 
  Box: Package, 
  Activity: LineChart, 
  Hash: Link2, 
  Zap: Rocket, 
  Bookmark: Pocket, 
  Layout: LayoutGrid, 
  Flag: Milestone, 
  Target: Crosshair, 
  ListChecks: CheckSquare, 
  Settings: Sliders, 
  Globe: Orbit, 
  Sparkles: Diamond,
  PlayCircle: Gamepad,
  Play: Gamepad
};

const AdminGames = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const toast = useToast();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  
  const [categoryForm, setCategoryForm] = useState({ title: '', icon: 'Gamepad2', desc: '', isLocked: false });

  const loadData = async () => {
    try {
      const gamesData = await contentService.getSpecialPrograms();
      setCategories(gamesData);
    } catch (err) {
      toast.error('Gagal memuat Data Game.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.title) return;

    setLoading(true);
    try {
      if (editingCategoryId) {
        await contentService.updateSpecialCategory(editingCategoryId, categoryForm.title, categoryForm.icon, categoryForm.desc, { isLocked: categoryForm.isLocked });
        toast.success('Kategori Game diperbarui!');
      } else {
        await contentService.addSpecialCategory(categoryForm.title, categoryForm.icon, categoryForm.desc);
        toast.success('Kategori Game baru dibuat!');
      }
      await loadData();
      setShowCategoryModal(false);
    } catch (err) {
      toast.error('Gagal menyimpan kategori.');
    } finally {
      setLoading(false);
    }
  };

  const openEditCategory = (category) => {
    setCategoryForm({ 
        title: category.title || '', 
        icon: category.icon || 'Gamepad2', 
        desc: category.desc || '',
        isLocked: category.isLocked || false
    });
    setEditingCategoryId(category.id);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (catId) => {
    const ok = await confirm('Hapus kategori game ini beserta semua isinya?', 'Hapus Kategori');
    if (ok) {
      setLoading(true);
      try {
        await contentService.deleteSpecialCategory(catId);
        await loadData();
        toast.success('Kategori dihapus.');
      } catch (err) {
        toast.error('Gagal menghapus kategori.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCategoryLock = async (category) => {
    try {
        await contentService.updateSpecialCategory(category.id, null, null, null, { isLocked: !category.isLocked });
        await loadData();
        toast.success(`Kategori ${!category.isLocked ? 'dikunci' : 'dibuka'}!`);
    } catch (err) {
        toast.error('Gagal mengubah status kunci.');
    }
  };


  if (loading && categories.length === 0) return (
    <div className="py-24 text-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Memuat Data Permainan...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
           <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
              <Trophy className="w-3 h-3" /> Dashboard Edukasi
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Manajemen Game</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Buat kategori permainan dan isi dengan konten interaktif.</p>
        </div>
        
        <button 
          onClick={() => { setCategoryForm({ title: '', icon: 'Gamepad2', desc: '', isLocked: false }); setEditingCategoryId(null); setShowCategoryModal(true); }}
          className="group flex items-center justify-center bg-amber-500 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
          Buat Kategori Baru
        </button>
      </div>


      {/* Categories List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
            {(categories || []).map((category, index) => {
              const IconComp = iconMap[category.icon] || Trophy;

              return (
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={category.id} 
                    className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-2"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
                      {/* Icon */}
                      <div className={cn(
                          "w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transition-all bg-amber-500 text-white shadow-xl shadow-amber-500/20 shrink-0"
                      )}>
                        <IconComp className="w-8 h-8 md:w-10 md:h-10" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 text-center md:text-left min-w-0">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-arabic tracking-tight mb-2">{category.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2 md:line-clamp-1 mb-4">{category.desc || 'Tidak ada deskripsi.'}</p>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                             <div className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                 {category.items?.length || 0} Konten
                             </div>
                             {category.isLocked && (
                                 <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full ring-1 ring-amber-500/20">
                                     <ShieldCheck className="w-3 h-3" /> Terkunci
                                 </span>
                             )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                          <Link 
                             to={`/admin/edit/${category.id}`}
                             className="flex items-center justify-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 active:scale-95 transition-all w-full md:w-auto text-xs"
                          >
                             <PlayCircle className="w-4 h-4" />
                             Edit Konten
                          </Link>
                          
                          <div className="flex items-center justify-center gap-2">
                                <button 
                                    onClick={() => toggleCategoryLock(category)}
                                    className={cn(
                                        "p-3 rounded-2xl transition-all border flex-1 md:flex-none justify-center flex",
                                        category.isLocked 
                                        ? "text-amber-500 bg-amber-500/10 border-amber-500/20" 
                                        : "bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-amber-500 border-slate-200 dark:border-slate-700"
                                    )}
                                    title={category.isLocked ? "Buka Kunci" : "Kunci Kategori"}
                                >
                                    {category.isLocked ? <ShieldCheck className="w-5 h-5" /> : <DoorOpen className="w-5 h-5" />}
                                </button>
                                <button 
                                    onClick={() => openEditCategory(category)}
                                    className="p-3 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-2xl transition-all bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-1 md:flex-none justify-center flex"
                                    title="Edit Info"
                                >
                                    <Sliders className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-1 md:flex-none justify-center flex"
                                    title="Hapus Kategori"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                          </div>
                      </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
          {showCategoryModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative border border-white/10">
                  <div className="p-6 md:p-10">
                      <div className="flex items-center justify-between mb-8 md:mb-10">
                        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
                                <Plus className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{editingCategoryId ? 'Edit Info Game' : 'Buat Kategori Baru'}</h2>
                                <p className="text-[10px] md:text-sm text-slate-500 font-medium truncate">Pengaturan nama dan ikon kategori.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowCategoryModal(false)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0">
                            <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <form onSubmit={handleSaveCategory} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Nama Kategori</label>
                                <input 
                                  type="text" 
                                  value={categoryForm.title}
                                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 shadow-sm outline-none outline-none"
                                  placeholder="Contoh: Level 1"
                                  required
                                />
                             </div>

                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Ikon</label>
                                <div className="grid grid-cols-5 gap-2 bg-slate-50 dark:bg-black/20 p-3 rounded-2xl border border-slate-200 dark:border-white/5">
                                   {Object.keys(iconMap).map(iconName => {
                                      const IconComp = iconMap[iconName];
                                      const isSelected = categoryForm.icon === iconName;
                                      return (
                                         <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                                            className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                isSelected ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "text-slate-400"
                                            )}
                                         >
                                            <IconComp className="w-5 h-5" />
                                         </button>
                                      );
                                   })}
                                </div>
                             </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Deskripsi</label>
                            <textarea 
                              value={categoryForm.desc}
                              onChange={(e) => setCategoryForm({ ...categoryForm, desc: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 shadow-sm outline-none h-24 resize-none"
                              placeholder="Deskripsi singkat tentang kategori ini..."
                            />
                          </div>

                          <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                                   {categoryForm.isLocked ? <ShieldCheck className="w-6 h-6" /> : <DoorOpen className="w-6 h-6" />}
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Kunci Kategori</h4>
                             </div>
                             <button type="button" onClick={() => setCategoryForm({ ...categoryForm, isLocked: !categoryForm.isLocked })} className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", categoryForm.isLocked ? "bg-amber-500 text-white" : "bg-white dark:bg-white/5 text-slate-400")}>
                               {categoryForm.isLocked ? 'Terkunci' : 'Terbuka'}
                             </button>
                          </div>

                          <button type="submit" className="w-full py-4 bg-amber-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95">
                             {editingCategoryId ? 'Simpan Perubahan' : 'Buat Kategori'}
                          </button>
                      </form>
                  </div>
               </motion.div>
            </div>
          )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGames;
