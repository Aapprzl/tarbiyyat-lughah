import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { Save, MoveLeft, Plus, Type, Table, AlertCircle, Trash2, GripVertical, Youtube, ClipboardList, Layers, X, ChevronDown, ChevronUp, Music, Puzzle, HelpCircle, RefreshCcw, ShieldCheck, MoveRight, Circle, Keyboard } from 'lucide-react';
import PdfViewer from '../../components/media/PdfViewer';
import AudioPlayer from '../../components/media/AudioPlayer';
import MatchUpGame from '../../components/games/MatchUpGame';
import QuizGame from '../../components/games/QuizGame';
import AnagramGame from '../../components/games/AnagramGame';
import CompleteSentenceGame from '../../components/games/CompleteSentenceGame';
import UnjumbleGame from '../../components/games/UnjumbleGame';
import SpinWheelGame from '../../components/games/SpinWheelGame';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useConfirm, useToast } from '../../components/ui/Toast';
import { BlockEditor, AddBlockButton } from '../../components/admin/BlockEditor';

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
  const [pickerTab, setPickerTab] = useState('common'); // 'common' or 'game'

  // Helper to extract URLs (Firebase & Supabase)
  const extractUrls = (content) => {
    if (!content) return [];
    const str = typeof content === 'string' ? content : JSON.stringify(content);
    // Be robust with URL matching for both Firebase and Supabase
    const urlRegex = /(https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^"\s]+)|(https:\/\/[^"\s]+\.supabase\.co\/storage\/v1\/object\/public\/[^"\s]+)/g;
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
        if (found) {
          title = found.title;
          setTopicDesc(found.desc || '');
          break;
        }
      }
      // Or check Special Programs (now category-based)
      if (title === "Unknown Topic") {
          const progs = await contentService.getSpecialPrograms();
          // First check if it matches a Category ID directly (New Structure)
          const categoryFound = progs.find(p => p.id === topicId);
          if (categoryFound) {
             title = categoryFound.title;
             setTopicDesc(categoryFound.desc || '');
             setIsSpecialProgram(true);
          } else {
             // Fallback: Check inside topics (Legacy Structure check)
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
            : type === 'quiz' ? { 
                title: 'Kuis', 
                questions: [{ 
                    id: 1, 
                    text: '', 
                    options: [
                        { id: 1, text: '', isCorrect: true },
                        { id: 2, text: '', isCorrect: false }
                    ] 
                }] 
              }

            : type === 'anagram' ? { title: 'Anagram', questions: [{ id: 1, answer: '', clue: '' }] }
            : type === 'completesentence' ? { title: 'Lengkapi Kalimat', questions: [{ id: 1, text: '' }] }
            : type === 'unjumble' ? { title: 'Susun Kalimat', subtitle: 'Susunlah Kalimat Arab', questions: [{ id: 1, text: '', pattern: 'Kerja + Pelaku + Objek', clue: '' }] }
            : type === 'spinwheel' ? { title: 'Spin the Wheel', items: [{ id: 1, text: '' }, { id: 2, text: '' }] }
            : type === 'wordclassification' ? { title: 'Tebak Jenis Kata', timeLimit: 60, questions: [{ id: 1, text: 'كتاب', type: 'isim' }] }
            : type === 'harakat' ? { title: 'Lengkapi Harakat', subtitle: 'Lengkapi harakat pada kata berikut...', questions: [{ id: 1, text: 'يَأْكُلُ' }] }
            : { title: '', content: '' }
    };

    setStages(prevStages => prevStages.map(stage => {
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

    // NEW: Sync Content Items to Category Metadata for Grid View
    if (isSpecialProgram) {
        const allItems = processedStages.flatMap(stage => stage.items); // Flatten all items from all stages
        await contentService.syncCategoryItems(topicId, allItems);
    }
    
    setSaving(false);
    toast.success('Struktur tersimpan! Refresh halaman publik untuk melihat hasil.');
  };

  if (loading) return (
    <div className="py-24 text-center">
        <div className="w-12 h-12 border-3 border-slate-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Memuat editor...</p>
    </div>
  );

  return (
    <div className="pb-16">
       {/* Header */}
      <div className="flex items-center justify-between mb-6 sticky top-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-30 py-3 px-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center flex-1 gap-3 min-w-0">
            <button 
                onClick={() => navigate(isSpecialProgram ? '/admin/games' : '/admin/dashboard')} 
                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
                <MoveLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded text-xs font-medium">
                    {isSpecialProgram ? 'Program Khusus' : 'Kurikulum Utama'}
                  </span>
                </div>
                <input 
                  type="text" 
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full placeholder-slate-300 p-0 focus:ring-0 truncate"
                  placeholder="Judul Materi..."
                />
                <input 
                  type="text" 
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="text-sm text-slate-500 bg-transparent border-none outline-none w-full placeholder-slate-300 p-0 focus:ring-0 truncate"
                  placeholder="Deskripsi singkat..."
                />
            </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
              <Save className="w-4 h-4" />
          )}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* CANVAS STAGES */}
      <LayoutGroup>
        <div className="mt-4 md:mt-6 space-y-6">
          {stages.map((stage, stageIndex) => (
              <motion.div 
                layout
                key={stage.id} 
                className="relative"
              >
                  {/* Stage Header */}
                   <div className="flex items-center justify-between mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold text-lg shrink-0">
                             {stageIndex + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                              <label className="text-xs text-slate-500 mb-1 block">Tahap</label>
                              <input 
                                  className="font-semibold text-lg text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 outline-none w-full p-0 truncate"
                                  value={stage.title}
                                  onChange={(e) => updateStageTitle(stage.id, e.target.value)}
                                  placeholder="Judul Tahapan..."
                              />
                          </div>
                      </div>
                      
                      <button 
                          onClick={() => removeStage(stage.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus Tahapan"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                  </div>
                  
                  {/* Stage Body (Blocks Canvas) */}
                  <div className="space-y-4">
                      
                      <AnimatePresence mode="popLayout">
                        {stage.items.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-400">
                                <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Belum ada konten. Tambahkan blok di bawah.</p>
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
                      </AnimatePresence>

                      {/* Block Picker */}
                      <div className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tambah Komponen</label>
                              
                              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                  <button 
                                      onClick={() => setPickerTab('common')}
                                      className={cn(
                                          "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                                          pickerTab === 'common' 
                                              ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" 
                                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                      )}
                                  >
                                      Umum
                                  </button>
                                  <button 
                                      onClick={() => setPickerTab('game')}
                                      className={cn(
                                          "px-4 py-1.5 rounded-md text-xs font-medium transition-colors",
                                          pickerTab === 'game' 
                                              ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm" 
                                              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                      )}
                                  >
                                      Game
                                  </button>
                              </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                  {pickerTab === 'common' ? (
                                      <>
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'text')} icon={Type} label="Teks" color="text-teal-600" bg="bg-teal-50 dark:bg-teal-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'vocab')} icon={Table} label="Kosakata" color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'alert')} icon={AlertCircle} label="Info" color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'youtube')} icon={Youtube} label="Video" color="text-red-600" bg="bg-red-50 dark:bg-red-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'audio')} icon={Music} label="Audio" color="text-violet-600" bg="bg-violet-50 dark:bg-violet-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'pdf')} icon={ClipboardList} label="File" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
                                      </>
                                  ) : (
                                      <>
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'matchup')} icon={Puzzle} label="Match Up" color="text-pink-600" bg="bg-pink-50 dark:bg-pink-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'quiz')} icon={HelpCircle} label="Quiz" color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-500/10" />

                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'anagram')} icon={GripVertical} label="Anagram" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'completesentence')} icon={Type} label="Lengkapi" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'unjumble')} icon={MoveLeft} label="Susun Kata" color="text-purple-600" bg="bg-purple-50 dark:bg-purple-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'wordclassification')} icon={Puzzle} label="Tebak Kata" color="text-rose-600" bg="bg-rose-50 dark:bg-rose-500/10" />
                                          <AddBlockButton onClick={() => addBlockToStage(stage.id, 'harakat')} icon={Keyboard} label="Harakat" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-500/10" />
                                      </>
                                  )}
                          </div>
                      </div>
                  </div>
              </motion.div>
          ))}
        </div>
      </LayoutGroup>

      {/* Add Stage Action */}
      <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
         <button 
            onClick={addStage}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 rounded-lg text-sm font-medium transition-colors"
         >
            <Plus className="w-5 h-5" />
            Tambah Tahapan Baru
         </button>
      </div>

    </div>
  );

};

export default LessonEditor;

