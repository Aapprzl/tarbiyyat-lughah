import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { isArabic } from '../../../utils/textUtils';

export const BlockWrapper = ({ 
    block, 
    info, 
    isFirst, 
    isLast, 
    onMoveUp, 
    onMoveDown, 
    onDelete, 
    onUpdate, // Passed for potential title updates if we ever move title editing to header, but mostly for children
    children 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = info.icon;

    // Helper to get preview title
    const getTitlePreview = () => {
        if (block.data.title && block.data.title.trim() !== '') return block.data.title;
        
        let content = block.data.content || block.data.question || '';
        if (block.data?.isRichText && content) {
            content = content.replace(/<[^>]*>?/gm, ''); // Strip HTML tags
        }
        
        if (content && content.trim() !== '') {
            return content.substring(0, 30) + (content.length > 30 ? '...' : '');
        }
        
        return info.label;
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 border-b-2 border-b-teal-500/50 overflow-hidden group hover:shadow-md transition-shadow">
            {/* Header / Accordion Trigger */}
            <div 
                className={cn(
                    "flex flex-col transition-colors",
                    isOpen ? "bg-slate-50 dark:bg-white/[0.05]" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                )}
            >
                <div 
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 md:px-6 py-3 md:py-4 flex justify-between items-center cursor-pointer select-none"
                >
                   <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 overflow-hidden">
                       {/* Icon Badge */}
                       <div className={cn(
                           "w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                           isOpen ? `${info.bg} ${info.color}` : "bg-slate-100 dark:bg-white/5 text-slate-400"
                       )}>
                           <Icon className="w-5 h-5 md:w-6 md:h-6" />
                       </div>
                       
                       {/* Title/Label */}
                       <div className="flex flex-col flex-1 min-w-0">
                           <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">{info.label}</span>
                           <span className={cn(
                                "text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate block transition-all",
                                isArabic(getTitlePreview()) && "arabic-content"
                           )}>
                                {getTitlePreview()}
                           </span>
                       </div>
                   </div>

                   <div className="flex items-center gap-3">
                      {/* Desktop Move Buttons */}
                      <div className="hidden md:flex bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 p-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                          disabled={isFirst}
                          className="p-2 text-slate-400 hover:text-teal-500 hover:bg-white dark:hover:bg-white/10 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          title="Pindah ke atas"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                          disabled={isLast}
                          className="p-2 text-slate-400 hover:text-teal-500 hover:bg-white dark:hover:bg-white/10 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          title="Pindah ke bawah"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Desktop Delete Button */}
                      <button 
                          onClick={(e) => {
                              e.stopPropagation();
                              onDelete();
                          }} 
                          className="hidden md:flex p-3 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                          title="Hapus Blok"
                      >
                          <Trash2 className="w-5 h-5" />
                      </button>
                      
                      {/* Toggle Chevron */}
                      <div className={cn(
                          "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all",
                          isOpen ? "bg-teal-500 text-white rotate-180" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                      )}>
                         <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                   </div>
                </div>

                {/* Mobile Action Bar */}
                <div className="md:hidden flex items-center justify-between px-4 pb-3 gap-2">
                    <div className="flex bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 p-0.5 shadow-inner">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMoveUp(); }} 
                            disabled={isFirst}
                            className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-20 transition-all"
                        >
                            <ChevronUp className="w-3.5 h-3.5" /> Up
                        </button>
                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 self-center"></div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onMoveDown(); }} 
                            disabled={isLast}
                            className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 disabled:opacity-20 transition-all"
                        >
                            Down <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                        className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-red-500/20 shadow-sm"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
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
                        <div className="px-4 md:px-8 pb-6 md:pb-8 pt-4 border-t border-slate-100 dark:border-white/[0.08]">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
