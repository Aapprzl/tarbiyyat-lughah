import React, { useEffect, useState } from 'react';
import { contentService } from '../../services/contentService';
import { Edit2, Award, Plus, Library, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Trash2, ChevronDown, ChevronUp, Diamond, FolderPlus, FilePlus, Crosshair, CheckSquare, Sliders, Orbit, MoreVertical, X, ShieldCheck, DoorOpen, Trophy, Gamepad } from 'lucide-react';
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

const colorOptions = [
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'teal', label: 'Teal', class: 'bg-teal-500' },
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' }
];

const AdminGames = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const confirm = useConfirm();
  const toast = useToast();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const [categoryForm, setCategoryForm] = useState({ title: '', icon: 'Gamepad2', desc: '', isLocked: false });
  const [topicTitle, setTopicTitle] = useState('');

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

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

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
    const ok = await confirm('Hapus seluruh kategori game ini beserta semua isinya?', 'Hapus Kategori');
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

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!topicTitle || !selectedCategoryId) return;

    setLoading(true);
    try {
        await contentService.addSpecialTopic(selectedCategoryId, topicTitle);
        await loadData();
        setShowTopicModal(false);
        setTopicTitle('');
        setSelectedCategoryId(null);
        toast.success('Unit Game baru ditambahkan! 🎮');
    } catch (err) {
        toast.error('Gagal menambahkan unit game.');
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteTopic = async (categoryId, topicId) => {
    const ok = await confirm('Yakin ingin menghapus Unit Game ini?', 'Hapus Unit');
    if (ok) {
        setLoading(true);
        try {
            await contentService.deleteSpecialProgram(categoryId, topicId);
            await loadData();
            toast.success('Unit Game dihapus.');
        } catch (err) {
            toast.error('Gagal menghapus unit game.');
        } finally {
            setLoading(false);
        }
    }
  };

  const openAddTopic = (catId) => {
    setSelectedCategoryId(catId);
    setShowTopicModal(true);
  };

  const toggleTopicLock = async (categoryId, topicId, currentLocked) => {
    setLoading(true);
    try {
        await contentService.updateTopicMetadata(topicId, { isLocked: !currentLocked });
        await loadData();
        toast.success(`Unit ${!currentLocked ? 'dikunci' : 'dibuka'}!`);
    } catch (err) {
        toast.error('Gagal mengubah status kunci.');
    } finally {
        setLoading(false);
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
           <p className="text-slate-500 dark:text-slate-400 font-medium">Atur kategori permainan dan unit tantangan belajar.</p>
        </div>
        
        <button 
          onClick={() => { setCategoryForm({ title: '', icon: 'Gamepad2', desc: '', isLocked: false }); setEditingCategoryId(null); setShowCategoryModal(true); }}
          className="group flex items-center justify-center bg-amber-500 text-white px-8 py-4 rounded-[1.5rem] font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
          Tambah Kategori Game
        </button>
      </div>


      {/* Categories List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
            {(categories || []).map((category, index) => {
              const IconComp = iconMap[category.icon] || Trophy;
              const isExpanded = expandedCategories[category.id];

              return (
                <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={category.id} 
                    className="bg-white dark:bg-white/5 rounded-[3rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div 
                    className={cn(
                        "flex items-center justify-between px-8 py-6 cursor-pointer transition-colors group",
                        isExpanded ? "bg-slate-50 dark:bg-white/5" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                    )}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn(
                          "w-14 h-14 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 shadow-lg",
                          isExpanded ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-white dark:bg-white/10 text-amber-600 border border-amber-500/20"
                      )}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white font-arabic tracking-tight">{category.title}</h3>
                        <div className="flex items-center gap-2">
                             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{category.topics?.length || 0} Unit Game</p>
                             {category.isLocked && (
                                 <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full ring-1 ring-amber-500/20">
                                     <ShieldCheck className="w-2.5 h-2.5" /> Terkunci
                                 </span>
                             )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => { e.stopPropagation(); toggleCategoryLock(category); }}
                            className={cn(
                                "p-3 rounded-2xl transition-all",
                                category.isLocked ? "text-amber-500 bg-amber-500/10" : "text-slate-400 hover:text-amber-500"
                            )}
                         >
                            {category.isLocked ? <ShieldCheck className="w-4 h-4" /> : <DoorOpen className="w-4 h-4" />}
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); openEditCategory(category); }}
                            className="p-3 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-2xl transition-all"
                         >
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                      <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                          isExpanded ? "bg-amber-500 text-white rotate-180" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                      )}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 pt-2">
                          <div className="h-px bg-slate-200 dark:bg-white/5 mb-8"></div>
                          
                          {category.topics?.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-black/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-white/5">
                              <Diamond className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-400 font-bold text-sm">Belum ada unit game yang ditambahkan.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {category.topics?.map(topic => (
                                <div 
                                    key={topic.id} 
                                    className="flex items-center justify-between p-5 bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-[2rem] hover:border-amber-500/30 transition-all group/topic"
                                >
                                  <div className="flex items-center gap-4">
                                     <div className={cn(
                                         "w-1.5 h-1.5 rounded-full",
                                         topic.isLocked ? "bg-amber-500 animate-pulse" : "bg-teal-500"
                                     )}></div>
                                     <div className="flex flex-col">
                                         <span className={cn(
                                             "font-bold font-arabic text-lg leading-tight",
                                             topic.isLocked ? "text-slate-400" : "text-slate-900 dark:text-white"
                                         )}>{topic.title}</span>
                                         {topic.isLocked && <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Akses Unit Dikunci</span>}
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => toggleTopicLock(category.id, topic.id, topic.isLocked)}
                                      className={cn(
                                          "p-2 rounded-xl transition-all border",
                                          topic.isLocked ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "text-slate-300 hover:text-amber-500 border-transparent hover:border-amber-100"
                                      )}
                                    >
                                      {topic.isLocked ? <ShieldCheck className="w-3.5 h-3.5" /> : <DoorOpen className="w-3.5 h-3.5" />}
                                    </button>
                                    <Link
                                      to={`/admin/edit/${topic.id}`}
                                      className="text-[10px] font-black uppercase tracking-widest bg-white dark:bg-white/10 text-teal-600 dark:text-teal-400 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all shadow-sm"
                                    >
                                      Edit Tantangan
                                    </Link>
                                    <button 
                                      onClick={() => handleDeleteTopic(category.id, topic.id)}
                                      className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <button 
                            onClick={() => openAddTopic(category.id)}
                            className="mt-6 w-full py-4 bg-amber-50 dark:bg-amber-500/5 border-2 border-dashed border-amber-200 dark:border-amber-500/20 rounded-[2rem] text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-all text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2"
                          >
                            <FilePlus className="w-4 h-4" />
                            Tambah Unit Baru
                          </button>
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>
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
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl relative border border-white/10">
                  <div className="p-10">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingCategoryId ? 'Edit Kategori Game' : 'Kategori Game Baru'}</h2>
                                <p className="text-sm text-slate-500 font-medium">Pengelompokan jenis tantangan belajar.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowCategoryModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <form onSubmit={handleSaveCategory} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Nama Game</label>
                                <input 
                                  type="text" 
                                  value={categoryForm.title}
                                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                                  className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-amber-500 shadow-sm outline-none outline-none"
                                  placeholder="Contoh: Teka Teki Nahwu"
                                  required
                                />
                             </div>

                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Ikon Game</label>
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
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Deskripsi Permainan</label>
                            <textarea 
                              value={categoryForm.desc}
                              onChange={(e) => setCategoryForm({ ...categoryForm, desc: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500 shadow-sm outline-none h-24 resize-none"
                              placeholder="Jelaskan cara bermain atau materi yang dicakup..."
                            />
                          </div>

                          <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                                   {categoryForm.isLocked ? <ShieldCheck className="w-6 h-6" /> : <DoorOpen className="w-6 h-6" />}
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Kunci Game ini</h4>
                             </div>
                             <button type="button" onClick={() => setCategoryForm({ ...categoryForm, isLocked: !categoryForm.isLocked })} className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", categoryForm.isLocked ? "bg-amber-500 text-white" : "bg-white dark:bg-white/5 text-slate-400")}>
                               {categoryForm.isLocked ? 'Terkunci' : 'Terbuka'}
                             </button>
                          </div>

                          <button type="submit" className="w-full py-4 bg-amber-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95">
                             {editingCategoryId ? 'Simpan Perubahan' : 'Terbitkan Kategori Game'}
                          </button>
                      </form>
                  </div>
               </motion.div>
            </div>
          )}
      </AnimatePresence>

      {/* Topic Modal */}
      <AnimatePresence>
          {showTopicModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTopicModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl relative border border-white/10">
                  <div className="p-10">
                      <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-600">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Unit Game Baru</h2>
                        </div>
                        <button onClick={() => setShowTopicModal(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <form onSubmit={handleAddTopic} className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Nama Tantangan / Level</label>
                            <input type="text" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none" placeholder="Contoh: Level 1 - Isim Isyarah" required autoFocus />
                         </div>
                         <button type="submit" className="w-full py-4 bg-teal-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition-all active:scale-95">
                            Tambah Unit Tantangan
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
