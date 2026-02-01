import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { Save, ArrowLeft, Plus, Type, Table, AlertCircle, Trash2, GripVertical, Youtube, FileText, Layers, X, ChevronDown, ChevronUp, Music, Puzzle } from 'lucide-react';
import PdfViewer from '../../components/PdfViewer';
import AudioPlayer from '../../components/AudioPlayer';
import MatchUpGame from '../../components/MatchUpGame';
import { useConfirm, useToast } from '../../components/Toast';

const LessonEditor = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();
  
  // Data Structure: [{ id: 1, title: 'Tahap 1', items: [ {type, id, data} ] }]
  const [stages, setStages] = useState([]);
  const [initialUrls, setInitialUrls] = useState([]); // For garbage collection
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [isSpecialProgram, setIsSpecialProgram] = useState(false);

  // Helper to extract Firebase URLs
  const extractUrls = (content) => {
    if (!content) return [];
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    // Be robust with URL matching
    const urlRegex = /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^"\s]+/g;
    const matches = str.match(urlRegex) || [];
    return [...new Set(matches)];
  };

  useEffect(() => {
    const init = async () => {
      // Load Metadata
      const curr = await contentService.getCurriculum();
      let title = "Unknown Topic";
      for (const s of curr) {
        const found = s.topics.find(t => t.id === topicId);
        if (found) title = found.title;
      }
      // Or check Special Programs (now category-based)
      if (title === "Unknown Topic") {
          const progs = await contentService.getSpecialPrograms();
          for (const category of progs) {
              if (category.topics) {
                  const found = category.topics.find(t => t.id === topicId);
                  if (found) {
                      title = found.title;
                      setTopicDesc(found.desc || '');
                      setIsSpecialProgram(true);
                      break;
                  }
              }
          }
      }
      setTopicTitle(title);

      // Load Content
      const rawContent = await contentService.getLessonContent(topicId);
      setInitialUrls(extractUrls(rawContent));
      
      try {
        const parsed = JSON.parse(rawContent);
        
        // Check if it's already in Stages format (Array of objects with 'items' array)
        const isStageFormat = Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].items);

        if (isStageFormat) {
            setStages(parsed);
        } else if (Array.isArray(parsed)) {
            // Legacy: Array of Blocks -> Wrap in one Stage
            setStages([{
                id: Date.now(),
                title: 'Materi Utama',
                items: parsed
            }]);
        } else {
            throw new Error("Invalid format");
        }
      } catch (e) {
        // Fallback or Empty
        if (rawContent && rawContent.trim().length > 0) {
           // String content -> wrap in text block -> wrap in stage
           setStages([{
             id: Date.now(),
             title: 'Materi Utama',
             items: [{ 
               id: Date.now(), 
               type: 'text', 
               data: { title: 'Pendahuluan', content: rawContent } 
             }]
           }]);
        } else {
           // New Empty: Start with 1 Stage
           setStages([{
               id: Date.now(),
               title: 'Tahapan 1',
               items: []
           }]);
        }
      }
      setLoading(false);
    };
    init();
  }, [topicId]);

  // --- Stage Management ---

  const addStage = () => {
    const newStage = {
        id: Date.now(),
        title: `Tahapan ${stages.length + 1}`,
        items: []
    };
    setStages([...stages, newStage]);
  };

  const removeStage = async (stageId) => {
    if (stages.length === 1) {
        toast.warning("Minimal harus ada satu tahapan.");
        return;
    }
    const ok = await confirm('Hapus tahapan ini? (Perubahan akan disimpan saat tombol Simpan ditekan)', 'Hapus Tahapan');
    if (ok) {
        setStages(stages.filter(s => s.id !== stageId));
    }
  };

  const updateStageTitle = (stageId, newTitle) => {
    setStages(stages.map(s => s.id === stageId ? { ...s, title: newTitle } : s));
  };

  // --- Block Management ---

  const addBlockToStage = (stageId, type) => {
    const newBlock = {
      id: Date.now(),
      type,
      data: type === 'vocab' ? { items: [{ arab: '', indo: '' }] } 
            : type === 'matchup' ? { title: 'Pasangkan', pairs: [{ id: 1, question: '', answer: '' }] }
            : { title: '', content: '' }
    };

    setStages(stages.map(stage => {
        if (stage.id === stageId) {
            return { ...stage, items: [...stage.items, newBlock] };
        }
        return stage;
    }));
  };

  const removeBlock = async (stageId, blockId) => {
    const ok = await confirm('Hapus konten ini?', 'Hapus Konten');
    if (ok) {
        setStages(stages.map(s => {
            if (s.id === stageId) {
                return { ...s, items: s.items.filter(b => b.id !== blockId) };
            }
            return s;
        }));
    }
  };

  const updateBlock = (stageId, blockId, newData) => {
    setStages(stages.map(stage => {
        if (stage.id === stageId) {
            const newItems = stage.items.map(b => b.id === blockId ? { ...b, data: newData } : b);
            return { ...stage, items: newItems };
        }
        return stage;
    }));
  };

  const moveBlock = (stageId, blockId, direction) => {
    setStages(stages.map(stage => {
        if (stage.id === stageId) {
            const items = [...stage.items];
            const idx = items.findIndex(b => b.id === blockId);
            if (idx === -1) return stage;
            
            const newIdx = direction === 'up' ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= items.length) return stage;
            
            // Swap
            [items[idx], items[newIdx]] = [items[newIdx], items[idx]];
            return { ...stage, items };
        }
        return stage;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Process any pending file uploads (Upload to Firebase Storage)
    const processedStages = await Promise.all(stages.map(async (stage) => {
        const processedItems = await Promise.all(stage.items.map(async (block) => {
            // PDF Upload
            if (block.type === 'pdf' && block.data.rawFile) {
                try {
                    const downloadUrl = await storageService.uploadFile(block.data.rawFile, 'materials/pdfs');
                    const { rawFile, ...restData } = block.data;
                    return { ...block, data: { ...restData, url: downloadUrl } };
                } catch (e) {
                    console.error("PDF Upload Failed", e);
                    toast.error(`Gagal upload PDF ${block.data.fileName}`);
                    return block; // Keep raw for retry? Or fail?
                }
            }
            // Audio Upload
            if (block.type === 'audio' && block.data.rawFile) {
                 try {
                    const downloadUrl = await storageService.uploadFile(block.data.rawFile, 'materials/audio');
                    const { rawFile, ...restData } = block.data;
                    return { ...block, data: { ...restData, url: downloadUrl } };
                } catch (e) {
                    console.error("Audio Upload Failed", e);
                    toast.error(`Gagal upload Audio ${block.data.fileName}`);
                    return block;
                }
            }
            return block;
        }));
        return { ...stage, items: processedItems };
    }));

    // Save Stages Structure
    const finalContentStr = JSON.stringify(processedStages);
    await contentService.saveLessonContent(topicId, finalContentStr);
    
    // Garbage Collection: Compare URL sets
    const finalUrls = extractUrls(finalContentStr);
    const toDelete = initialUrls.filter(url => !finalUrls.includes(url));
    
    if (toDelete.length > 0) {
        console.log(`[GC] Found ${toDelete.length} orphaned files. Cleaning up...`);
        // Run in background so we don't block UI excessively, or await if critical.
        // Awaiting is safer to ensure it completes before user leaves.
        try {
            await Promise.allSettled(toDelete.map(url => storageService.deleteFile(url)));
            toast.success(`Dibersihkan: ${toDelete.length} file tidak terpakai.`);
        } catch (e) {
            console.warn("[GC] Error cleaning up files", e);
        }
    }

    // Update initialUrls for the next save cycle
    setInitialUrls(finalUrls);

    // Save Metadata (Title & Desc)
    await contentService.updateTopicMetadata(topicId, { title: topicTitle, desc: topicDesc });
    
    setSaving(false);
    toast.success('Struktur tersimpan! Refresh halaman publik untuk melihat hasil.');
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Memuat Editor...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-32">
       {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-[var(--color-bg-card)]/95 backdrop-blur z-20 py-4 border-b border-[var(--color-border)] px-4 md:px-0">
        <div className="flex items-center flex-1 mr-8">
            <button onClick={() => navigate(isSpecialProgram ? '/admin/programs' : '/admin/dashboard')} className="mr-4 p-2 hover:bg-[var(--color-bg-hover)] rounded-full flex-shrink-0 text-[var(--color-text-muted)]">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-full">
                <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">JUDUL MATERI</label>
                <input 
                  type="text" 
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none w-full placeholder-[var(--color-text-muted)]/50 p-0 focus:ring-0 mb-2 font-arabic"
                  style={{ fontSize: 'var(--font-arabic-title-size)' }}
                  placeholder="Nama Materi..."
                />
                <input 
                  type="text" 
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="text-sm text-[var(--color-text-muted)] bg-transparent border-none outline-none w-full placeholder-[var(--color-text-muted)]/50 p-0 focus:ring-0"
                  placeholder="Deskripsi singkat materi..."
                />
            </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-teal-700 active:scale-95 transition-all flex-shrink-0 text-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* STAGES LIST */}
      <div className="space-y-12 px-4 md:px-0">
        {stages.map((stage, stageIndex) => (
            <div key={stage.id} className="relative">
                {/* Stage Header */}
                <div className="flex items-center mb-4 group">
                    <div className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-bold px-3 py-1 rounded-lg text-xs mr-3">
                        TAHAP {stageIndex + 1}
                    </div>
                    <input 
                        className="font-bold text-lg text-[var(--color-text-main)] bg-transparent border-b border-transparent hover:border-[var(--color-border)] focus:border-teal-500 outline-none flex-1 transition-colors px-2 py-1"
                        value={stage.title}
                        onChange={(e) => updateStageTitle(stage.id, e.target.value)}
                        placeholder="Judul Tahapan..."
                    />
                    <button 
                        onClick={() => removeStage(stage.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-[var(--color-text-muted)] hover:text-red-500 transition-all"
                        title="Hapus Tahapan"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Stage Body (Blocks) */}
                <div className="border-l-2 border-[var(--color-border)] pl-4 md:pl-8 space-y-6">
                    {stage.items.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-text-muted)] text-sm italic">
                            Belum ada konten di tahapan ini
                        </div>
                    ) : (
                        stage.items.map((block, blockIdx) => (
                            <BlockEditor 
                                key={block.id} 
                                block={block} 
                                onRemove={() => removeBlock(stage.id, block.id)} 
                                onUpdate={(newData) => updateBlock(stage.id, block.id, newData)}
                                onMoveUp={() => moveBlock(stage.id, block.id, 'up')}
                                onMoveDown={() => moveBlock(stage.id, block.id, 'down')}
                                isFirst={blockIdx === 0}
                                isLast={blockIdx === stage.items.length - 1}
                                toast={toast}
                            />
                        ))
                    )}

                    {/* Add Block Controls (Per Stage) */}
                    <div className="pt-4">
                        <div className="flex flex-wrap gap-2">
                             <AddBlockButton onClick={() => addBlockToStage(stage.id, 'text')} icon={Type} label="Teks" color="text-teal-600" bg="bg-teal-50" />
                             <AddBlockButton onClick={() => addBlockToStage(stage.id, 'vocab')} icon={Table} label="Kosakata" color="text-indigo-600" bg="bg-indigo-50" />
                             <AddBlockButton onClick={() => addBlockToStage(stage.id, 'alert')} icon={AlertCircle} label="Info" color="text-amber-600" bg="bg-amber-50" />
                             <AddBlockButton onClick={() => addBlockToStage(stage.id, 'youtube')} icon={Youtube} label="Video" color="text-red-600" bg="bg-red-50" />
                             <AddBlockButton onClick={() => addBlockToStage(stage.id, 'audio')} icon={Music} label="Audio" color="text-violet-600" bg="bg-violet-50" />
                             <AddBlockButton onClick={() => addBlockToStage(stage.id, 'pdf')} icon={FileText} label="File" color="text-blue-600" bg="bg-blue-50" />
                             <AddBlockButton onClick={() => addBlockToStage(stage.id, 'matchup')} icon={Puzzle} label="Game" color="text-pink-600" bg="bg-pink-50" />
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Add Stage Button (Bottom) */}
      <div className="mt-16 border-t border-[var(--color-border)] pt-8 text-center">
         <button 
            onClick={addStage}
            className="inline-flex items-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-teal-500 hover:text-teal-600 px-6 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
         >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Tahapan Baru
         </button>
      </div>

    </div>
  );
};

// --- Sub Components ---

const AddBlockButton = ({ onClick, icon: Icon, label, color, bg }) => (
    <button 
        onClick={onClick}
        className={`${bg} ${color} px-3 py-1.5 rounded-lg flex items-center text-xs font-bold hover:brightness-95 active:scale-95 transition-all`}
    >
        <Icon className="w-3 h-3 mr-1.5" />
        {label}
    </button>
);

const BlockEditor = ({ block, onRemove, onUpdate, onMoveUp, onMoveDown, isFirst, isLast, toast }) => {
    return (
        <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden group hover:shadow-md transition-shadow">
            <div className="bg-[var(--color-bg-muted)] px-4 py-2 border-b border-[var(--color-border)] flex justify-between items-center text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
               <span className="flex items-center">
                 {/* Move Buttons */}
                 <div className="flex flex-col mr-2">
                   <button 
                     onClick={onMoveUp} 
                     disabled={isFirst}
                     className="text-[var(--color-text-muted)] hover:text-teal-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                     title="Pindah ke atas"
                   >
                     <ChevronUp className="w-3 h-3" />
                   </button>
                   <button 
                     onClick={onMoveDown} 
                     disabled={isLast}
                     className="text-[var(--color-text-muted)] hover:text-teal-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                     title="Pindah ke bawah"
                   >
                     <ChevronDown className="w-3 h-3" />
                   </button>
                 </div>
                 {block.type === 'text' && 'Teks / Penjelasan'}
                 {block.type === 'vocab' && 'Tabel Kosakata'}
                 {block.type === 'alert' && 'Info Penting'}
                 {block.type === 'youtube' && 'Video YouTube'}
                 {block.type === 'audio' && 'Audio Player'}
                 {block.type === 'pdf' && 'File PDF / Download'}
                 {block.type === 'matchup' && 'Game: Pasangkan'}
               </span>
               <button onClick={onRemove} className="text-[var(--color-text-muted)] hover:text-red-500 p-1">
                 <X className="w-3 h-3" />
               </button>
            </div>

            <div className="p-4">
              {/* Reuse logic from original component, simplified for space */}
              
              {/* --- TEXT BLOCK --- */}
              {block.type === 'text' && (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Judul Bagian..."
                    className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 outline-none text-sm placeholder-[var(--color-text-muted)]/50"
                    value={block.data.title || ''}
                    onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                  />
                  <textarea 
                    placeholder="Tulis materi di sini..."
                    className="w-full h-24 text-sm resize-y outline-none text-[var(--color-text-main)] bg-transparent placeholder-[var(--color-text-muted)]/50"
                    value={block.data.content || ''}
                    onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
                  />
                </div>
              )}

              {/* --- VOCAB BLOCK --- */}
              {block.type === 'vocab' && (
                <div>
                     {block.data.items?.map((item, idx) => (
                     <div key={idx} className="flex gap-2 mb-2">
                        <input 
                          type="text"
                          className="w-1/2 p-2 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded text-right font-arabic border-none outline-none focus:ring-1 focus:ring-teal-200"
                          style={{ fontSize: 'var(--font-arabic-content-size)' }}
                          placeholder="Arab"
                          value={item.arab}
                          onChange={(e) => {
                             const newItems = [...block.data.items];
                             newItems[idx].arab = e.target.value;
                             onUpdate({ ...block.data, items: newItems });
                          }}
                        />
                         <input 
                          type="text"
                          className="w-1/2 p-2 bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded border-none outline-none text-sm focus:ring-1 focus:ring-teal-200"
                          placeholder="Indo"
                          value={item.indo}
                          onChange={(e) => {
                             const newItems = [...block.data.items];
                             newItems[idx].indo = e.target.value;
                             onUpdate({ ...block.data, items: newItems });
                          }}
                        />
                        <button 
                           onClick={() => {
                             const newItems = block.data.items.filter((_, i) => i !== idx);
                             onUpdate({ ...block.data, items: newItems });
                           }}
                           className="text-[var(--color-text-muted)] hover:text-red-400 px-1"
                        >×</button>
                     </div>
                   ))}
                   <button 
                     onClick={() => onUpdate({ ...block.data, items: [...(block.data.items || []), { arab: '', indo: '' }] })}
                     className="text-xs text-teal-600 font-medium hover:underline mt-1"
                   >
                     + Tambah Baris
                   </button>
                </div>
              )}

              {/* --- ALERT BLOCK --- */}
              {block.type === 'alert' && (
                <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg items-start border border-amber-100 dark:border-amber-900/30">
                   <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                   <textarea 
                     className="bg-transparent w-full outline-none text-amber-900 dark:text-amber-200 resize-none text-sm h-16 placeholder-amber-400"
                     placeholder="Tulis info penting..."
                     value={block.data.content || ''}
                     onChange={(e) => onUpdate({ ...block.data, content: e.target.value })}
                   />
                </div>
              )}

              {/* --- YOUTUBE BLOCK --- */}
              {block.type === 'youtube' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg border border-red-100 dark:border-red-900/20">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <input 
                      type="text" 
                      placeholder="Paste Link YouTube..."
                      className="w-full bg-transparent text-red-800 dark:text-red-300 text-xs font-mono outline-none placeholder-red-300"
                      value={block.data.url || ''}
                      onChange={(e) => onUpdate({ ...block.data, url: e.target.value })}
                    />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Judul Video (Opsional)..."
                    className="w-full bg-[var(--color-bg-muted)] text-[var(--color-text-main)] p-2 rounded-lg text-sm outline-none border border-transparent focus:border-teal-500/50"
                    value={block.data.title || ''}
                    onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                  />
                </div>
              )}

              {/* --- AUDIO BLOCK --- */}
              {block.type === 'audio' && (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Judul Audio..."
                    className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 text-sm outline-none placeholder-[var(--color-text-muted)]/50"
                    value={block.data.title || ''}
                    onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                  />
                   <div className="flex gap-2 items-center p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] border-dashed">
                        <input 
                          type="file" 
                          accept="audio/*"
                          className="block w-full text-xs text-[var(--color-text-muted)] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-violet-50 dark:file:bg-violet-900/30 file:text-violet-600 dark:file:text-violet-400 hover:file:bg-violet-100 dark:hover:file:bg-violet-900/50 cursor-pointer"
                          onChange={(e) => {
                             const file = e.target.files[0];
                             if (file) {
                                if (file.size > 5 * 1024 * 1024) { 
                                   toast.warning("Ukuran file maksimal 5MB (LocalStorage)."); return;
                                }
                                const objectUrl = URL.createObjectURL(file);
                                onUpdate({ 
                                    ...block.data, 
                                    url: objectUrl, 
                                    fileName: file.name,
                                    rawFile: file 
                                });
                             }
                          }}
                        />
                   </div>
                   
                   {/* Preview */}
                   {block.data.url && (
                     <div className="mt-3">
                        <AudioPlayer src={block.data.url} title={block.data.title} />
                     </div>
                   )}
                </div>
              )}

              {/* --- PDF BLOCK --- */}
              {block.type === 'pdf' && (
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Judul File..."
                    className="w-full font-bold text-[var(--color-text-main)] bg-transparent border-b border-[var(--color-border)] pb-1 text-sm outline-none placeholder-[var(--color-text-muted)]/50"
                    value={block.data.title || ''}
                    onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                  />
                   <div className="flex gap-2 items-center p-3 bg-[var(--color-bg-muted)] rounded-lg border border-[var(--color-border)] border-dashed">
                        <input 
                          type="file" 
                          accept="application/pdf"
                          className="block w-full text-xs text-[var(--color-text-muted)] file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-teal-50 dark:file:bg-teal-900/30 file:text-teal-600 dark:file:text-teal-400 hover:file:bg-teal-100 dark:hover:file:bg-teal-900/50 cursor-pointer"
                          onChange={(e) => {
                             const file = e.target.files[0];
                             if (file) {
                                if (file.size > 3 * 1024 * 1024) { 
                                   toast.warning("Ukuran file maksimal 3MB untuk kinerja browser yang optimal."); return;
                                }
                                // Use Object URL for fast preview interaction without freezing
                                const objectUrl = URL.createObjectURL(file);
                                onUpdate({ 
                                    ...block.data, 
                                    url: objectUrl, 
                                    fileName: file.name,
                                    rawFile: file // Store raw file to convert later on Save
                                });
                             }
                          }}
                        />
                   </div>
                   
                   {/* Download Permission Toggle */}
                   <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer select-none">
                       <input 
                         type="checkbox" 
                         checked={block.data.allowDownload !== false}
                         onChange={(e) => onUpdate({ ...block.data, allowDownload: e.target.checked })}
                         className="w-4 h-4 rounded border-[var(--color-border)] text-teal-600 focus:ring-teal-500 bg-[var(--color-bg-muted)]"
                       />
                       Izinkan pengunjung mengunduh file ini
                   </label>

                   {/* Preview */}
                   {block.data.url && (
                     <div className="mt-3">
                        <div className="bg-[var(--color-bg-muted)] px-3 py-2 text-xs text-[var(--color-text-muted)] flex items-center justify-between rounded-t-lg border border-b-0 border-[var(--color-border)]">
                            <span>📄 {block.data.fileName || 'File PDF'}</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">✓ Terlampir</span>
                        </div>
                        <PdfViewer src={block.data.url} height={200} />
                     </div>
                   )}
                </div>
              )}

              {/* --- MATCH UP GAME BLOCK --- */}
              {block.type === 'matchup' && (
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Puzzle className="w-5 h-5 text-pink-500" />
                        <input 
                            type="text" 
                            className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none focus:ring-0 placeholder-[var(--color-text-muted)]"
                            value={block.data.title || 'Pasangkan'}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                            placeholder="Judul Game..."
                        />
                     </div>

                     <div className="bg-[var(--color-bg-muted)] p-4 rounded-xl border border-[var(--color-border)] space-y-3">
                         <div className="grid grid-cols-2 gap-4 text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2">
                             <div>Pertanyaan (Diam)</div>
                             <div>Jawaban (Digeser)</div>
                         </div>
                         
                         {block.data.pairs?.map((pair, idx) => (
                             <div key={pair.id || idx} className="grid grid-cols-[1fr,1fr,auto] gap-2 items-center">
                                 <input 
                                    className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-pink-500"
                                    placeholder="Pertanyaan..."
                                    value={pair.question}
                                    onChange={(e) => {
                                        const newPairs = [...block.data.pairs];
                                        newPairs[idx].question = e.target.value;
                                        onUpdate({ ...block.data, pairs: newPairs });
                                    }}
                                 />
                                 <input 
                                    className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-pink-500"
                                    placeholder="Jawaban..."
                                    value={pair.answer}
                                    onChange={(e) => {
                                        const newPairs = [...block.data.pairs];
                                        newPairs[idx].answer = e.target.value;
                                        onUpdate({ ...block.data, pairs: newPairs });
                                    }}
                                 />
                                 <button 
                                    onClick={() => {
                                        if (block.data.pairs.length === 1) return;
                                        const newPairs = block.data.pairs.filter((_, i) => i !== idx);
                                        onUpdate({ ...block.data, pairs: newPairs });
                                    }}
                                    className="text-[var(--color-text-muted)] hover:text-red-500 p-1"
                                    disabled={block.data.pairs.length === 1}
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                             </div>
                         ))}

                         <button 
                            onClick={() => {
                                const newId = block.data.pairs.length > 0 ? Math.max(...block.data.pairs.map(p => p.id)) + 1 : 1;
                                onUpdate({ 
                                    ...block.data, 
                                    pairs: [...(block.data.pairs || []), { id: newId, question: '', answer: '' }] 
                                });
                            }}
                            className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 mt-2"
                         >
                            <Plus className="w-3 h-3" />
                            Tambah Pasangan
                         </button>
                     </div>

                     {/* Game Preview */}
                     <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                         <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview Game:</div>
                         <MatchUpGame pairs={block.data.pairs} title={block.data.title} />
                     </div>
                </div>
              )}
            
            </div>
        </div>
    );
};

export default LessonEditor;
