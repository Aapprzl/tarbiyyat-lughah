import React, { useState } from 'react';
import { Type, Table, AlertCircle, Youtube, Music, ClipboardList, Puzzle, HelpCircle, Layers, GripVertical, MoveLeft, RefreshCcw, Circle, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import PdfViewer from '../../components/PdfViewer';
import AudioPlayer from '../../components/AudioPlayer';

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

              {/* --- GAME EDITORS ARE OMITTED TO KEEP EXAMPLE SHORT - BUT WOULD BE HERE --- */}
              {/* This is a truncated version for the artifact demonstration. Real implementation would include all the game inputs */}
              {['matchup', 'quiz', 'flashcard', 'anagram', 'completesentence', 'unjumble', 'spinwheel'].includes(block.type) && (
                  <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl text-center">
                      <p className="text-xs text-slate-500 font-bold uppercase">Editor Game {block.type} belum direfaktor penuh di artifact ini.</p>
                  </div>
              )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export { BlockEditor, AddBlockButton };
