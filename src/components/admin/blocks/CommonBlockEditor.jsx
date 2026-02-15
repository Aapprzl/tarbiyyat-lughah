import React from 'react';
import TextBlock from './common/TextBlock';
import VocabBlock from './common/VocabBlock';
import AlertBlock from './common/AlertBlock';
import YouTubeBlock from './common/YouTubeBlock';
import AudioBlock from './common/AudioBlock';
import ImageBlock from './common/ImageBlock';
import PdfBlock from './common/PdfBlock';
import RichTextEditor from './common/RichTextEditor';
import { MindMapBlock } from './common/MindMapBlock';

/**
 * CommonBlockEditor Component
 * Handles rendering of all common content blocks (non-game blocks)
 * 
 * @param {Object} block - Block data with type and data properties
 * @param {Function} onUpdate - Callback to update block data
 * @param {Object} toast - Toast notification object
 */
const CommonBlockEditor = ({ block, onUpdate, toast }) => {
    return (
        <>
            {/* --- MIND MAP BLOCK --- */}
            {(block.type === 'mindmap' || (block.type === 'text' && block.data?.isMindMap)) && (
                <MindMapBlock 
                    data={block.data} 
                    onUpdate={onUpdate} 
                />
            )}

            {/* --- TEXT BLOCK --- */}
            {(block.type === 'text' && !block.data?.isRichText && !block.data?.isMindMap) && (
                <TextBlock data={block.data} onUpdate={onUpdate} />
            )}

            {/* --- VOCAB BLOCK --- */}
            {block.type === 'vocab' && (
                <VocabBlock data={block.data} onUpdate={onUpdate} />
            )}

            {/* --- ALERT BLOCK --- */}
            {block.type === 'alert' && (
                <AlertBlock data={block.data} onUpdate={onUpdate} />
            )}

            {/* --- YOUTUBE BLOCK --- */}
            {block.type === 'youtube' && (
                <YouTubeBlock data={block.data} onUpdate={onUpdate} />
            )}

            {/* --- AUDIO BLOCK --- */}
            {block.type === 'audio' && (
                <AudioBlock data={block.data} onUpdate={onUpdate} toast={toast} />
            )}

            {/* --- IMAGE BLOCK --- */}
            {block.type === 'image' && (
                <ImageBlock data={block.data} onUpdate={onUpdate} toast={toast} />
            )}

            {/* --- PDF BLOCK --- */}
            {block.type === 'pdf' && (
                <PdfBlock data={block.data} onUpdate={onUpdate} toast={toast} />
            )}

            {/* --- RICH TEXT BLOCK --- */}
            {(block.type === 'richtext' || (block.type === 'text' && block.data?.isRichText)) && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Konten (Opsional)</label>
                        <input 
                            type="text" 
                            placeholder="Bab 1: Pendahuluan..."
                            className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
                            value={block.data.title || ''}
                            onChange={(e) => onUpdate({ ...block.data, title: e.target.value })}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Isi Konten</label>
                        <RichTextEditor 
                            value={block.data.content || ''}
                            onChange={(content) => onUpdate({ ...block.data, content })}
                            placeholder="Tulis materi pembelajaran secara lengkap di sini..."
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default CommonBlockEditor;
