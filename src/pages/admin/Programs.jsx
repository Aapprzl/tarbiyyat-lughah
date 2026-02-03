import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Edit2, Star, Plus, BookOpen, Box, Activity, Hash, Zap, Bookmark, Layout, Flag, Smile, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useConfirm, useToast } from '../../components/Toast';

const iconMap = {
  BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile
};

const AdminPrograms = () => {
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const confirm = useConfirm();
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const progs = await contentService.getSpecialPrograms();
    setSpecialPrograms(progs);
    // Default closed
    setExpandedCategories({});
    setLoading(false);
  };

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };
  
  // --- Category Modal State ---
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ title: '', icon: 'Star', desc: '' });

  // --- Topic Modal State ---
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');

  // Category Actions
  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        if (editingCategoryId) {
           await contentService.updateSpecialCategory(editingCategoryId, categoryForm.title, categoryForm.icon, categoryForm.desc);
           toast.success('Kategori berhasil diperbarui!');
        } else {
           await contentService.addSpecialCategory(categoryForm.title, categoryForm.icon, categoryForm.desc);
           toast.success('Kategori baru ditambahkan!');
        }
    
        await loadData();
        setShowCategoryModal(false);
        setCategoryForm({ title: '', icon: 'Star', desc: '' });
        setEditingCategoryId(null);
    } catch (err) {
        console.error(err);
        toast.error(err.message || 'Gagal menyimpan kategori');
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const ok = await confirm('Yakin ingin menghapus Kategori ini? Semua topik di dalamnya juga akan terhapus!', 'Hapus Kategori');
    if (ok) {
        setLoading(true);
        try {
            await contentService.deleteSpecialCategory(categoryId);
            await loadData();
            toast.success('Kategori berhasil dihapus!');
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Gagal menghapus kategori');
        } finally {
            setLoading(false);
        }
    }
  };

  const openEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ 
      title: cat.title, 
      icon: cat.icon || 'Star',
      desc: cat.desc || '' 
    });
    setShowCategoryModal(true);
  };

  // Topic Actions
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
    } catch (err) {
        console.error(err);
        toast.error(err.message || 'Gagal menambahkan topik');
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
            toast.success('Topik berhasil dihapus!');
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Gagal menghapus topik');
        } finally {
            setLoading(false);
        }
    }
  };

  const openAddTopic = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setTopicTitle('');
    setShowTopicModal(true);
  };

  if (loading) return <div className="p-12 text-center text-[var(--color-text-muted)] animate-pulse">Loading Programs...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Program Khusus</h1>
           <p className="text-[var(--color-text-muted)]">Kelola kategori dan topik program unggulan.</p>
        </div>
        <button 
          onClick={() => { setCategoryForm({ title: '', icon: 'Star', desc: '' }); setEditingCategoryId(null); setShowCategoryModal(true); }}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center font-bold hover:bg-amber-600 transition-colors shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Kategori
        </button>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {specialPrograms.map(category => {
          const IconComp = iconMap[category.icon] || Star;
          const isExpanded = expandedCategories[category.id];

          return (
            <div key={category.id} className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden">
              {/* Category Header */}
              <div 
                className="flex items-center justify-between px-5 py-4 bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mr-4 shadow">
                    <IconComp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-text-main)] font-arabic">{category.title}</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{category.topics?.length || 0} topik</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); openEditCategory(category); }}
                    className="p-2 text-[var(--color-text-muted)] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                    title="Edit Kategori"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                    className="p-2 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" /> : <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />}
                </div>
              </div>

              {/* Topics List */}
              {isExpanded && (
                <div className="p-4 bg-[var(--color-bg-card)]">
                  {category.topics?.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-muted)] text-sm italic">
                      Belum ada topik dalam kategori ini
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {category.topics?.map(topic => (
                        <div key={topic.id} className="flex items-center justify-between p-3 bg-[var(--color-bg-muted)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group">
                          <span className="font-medium text-[var(--color-text-main)] font-arabic">{topic.title}</span>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/admin/edit/${topic.id}`}
                              className="text-xs bg-teal-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-teal-600 transition-colors"
                            >
                              Edit Konten
                            </Link>
                            <button 
                              onClick={() => handleDeleteTopic(category.id, topic.id)}
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Topic Button */}
                  <button 
                    onClick={() => openAddTopic(category.id)}
                    className="mt-4 w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-muted)] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Tambah Topik
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {specialPrograms.length === 0 && (
          <div className="text-center py-16 text-[var(--color-text-muted)]">
            <Star className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>Belum ada kategori program khusus.</p>
            <p className="text-sm">Klik tombol "Tambah Kategori" untuk memulai.</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-[var(--color-bg-card)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">{editingCategoryId ? 'Edit Kategori' : 'Kategori Baru'}</h2>
              
              <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Nama Kategori</label>
                    <input 
                      type="text" 
                      value={categoryForm.title}
                      onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-[var(--color-bg-main)] text-[var(--color-text-main)]"
                      placeholder="Contoh: Program Tahfidz"
                      required
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Deskripsi Singkat</label>
                    <textarea 
                      value={categoryForm.desc}
                      onChange={(e) => setCategoryForm({ ...categoryForm, desc: e.target.value })}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-[var(--color-bg-main)] text-[var(--color-text-main)]"
                      placeholder="Masukkan deskripsi program..."
                      rows="3"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">Ikon</label>
                    <div className="flex flex-wrap gap-2">
                       {Object.keys(iconMap).map(iconName => {
                          const Icon = iconMap[iconName];
                          return (
                             <button
                                key={iconName}
                                type="button"
                                onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                                className={`p-2 rounded-lg border-2 transition-all ${categoryForm.icon === iconName ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/50' : 'border-[var(--color-border)] hover:border-amber-300'}`}
                             >
                                <Icon className={`w-5 h-5 ${categoryForm.icon === iconName ? 'text-amber-600 dark:text-amber-400' : 'text-[var(--color-text-muted)]'}`} />
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                    <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 py-2 text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] rounded-lg font-medium transition-colors">
                       Batal
                    </button>
                    <button type="submit" className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors">
                       {editingCategoryId ? 'Simpan Perubahan' : 'Tambah Kategori'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-[var(--color-bg-card)] rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">Tambah Topik Baru</h2>
              
              <form onSubmit={handleAddTopic} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">Nama Topik</label>
                    <input 
                      type="text" 
                      value={topicTitle}
                      onChange={(e) => setTopicTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none bg-[var(--color-bg-main)] text-[var(--color-text-main)]"
                      placeholder="Contoh: Juz 30"
                      required
                    />
                 </div>

                 <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
                    <button type="button" onClick={() => setShowTopicModal(false)} className="flex-1 py-2 text-[var(--color-text-muted)] bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] rounded-lg font-medium transition-colors">
                       Batal
                    </button>
                    <button type="submit" className="flex-1 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors">
                       Tambah Topik
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrograms;
