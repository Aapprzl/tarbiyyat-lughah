import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import { BookOpen, Star, Users, ArrowRight, Box, Activity, Hash, Zap, Bookmark, Layout, Flag, Smile, Shield, X } from 'lucide-react';
import { PdfViewer } from '../components/PdfViewer';

const iconMap = {
  BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile
};

const Home = () => {
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [config, setConfig] = useState(null);
  const [copyrightConfig, setCopyrightConfig] = useState(null);
  const [showCopyright, setShowCopyright] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Load Programs
      const progs = await contentService.getSpecialPrograms();
      setSpecialPrograms(progs);

      // Load Home Config
      const conf = await contentService.getHomeConfig();
      setConfig(conf);
      
      // Load Copyright
      const cp = await contentService.getCopyrightConfig();
      setCopyrightConfig(cp);
    };
    load();
  }, []);

  if (!config) return null; // or loading spinner

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-8 md:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl text-center md:text-left mx-auto md:mx-0">
          <h1 className="font-extrabold mb-4 leading-relaxed drop-shadow-md tracking-wide text-white arabic-title">
            {config.heroTitleArabic}
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold font-sans mb-6 text-teal-50 drop-shadow-sm opacity-95">
             {config.heroTitleLatin}
          </h2>
          <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed max-w-xl font-medium drop-shadow-sm">
            {config.heroDescription}
          </p>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/materi" className="bg-white text-teal-700 px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center hover:bg-gray-50 hover:scale-105 active:scale-95">
              {config.heroButtonText}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/about" className="bg-teal-700/30 hover:bg-teal-700/50 text-white px-8 py-4 rounded-xl font-medium backdrop-blur-sm transition-all border border-white/20 hover:scale-105 active:scale-95">
              {config.heroButtonSecondaryText || 'Tentang Kami'}
            </Link>
            
            {/* Copyright Button */}
            {copyrightConfig?.pdfUrl && (
                <button 
                    onClick={() => setShowCopyright(true)}
                    className="bg-transparent hover:bg-white/10 text-white px-6 py-4 rounded-xl font-medium transition-all border border-white/20 flex items-center hover:scale-105 active:scale-95"
                >
                    <Shield className="w-5 h-5 mr-2" />
                    Hak Cipta
                </button>
            )}
          </div>
        </div>
        
        {/* Decorative Circle */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--color-secondary)]/20 rounded-full blur-3xl"></div>
        <div className="absolute top-12 right-12 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl animate-pulse"></div>
      </div>

       {/* Copyright Modal */}
       {showCopyright && copyrightConfig?.pdfUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-[var(--color-bg-card)] w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border border-[var(--color-border)]">
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
                   <h3 className="font-bold text-[var(--color-text-main)] flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                      Dokumen Hak Cipta
                   </h3>
                   <button 
                      onClick={() => setShowCopyright(false)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-[var(--color-text-muted)] hover:text-red-500 rounded-lg transition-colors"
                   >
                      <X className="w-6 h-6" />
                   </button>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-900">
                   <PdfViewer fileUrl={copyrightConfig.pdfUrl} />
                </div>
             </div>
          </div>
       )}

      {/* Featured Programs Section */}
      <div>
        <div className="flex items-center mb-8">
           <div className="h-8 w-1 bg-[var(--color-secondary)] rounded-full mr-4"></div>
           <h2 className="text-2xl font-bold text-[var(--color-text-main)]">{config.programsSectionTitle || 'Program Unggulan'}</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {specialPrograms.map((prog, idx) => {
             const Icon = iconMap[prog.icon] || Star;
             return (
               <Link 
                 key={prog.id} 
                 to={`/program/${prog.id}`}
                 className="group bg-[var(--color-bg-card)] rounded-2xl p-6 shadow-sm border border-[var(--color-border)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
               >
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                    idx === 0 ? 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100' :
                    idx === 1 ? 'bg-teal-100/50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:bg-teal-100' :
                    'bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100'
                 }`}>
                    <Icon className="w-7 h-7" />
                 </div>
                 
                 <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                   {prog.title}
                 </h3>
                 <p className="text-[var(--color-text-muted)] text-sm leading-relaxed line-clamp-3">
                   {prog.desc || 'Pelajari program khusus ini untuk meningkatkan kemampuan bahasa Arab Anda secara intensif.'}
                 </p>
                 
                 <div className="mt-4 flex items-center text-sm font-semibold text-[var(--color-primary)] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    Lihat Program <ArrowRight className="ml-2 w-4 h-4" />
                 </div>
               </Link>
             );
          })}
        </div>
      </div>


    </div>
  );
};

export default Home;
