import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { MoveLeft, Library, AlertCircle, Edit, Youtube, ClipboardList, Download, ExternalLink, MoveRight, Gamepad, CircleCheckBig, Clock, ArrowRightCircle, Share2, Printer, Pocket, ShieldCheck, Diamond, Trophy, Award, ChevronRight, ChevronDown, RefreshCcw, Type, Table, Puzzle, HelpCircle, Layers, GripVertical, Music } from 'lucide-react';
import { contentService } from '../services/contentService';
import PdfViewer from '../components/PdfViewer';
import AudioPlayer from '../components/AudioPlayer';
import MatchUpGame from '../components/MatchUpGame';
import QuizGame from '../components/QuizGame';
import FlashCardGame from '../components/FlashCardGame';
import AnagramGame from '../components/AnagramGame';
import CompleteSentenceGame from '../components/CompleteSentenceGame';
import UnjumbleGame from '../components/UnjumbleGame';
import SpinWheelGame from '../components/SpinWheelGame';
import WordClassificationGame from '../components/games/WordClassificationGame';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const getTypeInfo = (type) => {
    switch (type) {
        case 'matchup': return { label: 'Match Up', color: 'pink', icon: Puzzle };
        case 'quiz': return { label: 'Kuis', color: 'emerald', icon: HelpCircle };
        case 'flashcard': return { label: 'Kartu', color: 'sky', icon: Layers };
        case 'anagram': return { label: 'Anagram', color: 'orange', icon: GripVertical };
        case 'completesentence': return { label: 'Lengkapi', color: 'blue', icon: Type };
        case 'unjumble': return { label: 'Susun Kata', color: 'purple', icon: MoveLeft };
        case 'spinwheel': return { label: 'Roda Putar', color: 'indigo', icon: RefreshCcw };
        case 'youtube': return { label: 'Video', color: 'red', icon: Youtube };
        case 'audio': return { label: 'Audio', color: 'violet', icon: Music };
        case 'pdf': return { label: 'Dokumen', color: 'blue', icon: ClipboardList };
        case 'vocab': return { label: 'Kosakata', color: 'indigo', icon: Table }; 
        case 'text': return { label: 'Bacaan', color: 'teal', icon: Type };
        case 'wordclassification': return { label: 'Tebak Jenis Kata', color: 'rose', icon: Puzzle };
        default: return { label: 'Materi', color: 'slate', icon: ClipboardList };
    }
};

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("MaterialDetail Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-400 rounded-[2.5rem] m-8 border border-red-200 dark:border-red-900/30">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-black mb-4 uppercase tracking-widest text-red-600">Sistem Mengalami Error</h2>
          <p className="mb-6 font-medium">Halaman tidak dapat dimuat karena kesalahan teknis.</p>
          <div className="text-left bg-white dark:bg-black/40 p-6 rounded-2xl border border-red-100 dark:border-red-900/40 text-xs font-mono mb-8 overflow-auto max-h-40">
             <p className="font-bold text-red-600 mb-2">Technical Info:</p>
             {this.state.error?.toString()}
          </div>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95">Muat Ulang Halaman</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const MaterialDetailContent = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  // NEW: Get ID from query param
  const [searchParams] = useSearchParams();
  const targetItemId = searchParams.get('item');
  
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentSection, setParentSection] = useState(null);
  const [topic, setTopic] = useState(null);
  const [isCategoryView, setIsCategoryView] = useState(false);
  const [isGame, setIsGame] = useState(false);
  const [categoryTopics, setCategoryTopics] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockMeta, setLockMeta] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        setIsCategoryView(false);
        setIsGame(false);
        setCategoryTopics([]);

        const curr = await contentService.getCurriculum();
        let foundTopic = null;
        let foundSection = null;

        for (const section of curr) {
            const t = section.topics.find(t => t.id.toLowerCase() === topicId.toLowerCase());
            if (t) {
                foundTopic = t;
                foundSection = section;
                break;
            }
        }
        
        if (!foundTopic) {
            const progs = await contentService.getSpecialPrograms();
            
            // 1. Direct Category Match (New Structure)
            const directCat = progs.find(p => p.id === topicId);
            if (directCat) {
                foundTopic = directCat;
                foundSection = { title: 'Program Khusus', icon: directCat.icon, isLocked: directCat.isLocked };
                setIsGame(true);
                // If it has topics, it MIGHT be hybrid, but we treat it as Content Container now
            } else {
                 // 2. Fallback Topic Match
                for (const category of progs) {
                    if (category.topics) {
                        const t = category.topics.find(t => t.id.toLowerCase() === topicId.toLowerCase());
                        if (t) {
                            foundTopic = t;
                            foundSection = { title: category.title, icon: category.icon, isLocked: category.isLocked };
                            setIsGame(true);
                            break;
                        }
                    }
                }
            }

            if (!foundTopic) {
                const foundCategory = progs.find(c => c.id.toLowerCase() === topicId.toLowerCase());
                if (foundCategory) {
                    foundTopic = foundCategory;
                    setIsCategoryView(true);
                    setIsGame(true);
                    setCategoryTopics(foundCategory.topics || []);
                    foundSection = { title: 'Program Unggulan', icon: 'Star', isLocked: foundCategory.isLocked };
                }
            }
        }
        
        if (foundTopic) {
            // Check if Topic or Section is Locked
            if (foundTopic.isLocked || (foundSection && foundSection.isLocked)) {
                setIsLocked(true);
                setLockMeta({
                    title: foundTopic.title,
                    type: foundTopic.isLocked ? 'Topik' : 'Kategori'
                });
                setLoading(false);
                return;
            }
            
            setTopic(foundTopic);
            setParentSection(foundSection);
        }

        if (foundTopic && !isCategoryView) {
            const data = await contentService.getLessonContent(topicId);
            setContent(data);
        }
      } catch (err) {
        console.error("Error loading material:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topicId]);

  // NEW: Early return for Loading + Focused Item to prevent Layout Shift
  // Also updated to handle general loading to prevent Header blinking
  if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
                {targetItemId ? 'Memuat Permainan...' : 'Memuat Materi...'}
            </p>
        </div>
      );
  }

  if (!topic && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-12">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-8">
            <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Konten Hilang dari Radar</h2>
        <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">Maaf, materi yang Anda cari tidak dapat ditemukan. Mungkin telah dipindahkan atau dihapus.</p>
        <button onClick={() => navigate('/materi')} className="flex items-center gap-3 px-10 py-5 bg-teal-500 text-white rounded-[2rem] font-bold shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all">
          <MoveLeft className="w-5 h-5" />
          Kembali ke Kurikulum
        </button>
      </div>
    );
  }

  const isJson = content && typeof content === 'string' && content.trim().startsWith('[');
  let displayData = []; 

  if (isJson && !isCategoryView) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].items)) {
          displayData = parsed;
      } else if (Array.isArray(parsed)) {
          displayData = [{ id: 'legacy', title: 'Materi Utama', items: parsed }];
      }
    } catch (e) {
      console.error("Failed to parse content JSON", e);
    }
  }

  if (isLocked) {
      return (
          <div className="container mx-auto px-4 py-24 max-w-4xl text-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-[4rem] p-12 md:p-20 shadow-2xl border border-amber-500/20 relative overflow-hidden"
              >
                  {/* Decorative Elements */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  
                  <div className="relative z-10">
                      <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-amber-500/30">
                          <ShieldCheck className="w-12 h-12" />
                      </div>
                      
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                          <Diamond className="w-3 h-3" />
                          Materi Belum Tersedia
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                         Ups! Materi ini <br/> Masih Terkunci
                      </h1>
                      
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed mb-12">
                          Materi <span className="text-amber-600 font-bold">"{lockMeta?.title}"</span> sedang dalam tahap persiapan atau dijadwalkan untuk rilis mendatang.
                      </p>
                      
                      <button 
                        onClick={() => navigate('/materi')}
                        className="group flex items-center gap-3 px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl mx-auto"
                      >
                          <MoveLeft className="w-5 h-5 transition-transform group-hover:-translate-x-2" />
                          Kembali Ke Kurikulum
                      </button>
                  </div>
              </motion.div>
          </div>
      );
  }

  // --- NEW: FOCUSED ITEM VIEW ---
  if (targetItemId && isJson) {
     // Find the specific item
     let foundItem = null;
     for (const stage of displayData) {
         const item = stage.items?.find(i => String(i.id) === targetItemId);
         if (item) {
             foundItem = item;
             break;
         }
     }

     if (foundItem) {
         return (
             <div className="min-h-screen pb-20">
                 {/* Compact Header for Focus Mode */}
                 <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-white/5 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <button 
                             onClick={() => navigate(isGame ? '/permainan' : -1)}
                             className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
                         >
                            <MoveLeft className="w-5 h-5" />
                         </button>
                         <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{foundItem.data?.title || 'Fokus Materi'}</h3>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{topic?.title}</p>
                         </div>
                     </div>
                 </div>

                 <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12 animate-in fade-in zoom-in-95 duration-500">
                     <ContentBlock block={foundItem} />
                 </div>
             </div>
         );
     }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl pb-40">
      {/* Navigation & Header */}
      <div className="relative mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
         {/* Breadcrumb */}
         <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-4 md:px-0">
            {isGame ? (
                <>
                  <Link to="/permainan" className="hover:text-amber-600 transition-colors">Permainan</Link>
                  <ChevronRight className="w-3 h-3 opacity-30" />
                  <span className="text-slate-600 dark:text-slate-200">{isCategoryView ? (topic?.title || 'Area Bermain') : (parentSection?.title || 'Game')}</span>
                  {!isCategoryView && <ChevronRight className="w-3 h-3 opacity-30" />}
                  {!isCategoryView && <span className="text-amber-600">{topic?.title}</span>}
                </>
            ) : (
                <>
                  <Link to="/materi" className="hover:text-teal-600 transition-colors">Materi</Link>
                  <ChevronRight className="w-3 h-3 opacity-30" />
                  <span className="text-slate-600 dark:text-slate-200">{parentSection?.title || 'Program'}</span>
                  {!isCategoryView && <ChevronRight className="w-3 h-3 opacity-30" />}
                  {!isCategoryView && <span className="text-teal-600">{topic?.title}</span>}
                </>
            )}
         </nav>

         {/* Hero Display - HIDDEN for Game Categories to keep it streamlined */}
         {!isCategoryView && (
            <div className={cn(
                "relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl",
                isGame && "border-amber-500/20"
            )}>
                <div className={cn(
                    "absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] -mr-40 -mt-40",
                    isGame ? "bg-amber-500/10" : "bg-teal-500/10"
                )}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start justify-between">
                <div className="flex-1">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg mb-8 text-white",
                            isGame ? "bg-amber-500 shadow-amber-500/20" : "bg-teal-500 shadow-teal-500/20"
                        )}
                    >
                        {isGame ? <Trophy className="w-7 h-7" /> : <Library className="w-7 h-7" />}
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight arabic-title">
                        {topic?.title || 'Memuat Judul...'}
                    </h1>
                    {topic?.desc && (
                        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                            {topic.desc}
                        </p>
                    )}
                </div>

                {contentService.isAuthenticated() && (
                    <Link to={`/admin/edit/${topicId}`} className="group flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                        <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Edit Konten</span>
                    </Link>
                )}
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-12 pt-12 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <Clock className="w-4 h-4" />
                    {isGame ? 'Tantangan Belajar' : 'Materi Terstruktur'}
                    </div>
                    <div className={cn(
                        "flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                        isGame ? "text-amber-500" : "text-teal-500"
                    )}>
                    <CircleCheckBig className="w-4 h-4" />
                    Akses Terjamin
                    </div>
                </div>
            </div>
         )}

         {/* GAME CATEGORY TITLE - ONLY for streamlined Game View */}
         {isCategoryView && (
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="px-4 md:px-0"
            >
                <div className="flex items-center gap-5 mb-6">
                    <div className="w-16 h-16 bg-amber-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Permainan Bahasa Arab</span>
                            <Diamond className="w-3 h-3 text-amber-500" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            {topic?.title}
                        </h1>
                    </div>
                </div>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                    {topic?.desc || 'Pilih level permainan di bawah ini untuk memulai latihan interaktifmu.'}
                </p>
            </motion.div>
         )}
      </div>

      {/* Main Content Area */}
      {isCategoryView ? (

        /* CATEGORY LANDING PAGE (GRID VIEW) */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 px-4 md:px-0 mt-20">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
               Pilih Level / Tantangan
               <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10 dark:to-transparent"></div>
            </h3>
            
            {(!topic?.items || topic.items.length === 0) ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 font-bold">Belum ada tantangan dalam permainan ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {topic.items.map((item, itemIdx) => {
                          const typeInfo = getTypeInfo(item.type);
                          const TypeIcon = typeInfo.icon;
                          
                          return (
                              <Link 
                                  key={item.id} 
                                  to={`/program/${topic.id}?item=${item.id}`} // Link to Focused Item
                                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
                              >
                                  {/* Thumbnail Area */}
                                  <div className="aspect-square bg-slate-100 dark:bg-slate-900/50 relative overflow-hidden">
                                      {item.thumbnail ? (
                                          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                      ) : (
                                          <div className={cn(
                                              "w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 transition-colors",
                                              `group-hover:text-${typeInfo.color}-500/20`
                                          )}>
                                              <TypeIcon className="w-12 h-12" />
                                          </div>
                                      )}
                                      
                                      {/* Play Overlay */}
                                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-amber-500 transform scale-50 group-hover:scale-100 transition-transform">
                                                <Gamepad className="w-5 h-5 ml-1" />
                                            </div>
                                      </div>
                                  </div>

                                  {/* Content Info */}
                                  <div className="p-5">
                                      <div className={cn(
                                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border",
                                          `bg-${typeInfo.color}-50 dark:bg-${typeInfo.color}-900/10 text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400 border-${typeInfo.color}-100 dark:border-${typeInfo.color}-900/20`
                                      )}>
                                          <TypeIcon className="w-3 h-3" />
                                          {typeInfo.label}
                                      </div>
                                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 min-h-[2.5em] text-sm">
                                          {item.data?.title || item.title || 'Untitled'}
                                      </h3>
                                  </div>
                              </Link>
                          );
                    })}
                </div>
            )}
        </motion.div>
      ) : !content ? (
        /* NO CONTENT FALLBACK */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-4 md:mx-0 p-12 md:p-20 text-center bg-amber-50 dark:bg-amber-900/10 rounded-[3rem] border border-amber-100 dark:border-amber-900/30">
          <AlertCircle className="w-16 h-16 text-amber-400 mx-auto mb-8" />
          <h4 className="text-3xl font-black text-amber-900 dark:text-amber-100 mb-4 tracking-tight">Materi Sedang Disiapkan</h4>
          <p className="text-lg text-amber-800/70 dark:text-amber-400/70 max-w-lg mx-auto leading-relaxed font-medium">
            Kami sedang meracik konten terbaik untuk modul ini. Silakan kunjungi kembali dalam waktu dekat atau hubungi instruktur Anda.
          </p>
        </motion.div>
      ) : isJson ? (
        /* STRUCTURED JSON CONTENT */
        <div className="space-y-16 px-4 md:px-0">
          {displayData.map((stage, stageIdx) => (
             <motion.div 
               key={stage.id || stageIdx}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               className="relative"
             >
                <div className="flex items-center gap-6 mb-12">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-white/10"></div>
                   <div className="px-6 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.3em] shadow-xl">
                      Tahap {stageIdx + 1}: {stage.title === 'Materi Utama' ? 'Pembelajaran' : stage.title}
                   </div>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-white/10"></div>
                </div>
                
                <div className="space-y-10">
                    {stage.items.map((block, bIdx) => (
                        <ContentBlock key={block.id || bIdx} block={block} />
                    ))}
                    {stage.items.length === 0 && (
                        <div className="text-center py-20 bg-slate-100 dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
                           <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Konten Belum Tersedia</p>
                        </div>
                    )}
                </div>
             </motion.div>
          ))}
          
          {/* Finish Section */}
          <div className="pt-20 text-center">
              <div className="inline-block p-4 rounded-3xl bg-teal-500/10 mb-8">
                 <CircleCheckBig className="w-12 h-12 text-teal-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">Selesai Membaca?</h3>
              <p className="text-slate-500 font-medium mb-10">Anda telah menyelesaikan sesi pembelajaran ini. Bagus!</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <button onClick={() => navigate('/materi')} className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold transition-all hover:bg-slate-50 dark:hover:bg-white/10">Kembali ke Daftar</button>
                 <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full sm:w-auto px-10 py-5 bg-teal-500 text-white rounded-2xl font-bold shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all">Kembali ke Atas</button>
              </div>
          </div>
        </div>
      ) : (
        /* LEGACY MARKDOWN CONTENT */
        <article className="mx-4 md:mx-0 bg-white dark:bg-slate-800 rounded-[3.5rem] p-10 md:p-20 border border-slate-200 dark:border-slate-700 shadow-2xl prose prose-xl prose-teal dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      )}
    </div>
  );
};

// --- MODERN CONTENT BLOCK RENDERER ---
const ContentBlock = ({ block }) => {
    if (!block || !block.data) return null;

    switch (block.type) {
        case 'text':
            return (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-xl transition-all group">
                    {block.data?.title && <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                       <ClipboardList className="w-6 h-6 text-teal-500" /> 
                       {block.data.title}
                    </h3>}
                    <div className="prose prose-lg prose-teal dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-[2] whitespace-pre-wrap">
                        {block.data?.content}
                    </div>
                </div>
            );
        case 'vocab':
            return (
                <div className="space-y-6">
                    <h4 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em] font-sans flex items-center gap-3">
                       <Pocket className="w-4 h-4" /> Kosakata Baru
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {block.data?.items?.map((item, idx) => (
                            <motion.div 
                              key={idx} 
                              whileHover={{ scale: 1.02 }}
                              className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 hover:border-teal-500/30 transition-all text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-20 h-20 bg-teal-500/5 rounded-full -ml-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-3xl font-black text-slate-900 dark:text-white mb-4 dir-rtl arabic-content leading-relaxed">
                                   {item.arab}
                                </span>
                                <div className="h-px w-12 bg-slate-200 dark:bg-slate-700 mx-auto mb-4"></div>
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wide">
                                   {item.indo}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            );
        case 'alert':
            return (
                <div className="bg-teal-50 dark:bg-teal-900/10 border-l-8 border-teal-500 p-8 rounded-r-[2.5rem] flex items-start gap-6 shadow-sm">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                       <AlertCircle className="w-6 h-6 text-teal-500" />
                    </div>
                    <div className="flex-1">
                       <h5 className="font-black text-teal-900 dark:text-teal-100 uppercase tracking-widest text-xs mb-2">Penting Diketahui</h5>
                       <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bold">{block.data?.content}</p>
                    </div>
                </div>
            );
        case 'youtube':
            return (
                <div className="space-y-6">
                    {block.data?.title && <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3"><Youtube className="w-4 h-4" /> {block.data.title}</h4>}
                    <div className="aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-700/50 relative group">
                        {(() => {
                            const url = block.data?.url || '';
                            let videoId = '';
                            if (url.includes('youtube.com/watch?v=')) videoId = url.split('v=')[1]?.split('&')[0];
                            else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
                            
                            return videoId ? (
                                <iframe src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video" className="w-full h-full" allowFullScreen></iframe>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                                   <Youtube className="w-12 h-12 mb-4 opacity-20" />
                                   <span className="font-bold uppercase tracking-widest text-xs">Link Tidak Valid</span>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            );
        case 'pdf':
            return (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4 md:px-0">
                        <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-3">
                           <ClipboardList className="w-4 h-4" /> {block.data?.title || 'Dokumen Materi'}
                        </h4>
                        {block.data?.allowDownload !== false && block.data?.url && (
                            <a href={block.data.url} download className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest hover:underline transition-all">
                                <Download className="w-4 h-4" /> Download PDF
                            </a>
                        )}
                    </div>
                    <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800">
                        <PdfViewer fileUrl={block.data?.url} height={600} />
                    </div>
                </div>
            );
        case 'audio':
            return <AudioPlayer src={block.data?.url} title={block.data?.title || 'Audio Pembelajaran'} />;
        case 'matchup':
            return <MatchUpGame pairs={block.data?.pairs} title={block.data?.title} />;
        case 'quiz':
            return <QuizGame questions={block.data?.questions} title={block.data?.title} />;
        case 'flashcard':
            return <FlashCardGame items={block.data?.items} title={block.data?.title} />;
        case 'anagram':
            return <AnagramGame questions={block.data?.questions} title={block.data?.title} />;
        case 'completesentence':
            return <CompleteSentenceGame questions={block.data?.questions} title={block.data?.title} />;
        case 'unjumble':
            return <UnjumbleGame questions={block.data?.questions} title={block.data?.title} />;
        case 'spinwheel':
            return <SpinWheelGame items={block.data?.items} title={block.data?.title} />;
        case 'wordclassification':
            return <WordClassificationGame data={block.data} />;
        default:
            return null;
    }
};

const MaterialDetail = () => (
    <ErrorBoundary>
        <MaterialDetailContent />
    </ErrorBoundary>
);

export default MaterialDetail;
