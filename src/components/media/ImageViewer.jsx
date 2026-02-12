import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

const ImageViewer = ({ src, alt, title, className }) => {
  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
        <ImageIcon className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Gambar tidak tersedia</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {title && (
        <h4 className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-3">
          <ImageIcon className="w-4 h-4" />
          {title}
        </h4>
      )}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative group overflow-hidden rounded-2xl md:rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800"
      >
        <img 
          src={src} 
          alt={alt || title || "Media Gambar"} 
          className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Subtle Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Border Glow for Dark Mode */}
        <div className="absolute inset-0 rounded-[3rem] border border-white/5 pointer-events-none hidden dark:block" />
      </motion.div>
    </div>
  );
};

export { ImageViewer };
export default ImageViewer;
