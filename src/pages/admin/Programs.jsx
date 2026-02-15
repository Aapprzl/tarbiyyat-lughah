import React, { useEffect, useState } from 'react';
import { contentService } from '../../services/contentService';
import { Edit2, Award, Plus, Library, Package, Rocket, LayoutGrid, Trash2, ChevronDown, ChevronUp, Crosshair, X, Lock, Unlock, Gamepad as GamepadIcon, Trophy, Puzzle, Dices, Joystick, Swords, Crown, Ghost, Brain, Heart, Gem, Medal, Zap, Star, Shield } from 'lucide-react';
import { useConfirm, useToast } from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import { Link } from 'react-router-dom';

const iconMap = {
  Trophy: Trophy,
  Gamepad: GamepadIcon,
  Puzzle: Puzzle,
  Rocket: Rocket,
  Target: Crosshair,
  Zap: Zap,
  Award: Award,
  Star: Star,
  Dices: Dices,
  Joystick: Joystick,
  Swords: Swords,
  Shield: Shield,
  Crown: Crown,
  Ghost: Ghost,
  Brain: Brain,
  Heart: Heart,
  Diamond: Gem,
  Medal: Medal,
  // Fallbacks for compatibility
  BookOpen: Library,
  Box: Package,
  Zap_Old: Rocket
};

const AdminPrograms = () => {
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const confirm = useConfirm();
  const toast = useToast();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const [categoryForm, setCategoryForm] = useState({ title: '', icon: 'Star', desc: '', isLocked: false });
  const [topicTitle, setTopicTitle] = useState('');

  const loadData = async () => {
    try {
      const data = await contentService.getSpecialPrograms();
      setSpecialPrograms(data);
    } catch {
      toast.error('Gagal memuat Program Khusus.');
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
        await contentService.updateSpecialCategory(editingCategoryId, {
          title: categoryForm.title,
          description: categoryForm.desc,
          icon: categoryForm.icon,
          isLocked: categoryForm.isLocked
        });
        toast.success('Kategori diperbarui!');
      } else {
        await contentService.addSpecialCategory(categoryForm.title, categoryForm.icon, categoryForm.desc);
        toast.success('Kategori baru dibuat!');
      }
      await loadData();
      setShowCategoryModal(false);
    } catch {
      toast.error('Gagal menyimpan kategori.');
    } finally {
      setLoading(false);
    }
  };

  const openEditCategory = (category) => {
    setCategoryForm({ 
        title: category.title || '', 
        icon: category.icon || 'Star', 
        desc: category.desc || '',
        isLocked: category.isLocked || false
    });
    setEditingCategoryId(category.id);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (catId) => {
    const ok = await confirm('Hapus seluruh kategori ini beserta semua isinya?', 'Hapus Kategori');
    if (ok) {
      setLoading(true);
      try {
        await contentService.deleteSpecialCategory(catId);
        await loadData();
        toast.success('Kategori dihapus.');
      } catch {
        toast.error('Gagal menghapus kategori.');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCategoryLock = async (category) => {
    try {
        await contentService.updateSpecialCategory(category.id, { isLocked: !category.isLocked });
        await loadData();
        toast.success(`Kategori ${!category.isLocked ? 'dikunci' : 'dibuka'}!`);
    } catch {
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
        toast.success('Topik baru ditambahkan!');
    } catch {
        toast.error('Gagal menambahkan topik.');
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteTopic = async (categoryId, topicId) => {
    const ok = await confirm('Yakin ingin menghapus Topik ini?', 'Hapus Topik');
    if (ok) {
        setLoading(true);
        try {
            await contentService.deleteSpecialProgram(categoryId, topicId);
            await loadData();
            toast.success('Topik dihapus.');
        } catch {
            toast.error('Gagal menghapus topik.');
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
        toast.success(`Topik ${!currentLocked ? 'dikunci' : 'dibuka'}!`);
    } catch {
        toast.error('Gagal mengubah status kunci.');
    } finally {
        setLoading(false);
    }
  };

  if (loading && specialPrograms.length === 0) return (
    <div className="py-24 text-center">
        <div className="w-12 h-12 border-3 border-slate-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Memuat program khusus...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Program Khusus</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola kategori dan topik program pembelajaran khusus</p>
        </div>
        
        <button 
          onClick={() => { setCategoryForm({ title: '', icon: 'Star', desc: '', isLocked: false }); setEditingCategoryId(null); setShowCategoryModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Kategori Baru
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {specialPrograms.length > 0 ? (
          specialPrograms.map((category) => {
            if (!category) return null;
            const IconComp = iconMap[category.icon] || Award;
            const isExpanded = expandedCategories[category.id];

            return (
              <div 
                key={category.id} 
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                {/* Category Header */}
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{category.title}</h3>
                      <p className="text-sm text-slate-500">
                        {category.topics?.length || 0} Materi
                        {category.isLocked && ' • Terkunci'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleCategoryLock(category); }}
                      className={cn(
                          "p-2 rounded-lg transition-colors",
                          category.isLocked ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      )}
                      title={category.isLocked ? "Buka Kunci" : "Kunci Kategori"}
                    >
                      {category.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); openEditCategory(category); }}
                      className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleCategory(category.id) }}
                      className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Topics List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: "auto" }} 
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-200 dark:border-slate-700"
                    >
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                      
                      {category.topics?.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                          Belum ada topik yang ditambahkan.
                        </div>
                      ) : (
                        category.topics?.map(topic => (
                          <div 
                            key={topic.id} 
                            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  topic.isLocked ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                              )}>
                                {topic.isLocked ? <Lock className="w-4 h-4" /> : <Library className="w-4 h-4" />}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-white arabic-index-topic transition-all leading-tight">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleTopicLock(category.id, topic.id, topic.isLocked)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    topic.isLocked ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                )}
                                title={topic.isLocked ? "Buka Akses" : "Kunci Akses"}
                              >
                                {topic.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </button>
                              <Link
                                to={`/admin/edit/${topic.id}`}
                                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition-colors"
                              >
                                Edit
                              </Link>
                              <button 
                                onClick={() => handleDeleteTopic(category.id, topic.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      <button 
                        onClick={() => openAddTopic(category.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Topik
                      </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
            <LayoutGrid className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Program Masih Kosong</h2>
            <p className="text-slate-500 text-sm">Mulai dengan menambahkan kategori pertama.</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowCategoryModal(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-2xl relative shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingCategoryId ? 'Edit Kategori' : 'Kategori Baru'}
                  </h2>
                  <button 
                    onClick={() => setShowCategoryModal(false)} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Program</label>
                        <input 
                          type="text" 
                          value={categoryForm.title}
                          onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          style={{ fontFamily: 'var(--font-latin)' }}
                          placeholder="Contoh: Tahsin Al-Qur'an"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                        <textarea 
                          value={categoryForm.desc}
                          onChange={(e) => setCategoryForm({ ...categoryForm, desc: e.target.value })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none h-24 resize-none"
                          style={{ fontFamily: 'var(--font-latin)' }}
                          placeholder="Penjelasan singkat tentang program ini..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Ikon</label>
                      <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                        {Object.keys(iconMap).filter(k => !['BookOpen', 'Box', 'Zap_Old'].includes(k)).map(iconName => {
                          const IconComp = iconMap[iconName];
                          const isSelected = categoryForm.icon === iconName;
                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                              className={cn(
                                  "aspect-square rounded-lg flex items-center justify-center transition-colors px-1",
                                  isSelected ? "bg-amber-600 text-white" : "bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              )}
                              title={iconName}
                            >
                              <IconComp className="w-5 h-5" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-amber-600">
                        {categoryForm.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Status Akses</h4>
                        <p className="text-xs text-slate-500">{categoryForm.isLocked ? 'Terkunci' : 'Publik'}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, isLocked: !categoryForm.isLocked })}
                      className={cn(
                          "px-4 py-2 rounded-lg text-xs font-medium transition-colors",
                          categoryForm.isLocked ? "bg-amber-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600"
                      )}
                    >
                      {categoryForm.isLocked ? 'Terkunci' : 'Publik'}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                    >
                      {editingCategoryId ? 'Simpan Perubahan' : 'Buat Kategori'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowCategoryModal(false)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Topic Modal */}
      <AnimatePresence>
        {showTopicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowTopicModal(false)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-lg relative shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Topik Baru</h2>
                  <button 
                    onClick={() => setShowTopicModal(false)} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddTopic} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Unit / Topik</label>
                    <input 
                      type="text" 
                      value={topicTitle}
                      onChange={(e) => setTopicTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      placeholder="Nama topik pembelajaran..."
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit" 
                      className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                    >
                      Tambah Topik
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowTopicModal(false)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPrograms;
