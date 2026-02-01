import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, BookOpen, AlertCircle, Edit, Youtube, FileText, Download, ExternalLink } from 'lucide-react';
import { contentService } from '../services/contentService';
import PdfViewer from '../components/PdfViewer';
import AudioPlayer from '../components/AudioPlayer';
import MatchUpGame from '../components/MatchUpGame';
import QuizGame from '../components/QuizGame';
import FlashCardGame from '../components/FlashCardGame';
import AnagramGame from '../components/AnagramGame';

const MaterialDetail = () => {
  const { topicId } = useParams();
  
  // State
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [parentSection, setParentSection] = useState(null);
  const [topic, setTopic] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);
        console.log(`[MaterialDetail] Loading topic: ${topicId}`);

        // 1. Get Metadata from Curriculum (via Service)
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
        // 2. If not found in Curriculum, check Special Programs (now category-based)
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
        }

        console.log(`[MaterialDetail] Found topic:`, foundTopic);
        setTopic(foundTopic);
        setParentSection(foundSection);

        // 2. Get Content (HTML or Markdown)
        if (foundTopic) {
            const data = await contentService.getLessonContent(topicId);
            console.log(`[MaterialDetail] Fetched content length: ${data?.length || 0}`);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <AlertCircle className="w-16 h-16 text-red-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-500 mb-2">Materi tidak ditemukan</h2>
        <p className="text-gray-400 mb-6 max-w-sm">ID Materi: <code>{topicId}</code> mungkin sudah berubah atau dihapus.</p>
        <Link to="/materi" className="inline-flex items-center px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:opacity-90 transition-all font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Lihat Semua Materi
        </Link>
      </div>
    );
  }

  // Detect content type
  const isJson = content && content.trim().startsWith('[');
  let displayData = []; 

  if (isJson) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0].items)) {
          displayData = parsed;
      } else {
          displayData = [{ id: 'legacy', title: '', items: parsed }];
      }
    } catch (e) {
      console.error("Failed to parse content JSON", e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 min-h-[100vh]">
      {/* Breadcrumb / Nav */}
      <div className="flex items-center text-sm text-[var(--color-text-muted)] mb-8 py-4">
        <Link to="/materi" className="hover:text-[var(--color-primary)] flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Materi
        </Link>
        <span className="mx-2 opacity-30 select-none">/</span>
        <span className="text-[var(--color-text-main)] font-semibold">{parentSection?.title || 'Program'}</span>
      </div>

      {/* Header Section */}
      <div className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border)] p-8 md:p-12 mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl transition-all group-hover:bg-teal-500/10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
                <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-[var(--color-primary)] mb-8 shadow-sm">
                     <BookOpen className="w-8 h-8" />
                </div>
                
                <h1 className="text-3xl md:text-5xl font-bold text-[var(--color-text-main)] mb-6 leading-[1.2] arabic-title tracking-tight">
                    {topic?.title}
                </h1>
                
                {topic?.desc && (
                    <p className="text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl font-light">
                        {topic.desc}
                    </p>
                )}
            </div>
            
            {contentService.isAuthenticated() && (
                <Link to={`/admin/edit/${topicId}`} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg-muted)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg-card)] rounded-xl transition-all shadow-sm border border-[var(--color-border)]" title="Edit Materi">
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit Konten</span>
                </Link>
            )}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
      {loading ? (
         <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            <p className="text-[var(--color-text-muted)] font-medium animate-pulse">Memuat materi...</p>
         </div>
      ) : !content ? (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-8 md:p-10 mb-12 text-amber-800 dark:text-amber-400 flex items-start shadow-sm">
          <AlertCircle className="w-8 h-8 mr-6 flex-shrink-0 mt-1 opacity-80" />
          <div className="max-w-xl">
            <h4 className="text-xl font-bold mb-2">Materi Sedang Disiapkan</h4>
            <p className="text-lg opacity-90 leading-relaxed font-light">
              Maaf, konten untuk materi <strong>{topic?.title}</strong> belum tersedia secara lengkap di database kami saat ini. Silakan kembali lagi nanti atau hubungi pengajar.
            </p>
          </div>
        </div>
      ) : isJson ? (
        <div className="space-y-12">
          {displayData.map((stage, stageIdx) => (
             <div key={stage.id || stageIdx} className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border)] p-8 md:p-12 relative">
                {/* Stage Header */}
                <div className="flex items-center gap-6 mb-12 border-b border-[var(--color-border)] pb-8">
                     <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-bold px-5 py-2 rounded-xl text-sm tracking-widest shadow-lg shadow-teal-500/20 uppercase">
                         Tahap {stageIdx + 1}
                     </div>
                     <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-text-main)]">
                         {stage.title === 'Materi Utama' ? 'Materi Pembelajaran' : stage.title}
                     </h2>
                </div>
                
                {/* Render Blocks */}
                <div className="space-y-8">
                    {stage.items.map((block) => (
                        <ContentBlock key={block.id} block={block} />
                    ))}
                    {stage.items.length === 0 && (
                        <p className="text-[var(--color-text-muted)] italic text-center py-8 bg-[var(--color-bg-main)] rounded-xl border border-dashed border-[var(--color-border)]">
                            Belum ada konten di tahapan ini.
                        </p>
                    )}
                </div>
             </div>
          ))}
        </div>
      ) : (
        /* Legacy Markdown fallback */
        <article className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border)] p-8 md:p-12 prose prose-lg prose-teal dark:prose-invert max-w-none shadow-premium transition-all hover:shadow-premium-hover">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      )}
      </div>
    </div>
  );
};

// --- Sub Component: Block Renderer ---
const ContentBlock = ({ block }) => {
    switch (block.type) {
        case 'text':
            return (
                <div className="prose prose-lg prose-teal dark:prose-invert max-w-none text-[var(--color-text-main)]">
                    {block.data.title && <h3 className="text-xl font-bold text-[var(--color-text-main)] mb-4">{block.data.title}</h3>}
                    <p className="whitespace-pre-wrap leading-relaxed opacity-90">{block.data.content}</p>
                </div>
            );
        case 'vocab':
            return (
                <div className="my-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {block.data.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-[var(--color-bg-card)] p-4 rounded-xl shadow-sm border border-[var(--color-border)]">
                                <span className="text-[var(--color-text-muted)] font-medium">{item.indo}</span>
                                <span className="font-bold text-[var(--color-primary)] dir-rtl arabic-content">{item.arab}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        case 'alert':
            return (
                <div className="bg-amber-100/50 dark:bg-amber-900/20 border-l-4 border-amber-400 p-4 rounded-r-lg my-6 flex items-start">
                    <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-900 dark:text-amber-100 leading-relaxed font-medium">{block.data.content}</p>
                </div>
            );
        case 'youtube':
            return (
                <div className="my-8">
                    {block.data.title && <h4 className="font-bold text-[var(--color-text-main)] mb-2">{block.data.title}</h4>}
                    <div className="aspect-video bg-[var(--color-bg-main)] rounded-xl overflow-hidden shadow-sm">
                        {(() => {
                            const url = block.data.url || '';
                            let videoId = '';
                            if (url.includes('youtube.com/watch?v=')) videoId = url.split('v=')[1]?.split('&')[0];
                            else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
                            
                            return videoId ? (
                                <iframe 
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video player"
                                className="w-full h-full"
                                allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">Link Video Tidak Valid</div>
                            );
                        })()}
                    </div>
                </div>
            );
        case 'pdf':
            return (
                <div className="my-8">
                    <div className="flex items-center justify-between mb-4">
                        {block.data.title && <h4 className="font-bold text-[var(--color-text-main)]">{block.data.title}</h4>}
                        {block.data.allowDownload !== false && block.data.url && (
                            <a 
                                href={block.data.url} 
                                download={block.data.fileName || "Materi.pdf"}
                                className="flex items-center text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </a>
                        )}
                    </div>
                    {block.data.url ? (
                        <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                            <PdfViewer src={block.data.url} height={500} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-32 bg-[var(--color-bg-main)] rounded-xl text-[var(--color-text-muted)]">
                            Preview PDF tidak tersedia
                        </div>
                    )}
                </div>
            );
        case 'audio':
            return (
                <div className="my-8">
                     <AudioPlayer src={block.data.url} title={block.data.title || 'Audio Pembelajaran'} />
                </div>
            );
        case 'matchup':
            return (
                <div className="my-8">
                     <MatchUpGame pairs={block.data.pairs} title={block.data.title} />
                </div>
            );
        case 'quiz':
            return (
                <div className="my-8">
                     <QuizGame questions={block.data.questions} title={block.data.title} />
                </div>
            );
        case 'flashcard':
            return (
                <div className="my-8">
                     <FlashCardGame items={block.data.items} title={block.data.title} />
                </div>
            );
        case 'anagram':
            return (
                <div className="my-8">
                     <AnagramGame questions={block.data.questions} title={block.data.title} />
                </div>
            );
        default:
            return null;
    }
};

export default MaterialDetail;
