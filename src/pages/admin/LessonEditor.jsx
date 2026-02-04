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

// --- Sub Components ---

// --- Sub Components ---

const AddBlockButton = ({ onClick, icon: Icon, label, color, bg }) => (
    <button 
        onClick={onClick}
        className={cn(
            bg, color, 
            "px-4 py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:brightness-95 active:scale-95 transition-all border border-transparent hover:border-current shadow-sm"
        )}
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
);

const BlockEditor = ({ block, onRemove, onUpdate, onMoveUp, onMoveDown, isFirst, isLast, toast }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Helper to detect Arabic
    const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

    const getBlockInfo = (type) => {
        switch(type) {
            case 'text': return { icon: Type, label: 'Teks', color: 'text-teal-600', bg: 'bg-teal-50' };
            case 'vocab': return { icon: Table, label: 'Kosakata', color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'alert': return { icon: AlertCircle, label: 'Info', color: 'text-amber-600', bg: 'bg-amber-50' };
            case 'youtube': return { icon: Youtube, label: 'Video', color: 'text-red-600', bg: 'bg-red-50' };
            case 'audio': return { icon: Music, label: 'Audio', color: 'text-violet-600', bg: 'bg-violet-50' };
            case 'pdf': return { icon: ClipboardList, label: 'File', color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'matchup': return { icon: Puzzle, label: 'Match Up', color: 'text-pink-600', bg: 'bg-pink-50' };
            case 'quiz': return { icon: HelpCircle, label: 'Quiz', color: 'text-teal-600', bg: 'bg-teal-50' };
            case 'flashcard': return { icon: Layers, label: 'Flash Card', color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'anagram': return { icon: GripVertical, label: 'Anagram', color: 'text-orange-600', bg: 'bg-orange-50' };
            case 'completesentence': return { icon: Type, label: 'Lengkapi Kalimat', color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'unjumble': return { icon: MoveLeft, label: 'Unjumble', color: 'text-purple-600', bg: 'bg-purple-50' };
            case 'spinwheel': return { icon: RefreshCcw, label: 'Spin Wheel', color: 'text-pink-600', bg: 'bg-pink-50' };
            default: return { icon: Circle, label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50' };
        }
    };

    const info = getBlockInfo(block.type);
    const Icon = info.icon;

    // Get a preview title for the header
    const getTitlePreview = () => {
        if (block.data.title && block.data.title.trim() !== '') return block.data.title;
        if (block.type === 'text' && block.data.content) return block.data.content.substring(0, 30) + (block.data.content.length > 30 ? '...' : '');
        return info.label;
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-white/5 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden group hover:shadow-xl transition-all"
        >
            {/* Header / Accordion Trigger */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "px-6 py-4 flex justify-between items-center cursor-pointer select-none transition-all",
                    isOpen ? "bg-slate-50 dark:bg-white/[0.02]" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
                )}
            >
               <div className="flex items-center gap-5 overflow-hidden">
                   {/* Icon Badge */}
                   <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm",
                       isOpen ? `${info.bg} ${info.color} scale-110 shadow-lg shadow-current/10` : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:scale-110"
                   )}>
                       <Icon className="w-5 h-5" />
                   </div>
                   
                   {/* Title/Label */}
                   <div className="flex flex-col min-w-0">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{info.label}</span>
                       <span className="text-base font-black text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-md block tracking-tight font-arabic">
                            {getTitlePreview()}
                       </span>
                   </div>
               </div>

               <div className="flex items-center gap-3">
                 {/* Move Buttons */}
                 <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-1" onClick={(e) => e.stopPropagation()}>
                   <button 
                     onClick={onMoveUp} 
                     disabled={isFirst}
                     className="p-2 text-slate-400 hover:text-teal-500 hover:bg-white dark:hover:bg-white/10 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                     title="Pindah ke atas"
                   >
                     <ChevronUp className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={onMoveDown} 
                     disabled={isLast}
                     className="p-2 text-slate-400 hover:text-teal-500 hover:bg-white dark:hover:bg-white/10 rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                     title="Pindah ke bawah"
                   >
                     <ChevronDown className="w-4 h-4" />
                   </button>
                 </div>

                 {/* Delete Button */}
                 <button 
                     onClick={(e) => {
                         e.stopPropagation();
                         onRemove();
                     }} 
                     className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                     title="Hapus Blok"
                 >
                     <Trash2 className="w-5 h-5" />
                 </button>
                 
                 {/* Toggle Chevron */}
                 <div className={cn(
                     "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                     isOpen ? "bg-teal-500 text-white rotate-180" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                 )}>
                    <ChevronDown className="w-5 h-5" />
                 </div>
               </div>
            </div>

            {/* Content Body */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 pt-4 border-t border-slate-100 dark:border-white/5">
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

              {/* --- GAME: MATCH UP --- */}
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
                         {/* Desktop Header */}
                         <div className="hidden md:grid grid-cols-2 gap-4 text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2">
                             <div>Pertanyaan (Diam)</div>
                             <div>Jawaban (Digeser)</div>
                         </div>
                         
                         {block.data.pairs?.map((pair, idx) => (
                             <div key={pair.id || idx} className="flex flex-col md:grid md:grid-cols-[1fr,1fr,auto] gap-3 md:gap-2 items-stretch md:items-center bg-[var(--color-bg-card)] md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border border-[var(--color-border)] md:border-none relative">
                                 {/* Question Input */}
                                 <div className="w-full">
                                     <label className="md:hidden text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Pertanyaan</label>
                                     <input 
                                        className={`w-full bg-[var(--color-bg-muted)] md:bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-pink-500 ${isArabic(pair.question) ? 'font-arabic text-lg' : ''}`}
                                        placeholder="Pertanyaan..."
                                        value={pair.question}
                                        onChange={(e) => {
                                            const newPairs = [...block.data.pairs];
                                            newPairs[idx].question = e.target.value;
                                            onUpdate({ ...block.data, pairs: newPairs });
                                        }}
                                     />
                                 </div>

                                 {/* Answer Input */}
                                 <div className="w-full">
                                     <label className="md:hidden text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Jawaban</label>
                                     <input 
                                        className={`w-full bg-[var(--color-bg-muted)] md:bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-main)] outline-none focus:border-pink-500 ${isArabic(pair.answer) ? 'font-arabic text-lg' : ''}`}
                                        placeholder="Jawaban..."
                                        value={pair.answer}
                                        onChange={(e) => {
                                            const newPairs = [...block.data.pairs];
                                            newPairs[idx].answer = e.target.value;
                                            onUpdate({ ...block.data, pairs: newPairs });
                                        }}
                                     />
                                 </div>

                                 {/* Delete Button */}
                                 <button 
                                     onClick={() => {
                                         if (block.data.pairs.length === 1) return;
                                         const newPairs = block.data.pairs.filter((_, i) => i !== idx);
                                         onUpdate({ ...block.data, pairs: newPairs });
                                     }}
                                     className="absolute top-2 right-2 md:static text-gray-400 hover:text-red-500 p-1 bg-[var(--color-bg-card)] md:bg-transparent rounded-full shadow-sm md:shadow-none border md:border-none border-[var(--color-border)]"
                                     title="Hapus Pasangan"
                                 >
                                     <X className="w-4 h-4" />
                                 </button>
                             </div>
                         ))}
                         
                         <button 
                             onClick={() => {
                                 const newId = (block.data.pairs[block.data.pairs.length - 1]?.id || 0) + 1;
                                 onUpdate({ ...block.data, pairs: [...block.data.pairs, { id: newId, question: '', answer: '' }] });
                             }}
                             className="text-xs text-pink-600 font-bold hover:underline mt-2 flex items-center gap-1"
                         >
                             <Plus className="w-3 h-3" />
                             Tambah Pasangan
                         </button>
                     </div>
                     
                     {/* Preview */}
                     <div className="mt-6 border-t border-[var(--color-border)] pt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview:</p>
                        <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)]">
                            <MatchUpGame pairs={block.data.pairs} title={block.data.title} />
                        </div>
                     </div>
                </div>
              )}

              {/* --- GAME: QUIZ --- */}
              {block.type === 'quiz' && (
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-5 h-5 text-teal-500" />
                        <input 
                            type="text" 
                            className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none focus:ring-0 placeholder-[var(--color-text-muted)] w-full"
                            value={block.data.title || 'Kuis'}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                            placeholder="Judul Kuis..."
                        />
                     </div>

                     <div className="space-y-6">
                        {block.data.questions?.map((q, qIdx) => (
                            <div key={q.id} className="bg-[var(--color-bg-muted)] p-4 rounded-xl border border-[var(--color-border)] relative group/q">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 mr-4">
                                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Pertanyaan {qIdx + 1}</label>
                                        <input 
                                            className={`w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-medium outline-none focus:border-teal-500 ${isArabic(q.text) ? 'font-arabic text-right text-lg' : ''}`}
                                            dir={isArabic(q.text) ? 'rtl' : 'ltr'}
                                            placeholder="Tulis pertanyaan..."
                                            value={q.text}
                                            onChange={(e) => {
                                                const newQuestions = [...block.data.questions];
                                                newQuestions[qIdx].text = e.target.value;
                                                onUpdate({ ...block.data, questions: newQuestions });
                                            }}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (block.data.questions.length === 1) return;
                                            const newQuestions = block.data.questions.filter((_, i) => i !== qIdx);
                                            onUpdate({ ...block.data, questions: newQuestions });
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Hapus Pertanyaan"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Options */}
                                <div className="pl-4 border-l-2 border-[var(--color-border)] space-y-2">
                                    {q.options?.map((opt, optIdx) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <input 
                                                type="radio"
                                                name={`correct-${block.id}-${q.id}`}
                                                checked={opt.isCorrect}
                                                onChange={() => {
                                                    const newQuestions = [...block.data.questions];
                                                    newQuestions[qIdx].options = newQuestions[qIdx].options.map((o, i) => ({
                                                        ...o, isCorrect: i === optIdx
                                                    }));
                                                    onUpdate({ ...block.data, questions: newQuestions });
                                                }}
                                                className="text-teal-600 focus:ring-teal-500 cursor-pointer"
                                                title="Tandai sebagai jawaban benar"
                                            />
                                            <input 
                                                className={`flex-1 bg-[var(--color-bg-card)] border ${opt.isCorrect ? 'border-teal-500 ring-1 ring-teal-500' : 'border-[var(--color-border)]'} rounded text-xs px-2 py-1.5 outline-none focus:border-teal-500 ${isArabic(opt.text) ? 'font-arabic text-sm' : ''}`}
                                                placeholder={`Pilihan ${String.fromCharCode(65 + optIdx)}`}
                                                value={opt.text}
                                                onChange={(e) => {
                                                    const newQuestions = [...block.data.questions];
                                                    newQuestions[qIdx].options[optIdx].text = e.target.value;
                                                    onUpdate({ ...block.data, questions: newQuestions });
                                                }}
                                            />
                                            <button 
                                                onClick={() => {
                                                    if (q.options.length <= 2) return; // Min 2 options
                                                    const newQuestions = [...block.data.questions];
                                                    newQuestions[qIdx].options = q.options.filter((_, i) => i !== optIdx);
                                                    onUpdate({ ...block.data, questions: newQuestions });
                                                }}
                                                className="text-gray-300 hover:text-red-400 p-1"
                                                disabled={q.options.length <= 2}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            const newQuestions = [...block.data.questions];
                                            const newId = Math.max(...q.options.map(o => o.id)) + 1;
                                            newQuestions[qIdx].options.push({ id: newId, text: '', isCorrect: false });
                                            onUpdate({ ...block.data, questions: newQuestions });
                                        }}
                                        className="text-xs text-teal-600 font-bold hover:underline mt-1 ml-6"
                                    >
                                        + Tambah Pilihan
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button 
                            onClick={() => {
                                const newId = block.data.questions.length > 0 ? Math.max(...block.data.questions.map(q => q.id)) + 1 : 1;
                                onUpdate({ 
                                    ...block.data, 
                                    questions: [...(block.data.questions || []), { 
                                        id: newId, 
                                        text: '', 
                                        options: [{id:1, text:'', isCorrect:true}, {id:2, text:'', isCorrect:false}] 
                                    }] 
                                });
                            }}
                            className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Pertanyaan Baru
                        </button>
                     </div>

                     {/* Preview */}
                     <div className="mt-6 border-t border-[var(--color-border)] pt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview:</p>
                        <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)]">
                            <QuizGame questions={block.data.questions} title={block.data.title} />
                        </div>
                     </div>
                </div>
              )}
              {/* --- GAME: FLASH CARD --- */}
              {block.type === 'flashcard' && (
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        <input 
                            type="text" 
                            className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none focus:ring-0 placeholder-[var(--color-text-muted)] w-full"
                            value={block.data.title || 'Flash Card'}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                            placeholder="Judul Flash Card..."
                        />
                     </div>

                     <div className="space-y-4">
                        {block.data.items?.map((item, idx) => (
                            <div key={item.id || idx} className="bg-[var(--color-bg-muted)] p-3 rounded-xl border border-[var(--color-border)] flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-[10px] font-bold text-[var(--color-text-muted)]">DEPAN</span>
                                        <input 
                                            className="w-full pl-16 pr-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-lg font-arabic dir-rtl focus:border-indigo-500 outline-none"
                                            placeholder="Teks Arab..."
                                            value={item.front}
                                            onChange={(e) => {
                                                const newItems = [...block.data.items];
                                                newItems[idx].front = e.target.value;
                                                onUpdate({ ...block.data, items: newItems });
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-[10px] font-bold text-[var(--color-text-muted)]">BELAKANG</span>
                                        <input 
                                            className="w-full pl-20 pr-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:border-indigo-500 outline-none"
                                            placeholder="Teks Indonesia / Jawaban..."
                                            value={item.back}
                                            onChange={(e) => {
                                                const newItems = [...block.data.items];
                                                newItems[idx].back = e.target.value;
                                                onUpdate({ ...block.data, items: newItems });
                                            }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (block.data.items.length === 1) return;
                                        const newItems = block.data.items.filter((_, i) => i !== idx);
                                        onUpdate({ ...block.data, items: newItems });
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <button 
                            onClick={() => {
                                const newId = block.data.items.length > 0 ? Math.max(...block.data.items.map(i => i.id || 0)) + 1 : 1;
                                onUpdate({ 
                                    ...block.data, 
                                    items: [...(block.data.items || []), { id: newId, front: '', back: '' }] 
                                });
                            }}
                            className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Kartu Baru
                        </button>
                     </div>

                     {/* Preview */}
                     <div className="mt-6 border-t border-[var(--color-border)] pt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview:</p>
                        <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)]">
                            <FlashCardGame items={block.data.items} title={block.data.title} />
                        </div>
                     </div>
                </div>
              )}

              {/* --- GAME: ANAGRAM --- */}
              {block.type === 'anagram' && (
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <GripVertical className="w-5 h-5 text-orange-500" />
                        <input 
                            type="text" 
                            className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none focus:ring-0 placeholder-[var(--color-text-muted)] w-full"
                            value={block.data.title || 'Anagram'}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                            placeholder="Judul Game Anagram..."
                        />
                     </div>

                     <div className="space-y-4">
                        {block.data.questions?.map((q, idx) => (
                            <div key={q.id || idx} className="bg-[var(--color-bg-muted)] p-3 rounded-xl border border-[var(--color-border)] flex items-center gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-[10px] font-bold text-[var(--color-text-muted)]">JAWABAN (KATA)</span>
                                        <input 
                                            className={`w-full pl-24 pr-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-lg font-bold uppercase tracking-widest focus:border-orange-500 outline-none ${isArabic(q.answer) ? 'font-arabic' : ''}`}
                                            placeholder="Contoh: KUCING"
                                            value={q.answer}
                                            onChange={(e) => {
                                                const newQ = [...block.data.questions];
                                                newQ[idx].answer = e.target.value;
                                                onUpdate({ ...block.data, questions: newQ });
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-[10px] font-bold text-[var(--color-text-muted)]">PETUNJUK</span>
                                        <input 
                                            className={`w-full pl-20 pr-3 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text-main)] focus:border-orange-500 outline-none ${isArabic(q.clue) ? 'font-arabic text-lg' : ''}`}
                                            placeholder="Contoh: Hewan berkaki empat, suka ikan..."
                                            value={q.clue}
                                            onChange={(e) => {
                                                const newQ = [...block.data.questions];
                                                newQ[idx].clue = e.target.value;
                                                onUpdate({ ...block.data, questions: newQ });
                                            }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (block.data.questions.length === 1) return;
                                        const newQ = block.data.questions.filter((_, i) => i !== idx);
                                        onUpdate({ ...block.data, questions: newQ });
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <button 
                            onClick={() => {
                                const newId = block.data.questions.length > 0 ? Math.max(...block.data.questions.map(q => q.id || 0)) + 1 : 1;
                                onUpdate({ 
                                    ...block.data, 
                                    questions: [...(block.data.questions || []), { id: newId, answer: '', clue: '' }] 
                                });
                            }}
                            className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Kata Baru
                        </button>
                     </div>

                     {/* Preview */}
                     <div className="mt-6 border-t border-[var(--color-border)] pt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview:</p>
                        <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)]">
                            <AnagramGame questions={block.data.questions} title={block.data.title} />
                        </div>
                     </div>
                </div>
              )}

              {/* --- GAME: COMPLETE SENTENCE --- */}
              {block.type === 'completesentence' && (
                <div className="space-y-4">
                     <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 mb-4">
                        <strong>Cara Membuat:</strong> Tulis kalimat lengkap, lalu beri tanda kurung kurawal <code>{'{'}...{'}'}</code> pada kata yang akan dihilangkan.<br/>
                        Contoh: <code>Saya {'{makan}'} nasi di {'{kantin}'}.</code>
                     </div>

                     <div className="flex items-center gap-2 mb-2">
                        <Type className="w-5 h-5 text-blue-500" />
                        <input 
                            type="text" 
                            className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none focus:ring-0 placeholder-[var(--color-text-muted)] w-full"
                            value={block.data.title || 'Lengkapi Kalimat'}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                            placeholder="Judul Game..."
                        />
                     </div>

                     <div className="space-y-4">
                        {block.data.questions?.map((q, idx) => (
                            <div key={q.id || idx} className="bg-[var(--color-bg-muted)] p-3 rounded-xl border border-[var(--color-border)] flex gap-4">
                                <div className="flex-1">
                                    <textarea 
                                        className={`w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-3 text-sm focus:border-blue-500 outline-none h-20 ${isArabic(q.text) ? 'font-arabic text-lg text-right' : ''}`}
                                        dir={isArabic(q.text) ? 'rtl' : 'ltr'}
                                        placeholder="Tulis kalimat di sini..."
                                        value={q.text}
                                        onChange={(e) => {
                                            const newQ = [...block.data.questions];
                                            newQ[idx].text = e.target.value;
                                            onUpdate({ ...block.data, questions: newQ });
                                        }}
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        if (block.data.questions.length === 1) return;
                                        const newQ = block.data.questions.filter((_, i) => i !== idx);
                                        onUpdate({ ...block.data, questions: newQ });
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-2 h-fit"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <button 
                            onClick={() => {
                                const newId = block.data.questions.length > 0 ? Math.max(...block.data.questions.map(q => q.id || 0)) + 1 : 1;
                                onUpdate({ 
                                    ...block.data, 
                                    questions: [...(block.data.questions || []), { id: newId, text: '' }] 
                                });
                            }}
                            className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Kalimat Baru
                        </button>
                     </div>

                     {/* Preview */}
                     <div className="mt-6 border-t border-[var(--color-border)] pt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview:</p>
                        <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)]">
                            <CompleteSentenceGame questions={block.data.questions} title={block.data.title} />
                        </div>
                     </div>
                </div>
              )}

              {/* --- GAME: UNJUMBLE --- */}
              {block.type === 'unjumble' && (
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <MoveLeft className="w-5 h-5 text-purple-500" />
                        <input 
                            type="text" 
                            className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none focus:ring-0 placeholder-[var(--color-text-muted)] w-full"
                            value={block.data.title || 'Susun Kalimat'}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                            placeholder="Judul Game..."
                        />
                     </div>

                     <div className="space-y-4">
                        {block.data.questions?.map((q, idx) => (
                            <div key={q.id || idx} className="bg-[var(--color-bg-muted)] p-3 rounded-xl border border-[var(--color-border)] flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1 block">Kalimat Yang Benar</label>
                                    <textarea 
                                        className={`w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg p-3 text-sm focus:border-purple-500 outline-none h-20 ${isArabic(q.text) ? 'font-arabic text-lg text-right' : ''}`}
                                        dir={isArabic(q.text) ? 'rtl' : 'ltr'}
                                        placeholder="Tulis kalimat lengkap di sini..."
                                        value={q.text}
                                        onChange={(e) => {
                                            const newQ = [...block.data.questions];
                                            newQ[idx].text = e.target.value;
                                            onUpdate({ ...block.data, questions: newQ });
                                        }}
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        if (block.data.questions.length === 1) return;
                                        const newQ = block.data.questions.filter((_, i) => i !== idx);
                                        onUpdate({ ...block.data, questions: newQ });
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-2 h-fit"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <button 
                            onClick={() => {
                                const newId = block.data.questions.length > 0 ? Math.max(...block.data.questions.map(q => q.id || 0)) + 1 : 1;
                                onUpdate({ 
                                    ...block.data, 
                                    questions: [...(block.data.questions || []), { id: newId, text: '' }] 
                                });
                            }}
                            className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Soal Baru
                        </button>
                     </div>

                     {/* Preview */}
                     <div className="mt-6 border-t border-[var(--color-border)] pt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview:</p>
                        <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)]">
                            <UnjumbleGame questions={block.data.questions} title={block.data.title} />
                        </div>
                     </div>
                </div>
              )}

              {/* --- GAME: SPIN WHEEL --- */}
              {block.type === 'spinwheel' && (
                <div className="space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <RefreshCcw className="w-5 h-5 text-pink-500" />
                        <input 
                            type="text" 
                            className="font-bold text-[var(--color-text-main)] bg-transparent border-none outline-none focus:ring-0 placeholder-[var(--color-text-muted)] w-full"
                            value={block.data.title || 'Spin the Wheel'}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                            placeholder="Judul Game..."
                        />
                     </div>

                     <div className="space-y-4">
                        {block.data.items?.map((item, idx) => (
                            <div key={item.id || idx} className="bg-[var(--color-bg-muted)] p-3 rounded-xl border border-[var(--color-border)] flex items-center gap-4">
                                <div className="flex-1">
                                    <input 
                                        className={`w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:border-pink-500 outline-none ${isArabic(item.text) ? 'font-arabic text-lg' : ''}`}
                                        placeholder={`Item ${idx + 1}`}
                                        value={item.text}
                                        onChange={(e) => {
                                            const newItems = [...block.data.items];
                                            newItems[idx].text = e.target.value;
                                            onUpdate({ ...block.data, items: newItems });
                                        }}
                                    />
                                </div>
                                <button 
                                    onClick={() => {
                                        if (block.data.items.length <= 2) return; // Min 2 items 
                                        const newItems = block.data.items.filter((_, i) => i !== idx);
                                        onUpdate({ ...block.data, items: newItems });
                                    }}
                                    className="text-gray-400 hover:text-red-500 p-2"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <button 
                            onClick={() => {
                                const newId = block.data.items.length > 0 ? Math.max(...block.data.items.map(i => i.id || 0)) + 1 : 1;
                                onUpdate({ 
                                    ...block.data, 
                                    items: [...(block.data.items || []), { id: newId, text: '' }] 
                                });
                            }}
                            className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-xl text-xs font-bold text-[var(--color-text-muted)] hover:border-pink-500 hover:text-pink-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah Item
                        </button>
                     </div>

                     {/* Preview */}
                     <div className="mt-6 border-t border-[var(--color-border)] pt-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Preview:</p>
                        <div className="w-full border border-[var(--color-border)] rounded-xl overflow-hidden bg-[var(--color-bg-main)]">
                            <SpinWheelGame items={block.data.items} title={block.data.title} />
                        </div>
                     </div>
                </div>
              )}


                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LessonEditor;
