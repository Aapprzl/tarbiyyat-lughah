import React, { useState, useEffect } from 'react';
import { Type, Table, AlertCircle, Youtube, Music, ClipboardList, Puzzle, HelpCircle, Layers, GripVertical, MoveLeft, RefreshCcw, Circle, Trash2, Keyboard, LayoutGrid, Ghost, Plus, Zap, FileText, CloudRain, CheckCircle2, Image as ImageIcon, Mountain, X, Search, Telescope, User, Settings, Link as LinkIcon, Copy, Sparkles, MessageSquare, GitGraph } from 'lucide-react';
import { cn } from '../../utils/cn';
import { BlockWrapper } from './blocks/BlockWrapper';
import CommonBlockEditor from './blocks/CommonBlockEditor';
import GameBlockEditor from './blocks/GameBlockEditor';

/**
 * AddBlockButton Component
 * Reusable button for adding new blocks
 */
const AddBlockButton = ({ onClick, icon: Icon, label, color, bg }) => (
    <button 
        onClick={onClick}
        className={cn(
            bg,
            "px-3 md:px-4 py-2.5 md:py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-medium hover:brightness-110 transition-colors border border-slate-200/50 dark:border-white/10 backdrop-blur-md group"
        )}
    >
        <div className={cn("w-6 h-6 md:w-7 md:h-7 rounded-md flex items-center justify-center transition-colors shrink-0", bg, color)}>
            <Icon className="w-3 md:w-4 h-3 md:h-4" />
        </div>
        <span className="truncate dark:text-white/90 text-slate-700">{label}</span>
    </button>
);

/**
 * BlockEditor Component - Main Router
 * Routes blocks to appropriate editor (Common or Game)
 * 
 * @param {Object} block - Block data with type and data properties
 * @param {Function} onRemove - Callback to remove block
 * @param {Function} onUpdate - Callback to update block data
 * @param {Function} onMoveUp - Callback to move block up
 * @param {Function} onMoveDown - Callback to move block down
 * @param {boolean} isFirst - Whether this is the first block
 * @param {boolean} isLast - Whether this is the last block
 * @param {Object} toast - Toast notification object
 */
const BlockEditor = ({ block, onRemove, onUpdate, onMoveUp, onMoveDown, isFirst, isLast, toast }) => {
    // Define block type categories
    const commonTypes = [
        'text', 'vocab', 'alert', 'youtube', 'audio', 
        'image', 'pdf', 'richtext', 'mindmap'
    ];
    
    const gameTypes = [
        'matchup', 'quiz', 'anagram', 'completesentence', 'unjumble',
        'spinwheel', 'wordclassification', 'harakat', 'memory', 'hangman',
        'worddetective', 'camelrace', 'wordrain', 'interactivestory'
    ];
    
    // Determine block category
    const isCommonBlock = commonTypes.includes(block.type) || 
                          (block.type === 'text' && (block.data?.isRichText || block.data?.isMindMap));
    
    const isGameBlock = gameTypes.includes(block.type);
    
    /**
     * Get block metadata (icon, label, color, etc.)
     */
    const getBlockInfo = (type, data) => {
        if (type === 'text' && data?.isRichText) {
            return { icon: FileText, label: 'Rich Text', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        }
        if (type === 'text' && data?.isMindMap) {
            return { icon: GitGraph, label: 'Peta Pikiran', color: 'text-teal-600', bg: 'bg-teal-50' };
        }
        switch(type) {
            case 'text': return { icon: Type, label: 'Teks Bebas', color: 'text-slate-600', bg: 'bg-slate-50' };
            case 'vocab': return { icon: Table, label: 'Kosakata', color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'alert': return { icon: AlertCircle, label: 'Info', color: 'text-amber-600', bg: 'bg-amber-50' };
            case 'youtube': return { icon: Youtube, label: 'Video', color: 'text-red-600', bg: 'bg-red-50' };
            case 'audio': return { icon: Music, label: 'Audio', color: 'text-violet-600', bg: 'bg-violet-50' };
            case 'pdf': return { icon: ClipboardList, label: 'File', color: 'text-blue-600', bg: 'bg-blue-50' };
            case 'image': return { icon: ImageIcon, label: 'Gambar', color: 'text-pink-600', bg: 'bg-pink-50' };
            case 'richtext': return { icon: FileText, label: 'Rich Text', color: 'text-emerald-600', bg: 'bg-emerald-50' };
            case 'matchup': return { icon: Puzzle, label: 'Match Up', color: 'text-pink-600', bg: 'bg-pink-50' };
            case 'quiz': return { icon: HelpCircle, label: 'Quiz', color: 'text-teal-600', bg: 'bg-teal-50' };
            case 'anagram': return { icon: GripVertical, label: 'Anagram', color: 'text-orange-600', bg: 'bg-orange-50' };
            case 'completesentence': return { icon: Zap, label: 'Kilat Bahasa', color: 'text-indigo-600', bg: 'bg-indigo-50' };
            case 'unjumble': return { icon: MoveLeft, label: 'Unjumble', color: 'text-purple-600', bg: 'bg-purple-50' };
            case 'spinwheel': return { icon: RefreshCcw, label: 'Spin Wheel', color: 'text-pink-600', bg: 'bg-pink-50' };
            case 'wordclassification': return { icon: Puzzle, label: 'Tebak Kata', color: 'text-rose-600', bg: 'bg-rose-50', gradient: 'from-rose-500 to-pink-600' };
            case 'harakat': return { icon: Keyboard, label: 'Harakat', color: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-amber-400 to-orange-600' };
            case 'memory': return { icon: LayoutGrid, label: 'Memori', color: 'text-violet-600', bg: 'bg-violet-50', gradient: 'from-violet-500 to-fuchsia-600' };
            case 'hangman': return { icon: Ghost, label: 'Algojo', color: 'text-red-600', bg: 'bg-red-50', gradient: 'from-red-500 to-rose-600' };
            case 'wordrain': return { icon: CloudRain, label: 'Hujan Kata', color: 'text-sky-600', bg: 'bg-sky-50', gradient: 'from-sky-500 to-indigo-600' };
            case 'camelrace': return { icon: Mountain, label: 'Balap Unta', color: 'text-amber-600', bg: 'bg-amber-50', gradient: 'from-amber-400 to-orange-600' };
            case 'worddetective': return { icon: Search, label: 'Detektif Kata', color: 'text-emerald-600', bg: 'bg-emerald-50', gradient: 'from-emerald-400 to-teal-600' };
            case 'interactivestory': return { icon: Telescope, label: 'Pilih Jalur', color: 'text-teal-600', bg: 'bg-teal-50', gradient: 'from-teal-400 to-emerald-600' };
            default: return { icon: Circle, label: 'Unknown', color: 'text-gray-600', bg: 'bg-gray-50', gradient: 'from-slate-400 to-slate-600' };
        }
    };

    const info = getBlockInfo(block.type, block.data);

    return (
        <BlockWrapper 
            key={block.id}
            block={block}
            info={info}
            isFirst={isFirst}
            isLast={isLast}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            onDelete={onRemove}
            onUpdate={onUpdate}
        >
            {/* Route to Common Block Editor */}
            {isCommonBlock && (
                <CommonBlockEditor 
                    block={block} 
                    onUpdate={onUpdate} 
                    toast={toast} 
                />
            )}
            
            {/* Route to Game Block Editor */}
            {isGameBlock && (
                <GameBlockEditor 
                    block={block} 
                    onUpdate={onUpdate} 
                    toast={toast} 
                />
            )}
            
            {/* Fallback for unknown block types */}
            {!isCommonBlock && !isGameBlock && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30 text-center">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Unknown block type: <code className="font-mono">{block.type}</code>
                    </p>
                </div>
            )}
        </BlockWrapper>
    );
};

export { BlockEditor, AddBlockButton };
