import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { contentService } from '../../services/contentService';
import { Edit2, Plus, Library, Package, LineChart, Link2, Award, Rocket, Pocket, LayoutGrid, Milestone, Heart, Trash2, ChevronDown, ChevronUp, Search, Lock, Unlock, X, Gamepad as GamepadIcon } from 'lucide-react';
import { useConfirm, useToast } from '../../components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const iconMap = {
  BookOpen: Library, 
  Box: Package, 
  Activity: LineChart, 
  Hash: Link2, 
  Star: Award, 
  Zap: Rocket, 
  Bookmark: Pocket, 
  Layout: LayoutGrid, 
  Flag: Milestone, 
  Smile: Heart,
  PlayCircle: GamepadIcon,
  Play: GamepadIcon
};

const AdminDashboard = () => {
  const [curriculum, setCurriculum] = useState([]);
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  const loadData = async () => {
    try {
      const data = await contentService.getCurriculum();
      setCurriculum(data);
      const progs = await contentService.getSpecialPrograms();
      setSpecialPrograms(progs);
    } catch (err) {
        toast.error("Gagal memuat data dashboard.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDesc, setNewSectionDesc] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('BookOpen');  
  const [selectedSection, setSelectedSection] = useState('');
  const [editingSectionId, setEditingSectionId] = useState(null);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle || !selectedSection) return;

    setLoading(true);
    try {
        await contentService.addNewTopic(selectedSection, newTopicTitle);
        const data = await contentService.getCurriculum();
        setCurriculum(data);
        setShowAddModal(false);
        setNewTopicTitle('');
        toast.success('Materi baru berhasil ditambahkan!');
    } catch (err) {
        toast.error(err.message || 'Gagal menambahkan topik');
    } finally {
        setLoading(false);
    }
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle) return;

    setLoading(true);
    try {
        if (editingSectionId) {
          await contentService.updateSection(editingSectionId, {
            title: newSectionTitle,
            description: newSectionDesc,
            icon: selectedIcon
          });
          toast.success('Kategori berhasil diperbarui!');
        } else {
          await contentService.addNewSection(newSectionTitle, selectedIcon, newSectionDesc);
          toast.success('Kategori baru berhasil dibuat!');
        }
    
        const data = await contentService.getCurriculum();
        setCurriculum(data);
        setShowSectionModal(false);
        setNewSectionTitle('');
        setNewSectionDesc('');
        setSelectedIcon('BookOpen');
        setEditingSectionId(null);
    } catch (err) {
        toast.error(err.message || 'Gagal menyimpan kategori');
    } finally {
        setLoading(false);
    }
  };
  
  const handleDeleteSection = async (sectionId) => {
      const ok = await confirm('Yakin ingin menghapus kategori ini? Semua materi di dalamnya akan ikut terhapus!', 'Hapus Kategori');
      if (ok) {
          setLoading(true);
          try {
              await contentService.deleteSection(sectionId);
              const data = await contentService.getCurriculum();
              setCurriculum(data);
              toast.success('Kategori telah dihapus.');
          } catch (err) {
              toast.error(err.message || 'Gagal menghapus kategori');
          } finally {
              setLoading(false);
          }
      }
  };

  const handleDeleteTopic = async (topicId) => {
      const ok = await confirm('Hapus materi ini secara permanen?', 'Hapus Materi');
      if (ok) {
          setLoading(true);
          try {
              await contentService.deleteTopic(topicId);
              const data = await contentService.getCurriculum();
              setCurriculum(data);
              toast.success('Materi berhasil dihapus.');
          } catch (err) {
            toast.error(err.message || 'Gagal menghapus materi');
          } finally {
            setLoading(false);
          }
      }
  };

  const openEditSection = (section) => {
      setEditingSectionId(section.id);
      setNewSectionTitle(section.title);
      setNewSectionDesc(section.desc || '');
      setSelectedIcon(section.icon || 'BookOpen');
      setShowSectionModal(true);
  };

  const filteredCurriculum = (Array.isArray(curriculum) ? curriculum : []).filter(s => {
    if (!s) return false;
    const titleMatch = (s.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const topicsMatch = (s.topics || []).some(t => t && (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return titleMatch || topicsMatch;
  });

  if (loading && curriculum.length === 0) {
      return (
          <div className="py-24 text-center">
              <div className="w-12 h-12 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 text-sm">Memuat dashboard...</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {curriculum.reduce((acc, s) => acc + (s.topics?.length || 0), 0)} Materi • {curriculum.length} Kategori • {specialPrograms.length} Program
          </p>
        </div>
        
        <button 
          onClick={() => {
            setEditingSectionId(null);
            setNewSectionTitle('');
            setNewSectionDesc('');
            setSelectedIcon('BookOpen');
            setShowSectionModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Kategori Baru
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari kategori atau materi..."
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
          style={{ fontFamily: 'var(--font-latin)' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {filteredCurriculum.length > 0 ? (
            filteredCurriculum.map((section) => {
                  if (!section) return null;
                  return (
                    <DashboardSectionItem 
                        key={section.id || Math.random()} 
                        section={section} 
                        iconMap={iconMap}
                        onEdit={() => openEditSection(section)}
                        onDelete={() => handleDeleteSection(section.id)}
                        onDeleteTopic={handleDeleteTopic}
                        onReload={loadData}
                        onAddTopic={() => {
                            setSelectedSection(section.id);
                            setShowAddModal(true);
                        }}
                    />
                  );
            })
        ) : (
            <div className="py-16 text-center bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Tidak ada hasil</h3>
                <p className="text-slate-500 text-sm">Coba kata kunci lain atau buat kategori baru.</p>
            </div>
        )}
      </div>

      {/* Category Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
            {showSectionModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }} 
                   onClick={() => setShowSectionModal(false)} 
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
                            {editingSectionId ? 'Edit Kategori' : 'Buat Kategori'}
                          </h2>
                          <button 
                            onClick={() => setShowSectionModal(false)} 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <form onSubmit={handleSaveSection} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-4">
                                   <div>
                                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Kategori</label>
                                      <input 
                                        type="text" 
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                        style={{ fontFamily: 'var(--font-latin)' }}
                                        placeholder="Contoh: Shorof Dasar"
                                        autoFocus
                                        required
                                      />
                                   </div>

                                   <div>
                                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
                                      <textarea 
                                        value={newSectionDesc}
                                        onChange={(e) => setNewSectionDesc(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none h-24 resize-none"
                                        style={{ fontFamily: 'var(--font-latin)' }}
                                        placeholder="Deskripsi singkat tentang kategori ini..."
                                      />
                                   </div>
                                </div>
  
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pilih Ikon</label>
                                  <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                                     {Object.keys(iconMap).map(iconName => {
                                        const IconComp = iconMap[iconName];
                                        const isSelected = selectedIcon === iconName;
                                        return (
                                           <button
                                              key={iconName}
                                              type="button"
                                              onClick={() => setSelectedIcon(iconName)}
                                              className={cn(
                                                  "aspect-square rounded-lg flex items-center justify-center transition-colors",
                                                  isSelected 
                                                    ? "bg-teal-600 text-white" 
                                                    : "bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                              )}
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
                                {editingSectionId ? 'Simpan Perubahan' : 'Buat Kategori'}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setShowSectionModal(false)}
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

      {/* Add Topic Modal */}
      <AnimatePresence>
          {showAddModal && (
            <Modal title="Tambah Materi Baru" onClose={() => setShowAddModal(false)}>
                <form onSubmit={handleAddTopic} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Judul Materi</label>
                    <input 
                      type="text" 
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      style={{ fontFamily: 'var(--font-latin)' }}
                      placeholder="Contoh: Bab 1 - Pengenalan"
                      value={newTopicTitle}
                      onChange={e => setNewTopicTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Simpan ke Kategori</label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium">
                         {curriculum.find(s => s.id === selectedSection)?.title}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      type="submit" 
                      disabled={!newTopicTitle || loading} 
                      className="flex-1 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tambahkan Materi
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddModal(false)} 
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </form>
            </Modal>
          )}
      </AnimatePresence>
    </div>
  );
};

// Section Item Component
const DashboardSectionItem = ({ section, iconMap, onEdit, onDelete, onDeleteTopic, onAddTopic, onReload }) => {
    const [isOpen, setIsOpen] = useState(false);
    const SectionIcon = iconMap[section.icon] || Library;
    const topicCount = section.topics?.length || 0;
    const [toggling, setToggling] = useState(false);

    const toggleLock = async (e) => {
        e.stopPropagation();
        setToggling(true);
        try {
            await contentService.updateSection(section.id, { isLocked: !section.isLocked });
            onReload();
        } finally {
            setToggling(false);
        }
    };

    const toggleTopicLock = async (topicId, currentLocked) => {
        setToggling(true);
        try {
            await contentService.updateTopicMetadata(topicId, { isLocked: !currentLocked });
            onReload();
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
                {/* Icon */}
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center shrink-0">
                    <SectionIcon className="w-6 h-6" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">{section.title}</h3>
                    <p className="text-sm text-slate-500 truncate">
                        {topicCount} Materi
                        {section.isLocked && ' • Terkunci'}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button 
                        onClick={toggleLock}
                        disabled={toggling}
                        className={cn(
                            "p-2 rounded-lg transition-colors",
                            section.isLocked 
                            ? "text-amber-600 bg-amber-50 dark:bg-amber-900/20" 
                            : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        )}
                        title={section.isLocked ? "Buka Kunci" : "Kunci Kategori"}
                    >
                        {section.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: "auto" }} 
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-slate-200 dark:border-slate-700"
                    >
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 space-y-2">
                        
                        {topicCount > 0 ? (
                            section.topics.map((topic) => (
                                <div 
                                    key={topic.id} 
                                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            topic.isLocked 
                                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" 
                                                : "bg-teal-50 dark:bg-teal-900/30 text-teal-600"
                                        )}>
                                            {topic.isLocked ? <Lock className="w-4 h-4" /> : <Library className="w-4 h-4" />}
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-white truncate text-sm">{topic.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button 
                                            onClick={() => toggleTopicLock(topic.id, topic.isLocked)}
                                            className={cn(
                                                "p-1.5 rounded-lg transition-colors",
                                                topic.isLocked 
                                                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" 
                                                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
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
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Hapus"
                                            onClick={() => onDeleteTopic && onDeleteTopic(topic.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Kategori ini belum memiliki materi.
                            </div>
                        )}
                        
                        <button 
                            onClick={onAddTopic}
                            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Materi
                        </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Generic Modal Component
const Modal = ({ title, children, onClose }) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-lg shadow-xl"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>,
        document.body
    );
};

export default AdminDashboard;
