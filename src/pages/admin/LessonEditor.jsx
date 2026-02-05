import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { Save, MoveLeft, Plus, Type, Table, AlertCircle, Trash2, GripVertical, Youtube, ClipboardList, Layers, X, ChevronDown, ChevronUp, Music, Puzzle, HelpCircle, RefreshCcw, ShieldCheck, MoveRight, Circle } from 'lucide-react';
import PdfViewer from '../../components/PdfViewer';
import AudioPlayer from '../../components/AudioPlayer';
import MatchUpGame from '../../components/MatchUpGame';
import QuizGame from '../../components/QuizGame';
import FlashCardGame from '../../components/FlashCardGame';
import AnagramGame from '../../components/AnagramGame';
import CompleteSentenceGame from '../../components/CompleteSentenceGame';
import UnjumbleGame from '../../components/UnjumbleGame';
import SpinWheelGame from '../../components/SpinWheelGame';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '../../utils/cn';
import { useConfirm, useToast } from '../../components/Toast';
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
        if (found) {
          title = found.title;
          setTopicDesc(found.desc || '');
          break;
        }
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
            : type === 'flashcard' ? { title: 'Flash Card', items: [{ id: 1, front: '', back: '' }] }
            : type === 'anagram' ? { title: 'Anagram', questions: [{ id: 1, answer: '', clue: '' }] }
            : type === 'completesentence' ? { title: 'Lengkapi Kalimat', questions: [{ id: 1, text: '' }] }
            : type === 'unjumble' ? { title: 'Susun Kalimat', questions: [{ id: 1, text: '' }] }
            : type === 'spinwheel' ? { title: 'Spin the Wheel', items: [{ id: 1, text: '' }, { id: 2, text: '' }] }
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

  if (loading) return (
    <div className="py-24 text-center">
        <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Menyiapkan Canvas Materi...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-32">
       {/* Premium Canvas Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 sticky top-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-2xl z-20 py-8 border-b border-slate-200 dark:border-white/10 px-6 md:px-0 -mx-6 md:mx-0">
        <div className="flex items-center flex-1 mr-8 w-full md:w-auto">
            <button 
                onClick={() => navigate(isSpecialProgram ? '/admin/programs' : '/admin/dashboard')} 
                className="mr-6 p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex-shrink-0 text-slate-400 hover:text-teal-500 transition-all hover:shadow-lg"
            >
                <MoveLeft className="w-5 h-5" />
            </button>
            <div className="w-full space-y-2">
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                       {isSpecialProgram ? 'Program Khusus' : 'Kurikulum Utama'}
                    </div>
                </div>
                <input 
                  type="text" 
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="text-3xl font-black text-slate-900 dark:text-white bg-transparent border-none outline-none w-full placeholder-slate-300 dark:placeholder-white/10 p-0 focus:ring-0 tracking-tight font-arabic"
                  placeholder="Judul Materi..."
                />
                <input 
                  type="text" 
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="text-base text-slate-500 dark:text-slate-400 bg-transparent border-none outline-none w-full placeholder-slate-300 dark:placeholder-white/10 p-0 focus:ring-0 font-medium"
                  placeholder="Berikan deskripsi singkat untuk materi ini..."
                />
            </div>
        </div>

        <div className="flex items-center gap-4 mt-6 md:mt-0 w-full md:w-auto">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 md:flex-none flex items-center justify-center bg-teal-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-teal-500/20 hover:bg-teal-700 active:scale-95 transition-all"
            >
              {saving ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3"></div>
              ) : (
                  <Save className="w-4 h-4 mr-3" />
              )}
              {saving ? 'Menyimpan...' : 'Simpan Materi'}
            </button>
        </div>
      </div>

      {/* CANVAS STAGES */}
      <LayoutGroup>
        <div className="space-y-20">
          {stages.map((stage, stageIndex) => (
              <motion.div 
                layout
                key={stage.id} 
                className="relative"
              >
                  {/* Stage Header Card */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                      <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center text-teal-500 font-black text-xl shadow-sm">
                             {stageIndex + 1}
                          </div>
                          <div className="flex-1">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Tingkatan / Tahap</label>
                              <input 
                                  className="font-black text-2xl text-slate-900 dark:text-white bg-transparent border-none focus:ring-0 outline-none w-full p-0 tracking-tight"
                                  value={stage.title}
                                  onChange={(e) => updateStageTitle(stage.id, e.target.value)}
                                  placeholder="Judul Tahapan..."
                              />
                          </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                          <button 
                              onClick={() => removeStage(stage.id)}
                              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
                              title="Hapus Tahapan"
                          >
                              <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
                  
                  {/* Stage Body (Blocks Canvas) */}
                  <div className="space-y-6 relative ml-7 md:ml-10 pl-10 md:pl-12 border-l-2 border-slate-200 dark:border-white/10 py-4">
                      {/* Decorative Dot */}
                      <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 ring-4 ring-slate-50 dark:ring-slate-950"></div>
                      
                      <AnimatePresence mode="popLayout">
                        {stage.items.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16 bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[3rem] text-slate-400 flex flex-col items-center gap-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                                    <Layers className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="font-bold uppercase tracking-widest text-[10px]">Canvas masih kosong. Gunakan pemilih di bawah.</p>
                            </motion.div>
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

                      <div className="absolute bottom-0 -left-[9px] w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 ring-4 ring-slate-50 dark:ring-slate-950"></div>

                      {/* Floating Block Picker */}
                      <div className="pt-8">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block text-center md:text-left">Tambahkan Elemen Materi</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'text')} icon={Type} label="Teks" color="text-teal-600" bg="bg-teal-50 dark:bg-teal-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'vocab')} icon={Table} label="Kosakata" color="text-indigo-600" bg="bg-indigo-50 dark:bg-indigo-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'alert')} icon={AlertCircle} label="Info" color="text-amber-600" bg="bg-amber-50 dark:bg-amber-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'youtube')} icon={Youtube} label="Video" color="text-red-600" bg="bg-red-50 dark:bg-red-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'audio')} icon={Music} label="Audio" color="text-violet-600" bg="bg-violet-50 dark:bg-violet-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'pdf')} icon={ClipboardList} label="File" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'matchup')} icon={Puzzle} label="Match Up" color="text-pink-600" bg="bg-pink-50 dark:bg-pink-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'quiz')} icon={HelpCircle} label="Quiz" color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'flashcard')} icon={Layers} label="Card" color="text-sky-600" bg="bg-sky-50 dark:bg-sky-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'anagram')} icon={GripVertical} label="Anagram" color="text-orange-600" bg="bg-orange-50 dark:bg-orange-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'completesentence')} icon={Type} label="Lengkapi" color="text-blue-600" bg="bg-blue-50 dark:bg-blue-500/10" />
                               <AddBlockButton onClick={() => addBlockToStage(stage.id, 'unjumble')} icon={MoveLeft} label="Unjumble" color="text-purple-600" bg="bg-purple-50 dark:bg-purple-500/10" />
                          </div>
                      </div>
                  </div>
              </motion.div>
          ))}
        </div>
      </LayoutGroup>

      {/* Add Stage Action */}
      <div className="mt-24 border-t border-slate-200 dark:border-white/10 pt-12 text-center">
         <button 
            onClick={addStage}
            className="group inline-flex items-center bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-teal-500 hover:text-teal-600 px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-xs transition-all shadow-sm hover:shadow-xl hover:scale-105 active:scale-95"
         >
            <Plus className="w-5 h-5 mr-3 transition-transform group-hover:rotate-90" />
            Buka Tahapan Baru
         </button>
      </div>

    </div>
  );

};

export default LessonEditor;

