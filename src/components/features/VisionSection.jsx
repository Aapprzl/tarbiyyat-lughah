import React from 'react';
import { Info, MapPin, Mail, Phone } from 'lucide-react';

export const VisionSection = ({ config }) => {
  if (!config) return null;

  return (
    <section id="tentang" className="max-w-7xl mx-auto px-4 pb-12 md:pb-24 scroll-mt-32">
        <div className="relative bg-white dark:bg-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-2xl border-2 md:border-4 border-slate-100 dark:border-slate-700 overflow-hidden">
          
          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
    
          <div className="relative p-6 md:p-14">
            {/* Header Section */}
            <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-10">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-teal-500 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-teal-500/20 transform -rotate-3 hover:rotate-0 transition-transform">
                <Info className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h2 className="text-2xl md:text-5xl font-black text-[var(--color-text-main)] tracking-tight leading-tight">
                {config.visionTitle || "Visi Tarbiyyat Al-Lughah"}
              </h2>
            </div>
    
            {/* Main Description */}
            <div className="space-y-6 md:space-y-10">
              <p className="text-[var(--color-text-main)] opacity-90 leading-relaxed text-base md:text-2xl font-medium">
                 {config.visionDesc}
              </p>
    
              {/* Methodology / Steps */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl md:rounded-[3rem] p-5 md:p-12 border-2 border-slate-100 dark:border-slate-700 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Info className="w-24 h-24 md:w-32 md:h-32" />
                </div>
                
                <p className="text-[10px] md:text-xs font-black text-[var(--color-text-muted)] opacity-60 uppercase tracking-[0.3em] mb-6 md:mb-10 border-b border-slate-200 dark:border-slate-800 pb-4 inline-block">Metode Belajar Interaktif</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
                  <div className="space-y-3 md:space-y-4 relative">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-emerald-500 rounded-xl md:rounded-2xl text-base md:text-lg font-black text-white shadow-lg shadow-emerald-500/20 transform -rotate-6">1</div>
                      <span className="text-base md:text-xl font-black text-[var(--color-text-main)]">{config.visionStep1Title || 'Kosakata Visual'}</span>
                    </div>
                    <p className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed font-medium">{config.visionStep1Desc}</p>
                  </div>
    
                  <div className="space-y-3 md:space-y-4 relative">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-sky-500 rounded-xl md:rounded-2xl text-base md:text-lg font-black text-white shadow-lg shadow-sky-500/20 transform rotate-12">2</div>
                      <span className="text-base md:text-xl font-black text-[var(--color-text-main)]">{config.visionStep2Title || 'Qira\'ah Digital'}</span>
                    </div>
                    <p className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed font-medium">{config.visionStep2Desc}</p>
                  </div>
    
                  <div className="space-y-3 md:space-y-4 relative">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-indigo-500 rounded-xl md:rounded-2xl text-base md:text-lg font-black text-white shadow-lg shadow-indigo-500/20 transform -rotate-3">3</div>
                      <span className="text-base md:text-xl font-black text-[var(--color-text-main)]">{config.visionStep3Title || 'Game Edukasi'}</span>
                    </div>
                    <p className="text-xs md:text-sm text-[var(--color-text-muted)] leading-relaxed font-medium">{config.visionStep3Desc}</p>
                  </div>
                </div>
              </div>
    
              <p className="text-[var(--color-text-muted)] text-sm md:text-base leading-relaxed">
                Melalui integrasi teknologi AI dan desain yang berpusat pada pengguna, kami menghadirkan pengalaman belajar yang 
                lebih alami, sistematis, dan tentu saja tidak membosankan bagi generasi Z.
              </p>
            </div>
    
            {/* Developer Card */}
            <div className="mt-12 pt-10 border-t-2 border-slate-100 dark:border-slate-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-teal-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-600 flex items-center justify-center text-white text-lg md:text-xl font-black shadow-xl ring-2 md:ring-4 ring-white dark:ring-slate-800">
                      {(config.devName || 'MA').substring(0,2).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-sm md:text-xl font-black text-[var(--color-text-main)] leading-none mb-1">{config.devName || 'Muh. Aprizal'}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-[9px] md:text-[10px] font-bold text-teal-600 dark:text-teal-400 rounded-md uppercase">{config.devRole || 'Developer'}</span>
                      <span className="text-slate-400 text-[10px]">|</span>
                      <span className="text-[9px] md:text-xs text-[var(--color-text-muted)] font-medium">{config.devCampus || 'PBA IAIN BONE'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-100 dark:bg-slate-900/80 backdrop-blur rounded-full border border-slate-200 dark:border-slate-700">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest opacity-80">
                    {config.visionBadgeText || 'Skripsi Original Project'}
                  </span>
                </div>
              </div>
            </div>
    
          </div>
        </div>
      </section>
  );
};
