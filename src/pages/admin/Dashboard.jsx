import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Edit2, Plus, BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile, Trash2, ChevronDown, ChevronUp, Search, Layers, FileText, ArrowRight, Sparkles, FolderPlus, MoreVertical, ExternalLink } from 'lucide-react';
import { useConfirm, useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const iconMap = {
  BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile
};

const AdminDashboard = () => {
  const [curriculum, setCurriculum] = useState([]);
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
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
    loadData();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
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
          await contentService.updateSection(editingSectionId, newSectionTitle, selectedIcon);
          toast.success('Kategori berhasil diperbarui!');
        } else {
          await contentService.addNewSection(newSectionTitle, selectedIcon);
          toast.success('Kategori baru berhasil dibuat!');
        }
    
        const data = await contentService.getCurriculum();
        setCurriculum(data);
        setShowSectionModal(false);
        setNewSectionTitle('');
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
      setSelectedIcon(section.icon || 'BookOpen');
      setShowSectionModal(true);
  };

  const filteredCurriculum = curriculum.filter(s => 
    (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.topics || []).some(t => (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <div className="px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Materi</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">{curriculum.reduce((acc, s) => acc + (s.topics?.length || 0), 0)}</div>
              </div>
              <div className="px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Program</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">{specialPrograms.length}</div>
              </div>
              <div className="px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</div>
                 <div className="text-xl font-black text-slate-900 dark:text-white">{curriculum.length}</div>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => {
                setEditingSectionId(null);
                setNewSectionTitle('');
                setSelectedIcon('BookOpen');
                setShowSectionModal(true);
              }}
              className="group flex-1 md:flex-none flex items-center justify-center bg-teal-600 text-white px-8 py-4.5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all"
            >
              <FolderPlus className="w-5 h-5 mr-3 transition-transform group-hover:scale-125" />
              Kategori Baru
            </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-white/5 p-4 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                 type="text" 
                 placeholder="Cari kategori atau materi..."
                 className="w-full bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
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
            filteredCurriculum.map((section) => (
                 <DashboardSectionItem 
                    key={section.id} 
                    section={section} 
                    iconMap={iconMap}
                    onEdit={() => openEditSection(section)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onDeleteTopic={handleDeleteTopic}
                    onAddTopic={() => {
                        setSelectedSection(section.id);
                        setShowAddModal(true);
                    }}
                 />
            ))
        ) : (
            <div className="py-24 text-center bg-white dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 text-center">Tidak ada hasil</h3>
                <p className="text-slate-500">Coba kata kunci lain atau buat kategori baru.</p>
            </div>
        )}
      </div>

      {/* Modals... */}
      <AnimatePresence>
          {showSectionModal && (
            <Modal title={editingSectionId ? 'Edit Kategori' : 'Buat Kategori Baru'} onClose={() => setShowSectionModal(false)}>
                <form onSubmit={handleSaveSection} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Nama Kategori</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-lg"
                      placeholder="Contoh: Shorof Dasar"
                      value={newSectionTitle}
                      onChange={e => setNewSectionTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Pilih Ikon Visual</label>
                    <div className="grid grid-cols-5 gap-3">
                        {Object.keys(iconMap).map(iconName => {
                           const Icon = iconMap[iconName];
                           const isSelected = selectedIcon === iconName;
                           return (
                             <button
                               key={iconName}
                               type="button"
                               onClick={() => setSelectedIcon(iconName)}
                               className={cn(
                                 "aspect-square rounded-2xl flex items-center justify-center transition-all border-2",
                                 isSelected 
                                   ? "bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-500/20 scale-105" 
                                   : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:border-teal-500/30"
                               )}
                             >
                               <Icon className="w-6 h-6" />
                             </button>
                           );
                        })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button type="submit" disabled={!newSectionTitle || loading} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                        {editingSectionId ? 'Simpan Perubahan' : 'Buat Kategori Sekarang'}
                    </button>
                    <button type="button" onClick={() => setShowSectionModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-slate-700 transition-colors">Batal</button>
                  </div>
                </form>
            </Modal>
          )}

          {showAddModal && (
            <Modal title="Tambah Materi Baru" onClose={() => setShowAddModal(false)}>
                <form onSubmit={handleAddTopic} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Judul Materi</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl px-5 py-4 focus:ring-2 focus:ring-teal-500 outline-none font-bold text-lg"
                      placeholder="Contoh: Bab 1 - Pengenalan"
                      value={newTopicTitle}
                      onChange={e => setNewTopicTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Simpan ke Kategori</label>
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 text-slate-900 dark:text-white font-bold flex items-center justify-between">
                         {curriculum.find(s => s.id === selectedSection)?.title}
                         <Layers className="w-4 h-4 text-teal-500" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-4">
                    <button type="submit" disabled={!newTopicTitle || loading} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                        Tambahkan Materi
                    </button>
                    <button type="button" onClick={() => setShowAddModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-slate-700 transition-colors">Batal</button>
                  </div>
                </form>
            </Modal>
          )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub Components ---

const DashboardSectionItem = ({ section, iconMap, onEdit, onDelete, onDeleteTopic, onAddTopic }) => {
    const [isOpen, setIsOpen] = useState(false);
    const SectionIcon = iconMap[section.icon] || BookOpen;
    const topicCount = section.topics?.length || 0;

    return (
        <motion.div 
            layout
            className="group bg-white dark:bg-white/5 rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl transition-all border-b-4 border-b-teal-500/50"
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:bg-teal-500/5 transition-colors"
            >
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-all duration-500",
                        isOpen ? "bg-teal-600 text-white scale-110 rotate-3" : "bg-white dark:bg-white/10 text-teal-500 group-hover:scale-110"
                    )}>
                        <SectionIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-1 font-arabic">{section.title}</h3>
                        <div className="flex items-center gap-3">
                             <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                 {topicCount} Topik
                             </span>
                             {topicCount === 0 && (
                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 uppercase tracking-widest">
                                    <Zap className="w-3 h-3" /> Kosong
                                </span>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:border-l border-slate-200 dark:border-white/10 md:pl-6">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-3 text-slate-400 hover:text-teal-600 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                        title="Edit Kategori"
                    >
                        <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                        title="Hapus Kategori"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className={cn("p-2 transition-transform duration-500", isOpen && "rotate-180")}>
                        <ChevronDown className="w-6 h-6 text-slate-300" />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-8 pt-0 bg-slate-50/50 dark:bg-black/20"
                    >
                        <div className="h-px w-full bg-slate-200 dark:bg-white/10 mb-8"></div>
                        
                        {topicCount > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {section.topics.map((topic) => (
                                    <div key={topic.id} className="group/item flex items-center justify-between p-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl hover:border-teal-500/30 hover:shadow-lg transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 group-hover/item:bg-teal-500 group-hover/item:text-white transition-all">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 font-arabic text-lg tracking-tight">{topic.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link 
                                                to={`/admin/edit/${topic.id}`}
                                                className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all border border-teal-500/20"
                                            >
                                                Edit <ArrowRight className="w-3 h-3" />
                                            </Link>
                                            <button 
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
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
                            <div className="text-center py-12 bg-white/50 dark:bg-black/10 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/5">
                                <Sparkles className="w-10 h-10 mx-auto mb-4 text-slate-300 opacity-50" />
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kategori ini masih kosong</p>
                            </div>
                        )}

                        <button 
                            onClick={onAddTopic}
                            className="mt-6 w-full group flex items-center justify-center gap-3 py-5 bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl text-slate-500 hover:border-teal-500 hover:text-teal-600 hover:bg-teal-500/5 transition-all text-xs font-black uppercase tracking-widest"
                        >
                            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                            Tambahkan Materi Ke Sini
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Generic Modal Component
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
        />
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-white/20 overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 via-indigo-500 to-purple-500"></div>
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
                <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
                    <X className="w-6 h-6 text-slate-500" />
                </button>
            </div>
            {children}
        </motion.div>
    </div>
);

const X = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default AdminDashboard;
