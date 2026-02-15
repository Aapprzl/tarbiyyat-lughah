import React, { useState, useEffect } from 'react';
import { Type, ImageIcon, ChevronDown, X, MessageSquare, Trash2, Plus, Link as LinkIcon, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import { getDirection } from '../../../utils/textUtils';
import { contentService } from '../../../services/contentService';


export const InteractiveStoryBlock = ({ block, onUpdate }) => {
    const [globalCharacters, setGlobalCharacters] = useState([]);
    const [globalBackgrounds, setGlobalBackgrounds] = useState([]);

    useEffect(() => {
        const fetchAssets = async () => {
            const [chars, bgs] = await Promise.all([
                contentService.getCharacters(),
                contentService.getBackgrounds()
            ]);
            setGlobalCharacters(chars);
            setGlobalBackgrounds(bgs);
        };
        fetchAssets();
    }, []);

    // Ensure scenes structure exists
    useEffect(() => {
        if (!block.data.scenes) {
            onUpdate({ ...block.data, scenes: {} });
        }
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Scene ({Object.keys(block.data.scenes || {}).length})</label>
            </div>

            <div className="space-y-3">
                {Object.entries(block.data.scenes || {}).map(([sKey, sData]) => (
                    <div key={sKey} className="group/scene bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden transition-all hover:border-teal-500/30">
                        <div className="p-3.5 space-y-4">
                            {/* Scene Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-0.5 bg-teal-500 text-white text-[9px] font-bold rounded-lg uppercase tracking-widest shadow-sm shadow-teal-500/20 flex items-center gap-2">
                                        ID: {sKey}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(sKey);
                                                alert("ID disalin ke clipboard!");
                                            }}
                                            className="hover:text-white/70 transition-colors p-0.5"
                                            title="Salin ID"
                                        >
                                            <Copy className="w-2.5 h-2.5" />
                                        </button>
                                    </div>
                                    {sKey === block.data.startScene && (
                                        <span className="text-[9px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-lg border border-teal-100 dark:border-teal-500/20 uppercase tracking-tighter italic">START</span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => {
                                        const newScenes = { ...block.data.scenes };
                                        delete newScenes[sKey];
                                        onUpdate({ ...block.data, scenes: newScenes });
                                    }}
                                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Common Scene background */}
                            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon className="w-3 h-3 text-teal-500" /> Background Utama
                                    </label>
                                    <button 
                                        onClick={() => window.open('#/admin/assets', '_blank')}
                                        className="text-[8px] font-bold text-teal-500 hover:text-teal-600 uppercase tracking-tighter"
                                    >+ Tambah Aset</button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div className="relative group/bg">
                                        <select 
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-[11px] font-bold outline-none appearance-none cursor-pointer focus:border-teal-500/50 dark:text-white transition-all hover:bg-white dark:hover:bg-slate-800"
                                            value={globalBackgrounds.find(b => b.image === sData.background)?.id || ''}
                                            onChange={(e) => {
                                                const selected = globalBackgrounds.find(b => b.id === e.target.value);
                                                const newScenes = { ...block.data.scenes };
                                                newScenes[sKey] = { 
                                                    ...sData, 
                                                    background: selected ? selected.image : '' 
                                                };
                                                onUpdate({ ...block.data, scenes: newScenes });
                                            }}
                                        >
                                            <option value="" className="bg-white dark:bg-slate-900 text-slate-400">Pilih Background...</option>
                                            {globalBackgrounds.map(bg => (
                                                <option key={bg.id} value={bg.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium">
                                                    {bg.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronDown className="w-3 h-3" />
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {sData.background && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="relative aspect-video bg-slate-100 dark:bg-black/20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-sm"
                                            >
                                                <img src={sData.background} alt="Scene Background" loading="lazy" className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={() => {
                                                        const newScenes = { ...block.data.scenes };
                                                        newScenes[sKey] = { ...sData, background: '' };
                                                        onUpdate({ ...block.data, scenes: newScenes });
                                                    }}
                                                    className="absolute top-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-lg text-red-500 shadow-xl opacity-0 hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                             {/* Dialogue Sequence (Multi-Bubble) */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[9px] font-bold text-teal-600 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Urutan Dialog / Bubble
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    {(sData.bubbles || (sData.text ? [{ text: sData.text, character: sData.character }] : [])).map((bubble, bIdx) => (
                                        <motion.div 
                                            key={bIdx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="relative p-3.5 bg-slate-50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 space-y-3 group/bubble"
                                        >
                                            {/* Bubble Header / Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 bg-teal-500/10 rounded-full flex items-center justify-center text-[9px] font-bold text-teal-600">
                                                        {bIdx + 1}
                                                    </div>
                                                    <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Urutan Dialog</span>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const newScenes = { ...block.data.scenes };
                                                        const bubbles = [...(sData.bubbles || (sData.text ? [{ text: sData.text, character: sData.character }] : []))];
                                                        bubbles.splice(bIdx, 1);
                                                        newScenes[sKey] = { ...sData, bubbles };
                                                        onUpdate({ ...block.data, scenes: newScenes });
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                             {/* Bubble Content */}
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="md:col-span-2 space-y-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Teks Dialog</label>
                                                        <textarea 
                                                            placeholder="Tulis dialog..."
                                                            className={cn(
                                                                "w-full h-24 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-[11px] font-bold outline-none focus:border-teal-500/50 transition-all",
                                                                getDirection(bubble.text) === 'rtl' && "arabic-content leading-[2]"
                                                            )}
                                                            style={{ 
                                                                    direction: getDirection(bubble.text),
                                                                    fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif'
                                                                }}
                                                            value={bubble.text || ''}
                                                            onChange={(e) => {
                                                                const newScenes = { ...block.data.scenes };
                                                                const bubbles = [...(sData.bubbles || (sData.text ? [{ text: sData.text, character: sData.character }] : []))];
                                                                bubbles[bIdx] = { ...bubbles[bIdx], text: e.target.value };
                                                                newScenes[sKey] = { ...sData, bubbles };
                                                                onUpdate({ ...block.data, scenes: newScenes });
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Internal Bubble Options */}
                                                    <div className="space-y-2 bg-white/40 dark:bg-black/20 p-3 rounded-xl border border-dotted border-slate-200 dark:border-white/10">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[8px] font-bold text-teal-600/70 uppercase tracking-widest px-1 flex items-center gap-2">
                                                                <Plus className="w-3 h-3" /> Pilihan Internal
                                                            </label>
                                                            <button 
                                                                onClick={() => {
                                                                    const newScenes = { ...block.data.scenes };
                                                                    const bubbles = [...(sData.bubbles || [])];
                                                                    const bOptions = [...(bubbles[bIdx].options || [])];
                                                                    bubbles[bIdx] = { ...bubbles[bIdx], options: [...bOptions, { text: '', nextBubbleIndex: 0 }] };
                                                                    newScenes[sKey] = { ...sData, bubbles };
                                                                    onUpdate({ ...block.data, scenes: newScenes });
                                                                }}
                                                                className="text-[8px] font-bold uppercase text-teal-600 hover:text-teal-700 transition-colors"
                                                            >
                                                                + Tambah
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="space-y-1.5">
                                                            {(bubble.options || []).map((bOpt, boIdx) => {
                                                                const availableBubbles = (sData.bubbles || []).map((_, i) => i);
                                                                return (
                                                                    <div key={boIdx} className="flex gap-2 items-center">
                                                                        <input 
                                                                            type="text"
                                                                            placeholder="Teks Opsi..."
                                                                            className={cn(
                                                                                "flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold outline-none focus:border-teal-500/50",
                                                                                getDirection(bOpt.text) === 'rtl' && "arabic-content text-right dir-rtl leading-none pb-1"
                                                                            )}
                                                                            style={{ 
                                                                                direction: getDirection(bOpt.text),
                                                                                fontFamily: 'var(--font-latin), var(--font-arabic), sans-serif' 
                                                                            }}
                                                                            value={bOpt.text || ''}
                                                                            onChange={(e) => {
                                                                                const newScenes = { ...block.data.scenes };
                                                                                const bubbles = [...(sData.bubbles || [])];
                                                                                const bOptions = [...(bubbles[bIdx].options || [])];
                                                                                bOptions[boIdx] = { ...bOptions[boIdx], text: e.target.value };
                                                                                bubbles[bIdx] = { ...bubbles[bIdx], options: bOptions };
                                                                                newScenes[sKey] = { ...sData, bubbles };
                                                                                onUpdate({ ...block.data, scenes: newScenes });
                                                                            }}
                                                                        />
                                                                        <div className="relative w-20">
                                                                            <select 
                                                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-[9px] font-bold outline-none appearance-none cursor-pointer focus:border-teal-500/50"
                                                                                value={bOpt.nextBubbleIndex || 0}
                                                                                onChange={(e) => {
                                                                                    const newScenes = { ...block.data.scenes };
                                                                                    const bubbles = [...(sData.bubbles || [])];
                                                                                    const bOptions = [...(bubbles[bIdx].options || [])];
                                                                                    bOptions[boIdx] = { ...bOptions[boIdx], nextBubbleIndex: parseInt(e.target.value) };
                                                                                    bubbles[bIdx] = { ...bubbles[bIdx], options: bOptions };
                                                                                    newScenes[sKey] = { ...sData, bubbles };
                                                                                    onUpdate({ ...block.data, scenes: newScenes });
                                                                                }}
                                                                            >
                                                                                {availableBubbles.map(idx => (
                                                                                    <option key={idx} value={idx}>Dialog {idx + 1}</option>
                                                                                ))}
                                                                            </select>
                                                                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-400 pointer-events-none" />
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => {
                                                                                const newScenes = { ...block.data.scenes };
                                                                                const bubbles = [...(sData.bubbles || [])];
                                                                                const bOptions = [...(bubbles[bIdx].options || [])];
                                                                                bOptions.splice(boIdx, 1);
                                                                                bubbles[bIdx] = { ...bubbles[bIdx], options: bOptions };
                                                                                newScenes[sKey] = { ...sData, bubbles };
                                                                                onUpdate({ ...block.data, scenes: newScenes });
                                                                            }}
                                                                            className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="relative group/char">
                                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1 block mb-1.5">Karakter</label>
                                                        <div className="relative">
                                                            <select 
                                                                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-[10px] font-bold outline-none appearance-none cursor-pointer focus:border-teal-500/50 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                                                                value={bubble.character?.id || ''}
                                                                onChange={(e) => {
                                                                    const selected = globalCharacters.find(c => c.id === e.target.value);
                                                                    const newScenes = { ...block.data.scenes };
                                                                    const bubbles = [...(sData.bubbles || (sData.text ? [{ text: sData.text, character: sData.character }] : []))];
                                                                    bubbles[bIdx] = { 
                                                                        ...bubbles[bIdx], 
                                                                        character: selected ? { id: selected.id, name: selected.name, image: selected.image } : null 
                                                                    };
                                                                    newScenes[sKey] = { ...sData, bubbles };
                                                                    onUpdate({ ...block.data, scenes: newScenes });
                                                                }}
                                                            >
                                                                <option value="">Tanpa Karakter</option>
                                                                {globalCharacters.map(char => (
                                                                    <option key={char.id} value={char.id}>{char.name}</option>
                                                                ))}
                                                            </select>
                                                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                <ChevronDown className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {bubble.character && (
                                                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                                            <img src={bubble.character.image} alt={bubble.character.name} loading="lazy" className="w-8 h-8 object-contain shrink-0" />
                                                            <div className="min-w-0">
                                                                <p className="text-[8px] font-black text-teal-600 uppercase tracking-tighter truncate">{bubble.character.name}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            const newScenes = { ...block.data.scenes };
                                            const currentBubbles = sData.bubbles || (sData.text ? [{ text: sData.text, character: sData.character }] : []);
                                            newScenes[sKey] = { 
                                                ...sData, 
                                                bubbles: [...currentBubbles, { text: '', character: null }]
                                            };
                                            // Clean up old fields
                                            delete newScenes[sKey].text;
                                            delete newScenes[sKey].character;
                                            onUpdate({ ...block.data, scenes: newScenes });
                                        }}
                                        className="w-full mt-1.5 py-4 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border border-dashed border-teal-500/30 rounded-xl text-[9px] font-bold uppercase text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all group"
                                    >
                                        <Plus className="w-3 h-3 group-hover:scale-125 transition-transform" /> Tambah Bubble
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Options */}
                            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/5">
                                <label className="text-[9px] font-bold text-teal-600 uppercase tracking-widest px-1">Pilihan Jalur Cerita</label>
                                <div className="space-y-1.5">
                                    {(sData.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex gap-2 items-center group/opt">
                                            <div className="flex-1 bg-slate-50 dark:bg-black/10 rounded-xl p-2 flex gap-3 border border-transparent hover:border-teal-500/30 transition-all">
                                                <input 
                                                    type="text"
                                                    placeholder="Teks Pilihan..."
                                                    className={cn(
                                                        "flex-[1.5] bg-transparent text-[11px] font-bold outline-none",
                                                        getDirection(opt.text) === 'rtl' && "arabic-content text-right leading-[2]"
                                                    )}
                                                    value={opt.text || ''}
                                                    onChange={(e) => {
                                                        const newScenes = { ...block.data.scenes };
                                                        const newOpts = [...(newScenes[sKey].options || [])];
                                                        newOpts[oIdx] = { ...newOpts[oIdx], text: e.target.value };
                                                        newScenes[sKey].options = newOpts;
                                                        onUpdate({ ...block.data, scenes: newScenes });
                                                    }}
                                                />
                                                <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
                                                <div className="flex-1 flex items-center gap-2">
                                                    <LinkIcon className="w-3 h-3 text-slate-400" />
                                                    <input 
                                                        type="text"
                                                        placeholder="ID Scene Tujuan"
                                                        className="w-full bg-transparent text-[10px] font-black text-teal-600 outline-none"
                                                        value={opt.nextScene || ''}
                                                        onChange={(e) => {
                                                            const newScenes = { ...block.data.scenes };
                                                            const newOpts = [...(newScenes[sKey].options || [])];
                                                            newOpts[oIdx] = { ...newOpts[oIdx], nextScene: e.target.value };
                                                            newScenes[sKey].options = newOpts;
                                                            onUpdate({ ...block.data, scenes: newScenes });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newScenes = { ...block.data.scenes };
                                                    newScenes[sKey].options = sData.options.filter((_, i) => i !== oIdx);
                                                    onUpdate({ ...block.data, scenes: newScenes });
                                                }}
                                                className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => {
                                            const newScenes = { ...block.data.scenes };
                                            newScenes[sKey].options = [...(sData.options || []), { text: '', nextScene: '' }];
                                            onUpdate({ ...block.data, scenes: newScenes });
                                        }}
                                        className="w-full py-2 bg-slate-50 dark:bg-white/5 border border-dashed border-teal-200 dark:border-teal-500/20 rounded-lg text-[9px] font-bold uppercase text-teal-500 hover:bg-teal-50 transition-all"
                                    >+ Tambah Pilihan</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            
                <button
                    onClick={() => {
                        const sceneId = `scene_${Date.now()}`;
                        onUpdate({ 
                        ...block.data, 
                        scenes: { 
                            ...(block.data.scenes || {}), 
                            [sceneId]: { text: '', options: [{ text: 'Lanjut', nextScene: '' }] } 
                        } 
                        });
                    }}
                    className="w-full py-4 flex items-center justify-center gap-3 bg-slate-100 dark:bg-white/5 border border-dashed border-teal-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all group"
                >
                    <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Tambah Scene Baru
                </button>
            </div>
        </div>
    );
};
