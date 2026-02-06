import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { contentService } from '../../services/contentService';
import { Edit2, Plus, Library, Package, LineChart, Link2, Award, Rocket, Pocket, LayoutGrid, Milestone, Heart, Trash2, ChevronDown, ChevronUp, Telescope, Layers, ClipboardList, MoveRight, Diamond, FolderPlus, MoreVertical, ExternalLink, ShieldCheck, DoorOpen, X, Trophy, Gamepad as GamepadIcon } from 'lucide-react';
import { useConfirm, useToast } from '../../components/Toast';
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
        toast.success('Materi baru berhasil ditambahkan! ✨');
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
          await contentService.updateSection(editingSectionId, newSectionTitle, selectedIcon, newSectionDesc);
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
      const ok = await confirm('Yakin ingin menghapus kategori ini? Semua materi di dalamnya akan ikut terhapus selamanya!', 'Hapus Kategori');
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
              <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Menyiapkan Dashboard...</p>
          </div>
      );
  }

  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-4 flex-1">
           <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.2em] text-[10px]">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div> Manajemen Konten
           </div>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">Command Center</h1>
           
           <div className="flex flex-wrap gap-4 pt-4">
              <div className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Materi</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">{curriculum.reduce((acc, s) => acc + (s.topics?.length || 0), 0)}</div>
              </div>
              <div className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Program</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">{specialPrograms.length}</div>
              </div>
              <div className="px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">{curriculum.length}</div>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto self-end pb-1">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingSectionId(null);
                setNewSectionTitle('');
                setNewSectionDesc('');
                setSelectedIcon('BookOpen');
                setShowSectionModal(true);
              }}
              className="relative group overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-teal-500/20 active:shadow-inner transition-all flex items-center justify-center min-w-[180px]"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
              
              <div className="relative flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <FolderPlus className="w-4 h-4 transition-transform group-hover:scale-110" />
                </div>
                <span>Kategori Baru</span>
              </div>
              
              {/* Glow border on hover */}
              <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-3xl transition-all duration-500"></div>
            </motion.button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="relative w-full md:w-96">
              <Telescope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Cari kategori atau materi..."
                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase tracking-widest px-4">
              Total: {curriculum.length} Kategori
          </div>
      </div>

      {/* Grid Content */}
      <div className="grid gap-6">
        {filteredCurriculum.length > 0 ? (
            (filteredCurriculum || []).map((section) => {
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
            <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Telescope className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Tidak ada hasil</h3>
                <p className="text-slate-500">Coba kata kunci lain atau buat kategori baru.</p>
            </div>
        )}
      </div>

      {/* Modals... */}
      {/* Category Modal - Ported from Games.jsx */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
            {showSectionModal && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSectionModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" />
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 icon-picker-modal rounded-[1.5rem] md:rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl relative border border-white/10 mx-4 md:mx-0 max-h-[90vh] flex flex-col">
                    <div className="p-4 md:p-10 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-5 md:mb-10">
                          <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                              <div className="w-9 h-9 md:w-12 md:h-12 bg-teal-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-teal-600 shrink-0">
                                  <Plus className="w-4 h-4 md:w-6 md:h-6" />
                              </div>
                              <div className="min-w-0">
                                  <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">{editingSectionId ? 'Edit Kategori' : 'Buat Kategori'}</h2>
                                  <p className="text-[10px] md:text-sm text-slate-500 font-medium truncate">Pengaturan kategori kurikulum.</p>
                              </div>
                          </div>
                          <button onClick={() => setShowSectionModal(false)} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shrink-0">
                              <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <form onSubmit={handleSaveSection} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
                                {/* Left Column: Inputs */}
                                <div className="md:col-span-7 space-y-6">
                                   <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Nama Kategori</label>
                                      <input 
                                        type="text" 
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-2.5 md:px-6 md:py-4 text-xs md:text-base text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-teal-500 shadow-sm outline-none"
                                        placeholder="Contoh: Shorof Dasar"
                                        autoFocus
                                        required
                                      />
                                   </div>

                                   <div className="space-y-3">
                                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4">Deskripsi</label>
                                      <textarea 
                                        value={newSectionDesc}
                                        onChange={(e) => setNewSectionDesc(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl md:rounded-2xl px-4 py-2.5 md:px-6 md:py-4 text-xs md:text-base text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500 shadow-sm outline-none h-20 md:h-32 resize-none leading-relaxed"
                                        placeholder="Deskripsi singkat tentang kategori ini..."
                                      />
                                   </div>
                                </div>
  
                                {/* Right Column: Icons */}
                                <div className="md:col-span-5 space-y-3">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Pilih Ikon</label>
                                  <div className="grid grid-cols-6 md:grid-cols-5 gap-1.5 md:gap-3 bg-slate-50 dark:bg-black/20 p-2 md:p-4 rounded-xl md:rounded-[2rem] border border-slate-200 dark:border-white/5 max-h-[200px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                                     {Object.keys(iconMap).map(iconName => {
                                        const IconComp = iconMap[iconName];
                                        const isSelected = selectedIcon === iconName;
                                        return (
                                           <button
                                              key={iconName}
                                              type="button"
                                              onClick={() => setSelectedIcon(iconName)}
                                              className={cn(
                                                  "aspect-square rounded-2xl flex items-center justify-center transition-all",
                                                  isSelected ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105" : "bg-white dark:bg-white/5 text-slate-300 hover:bg-white hover:text-teal-500 dark:hover:bg-white/10"
                                              )}
                                           >
                                              <IconComp className="w-5 h-5 md:w-6 md:h-6" />
                                           </button>
                                        );
                                     })}
                                  </div>
                                </div>
                            </div>
  
                            <div className="pt-2 md:pt-4 border-t border-slate-100 dark:border-white/5">
                              <button type="submit" className="w-full py-3 md:py-4 bg-teal-500 text-white rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95 text-[10px] md:text-sm">
                                  {editingSectionId ? 'Simpan Perubahan' : 'Buat Kategori'}
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
                <form onSubmit={handleAddTopic} className="space-y-4 md:space-y-6">
                  <div>
                    <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 md:mb-3">Judul Materi</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-4 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-sm md:text-lg"
                      placeholder="Contoh: Bab 1 - Pengenalan"
                      value={newTopicTitle}
                      onChange={e => setNewTopicTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Simpan ke Kategori</label>
                    <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white font-bold flex items-center justify-between text-sm md:text-base">
                         {curriculum.find(s => s.id === selectedSection)?.title}
                         <Layers className="w-4 h-4 text-teal-500" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-2 md:pt-4">
                    <button type="submit" disabled={!newTopicTitle || loading} className="w-full py-3 md:py-4 bg-teal-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                        Tambahkan Materi
                    </button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="w-full py-3 md:py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-slate-700 transition-colors">Batal</button>
                  </div>
                </form>
            </Modal>
          )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---

// --- Sub Components ---

const DashboardSectionItem = ({ section, iconMap, onEdit, onDelete, onDeleteTopic, onAddTopic, onReload }) => {
    const [isOpen, setIsOpen] = useState(false);
    const SectionIcon = iconMap[section.icon] || Library;
    const topicCount = section.topics?.length || 0;
    const [toggling, setToggling] = useState(false);

    const toggleLock = async (e) => {
        e.stopPropagation();
        setToggling(true);
        try {
            await contentService.updateSection(section.id, null, null, null, { isLocked: !section.isLocked });
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
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-2"
        >
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 cursor-pointer group"
            >
                {/* Icon */}
                <div className={cn(
                    "w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center transition-all bg-teal-600 text-white shadow-xl shadow-teal-500/20 shrink-0",
                    isOpen && "scale-105 rotate-3"
                )}>
                    <SectionIcon className="w-8 h-8 md:w-10 md:h-10" />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left min-w-0">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-arabic tracking-tight mb-2 group-hover:text-teal-600 transition-colors">{section.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mb-4 hidden md:block">
                        {section.desc || `Klik untuk melihat ${topicCount} topik materi dalam kategori ini.`}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <span className="bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                {topicCount} Materi
                            </span>
                            {section.isLocked && (
                                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full ring-1 ring-amber-500/20">
                                    <ShieldCheck className="w-3 h-3" /> Terkunci
                                </span>
                            )}
                            {topicCount === 0 && (
                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 uppercase tracking-widest">
                                    <Rocket className="w-3 h-3" /> Kosong
                                </span>
                            )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen) }}
                        className={cn(
                            "flex items-center justify-center gap-2 px-6 py-4 bg-teal-500 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-600 active:scale-95 transition-all w-full md:w-auto text-xs",
                            isOpen && "bg-slate-800 text-slate-300 shadow-none hover:bg-slate-700"
                        )}
                    >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        {isOpen ? 'Tutup Materi' : 'Lihat Materi'}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={toggleLock}
                            disabled={toggling}
                            className={cn(
                                "p-3 rounded-2xl transition-all border flex-1 md:flex-none justify-center flex",
                                section.isLocked 
                                ? "text-amber-500 bg-amber-500/10 border-amber-500/20" 
                                : "bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-amber-500 border-slate-200 dark:border-slate-700"
                            )}
                            title={section.isLocked ? "Buka Kunci" : "Kunci Kategori"}
                        >
                            {section.isLocked ? <ShieldCheck className="w-5 h-5" /> : <DoorOpen className="w-5 h-5" />}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-2xl transition-all bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-1 md:flex-none justify-center flex"
                            title="Edit Info"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex-1 md:flex-none justify-center flex"
                            title="Hapus Kategori"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/50"
                    >
                        <div className="p-6 md:p-8">
                        
                        {topicCount > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                { (section.topics || []).map((topic) => (
                                    <div key={topic.id} className={cn(
                                        "group/item flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-white dark:bg-slate-800 border rounded-[2rem] md:rounded-3xl transition-all gap-4 shadow-sm",
                                        topic.isLocked ? "border-amber-500/30 opacity-80" : "border-slate-200 dark:border-slate-700 hover:border-teal-500/30 hover:shadow-lg"
                                    )}>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                                                topic.isLocked ? "bg-amber-500 text-white" : "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover/item:bg-teal-500 group-hover/item:text-white"
                                            )}>
                                                {topic.isLocked ? <ShieldCheck className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 font-arabic text-lg tracking-tight truncate">{topic.title}</span>
                                                {topic.isLocked && <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest leading-none mt-0.5">Akses Terbatas</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 justify-end">
                                            <button 
                                                onClick={() => toggleTopicLock(topic.id, topic.isLocked)}
                                                className={cn(
                                                    "p-2 rounded-xl transition-all border",
                                                    topic.isLocked 
                                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                                                        : "bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-amber-500 border-slate-100 dark:border-slate-700"
                                                )}
                                                title={topic.isLocked ? "Buka Akses" : "Kunci Akses"}
                                            >
                                                {topic.isLocked ? <ShieldCheck className="w-4 h-4" /> : <DoorOpen className="w-4 h-4" />}
                                            </button>
                                            <Link 
                                                to={`/admin/edit/${topic.id}`}
                                                className="flex items-center gap-2 px-3 md:px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all border border-teal-500/20"
                                            >
                                                Edit <MoveRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                            </Link>
                                            <button 
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl"
                                                title="Hapus Materi"
                                                onClick={() => onDeleteTopic && onDeleteTopic(topic.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <Diamond className="w-10 h-10 mx-auto mb-4 text-slate-300 opacity-50" />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kategori ini belum memiliki materi.</p>
                            </div>
                        )}
                        <button 
                            onClick={onAddTopic}
                            className="mt-6 w-full group flex items-center justify-center gap-3 py-5 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] text-slate-500 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-500/5 transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                            Tambahkan Materi Ke Sini
                        </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Generic Modal Component
const Modal = ({ title, children, onClose }) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden mx-4 max-h-[90vh] flex flex-col"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500 z-10"></div>
                
                <div className="p-5 md:p-12 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-6 md:mb-10">
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
                        <button onClick={onClose} className="p-2 md:p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shrink-0">
                            <X className="w-5 h-5 md:w-6 md:h-6 text-slate-500" />
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
