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

            <div className="space-y-4">
                {Object.entries(block.data.scenes || {}).map(([sKey, sData]) => (
                    <div key={sKey} className="group/scene bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden transition-all hover:border-teal-500/30">
                        <div className="p-6 space-y-6">
                            {/* Scene Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-teal-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-teal-500/20 flex items-center gap-2">
                                        ID: {sKey}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigator.clipboard.writeText(sKey);
                                                // toast.success("ID disalin ke clipboard!");
                                                alert("ID disalin ke clipboard!");
                                            }}
                                            className="hover:text-white/70 transition-colors p-0.5"
                                            title="Salin ID"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {sKey === block.data.startScene && (
                                        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100 uppercase tracking-tighter italic">START SCENE</span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => {
                                        const newScenes = { ...block.data.scenes };
                                        delete newScenes[sKey];
                                        onUpdate({ ...block.data, scenes: newScenes });
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Common Scene background */}
                            <div className="space-y-4 pb-6 border-b border-slate-100 dark:border-white/5">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <ImageIcon className="w-3 h-3 text-teal-500" /> Background Utama Scene
                                    </label>
                                    <button 
                                        onClick={() => window.open('#/admin/assets', '_blank')}
                                        className="text-[9px] font-bold text-teal-500 hover:text-teal-600 uppercase tracking-tighter"
                                    >+ Tambah Aset</button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="relative group/bg">
                                        <select 
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-teal-500/20 dark:text-white transition-all hover:bg-white dark:hover:bg-slate-800"
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
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                                            <ChevronDown className="w-4 h-4" />
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
                                                <img src={sData.background} className="w-full h-full object-cover" />
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
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Urutan Dialog / Bubble
                                    </label>
                                </div>

                                <div className="space-y-6">
                                    {(sData.bubbles || (sData.text ? [{ text: sData.text, character: sData.character }] : [])).map((bubble, bIdx) => (
                                        <motion.div 
                                            key={bIdx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="relative p-5 bg-slate-50 dark:bg-black/10 rounded-[2rem] border border-slate-100 dark:border-white/5 space-y-4 group/bubble"
                                        >
                                            {/* Bubble Header / Controls */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-teal-500/10 rounded-full flex items-center justify-center text-[10px] font-black text-teal-600">
                                                        {bIdx + 1}
                                                    </div>
                                                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Urutan Dialog</span>
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
                                            <div className="grid md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2 space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Teks Dialog</label>
                                                        <textarea 
                                                            placeholder="Tulis dialog..."
                                                            className={cn(
                                                                "w-full h-32 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500/20 transition-all",
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
                                                    <div className="space-y-3 bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-dotted border-slate-200 dark:border-white/10">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[9px] font-black text-teal-600/70 uppercase tracking-widest px-1 flex items-center gap-2">
                                                                <Plus className="w-3 h-3" /> Pilihan Internal (Lompat ke Dialog Lain)
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
                                                                className="text-[8px] font-black uppercase text-teal-600 hover:text-teal-700 transition-colors"
                                                            >
                                                                + Tambah Opsi
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="space-y-2">
                                                            {(bubble.options || []).map((bOpt, boIdx) => {
                                                                const availableBubbles = (sData.bubbles || []).map((_, i) => i);
                                                                return (
                                                                    <div key={boIdx} className="flex gap-2 items-center">
                                                                        <input 
                                                                            type="text"
                                                                            placeholder="Teks Opsi..."
                                                                            className={cn(
                                                                                "flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[10px] font-bold outline-none focus:ring-2 focus:ring-teal-500/20",
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
                                                                        <div className="relative w-24">
                                                                            <select 
                                                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-[9px] font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-teal-500/20"
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
                                                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
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
                                                <div className="space-y-4">
                                                    <div className="relative group/char">
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">Karakter</label>
                                                        <div className="relative">
                                                            <select 
                                                                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-[10px] font-bold outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-teal-500/20 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
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
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                                <ChevronDown className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {bubble.character && (
                                                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                                            <img src={bubble.character.image} className="w-8 h-8 object-contain shrink-0" />
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
                                        className="w-full mt-2 py-4 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border-2 border-dashed border-teal-500/30 rounded-[2rem] text-[10px] font-black uppercase text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all group"
                                    >
                                        <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Tambah Bubble Baru
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Options */}
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest px-1">Pilihan Jalur (Options)</label>
                                <div className="space-y-2">
                                    {(sData.options || []).map((opt, oIdx) => (
                                        <div key={oIdx} className="flex gap-3 items-center group/opt">
                                            <div className="flex-1 bg-slate-50 dark:bg-black/10 rounded-2xl p-3 flex gap-4">
                                                <input 
                                                    type="text"
                                                    placeholder="Teks Pilihan..."
                                                    className={cn(
                                                        "flex-[1.5] bg-transparent text-xs font-bold outline-none",
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
                                                <div className="w-px h-6 bg-slate-200 dark:bg-white/10" />
                                                <div className="flex-1 flex items-center gap-2">
                                                    <LinkIcon className="w-3 h-3 text-slate-400" />
                                                    <input 
                                                        type="text"
                                                        placeholder="ID Scene Tujuan"
                                                        className="w-full bg-transparent text-xs font-black text-teal-500 outline-none"
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
                                                className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-all"
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
                                        className="w-full py-2 bg-slate-50 dark:bg-white/5 border border-dashed border-teal-200 dark:border-teal-500/20 rounded-xl text-[10px] font-black uppercase text-teal-500 hover:bg-teal-50 transition-all"
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
                    className="w-full mt-4 py-5 flex items-center justify-center gap-3 bg-slate-100 dark:bg-white/5 border-2 border-dashed border-teal-500/30 rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all group shadow-sm"
                >
                    <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> Tambah Scene Baru
                </button>
            </div>
        </div>
    );
};
