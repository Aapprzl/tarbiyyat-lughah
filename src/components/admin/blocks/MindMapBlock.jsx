import React from 'react';
import { Plus, Trash2, ChevronDown, GitGraph, Type } from 'lucide-react';
import { cn } from '../../../utils/cn';

export const MindMapBlock = ({ data, onUpdate }) => {
    const nodes = data.nodes || [{ id: 'n1', text: 'Topik Utama', parentId: null, color: 'teal' }];

    const addNode = (parentId = null) => {
        const newNode = {
            id: `n${Date.now()}`,
            text: '',
            parentId: parentId,
            color: 'teal',
            label: ''
        };
        onUpdate({ ...data, nodes: [...nodes, newNode] });
    };

    const updateNode = (id, updates) => {
        const newNodes = nodes.map(node => node.id === id ? { ...node, ...updates } : node);
        onUpdate({ ...data, nodes: newNodes });
    };

    const deleteNode = (id) => {
        // Prevent deleting the root if it's the only one
        if (nodes.length <= 1) return;
        
        // Find all descendants to delete them too (recursive)
        const getDescendants = (parentId) => {
            const children = nodes.filter(n => n.parentId === parentId);
            return [...children, ...children.flatMap(c => getDescendants(c.id))];
        };

        const toDelete = [id, ...getDescendants(id).map(d => d.id)];
        const newNodes = nodes.filter(node => !toDelete.includes(node.id));
        onUpdate({ ...data, nodes: newNodes });
    };

    const colors = [
        { name: 'teal', bg: 'bg-teal-500', text: 'text-teal-600', bgLight: 'bg-teal-50 dark:bg-teal-500/10' },
        { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { name: 'cyan', bg: 'bg-cyan-500', text: 'text-cyan-600', bgLight: 'bg-cyan-50 dark:bg-cyan-500/10' },
        { name: 'sky', bg: 'bg-sky-500', text: 'text-sky-600', bgLight: 'bg-sky-50 dark:bg-sky-500/10' },
        { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-600', bgLight: 'bg-blue-50 dark:bg-blue-500/10' },
        { name: 'indigo', bg: 'bg-indigo-500', text: 'text-indigo-600', bgLight: 'bg-indigo-50 dark:bg-indigo-500/10' },
        { name: 'violet', bg: 'bg-violet-500', text: 'text-violet-600', bgLight: 'bg-violet-50 dark:bg-violet-500/10' },
        { name: 'purple', bg: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-500/10' },
        { name: 'fuchsia', bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
        { name: 'pink', bg: 'bg-pink-500', text: 'text-pink-600', bgLight: 'bg-pink-50 dark:bg-pink-500/10' },
        { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-600', bgLight: 'bg-rose-50 dark:bg-rose-500/10' },
        { name: 'orange', bg: 'bg-orange-500', text: 'text-orange-600', bgLight: 'bg-orange-50 dark:bg-orange-500/10' },
        { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-500/10' },
        { name: 'slate', bg: 'bg-slate-500', text: 'text-slate-600', bgLight: 'bg-slate-50 dark:bg-slate-500/10' },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Judul Peta Pikiran</label>
                <input 
                    type="text" 
                    placeholder="Judul Peta Pikiran..."
                    className="w-full font-bold text-lg text-slate-900 dark:text-white bg-transparent border-b border-slate-200 dark:border-white/10 pb-2 outline-none px-1"
                    value={data.title || ''}
                    onChange={(e) => onUpdate({ ...data, title: e.target.value })}
                />
            </div>

            <div className="space-y-4">
                {nodes.map((node, index) => (
                    <div key={node.id} className={cn(
                        "p-5 rounded-[2rem] border transition-all relative group",
                        node.parentId === null 
                            ? cn(
                                "shadow-xl border-2",
                                {
                                    teal: 'bg-teal-50 dark:bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300',
                                    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300',
                                    cyan: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300',
                                    sky: 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300',
                                    blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300',
                                    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300',
                                    violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300',
                                    purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300',
                                    fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300',
                                    pink: 'bg-pink-50 dark:bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-300',
                                    rose: 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300',
                                    orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300',
                                    amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300',
                                    slate: 'bg-slate-50 dark:bg-slate-500/10 border-slate-500 text-slate-700 dark:text-slate-300',
                                }[node.color || 'slate']
                            ) 
                            : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"
                    )}>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Node Metadata & Connection */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                        {node.parentId === null ? 'Topik Utama' : `Cabang #${index}`}
                                    </span>
                                    {node.parentId !== null && (
                                        <button 
                                            onClick={() => deleteNode(node.id)}
                                            className="text-slate-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold opacity-70 px-1">Teks Kotak</label>
                                        <input 
                                            type="text" 
                                            placeholder="Tulis informasi..."
                                            className={cn(
                                                "w-full bg-transparent border-b pb-1 outline-none text-sm transition-all",
                                                node.parentId === null ? "border-white/20 font-black" : "border-slate-200 dark:border-white/10 font-bold"
                                            )}
                                            value={node.text}
                                            onChange={(e) => updateNode(node.id, { text: e.target.value })}
                                        />
                                    </div>

                                    {node.parentId !== null && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold opacity-70 px-1">Induk (Parent)</label>
                                                <div className="relative group/select">
                                                    {(() => {
                                                        const parent = nodes.find(n => n.id === node.parentId);
                                                        const parentColor = colors.find(c => c.name === (parent?.color || 'slate'));
                                                        return (
                                                            <div className={cn(
                                                                "flex items-center gap-2 w-full p-2 rounded-xl text-xs transition-all border",
                                                                parentColor ? `${parentColor.bgLight} border-transparent shadow-sm` : "bg-slate-100 dark:bg-white/10 border-transparent"
                                                            )}>
                                                                <div className={cn("w-2 h-2 rounded-full shrink-0", parentColor?.bg || "bg-slate-400")} />
                                                                <select 
                                                                    className="w-full bg-transparent outline-none appearance-none cursor-pointer pr-6 font-bold text-slate-700 dark:text-slate-200"
                                                                    value={node.parentId}
                                                                    onChange={(e) => updateNode(node.id, { parentId: e.target.value })}
                                                                >
                                                                    {nodes.filter(n => n.id !== node.id).map(n => (
                                                                        <option key={n.id} value={n.id} className="dark:bg-slate-900">
                                                                            {n.text || '(Tanpa Teks)'}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 transition-transform group-hover/select:translate-y-[-40%]" />
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold opacity-70 px-1">Label Garis (Opsional)</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="Contoh: meliputi, terdiri dari..."
                                                    className="w-full bg-slate-100 dark:bg-white/10 p-2 rounded-xl text-xs outline-none"
                                                    value={node.label || ''}
                                                    onChange={(e) => updateNode(node.id, { label: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className="grid grid-cols-7 md:grid-cols-2 gap-2 border-t md:border-t-0 md:border-l border-slate-200 dark:border-white/10 pt-4 md:pt-0 md:pl-4 overflow-visible">
                                {colors.map(c => (
                                    <button 
                                        key={c.name}
                                        onClick={() => updateNode(node.id, { color: c.name })}
                                        className={cn(
                                            "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                                            c.bg,
                                            node.color === c.name ? "ring-2 ring-offset-2 ring-slate-400 dark:ring-white/40 scale-110" : "opacity-40 hover:opacity-100"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={() => addNode(nodes[0].id)}
                className="w-full py-5 bg-white dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[2.5rem] text-xs font-black uppercase tracking-widest text-slate-400 hover:border-teal-500 hover:text-teal-500 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Tambah Cabang Baru
            </button>
        </div>
    );
};
