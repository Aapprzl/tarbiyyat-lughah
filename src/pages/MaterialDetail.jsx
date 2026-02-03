import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, BookOpen, AlertCircle, Edit, Youtube, FileText, Download, ExternalLink, ArrowRight, Play, CheckCircle, Clock, ChevronRight, Share2, Printer, Bookmark } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

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
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentSection, setParentSection] = useState(null);
  const [topic, setTopic] = useState(null);
  const [isCategoryView, setIsCategoryView] = useState(false);
  const [categoryTopics, setCategoryTopics] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        setIsCategoryView(false);
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
            for (const category of progs) {
                if (category.topics) {
                    const t = category.topics.find(t => t.id.toLowerCase() === topicId.toLowerCase());
                    if (t) {
                        foundTopic = t;
                        foundSection = { title: category.title, icon: category.icon };
                        break;
                    }
                }
            }

            if (!foundTopic) {
                const foundCategory = progs.find(c => c.id.toLowerCase() === topicId.toLowerCase());
                if (foundCategory) {
                    foundTopic = foundCategory;
                    setIsCategoryView(true);
                    setCategoryTopics(foundCategory.topics || []);
                    foundSection = { title: 'Program Unggulan', icon: 'Star' };
                }
            }
        }

        setTopic(foundTopic);
        setParentSection(foundSection);

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

  if (!topic && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-12">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-8">
            <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Konten Hilang dari Radar</h2>
        <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium">Maaf, materi yang Anda cari tidak dapat ditemukan. Mungkin telah dipindahkan atau dihapus.</p>
        <button onClick={() => navigate('/materi')} className="flex items-center gap-3 px-10 py-5 bg-teal-500 text-white rounded-[2rem] font-bold shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5" />
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl pb-40">
      {/* Navigation & Header */}
      <div className="relative mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
         {/* Breadcrumb */}
         <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-4 md:px-0">
            <Link to="/materi" className="hover:text-teal-600 transition-colors">Materi</Link>
            <ChevronRight className="w-3 h-3 opacity-30" />
            <span className="text-slate-600 dark:text-slate-200">{parentSection?.title || 'Program'}</span>
         </nav>

         {/* Hero Display */}
         <div className="relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start justify-between">
               <div className="flex-1">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 mb-8 text-white"
                  >
                     <BookOpen className="w-7 h-7" />
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

               {contentService.isAuthenticated() && !isCategoryView && (
                  <Link to={`/admin/edit/${topicId}`} className="group flex items-center gap-3 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
                      <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span>Edit Konten</span>
                  </Link>
               )}
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-12 pt-12 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                   <Clock className="w-4 h-4" />
                   {isCategoryView ? 'Daftar Modul' : 'Materi Terstruktur'}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-teal-500 uppercase tracking-widest">
                   <CheckCircle className="w-4 h-4" />
                   Akses Terjamin
                </div>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
         <div className="flex flex-col items-center justify-center py-40 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-14 h-14 border-4 border-teal-500/20 border-t-teal-500 rounded-full" />
            <p className="text-slate-400 font-black tracking-widest text-xs uppercase animate-pulse">Menyiapkan Materi...</p>
         </div>
      ) : isCategoryView ? (
        /* CATEGORY LANDING PAGE */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 px-4 md:px-0">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
               <div className="h-px w-8 bg-slate-200 dark:bg-white/10"></div>
               Daftar Modul Pembelajaran
            </h3>
            
            {!Array.isArray(categoryTopics) || categoryTopics.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                    <p className="text-slate-400 font-bold">Belum ada topik materi dalam program ini.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {categoryTopics.filter(t => t).map((item, idx) => (
                        <Link  
                            key={item.id || idx} 
                            to={`/program/${item.id}`} 
                            className="group flex items-center justify-between p-8 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/10 transition-all overflow-hidden relative"
                        >
                             <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                             <div className="flex items-center gap-6 relative z-10">
                                <span className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center font-black transition-all">
                                    {String(idx + 1).padStart(2, '0')}
                                </span>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors arabic-index-topic">
                                        {item.title || 'Materi Tanpa Judul'}
                                    </h4>
                                    {item.desc && <p className="text-slate-500 text-sm mt-1 font-medium">{item.desc}</p>}
                                </div>
                             </div>
                             <div className="hidden md:flex items-center gap-2 text-xs font-black uppercase text-teal-600 tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all relative z-10">
                                Mulai Belajar <ArrowRight className="w-4 h-4" />
                             </div>
                        </Link>
                    ))}
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
                        <div className="text-center py-20 bg-slate-100 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-300 dark:border-white/10">
                           <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">Konten Belum Tersedia</p>
                        </div>
                    )}
                </div>
             </motion.div>
          ))}
          
          {/* Finish Section */}
          <div className="pt-20 text-center">
              <div className="inline-block p-4 rounded-3xl bg-teal-500/10 mb-8">
                 <CheckCircle className="w-12 h-12 text-teal-500" />
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
        <article className="mx-4 md:mx-0 bg-white dark:bg-white/5 rounded-[3.5rem] p-10 md:p-20 border border-slate-200 dark:border-white/10 shadow-2xl prose prose-xl prose-teal dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:leading-relaxed">
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
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-xl transition-all group">
                    {block.data?.title && <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                       <FileText className="w-6 h-6 text-teal-500" /> 
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
                       <Bookmark className="w-4 h-4" /> Kosakata Baru
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {block.data?.items?.map((item, idx) => (
                            <motion.div 
                              key={idx} 
                              whileHover={{ scale: 1.02 }}
                              className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-teal-500/30 transition-all text-center relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-20 h-20 bg-teal-500/5 rounded-full -ml-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-3xl font-black text-slate-900 dark:text-white mb-4 dir-rtl arabic-content leading-relaxed">
                                   {item.arab}
                                </span>
                                <div className="h-px w-12 bg-slate-200 dark:bg-white/10 mx-auto mb-4"></div>
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
                    <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
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
                    <div className="aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5 relative group">
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
                           <FileText className="w-4 h-4" /> {block.data?.title || 'Dokumen Materi'}
                        </h4>
                        {block.data?.allowDownload !== false && block.data?.url && (
                            <a href={block.data.url} download className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest hover:underline transition-all">
                                <Download className="w-4 h-4" /> Download PDF
                            </a>
                        )}
                    </div>
                    <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl bg-white dark:bg-white/5">
                        <PdfViewer fileUrl={block.data?.url} height={600} />
                    </div>
                </div>
            );
        case 'audio':
            return (
                <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm">
                    <AudioPlayer src={block.data?.url} title={block.data?.title || 'Audio Pembelajaran'} />
                </div>
            );
        case 'matchup':
            return <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"><MatchUpGame pairs={block.data?.pairs} title={block.data?.title} /></div>;
        case 'quiz':
            return <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"><QuizGame questions={block.data?.questions} title={block.data?.title} /></div>;
        case 'flashcard':
            return <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"><FlashCardGame items={block.data?.items} title={block.data?.title} /></div>;
        case 'anagram':
            return <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"><AnagramGame questions={block.data?.questions} title={block.data?.title} /></div>;
        case 'completesentence':
            return <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"><CompleteSentenceGame questions={block.data?.questions} title={block.data?.title} /></div>;
        case 'unjumble':
            return <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"><UnjumbleGame questions={block.data?.questions} title={block.data?.title} /></div>;
        case 'spinwheel':
            return <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"><SpinWheelGame items={block.data?.items} title={block.data?.title} /></div>;
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
