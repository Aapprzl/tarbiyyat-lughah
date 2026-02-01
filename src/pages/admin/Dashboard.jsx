import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Edit2, Plus, BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile, Trash2 } from 'lucide-react';
import { useConfirm, useToast } from '../../components/Toast';

const iconMap = {
  BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile
};

const AdminDashboard = () => {
  const [curriculum, setCurriculum] = useState([]);
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    const loadData = async () => {
      const data = await contentService.getCurriculum();
      setCurriculum(data);
      const progs = await contentService.getSpecialPrograms();
      setSpecialPrograms(progs);
      setLoading(false);
    };
    loadData();
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('BookOpen'); 
  const [selectedSection, setSelectedSection] = useState('');
  
  // Edit Mode State
  const [editingSectionId, setEditingSectionId] = useState(null);

  // Handle Add Topic
  // Handle Add Topic
  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle || !selectedSection) return;

    setLoading(true);
    try {
        await contentService.addNewTopic(selectedSection, newTopicTitle);
        
        // Refresh Data & Reset
        const data = await contentService.getCurriculum();
        setCurriculum(data);
        setShowAddModal(false);
        setNewTopicTitle('');
        toast.success('Topik berhasil ditambahkan!');
    } catch (err) {
        console.error(err);
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
          // Edit Mode
          await contentService.updateSection(editingSectionId, newSectionTitle, selectedIcon);
          toast.success('Kategori berhasil diperbarui!');
        } else {
          // Add Mode
          await contentService.addNewSection(newSectionTitle, selectedIcon);
          toast.success('Kategori berhasil dibuat!');
        }
    
        // Refresh Data & Reset
        const data = await contentService.getCurriculum();
        setCurriculum(data);
        setShowSectionModal(false);
        setNewSectionTitle('');
        setSelectedIcon('BookOpen');
        setEditingSectionId(null);
    } catch (err) {
        console.error(err);
        toast.error(err.message || 'Gagal menyimpan kategori');
    } finally {
        setLoading(false);
    }
  };
  
  const handleDeleteSection = async (sectionId) => {
      const ok = await confirm('Yakin ingin menghapus Kategori ini? Semua topik di dalamnya juga akan terhapus!', 'Hapus Kategori');
      if (ok) {
          setLoading(true);
          try {
              await contentService.deleteSection(sectionId);
              const data = await contentService.getCurriculum();
              setCurriculum(data);
              toast.success('Kategori berhasil dihapus!');
          } catch (err) {
              console.error(err);
              toast.error(err.message || 'Gagal menghapus kategori');
          } finally {
              setLoading(false);
          }
      }
  };

  const handleDeleteTopic = async (topicId) => {
      const ok = await confirm('Yakin ingin menghapus Materi ini?', 'Hapus Materi');
      if (ok) {
          setLoading(true);
          try {
              await contentService.deleteTopic(topicId);
              const data = await contentService.getCurriculum();
              setCurriculum(data);
              toast.success('Materi berhasil dihapus!');
          } catch (err) {
            console.error(err);
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

  const openAddSection = () => {
      setEditingSectionId(null);
      setNewSectionTitle('');
      setSelectedIcon('BookOpen');
      setShowSectionModal(true);
  };

  if (loading) return <div className="p-12 text-center text-[var(--color-text-muted)] animate-pulse">Loading Dashboard...</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Daftar Materi</h1>
           <p className="text-[var(--color-text-muted)]">Kelola semua konten pembelajaran dari sini.</p>
        </div>
        
        <div className="flex gap-3">
            {/* Add Section Button */}
            <button 
              onClick={openAddSection}
              className="bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border)] px-4 py-2 rounded-lg flex items-center font-bold hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-main)] transition-colors shadow-sm active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Kategori Baru
            </button>

            {/* Add Topic Button */}
            <button 
              onClick={() => {
                if(curriculum.length > 0) setSelectedSection(curriculum[0].id);
                setShowAddModal(true);
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center font-bold hover:bg-teal-700 transition-colors shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Topik
            </button>
        </div>
      </div>

      {/* Add/Edit Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-[var(--color-bg-card)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">{editingSectionId ? 'Edit Kategori' : 'Buat Kategori Baru'}</h2>
              
              <form onSubmit={handleSaveSection} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Nama Kategori</label>
                    <input 
                      type="text" 
                      className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] text-[var(--color-text-main)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-gray-400"
                      placeholder="Contoh: Shorof Lanjutan"
                      value={newSectionTitle}
                      onChange={e => setNewSectionTitle(e.target.value)}
                      autoFocus
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Pilih Ikon</label>
                    <div className="grid grid-cols-5 gap-2">
                        {Object.keys(iconMap).map(iconName => {
                           const Icon = iconMap[iconName];
                           const isSelected = selectedIcon === iconName;
                           return (
                             <button
                               key={iconName}
                               type="button"
                               onClick={() => setSelectedIcon(iconName)}
                               className={`p-2 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-teal-600 text-white shadow-md scale-105' : 'bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]'}`}
                             >
                               <Icon className="w-5 h-5" />
                             </button>
                           );
                        })}
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                    <button 
                      type="button"
                      onClick={() => setShowSectionModal(false)}
                      className="px-4 py-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] rounded-lg font-medium"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={!newSectionTitle}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {editingSectionId ? 'Simpan Perubahan' : 'Buat Kategori'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-[var(--color-bg-card)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">Tambah Materi Baru</h2>
              
              <form onSubmit={handleAddTopic} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Judul Materi</label>
                    <input 
                      type="text" 
                      className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] text-[var(--color-text-main)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none placeholder-gray-400"
                      placeholder="Contoh: Bab 5 - Latihan"
                      value={newTopicTitle}
                      onChange={e => setNewTopicTitle(e.target.value)}
                      autoFocus
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Masuk ke Kategori</label>
                    <select 
                      className="w-full bg-[var(--color-bg-main)] border border-[var(--color-border)] text-[var(--color-text-main)] rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
                      value={selectedSection}
                      onChange={e => setSelectedSection(e.target.value)}
                    >
                       {curriculum.map(s => (
                         <option key={s.id} value={s.id}>{s.title}</option>
                       ))}
                    </select>
                 </div>

                 <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] rounded-lg font-medium"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={!newTopicTitle}
                      className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 disabled:opacity-50"
                    >
                      Simpan
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="grid gap-6">
        {curriculum.map((section) => {
          const SectionIcon = iconMap[section.icon] || BookOpen;
          return (
          <div key={section.id} className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
            <div className="bg-[var(--color-bg-muted)] px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div className="flex items-center">
                <SectionIcon className="w-5 h-5 text-[var(--color-text-muted)] mr-3" />
                <h3 className="font-bold text-[var(--color-text-main)] font-arabic">{section.title}</h3>
              </div>
              <div className="flex gap-2">
                <button 
                    onClick={() => openEditSection(section)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                    title="Edit Kategori"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Hapus Kategori"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-[var(--color-border)]">
              {section.topics.map(topic => (
                <div key={topic.id} className="p-4 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors group">
                  <div className="flex items-center">
                     <div className="w-2 h-2 rounded-full bg-teal-200 dark:bg-teal-700 mr-4"></div>
                     <span className="font-medium text-[var(--color-text-main)] font-arabic">{topic.title}</span>
                     <span className="ml-3 text-xs bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] px-2 py-1 rounded font-mono hidden md:inline-block border border-[var(--color-border)]">
                        {topic.id}
                     </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                        to={`/admin/edit/${topic.id}`}
                        className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg hover:bg-teal-600 hover:text-white dark:hover:text-white transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                    </Link>
                    <button 
                        onClick={() => handleDeleteTopic(topic.id)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus Topik"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        })}
      </div>

    </div>
  );
};

export default AdminDashboard;
