import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { contentService } from '../../services/contentService';
import { 
  Trophy, Award, Package, LineChart, Link2, Rocket, Pocket, LayoutGrid, Milestone, Heart, Crosshair, CheckSquare, Sliders, Orbit, MoveRight, ShieldCheck, Diamond, Medal, Gamepad as GamepadIcon, Play, Puzzle, Youtube, Music, ClipboardList, Layers, GripVertical, HelpCircle, MoveLeft, Image as ImageIcon, Keyboard, Type, Table, FileText, RefreshCcw, BrainCircuit, Shuffle, StretchHorizontal, Vibrate, Headphones, CaseSensitive, BookOpen, ALargeSmall, Library,
  Search, Telescope, ChevronRight, Dices, Joystick, Swords, Crown, Ghost, Brain, Gem, Zap, Star, CloudRain, Mountain
} from 'lucide-react';
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
  Shield: Milestone, // Using Milestone as Shield if Shield is missing or for Variety
  Crown: Crown,
  Ghost: Ghost,
  Brain: Brain,
  Heart: Heart,
  Diamond: Gem,
  Medal: Medal,
  Search: Search,
  Telescope: Telescope,
  // Fallbacks
  Gamepad2: Trophy,
  Box: Package,
  BookOpen: BookOpen
};

const AdminGames = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ title: '', icon: 'Gamepad2', desc: '', isLocked: false });

  const confirm = useConfirm();
  const toast = useToast();

  const loadData = async () => {
    try {
      const gamesData = await contentService.getGamesConfig();
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
        await contentService.updateGameCategory(editingCategoryId, categoryForm);
        toast.success('Kategori Game diperbarui!');
      } else {
        await contentService.addNewGameCategory(categoryForm.title, categoryForm.desc, categoryForm.icon);
        toast.success('Kategori Game baru dibuat!');
      }
      await loadData();
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
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
    const ok = await confirm('Hapus kategori game ini beserta semua kontennya?', 'Hapus Kategori');
    if (ok) {
      setLoading(true);
      try {
        await contentService.deleteGameCategory(catId);
        await loadData();
        toast.success('Kategori dihapus.');
      } catch (err) {
        toast.error('Gagal menghapus kategori.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && categories.length === 0) return (
    <div className="py-24 text-center">
        <div className="w-12 h-12 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Memuat data permainan...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manajemen Game</h1>
          <p className="text-sm text-slate-500 mt-1">Buat kategori permainan dan atur konten di dalamnya</p>
        </div>
        
        <button 
          onClick={() => { setCategoryForm({ title: '', icon: 'Gamepad2', desc: '', isLocked: false }); setEditingCategoryId(null); setShowCategoryModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Kategori Baru
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(categories || []).map((category) => {
          const IconComp = iconMap[category.icon] || Trophy;

          return (
            <div 
              key={category.id} 
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <IconComp className="w-7 h-7" />
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => openEditCategory(category)}
                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {category.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {category.desc || 'Tidak ada deskripsi.'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Package className="w-4 h-4" />
                  {category.blockCount !== undefined ? `${category.blockCount} Konten` : 'Konten Game'}
                </div>

                <Link
                  to={`/admin/edit/${category.id}`}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                >
                  Edit Konten <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      {typeof document !== 'undefined' && createPortal(
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
                                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Permainan</label>
                                      <input 
                                        type="text" 
                                        value={categoryForm.title}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                        placeholder="Contoh: Level 1"
                                        required
                                      />
                                   </div>

                                   <div>
                                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                                      <textarea 
                                        value={categoryForm.desc}
                                        onChange={(e) => setCategoryForm({ ...categoryForm, desc: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none h-24 resize-none"
                                        placeholder="Deskripsi singkat..."
                                      />
                                   </div>
                                </div>
  
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Ikon</label>
                                  <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                                     {Object.keys(iconMap).filter(k => !['Gamepad2', 'Box', 'BookOpen'].includes(k)).map(iconName => {
                                        const IconComp = iconMap[iconName];
                                        const isSelected = categoryForm.icon === iconName;
                                        return (
                                           <button
                                              key={iconName}
                                              type="button"
                                              onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                                              className={cn(
                                                  "aspect-square rounded-lg flex items-center justify-center transition-colors px-1",
                                                  isSelected 
                                                    ? "bg-teal-600 text-white" 
                                                    : "bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
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
  
                            <div className="flex gap-2 pt-2">
                              <button 
                                type="submit" 
                                className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
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
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default AdminGames;
