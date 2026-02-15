import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, GitGraph, Type, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../../utils/cn';

/**
 * Custom Parent Selector Dropdown
 */
const ParentSelector = ({ currentId, nodes, colors, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const selectedParent = nodes.find(n => n.id === value);
    const parentColor = colors.find(c => c.name === (selectedParent?.color || 'slate'));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 w-full p-2 rounded-lg text-[11px] transition-all border text-left",
                    parentColor 
                        ? `${parentColor.bgLight} border-transparent shadow-sm` 
                        : "bg-slate-50 dark:bg-white/5 border-transparent"
                )}
            >
                <div className={cn("w-2 h-2 rounded-full shrink-0", parentColor?.bg || "bg-slate-400")} />
                <span className="flex-1 font-bold text-slate-700 dark:text-slate-200 truncate">
                    {selectedParent?.text || '(Tanpa Teks)'}
                </span>
                <ChevronDown className={cn(
                    "w-3.5 h-3.5 opacity-40 transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute z-[100] left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                    >
                        <div className="p-1">
                            {nodes
                                .filter(n => n.id !== currentId)
                                .map(node => {
                                    const nodeColor = colors.find(c => c.name === (node.color || 'slate'));
                                    const isSelected = node.id === value;
                                    
                                    return (
                                        <button
                                            key={node.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(node.id);
                                                setIsOpen(false);
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors",
                                                isSelected 
                                                    ? "bg-teal-50 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400" 
                                                    : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                                            )}
                                        >
                                            <div className={cn("w-2 h-2 rounded-full shrink-0", nodeColor?.bg || "bg-slate-400")} />
                                            <span className="flex-1 text-[11px] font-bold truncate">
                                                {node.text || '(Tanpa Teks)'}
                                            </span>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </button>
                                    );
                                })
                            }
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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

  // Helper to detect Arabic text
  const isArabic = (text) => {
    if (!text) return false;
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
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
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Judul Peta Pikiran</label>
        <input 
          type="text" 
          placeholder="Judul Map..."
          className="w-full bg-transparent font-bold text-slate-700 dark:text-slate-200 border-b border-transparent focus:border-teal-500 outline-none text-sm py-1 transition-colors"
          value={data.title || ''}
          onChange={(e) => onUpdate({ ...data, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        {nodes.map((node, index) => (
          <div key={node.id} className={cn(
            "p-3 rounded-xl border transition-all relative group",
            node.parentId === null 
              ? cn(
                  "shadow-md border-2",
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
            {node.parentId !== null && (
              <button 
                onClick={() => deleteNode(node.id)}
                className="absolute left-1.5 top-1.5 text-slate-300 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Hapus Cabang"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between pl-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                    {node.parentId === null ? 'Pusat Topik' : `Cabang Node`}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold opacity-60 px-1">Teks Utama</label>
                    <input 
                      type="text" 
                      placeholder="Apa inti bahasannya?"
                      dir={isArabic(node.text) ? "rtl" : "ltr"}
                      className={cn(
                        "w-full bg-transparent text-xs font-bold outline-none border-b border-dashed py-1 transition-all",
                        node.parentId === null ? "border-white/20" : "border-slate-200 dark:border-white/10 focus:border-teal-500/50 focus:border-solid",
                        isArabic(node.text) && "arabic-content"
                      )}
                      value={node.text}
                      onChange={(e) => updateNode(node.id, { text: e.target.value })}
                    />
                  </div>

                  {node.parentId !== null && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold opacity-60 px-1">Label Hubungan (Opsional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. terbagi menjadi..."
                        className="w-full bg-transparent text-xs font-bold outline-none border-b border-dashed border-slate-200 dark:border-white/10 focus:border-teal-500/50 focus:border-solid py-1 transition-all"
                        value={node.label || ''}
                        onChange={(e) => updateNode(node.id, { label: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {node.parentId !== null && (
                  <div className="pl-5 space-y-1">
                    <label className="text-[10px] font-bold opacity-60 px-1">Terhubung Ke (Parent)</label>
                    <div className="max-w-xs">
                        <ParentSelector 
                            currentId={node.id}
                            nodes={nodes}
                            colors={colors}
                            value={node.parentId}
                            onChange={(val) => updateNode(node.id, { parentId: val })}
                        />
                    </div>
                  </div>
                )}
              </div>

              {/* Color Picker - Compact Horizontal */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 pl-5 border-t border-slate-200/50 dark:border-white/5">
                <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter mr-1">Warna:</span>
                {colors.map(c => (
                  <button 
                    key={c.name}
                    onClick={() => updateNode(node.id, { color: c.name })}
                    className={cn(
                      "w-4 h-4 rounded-full transition-all flex items-center justify-center",
                      c.bg,
                      node.color === c.name ? "ring-2 ring-offset-1 ring-slate-400 dark:ring-white/40 scale-110" : "opacity-30 hover:opacity-100"
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => addNode(nodes[0].id)}
        className="w-full py-2.5 bg-white dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:border-teal-500 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-3.5 h-3.5" /> 
        <span>Tambah Cabang</span>
      </button>
    </div>
  );
};

export default MindMapBlock;
