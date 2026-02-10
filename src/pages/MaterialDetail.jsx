import React, { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  MoveLeft,
  Library,
  AlertCircle,
  Edit,
  Youtube,
  ClipboardList,
  Download,
  ExternalLink,
  MoveRight,
  Gamepad as GamepadIcon,
  CircleCheckBig,
  Clock,
  ArrowRightCircle,
  Share2,
  Printer,
  Pocket,
  ShieldCheck,
  Diamond,
  Trophy,
  Award,
  ChevronRight,
  ChevronDown,
  RefreshCcw,
  Type,
  Table,
  Puzzle,
  HelpCircle,
  Layers,
  GripVertical,
  Music,
  Keyboard,
  Package, 
  Gamepad2,
  LineChart, 
  Link2, 
  Rocket, 
  Milestone, 
  Heart,
  LayoutGrid,
} from "lucide-react";

const iconMap = {
  BookOpen: Library, 
  Box: Package, 
  Activity: LineChart, 
  Hash: Link2, 
  Star: Award, 
  Zap: Rocket, 
  Bookmark: Pocket, 
  Layout: LayoutGrid, 
  Flag: Milestone, 
  Smile: Heart,
  PlayCircle: GamepadIcon,
  Play: GamepadIcon
};
import { contentService } from "../services/contentService";
import PdfViewer from "../components/media/PdfViewer";
import AudioPlayer from "../components/media/AudioPlayer";
import MatchUpGame from "../components/games/MatchUpGame";
import QuizGame from "../components/games/QuizGame";
import AnagramGame from "../components/games/AnagramGame";
import CompleteSentenceGame from "../components/games/CompleteSentenceGame";
import UnjumbleGame from "../components/games/UnjumbleGame";
import SpinWheelGame from "../components/games/SpinWheelGame";
import WordClassificationGame from "../components/games/WordClassificationGame";
import HarakatGame from "../components/games/HarakatGame";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";

const getTypeInfo = (type) => {
  switch (type) {
    case "matchup":
      return {
        label: "Match Up",
        color: "pink",
        icon: Puzzle,
        gradient: "from-pink-500 to-rose-600",
      };
    case "quiz":
      return {
        label: "Kuis",
        color: "emerald",
        icon: HelpCircle,
        gradient: "from-emerald-400 to-teal-600",
      };

    case "anagram":
      return {
        label: "Anagram",
        color: "teal",
        icon: GripVertical,
        gradient: "from-teal-400 to-teal-600",
      };
    case "completesentence":
      return {
        label: "Lengkapi",
        color: "blue",
        icon: Type,
        gradient: "from-blue-400 to-indigo-600",
      };
    case "unjumble":
      return {
        label: "Susun Kalimat",
        color: "emerald",
        icon: Puzzle,
        gradient: "from-emerald-400 to-indigo-600",
      };
    case "spinwheel":
      return {
        label: "Roda Putar",
        color: "indigo",
        icon: RefreshCcw,
        gradient: "from-indigo-500 to-purple-600",
      };
    case "youtube":
      return {
        label: "Video",
        color: "red",
        icon: Youtube,
        gradient: "from-red-500 to-rose-600",
      };
    case "audio":
      return {
        label: "Audio",
        color: "violet",
        icon: Music,
        gradient: "from-violet-500 to-purple-600",
      };
    case "pdf":
      return {
        label: "Dokumen",
        color: "blue",
        icon: ClipboardList,
        gradient: "from-blue-500 to-cyan-600",
      };
    case "vocab":
      return {
        label: "Kosakata",
        color: "indigo",
        icon: Table,
        gradient: "from-indigo-500 to-slate-800",
      };
    case "text":
      return {
        label: "Bacaan",
        color: "teal",
        icon: Type,
        gradient: "from-teal-400 to-emerald-600",
      };
    case "wordclassification":
      return {
        label: "Tebak Jenis Kata",
        color: "rose",
        icon: Puzzle,
        gradient: "from-rose-500 to-pink-600",
      };
    case "harakat":
      return {
        label: "Harakat",
        color: "teal",
        icon: Keyboard,
        gradient: "from-teal-400 to-emerald-600",
      };
    default:
      return {
        label: "Materi",
        color: "slate",
        icon: ClipboardList,
        gradient: "from-slate-400 to-slate-600",
      };
  }
};

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("MaterialDetail Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-400 rounded-[2.5rem] m-8 border border-red-200 dark:border-red-900/30">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-black mb-4 uppercase tracking-widest text-red-600" style={{ fontFamily: 'var(--font-latin)' }}>
            Sistem Mengalami Error
          </h2>
          <p className="mb-6 font-medium" style={{ fontFamily: 'var(--font-latin)' }}>
            Halaman tidak dapat dimuat karena kesalahan teknis.
          </p>
          <div className="text-left bg-white dark:bg-black/40 p-6 rounded-2xl border border-red-100 dark:border-red-900/40 text-xs font-mono mb-8 overflow-auto max-h-40">
            <p className="font-bold text-red-600 mb-2" style={{ fontFamily: 'var(--font-latin)' }}>Technical Info:</p>
            {this.state.error?.toString()}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
            style={{ fontFamily: 'var(--font-latin)' }}
          >
            Muat Ulang Halaman
          </button>
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
  const targetItemId = searchParams.get("item");

  const [content, setContent] = useState("");
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
          const t = section.topics.find(
            (t) => t.id.toLowerCase() === topicId.toLowerCase(),
          );
          if (t) {
            foundTopic = t;
            foundSection = section;
            break;
          }
        }

        if (!foundTopic) {
          const progs = await contentService.getSpecialPrograms();

          // 1. Direct Category Match (New Structure)
          const directCat = progs.find((p) => p.id === topicId);
          if (directCat) {
            foundTopic = directCat;
            foundSection = {
              title: "Program Khusus",
              icon: directCat.icon,
              isLocked: directCat.isLocked,
            };
            setIsGame(true);
            // If it has topics, it MIGHT be hybrid, but we treat it as Content Container now
          } else {
            // 2. Fallback Topic Match
            for (const category of progs) {
              if (category.topics) {
                const t = category.topics.find(
                  (t) => t.id.toLowerCase() === topicId.toLowerCase(),
                );
                if (t) {
                  foundTopic = t;
                  foundSection = {
                    title: category.title,
                    icon: category.icon,
                    isLocked: category.isLocked,
                  };
                  setIsGame(true);
                  break;
                }
              }
            }
          }

          if (!foundTopic) {
            const foundCategory = progs.find(
              (c) => c.id.toLowerCase() === topicId.toLowerCase(),
            );
            if (foundCategory) {
              foundTopic = foundCategory;
              setIsCategoryView(true);
              setIsGame(true);
              setCategoryTopics(foundCategory.topics || []);
              foundSection = {
                title: "Program Unggulan",
                icon: "Star",
                isLocked: foundCategory.isLocked,
              };
            }
          }
        }

        if (foundTopic) {
          // Check if Topic or Section is Locked
          if (foundTopic.isLocked || (foundSection && foundSection.isLocked)) {
            setIsLocked(true);
            setLockMeta({
              title: foundTopic.title,
              type: foundTopic.isLocked ? "Topik" : "Kategori",
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-[var(--color-bg-main)]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          {targetItemId ? (
             <Gamepad2 className="absolute inset-0 m-auto w-8 h-8 text-teal-500 animate-pulse" />
          ) : (
             <Library className="absolute inset-0 m-auto w-8 h-8 text-teal-500 animate-pulse" />
          )}
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse" style={{ fontFamily: 'var(--font-latin)' }}>
          {targetItemId ? "Memuat Permainan" : "Memuat Materi"}
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
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4" style={{ fontFamily: 'var(--font-latin)' }}>
          Konten Hilang dari Radar
        </h2>
        <p className="text-slate-500 max-w-sm mb-10 leading-relaxed font-medium" style={{ fontFamily: 'var(--font-latin)' }}>
          Maaf, materi yang Anda cari tidak dapat ditemukan. Mungkin telah
          dipindahkan atau dihapus.
        </p>
        <button
          onClick={() => navigate("/materi")}
          className="flex items-center gap-3 px-10 py-5 bg-teal-500 text-white rounded-[2rem] font-bold shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
          style={{ fontFamily: 'var(--font-latin)' }}
        >
          <MoveLeft className="w-5 h-5" />
          Kembali ke Kurikulum
        </button>
      </div>
    );
  }

  const isJson =
    content && typeof content === "string" && content.trim().startsWith("[");
  let displayData = [];

  if (isJson && !isCategoryView) {
    try {
      const parsed = JSON.parse(content);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        Array.isArray(parsed[0].items)
      ) {
        displayData = parsed;
      } else if (Array.isArray(parsed)) {
        displayData = [{ id: "legacy", title: "Materi Utama", items: parsed }];
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
          className="bg-white dark:bg-slate-900 rounded-[4rem] p-12 md:p-20 shadow-2xl border border-teal-500/20 relative overflow-hidden"
        >
          {/* Decorative Elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-teal-500/30">
              <ShieldCheck className="w-12 h-12" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Diamond className="w-3 h-3" />
              Materi Belum Tersedia
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
              Ups! Materi ini <br /> Masih Terkunci
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed mb-12">
              Materi{" "}
              <span className="text-teal-600 font-bold">
                "{lockMeta?.title}"
              </span>{" "}
              sedang dalam tahap persiapan atau dijadwalkan untuk rilis
              mendatang.
            </p>

            <button
              onClick={() => navigate("/materi")}
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
      const item = stage.items?.find((i) => String(i.id) === targetItemId);
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
                onClick={() => navigate(isGame ? "/permainan" : -1)}
                className="w-10 h-10 bg-slate-100 dark:bg-white/10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
              >
                <MoveLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {foundItem.data?.title || "Fokus Materi"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {topic?.title}
                </p>
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

        {/* GAME CATEGORY TITLE - ONLY for streamlined Game View */}
        {isCategoryView && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-4 md:px-0"
          >
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 bg-teal-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-teal-500/20">
                {(() => {
                  const IconComp = iconMap[topic?.icon || parentSection?.icon] || Trophy;
                  return <IconComp className="w-8 h-8" />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-teal-600 uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--font-latin)' }}>
                    Permainan Bahasa Arab
                  </span>
                  <Diamond className="w-3 h-3 text-teal-500" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight arabic-text">
                  {topic?.title}
                </h1>
              </div>
            </div>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed" style={{ fontFamily: 'var(--font-latin)' }}>
              {topic?.desc ||
                "Pilih level permainan di bawah ini untuk memulai latihan interaktifmu."}
            </p>
          </motion.div>
        )}
      </div>

      {/* Main Content Area */}
      {isCategoryView ? (
        /* CATEGORY LANDING PAGE (GRID VIEW) */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 px-4 md:px-0 mt-20"
        >
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
            Pilih Level / Tantangan
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10 dark:to-transparent"></div>
          </h3>

          {!topic?.items || topic.items.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 font-bold">
                Belum ada tantangan dalam permainan ini.
              </p>
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
                    className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-1"
                  >
                    {/* Thumbnail Area */}
                    <div className="aspect-square relative overflow-hidden">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-full h-full flex items-center justify-center relative transition-transform duration-700 group-hover:scale-110 bg-gradient-to-br",
                            typeInfo.gradient,
                          )}
                        >
                          {/* Decorative background shapes */}
                          <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-black rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                          </div>

                          {/* Main Stylized Icon */}
                          <div className="relative z-10 p-6 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 shadow-2xl">
                            <TypeIcon className="w-14 h-14 text-white drop-shadow-lg" />
                          </div>

                          {/* Bottom Accent */}
                          <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-1/3 h-full bg-white/40 animate-shimmer" />
                          </div>
                        </div>
                      )}

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-teal-500 transform scale-50 group-hover:scale-100 transition-transform">
                          <GamepadIcon className="w-5 h-5 ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-5">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 border",
                          `bg-${typeInfo.color}-50 dark:bg-${typeInfo.color}-900/10 text-${typeInfo.color}-600 dark:text-${typeInfo.color}-400 border-${typeInfo.color}-100 dark:border-${typeInfo.color}-900/20`,
                        )}
                      >
                        <TypeIcon className="w-3 h-3" />
                        {typeInfo.label}
                      </div>
                      <h3 
                        className={cn(
                          "font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[2.5em] text-sm",
                          isArabic(item.data?.title || item.title) ? "arabic-text dir-rtl leading-[1.4] py-0.5" : "font-sans leading-tight"
                        )}
                        dir={isArabic(item.data?.title || item.title) ? "rtl" : "ltr"}
                      >
                        {item.data?.title || item.title || "Untitled"}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 md:mx-0 p-12 md:p-20 text-center bg-teal-50 dark:bg-teal-900/10 rounded-[3rem] border border-teal-100 dark:border-teal-900/30"
        >
          <AlertCircle className="w-16 h-16 text-teal-400 mx-auto mb-8" />
          <h4 className="text-3xl font-black text-teal-900 dark:text-teal-100 mb-4 tracking-tight">
            Materi Sedang Disiapkan
          </h4>
          <p className="text-lg text-teal-800/70 dark:text-teal-400/70 max-w-lg mx-auto leading-relaxed font-medium">
            Kami sedang meracik konten terbaik untuk modul ini. Silakan kunjungi
            kembali dalam waktu dekat atau hubungi instruktur Anda.
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
                  Tahap {stageIdx + 1}:{" "}
                  {stage.title === "Materi Utama"
                    ? "Pembelajaran"
                    : stage.title}
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-white/10"></div>
              </div>

              <div className="space-y-10">
                {stage.items.map((block, bIdx) => (
                  <ContentBlock key={block.id || bIdx} block={block} />
                ))}
                {stage.items.length === 0 && (
                  <div className="text-center py-20 bg-slate-100 dark:bg-slate-800 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">
                      Konten Belum Tersedia
                    </p>
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
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-widest">
              Selesai Membaca?
            </h3>
            <p className="text-slate-500 font-medium mb-10">
              Anda telah menyelesaikan sesi pembelajaran ini. Bagus!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/materi")}
                className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl font-bold transition-all hover:bg-slate-50 dark:hover:bg-white/10"
              >
                Kembali ke Daftar
              </button>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-full sm:w-auto px-10 py-5 bg-teal-500 text-white rounded-2xl font-bold shadow-xl shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Kembali ke Atas
              </button>
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
const isArabic = (text) => /[\u0600-\u06FF]/.test(text || "");

const ContentBlock = ({ block }) => {
  if (!block || !block.data) return null;

  switch (block.type) {
    case "text": {
      const hasArabic = isArabic(block.data.content);
      return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-xl transition-all group">
          {block.data?.title && (
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-teal-500" />
              {block.data.title}
            </h3>
          )}
          <div 
            className={cn(
                "prose prose-lg prose-teal dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-[2] whitespace-pre-wrap",
                hasArabic && "arabic-content dir-rtl"
            )}
          >
            {block.data?.content}
          </div>
        </div>
      );
    }
    case "vocab":
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4 md:px-0">
              <h4 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em] font-sans flex items-center gap-3">
                <Pocket className="w-4 h-4" /> Daftar Kosakata
              </h4>
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                {block.data?.items?.length || 0} Kata
              </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest w-[12%] md:w-[10%] text-center">No</th>
                    <th className="px-4 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest text-right">Kata / Frasa (Arab)</th>
                    <th className="px-4 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Arti (Indo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {block.data?.items?.map((item, idx) => (
                    <motion.tr 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="group odd:bg-slate-50/50 dark:odd:bg-white/[0.02] hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-colors"
                    >
                      <td className="px-4 md:px-8 py-4 md:py-6 text-[10px] md:text-xs font-bold text-slate-400 text-center">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6 text-right">
                        <span className={cn(
                          "font-black text-slate-900 dark:text-white dir-rtl arabic-content leading-relaxed block group-hover:scale-105 transition-transform origin-right",
                          item.arab?.length < 15 ? "text-3xl md:text-4xl" : 
                          item.arab?.length < 30 ? "text-2xl md:text-3xl" : "text-xl md:text-xl"
                        )}>
                          {item.arab}
                        </span>
                      </td>
                      <td className="px-4 md:px-8 py-4 md:py-6">
                        <span className="text-xs md:text-base font-bold text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {item.indo}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer / Accent */}
            <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-20"></div>
          </div>
        </div>
      );
    case "alert": {
      const hasArabic = isArabic(block.data.content);
      return (
        <div className="bg-teal-50 dark:bg-teal-900/10 border-l-8 border-teal-500 p-8 rounded-r-[2.5rem] flex items-start gap-6 shadow-sm">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <AlertCircle className="w-6 h-6 text-teal-500" />
          </div>
          <div className="flex-1">
            <h5 className="font-black text-teal-900 dark:text-teal-100 uppercase tracking-widest text-xs mb-2">
              Penting Diketahui
            </h5>
            <p className={cn(
                "text-slate-700 dark:text-slate-300 leading-relaxed font-bold",
                hasArabic && "dir-rtl arabic-content"
            )}>
              {block.data?.content}
            </p>
          </div>
        </div>
      );
    }
    case "youtube":
      return (
        <div className="space-y-6">
          {block.data?.title && (
            <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <Youtube className="w-4 h-4" /> {block.data.title}
            </h4>
          )}
          <div className="aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-200 dark:border-slate-700/50 relative group">
            {(() => {
              const url = block.data?.url || "";
              let videoId = "";
              if (url.includes("youtube.com/watch?v="))
                videoId = url.split("v=")[1]?.split("&")[0];
              else if (url.includes("youtu.be/"))
                videoId = url.split("youtu.be/")[1];

              return videoId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video"
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <Youtube className="w-12 h-12 mb-4 opacity-20" />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    Link Tidak Valid
                  </span>
                </div>
              );
            })()}
          </div>
        </div>
      );
    case "pdf":
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4 md:px-0">
            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <ClipboardList className="w-4 h-4" />{" "}
              {block.data?.title || "Dokumen Materi"}
            </h4>
            {block.data?.allowDownload !== false && block.data?.url && (
              <a
                href={block.data.url}
                download
                className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest hover:underline transition-all"
              >
                <Download className="w-4 h-4" /> Download PDF
              </a>
            )}
          </div>
          <div className="rounded-[3rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800">
            <PdfViewer fileUrl={block.data?.url} height={600} />
          </div>
        </div>
      );
    case "audio":
      return (
        <AudioPlayer
          src={block.data?.url}
          title={block.data?.title || "Audio Pembelajaran"}
        />
      );
    case "matchup":
      return (
        <MatchUpGame pairs={block.data?.pairs} title={block.data?.title} />
      );
    case "quiz":
      return (
        <QuizGame questions={block.data?.questions} title={block.data?.title} />
      );

    case "anagram":
      return (
        <AnagramGame
          questions={block.data?.questions}
          title={block.data?.title}
        />
      );
    case "completesentence":
      return (
        <CompleteSentenceGame
          questions={block.data?.questions}
          title={block.data?.title}
        />
      );
    case "unjumble":
      return <UnjumbleGame data={block.data} />;
    case "spinwheel":
      return (
        <SpinWheelGame items={block.data?.items} title={block.data?.title} />
      );
    case "wordclassification":
      return <WordClassificationGame data={block.data} />;
    case "harakat":
      return <HarakatGame data={block.data} />;
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
