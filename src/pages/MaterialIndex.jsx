import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Box, Activity, Hash, ArrowRight, Star, ChevronDown, ChevronUp, Zap, Bookmark, Layout, Flag, Smile } from 'lucide-react';
import { contentService } from '../services/contentService';

const iconMap = {
  BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile
};

const MaterialIndex = () => {
  const [sections, setSections] = useState([]);
  const [specialPrograms, setSpecialPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Main Curriculum
            const curr = await contentService.getCurriculum();
            
            // 2. Fetch Special Programs
            const special = await contentService.getSpecialPrograms();
            
            // 3. Filter if Search Active
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase();
                
                // Filter Curriculum
                const filteredCurr = curr.map(section => ({
                    ...section,
                    topics: section.topics.filter(t => t.title.toLowerCase().includes(lowerQuery))
                })).filter(section => section.topics.length > 0);
                
                // Filter Special
                const filteredSpecial = special.map(cat => ({
                    ...cat,
                    topics: cat.topics ? cat.topics.filter(t => t.title.toLowerCase().includes(lowerQuery)) : []
                })).filter(cat => cat.topics.length > 0);

                setSections(filteredCurr);
                setSpecialPrograms(filteredSpecial);

                // Expand All for results
                const expanded = {};
                filteredCurr.forEach(s => expanded[s.id] = true);
                filteredSpecial.forEach(s => expanded[s.id] = true);
                setExpandedSections(expanded);
            } else {
                setSections(curr);
                setSpecialPrograms(special);
                
                // Expand all by default
                const expanded = {};
                curr.forEach(s => expanded[s.id] = true);
                special.forEach(s => expanded[s.id] = true);
                setExpandedSections(expanded);
            }
        } catch (e) {
            console.error("Failed to load materi index", e);
        }
        setLoading(false);
    };

    loadData();
  }, [searchQuery]); // Re-run when search changes

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (loading) {
      return (
          <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="text-center mb-12">
        {searchQuery ? (
             <>
               <h1 className="font-bold text-[var(--color-text-main)] mb-4 text-3xl">Hasil Pencarian</h1>
               <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
                 Menampilkan hasil untuk kata kunci <span className="font-bold text-[var(--color-primary)]">"{searchQuery}"</span>
               </p>
               {sections.length === 0 && specialPrograms.length === 0 && (
                   <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl">
                       Tidak ditemukan materi yang cocok.
                   </div>
               )}
             </>
        ) : (
             <>
               <h1 className="font-bold text-[var(--color-text-main)] mb-4 arabic-title">Daftar Materi Pembelajaran</h1>
               <p className="text-[var(--color-text-muted)] max-w-2xl mx-auto">
                 Silakan pilih topik materi di bawah ini untuk memulai belajar. Materi disusun secara berjenjang dari pemula hingga mahir.
               </p>
             </>
        )}
      </div>

      {/* Special Programs Section */}
      {specialPrograms.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-6 flex items-center">
            <Star className="w-6 h-6 mr-2 text-amber-500" />
            Program Khusus
          </h2>
          <div className="grid md:grid-cols-2 gap-6 items-start">
            {specialPrograms.map((category) => {
              const Icon = iconMap[category.icon] || Star;
              const isExpanded = expandedSections[category.id];

              return (
                <div key={category.id} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/30 overflow-hidden hover:shadow-card transition-all">
                  {/* Category Header - Clickable */}
                  <button 
                    onClick={() => toggleSection(category.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mr-4 shadow">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100">{category.title}</h3>
                        <p className="text-xs text-amber-700 dark:text-amber-400">{category.topics?.length || 0} topik</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-600" /> : <ChevronDown className="w-5 h-5 text-amber-600" />}
                  </button>

                  {/* Topics List - Expandable */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-2">
                      {category.topics?.length === 0 ? (
                        <p className="text-gray-400 text-sm italic py-4 text-center">Belum ada topik dalam kategori ini.</p>
                      ) : (
                        category.topics?.map(topic => (
                          <Link 
                            key={topic.id}
                            to={`/program/${topic.id}`}
                            className="block p-3 rounded-lg bg-white/60 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border border-amber-100 dark:border-amber-900/20 hover:border-amber-200 dark:hover:border-amber-800 hover:shadow-sm transition-all flex items-center justify-between group"
                          >
                            <div>
                                <div className="font-medium text-sm text-amber-900 dark:text-amber-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 arabic-index-topic">
                                  {topic.title}
                                </div>
                                {topic.desc && (
                                  <div className="text-xs text-amber-800/70 dark:text-amber-300/70 mt-1 line-clamp-1 font-light">
                                    {topic.desc}
                                  </div>
                                )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Curriculum Section */}
      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-6 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-teal-600" />
          Kurikulum Utama
        </h2>
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {sections.map((section) => {
            const Icon = iconMap[section.icon] || BookOpen;
            const isExpanded = expandedSections[section.id];
            
            return (
              <div key={section.id} className="bg-[var(--color-bg-card)] rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-card transition-all">
                {/* Section Header - Clickable */}
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-bg-muted)] transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center mr-4 shadow">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-text-main)]">{section.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">{section.topics?.length || 0} materi</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {/* Topics List - Expandable */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-2">
                    {section.topics?.length === 0 ? (
                      <p className="text-gray-400 text-sm italic py-4 text-center">Belum ada materi di bagian ini.</p>
                    ) : (
                      section.topics?.map(topic => (
                        <Link 
                          key={topic.id}
                          to={`/materi/${topic.id}`}
                          className="block p-3 rounded-lg bg-[var(--color-bg-main)]/50 hover:bg-[var(--color-bg-main)] border border-[var(--color-border)]/50 hover:border-[var(--color-primary)] hover:shadow-sm transition-all flex items-center justify-between group"
                        >
                          <div>
                            <div className="font-medium text-sm text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] arabic-index-topic">
                              {topic.title}
                            </div>
                            {topic.desc && (
                              <div className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1 opacity-80 font-light">
                                {topic.desc}
                              </div>
                            )}
                          </div>
                          <ArrowRight className="w-4 h-4 text-teal-500 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4" />
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MaterialIndex;
