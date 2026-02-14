import React, { useEffect, useState } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useCallback } from "react";
import { useRealtimeCurriculum } from "../hooks/useRealtimeCurriculum";
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
  Zap,
  FileText,
  CloudRain,
  Mountain,
  GitGraph,
  Search,
  Telescope,
  Ghost,
  ZoomIn,
  ZoomOut,
  Maximize,
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
import ImageViewer from "../components/media/ImageViewer";
import MatchUpGame from "../components/games/MatchUpGame";
import QuizGame from "../components/games/QuizGame";
import AnagramGame from "../components/games/AnagramGame";
import TrueFalseGame from "../components/games/TrueFalseGame";
import UnjumbleGame from "../components/games/UnjumbleGame";
import WordRainGame from "../components/games/WordRainGame";
import SpinWheelGame from "../components/games/SpinWheelGame";
import WordClassificationGame from "../components/games/WordClassificationGame";
import HarakatGame from "../components/games/HarakatGame";
import MemoryGame from "../components/games/MemoryGame";
import HangmanGame from "../components/games/HangmanGame";
import CamelRaceGame from "../components/games/CamelRaceGame";
import WordDetectiveGame from '../components/games/WordDetectiveGame';
import InteractiveStoryGame from '../components/games/InteractiveStoryGame';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { wrapArabicText, isArabic } from "../utils/textUtils";

const getTypeInfo = (type, data) => {
  if (type === "text" && data?.isMindMap) {
    return {
      label: "Peta Pikiran",
      color: "teal",
      icon: GitGraph,
      gradient: "from-teal-400 to-emerald-600",
    };
  }

  switch (type) {
    case "matchup":
      return {
        label: "Match Up",
        color: "pink",
        icon: Puzzle,
        gradient: "from-pink-500 to-rose-600",
      };
    case "worddetective":
      return {
        label: "Detektif Kata",
        color: "emerald",
        icon: Search,
        gradient: "from-emerald-400 to-teal-600",
      };
    case "interactivestory":
      return {
        label: "Pilih Jalur",
        color: "teal",
        icon: Telescope,
        gradient: "from-teal-400 to-emerald-600",
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
        label: "Kilat Bahasa",
        color: "indigo",
        icon: Zap,
        gradient: "from-indigo-500 to-azure-600",
      };
    case "unjumble":
      return {
        label: "Susun Kalimat",
        color: "emerald",
        icon: Puzzle,
        gradient: "from-emerald-400 to-indigo-600",
      };
    case "mindmap":
      return {
        label: "Peta Pikiran",
        color: "teal",
        icon: GitGraph,
        gradient: "from-teal-400 to-emerald-600",
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
        label: "Teks Bebas",
        color: "slate",
        icon: Type,
        gradient: "from-slate-400 to-slate-600",
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
        color: "orange",
        icon: Keyboard,
        gradient: "from-orange-400 to-amber-600",
      };
    case "memory":
      return {
        label: "Memori",
        color: "violet",
        icon: LayoutGrid,
        gradient: "from-violet-500 to-fuchsia-600",
      };
    case "wordrain":
      return {
        label: "Hujan Kata",
        color: "sky",
        icon: CloudRain,
        gradient: "from-sky-400 to-indigo-600",
      };
    case "camelrace":
      return {
        label: "Balap Unta",
        color: "amber",
        icon: Mountain,
        gradient: "from-amber-400 to-orange-600",
      };
    case "hangman":
      return {
        label: "Tebak Huruf",
        color: "red",
        icon: Ghost,
        gradient: "from-red-500 to-rose-600",
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

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      if (!silent) window.scrollTo(0, 0);
      
      // Only reset these if we are doing a full load, otherwise we might flicker.
      // But for safety to ensure correct view mode, we re-evaluate.
      // We'll trust the logic below to set them correctly.
      
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

      const progs = await contentService.getSpecialPrograms();

      if (!foundTopic) {
        // 1. Direct Category Match (New Structure)
        const directCat = progs.find((p) => p.id === topicId);
        if (directCat) {
          foundTopic = directCat;
          foundSection = {
            title: "Program Khusus",
            icon: directCat.icon,
            isLocked: directCat.isLocked,
          };
          if (!silent) setIsGame(true);
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
                if (!silent) setIsGame(true);
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
            setCategoryTopics(foundCategory.items || foundCategory.topics || []); // Prefer items for games
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

        // If it's a category view (Game List), update specific state
        // This is crucial for the "Add Topic" -> "Appear" flow
        if (progs.find(c => c.id.toLowerCase() === topicId.toLowerCase())) {
            setIsCategoryView(true);
            setCategoryTopics(foundTopic.items || foundTopic.topics || []);
        }
      }

      if (foundTopic && !isCategoryView) {
        // Only fetch content if NOT a category view
        // Is it safe to skip content fetch on silent update?
        // Yes, likely logic updates mainly the list/metadata.
        const data = await contentService.getLessonContent(topicId);
        setContent(data);
      }
    } catch (err) {
      console.error("Error loading material:", err);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Handle realtime updates
  useRealtimeCurriculum(useCallback((type, payload) => {
    // Silent reload to prevent full screen spinner
    loadData(true);
  }, [loadData]));

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
  if (targetItemId) {
    // Find the specific item
    let foundItem = null;
    
    // 1. Search in displayData (Structured Content)
    for (const stage of displayData) {
      const item = stage.items?.find((i) => String(i.id) === targetItemId);
      if (item) {
        foundItem = item;
        break;
      }
    }

    // 2. Search in categoryTopics (Game Lists/Special Programs)
    if (!foundItem && isCategoryView) {
      foundItem = categoryTopics.find((i) => String(i.id) === targetItemId);
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
                  {foundItem.data?.title || foundItem.title || "Fokus Materi"}
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
                <h1 className={cn(
                  "text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight",
                  isArabic(topic?.title) ? "arabic-title dir-rtl" : "font-sans"
                )}>
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
          key={(categoryTopics || []).map(t => t.id).join('-')}
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
                const typeInfo = getTypeInfo(item.type, item.data);
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
          className="mx-4 md:mx-0 p-8 md:p-20 text-center bg-teal-50 dark:bg-teal-900/10 rounded-[2.5rem] md:rounded-[3rem] border border-teal-100 dark:border-teal-900/30"
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
        <div className="px-0 md:px-0">
          {/* Top Navigation */}
          <div className="mb-12 px-4 md:px-0 flex justify-start animate-in fade-in slide-in-from-left-4 duration-1000">
            <button
              onClick={() => navigate("/materi")}
              className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-teal-500 hover:text-white dark:hover:bg-teal-500 hover:border-teal-500 shadow-sm hover:shadow-xl hover:shadow-teal-500/20 active:scale-95"
            >
              <MoveLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1.5" />
              Kembali ke Daftar Materi
            </button>
          </div>

          <div className="space-y-16">
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
          </div>

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

// isArabic functionality

const ContentBlock = ({ block: rawBlock }) => {
  if (!rawBlock || !rawBlock.data) return null;
  
  // Safe parsing for data
  let data = rawBlock.data;
  if (typeof data === 'string') {
      try {
          data = JSON.parse(data);
      } catch (e) {
          console.error('[ContentBlock] Failed to parse data:', e);
          return null; // Invalid JSON
      }
  }

  const block = { ...rawBlock, data };

  switch (block.type) {
    case 'mindmap':
    case 'text': {
      if (block.type === 'mindmap' || (block.type === 'text' && block.data?.isMindMap)) {
        const { nodes = [], title } = block.data;
        const rootNode = nodes.find(n => !n.parentId);
        
        const renderNodeMobile = (node, depth = 0) => {
          const children = nodes.filter(n => n.parentId === node.id);
          const colorClass = {
            teal: 'border-teal-500 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/10',
            emerald: 'border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10',
            cyan: 'border-cyan-500 text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10',
            sky: 'border-sky-500 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/10',
            blue: 'border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10',
            indigo: 'border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10',
            violet: 'border-violet-500 text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10',
            purple: 'border-purple-500 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10',
            fuchsia: 'border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-50 dark:bg-fuchsia-500/10',
            pink: 'border-pink-500 text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-500/10',
            rose: 'border-rose-500 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10',
            orange: 'border-orange-500 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-500/10',
            amber: 'border-amber-500 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10',
            slate: 'border-slate-500 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-500/10',
          }[node.color] || 'border-slate-300 bg-white';

          const rootColorClass = {
            teal: 'bg-teal-50 dark:bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 shadow-teal-500/20',
            emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-emerald-500/20',
            cyan: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-cyan-500/20',
            sky: 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300 shadow-sky-500/20',
            blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 shadow-blue-500/20',
            indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-indigo-500/20',
            violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300 shadow-violet-500/20',
            purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 shadow-purple-500/20',
            fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300 shadow-fuchsia-500/20',
            pink: 'bg-pink-50 dark:bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-300 shadow-pink-500/20',
            rose: 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 shadow-rose-500/20',
            orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300 shadow-orange-500/20',
            amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 shadow-amber-500/20',
            slate: 'bg-slate-50 dark:bg-slate-500/10 border-slate-500 text-slate-700 dark:text-slate-300 shadow-slate-500/20',
          }[node.color || 'slate'];

          return (
            <div key={node.id} className="space-y-3">
              <div 
                style={{ marginLeft: `${depth}rem` }}
                className={cn(
                  "p-4 rounded-2xl border-2 shadow-sm transition-all",
                  node.parentId === null ? cn("shadow-xl", rootColorClass) : colorClass
                )}
              >
                {node.label && (
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2">
                    <div className="w-4 h-px bg-current opacity-30" />
                    {node.label}
                  </div>
                )}
                <div className={cn("font-bold text-sm", isArabic(node.text) && "arabic-content text-xl text-right")}>
                  {node.text}
                </div>
              </div>
              {children.length > 0 && (
                <div className="space-y-3 relative">
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-white/10" 
                    style={{ left: `${depth + 1}rem` }}
                  />
                  {children.map(child => renderNodeMobile(child, depth + 1.5))}
                </div>
              )}
            </div>
          );
        };

        const renderNodeDesktop = (node, isRoot = false) => {
          const children = nodes.filter(n => n.parentId === node.id);
          const colorClass = {
            teal: 'bg-teal-50 dark:bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 shadow-teal-500/20',
            emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-emerald-500/20',
            cyan: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-cyan-500/20',
            sky: 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300 shadow-sky-500/20',
            blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 shadow-blue-500/20',
            indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-indigo-500/20',
            violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300 shadow-violet-500/20',
            purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 shadow-purple-500/20',
            fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300 shadow-fuchsia-500/20',
            pink: 'bg-pink-50 dark:bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-300 shadow-pink-500/20',
            rose: 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 shadow-rose-500/20',
            orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300 shadow-orange-500/20',
            amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 shadow-amber-500/20',
            slate: 'bg-slate-50 dark:bg-slate-500/10 border-slate-500 text-slate-700 dark:text-slate-300 shadow-slate-500/20',
          }[node.color] || 'border-slate-300 bg-white';

          const rootColorClass = {
            teal: 'bg-teal-50 dark:bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300 shadow-teal-500/20',
            emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-emerald-500/20',
            cyan: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-cyan-500/20',
            sky: 'bg-sky-50 dark:bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-300 shadow-sky-500/20',
            blue: 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300 shadow-blue-500/20',
            indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-indigo-500/20',
            violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-500 text-violet-700 dark:text-violet-300 shadow-violet-500/20',
            purple: 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-300 shadow-purple-500/20',
            fuchsia: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-700 dark:text-fuchsia-300 shadow-fuchsia-500/20',
            pink: 'bg-pink-50 dark:bg-pink-500/10 border-pink-500 text-pink-700 dark:text-pink-300 shadow-pink-500/20',
            rose: 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300 shadow-rose-500/20',
            orange: 'bg-orange-50 dark:bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-300 shadow-orange-500/20',
            amber: 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 shadow-amber-500/20',
            slate: 'bg-slate-50 dark:bg-slate-500/10 border-slate-500 text-slate-700 dark:text-slate-300 shadow-slate-500/20',
          }[node.color || 'slate'];

          return (
            <div key={node.id} className="flex flex-col items-center flex-1">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={cn(
                  "px-6 py-4 rounded-[2rem] shadow-xl text-center min-w-[160px] relative z-10 transition-transform hover:scale-105 border-2",
                  isRoot ? rootColorClass : cn("text-white", colorClass)
                )}
              >
                <span className={cn("font-black text-sm block", isArabic(node.text) && "arabic-content text-2xl")}>
                  {node.text}
                </span>
              </motion.div>

              {children.length > 0 && (
                (() => {
                  const numChildren = children.length;
                  // Dynamic gap: more children = smaller gap (min 2rem, max 4rem)
                  const gapX = Math.max(2, 6 - numChildren) + 'rem';
                  // Dynamic slot width: allow shrinking when dense
                  const slotWidth = numChildren > 4 ? '120px' : '160px';

                  return (
                    <div 
                      className="pt-12 relative grid transition-all duration-500 justify-items-center"
                      style={{ 
                        gridTemplateColumns: `repeat(${numChildren}, minmax(${slotWidth}, 1fr))`,
                        gap: `0 ${gapX}`
                      }}
                    >
                      {/* SVG Layer for Lines */}
                      <svg 
                        className="absolute top-0 left-0 w-full h-12 pointer-events-none overflow-visible"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      {children.map((child, i) => {
                        const xEnd = (100 / children.length) * (i + 0.5);
                        return (
                          <path 
                            key={`line-${child.id}`}
                            d={`M 50 0 C 50 50, ${xEnd} 50, ${xEnd} 100`}
                            className="stroke-slate-200 dark:stroke-white/10 fill-none"
                            strokeWidth="3"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                            style={{ translate: '0 -1px' }}
                          />
                        );
                      })}
                    </svg>

                    {/* HTML Layer for Labels (Avoids SVG Stretching) */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                      {children.map((child, i) => {
                        if (!child.label) return null;
                        const xEnd = (100 / children.length) * (i + 0.5);
                        return (
                          <div 
                            key={`label-${child.id}`}
                            className="absolute flex justify-center items-center h-12"
                            style={{ 
                              left: `${(50 + xEnd) / 2}%`,
                              top: '0',
                              transform: 'translateX(-50%)',
                            }}
                          >
                            <span 
                              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight text-slate-500 border border-slate-200 dark:border-white/10 shadow-sm whitespace-nowrap"
                              style={{ fontFamily: 'var(--font-latin)' }}
                            >
                              {child.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {children.map(child => renderNodeDesktop(child))}
                  </div>
                );
              })())}
            </div>
          );
        };

        const [zoom, setZoom] = useState(1);
        const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
        const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
        const handleResetZoom = () => setZoom(1);

        return (
          <div className="space-y-8 px-4 md:px-0 relative group/mindmap">
            <div className="flex items-center justify-between">
              {title && (
                <h4 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em] flex items-center gap-3">
                  <GitGraph className="w-4 h-4" /> {title}
                </h4>
              )}
              
              {/* Zoom Controls */}
              <div className="hidden md:flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full p-1 shadow-sm opacity-0 group-hover/mindmap:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={handleZoomOut}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="px-2 text-[10px] font-black text-slate-400 w-10 text-center">
                  {Math.round(zoom * 100)}%
                </div>
                <button 
                  onClick={handleZoomIn}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-1" />
                <button 
                  onClick={handleResetZoom}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                  title="Reset Zoom"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="md:bg-slate-50/50 dark:md:bg-white/5 md:border-2 md:border-dashed md:border-slate-200 dark:md:border-white/10 md:rounded-[3rem] p-4 md:p-12 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
              <div 
                className="hidden md:flex flex-col items-center min-w-max px-24 py-12 mx-auto origin-top transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoom})` }}
              >
                {rootNode ? renderNodeDesktop(rootNode, true) : (
                  <div className="text-slate-400 font-bold italic">Peta pikiran belum dikonfigurasi.</div>
                )}
              </div>

              <div className="md:hidden space-y-4">
                {rootNode ? renderNodeMobile(rootNode) : (
                  <div className="text-slate-400 font-bold italic">Peta pikiran belum dikonfigurasi.</div>
                )}
              </div>
            </div>
          </div>
        );
      }
      
      // Default text rendering
      if (block.data?.isRichText) {
        return (
          <div className="px-4 md:px-0">
            <div className="md:bg-[var(--color-bg-card)] md:border md:border-[var(--color-border)] md:rounded-[2.5rem] py-6 md:p-12 md:shadow-sm md:hover:shadow-xl transition-all group">
              {block.data?.title && (
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-500" />
                  {block.data.title}
                </h3>
              )}
              <div 
                className="prose prose-lg prose-teal dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-relaxed"
                dangerouslySetInnerHTML={{ __html: wrapArabicText(block.data?.content) }}
              />
            </div>
          </div>
        );
      }
      const hasArabic = isArabic(block.data.content);
      return (
        <div className="px-4 md:px-0">
          <div className="md:bg-[var(--color-bg-card)] md:border md:border-[var(--color-border)] md:rounded-[2.5rem] py-6 md:p-12 md:shadow-sm md:hover:shadow-xl transition-all group">
            {block.data?.title && (
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                <ClipboardList className="w-6 h-6 text-teal-500" />
                {block.data.title}
              </h3>
            )}
            <div 
              className={cn(
                  "prose prose-lg prose-teal dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-[2] whitespace-pre-wrap",
                  isArabic(block.data.content) && "arabic-content dir-rtl"
              )}
            >
              {block.data?.content}
            </div>
          </div>
        </div>
      );
    }
    case "richtext": {
      return (
        <div className="px-4 md:px-0">
          <div className="md:bg-[var(--color-bg-card)] md:border md:border-[var(--color-border)] md:rounded-[2.5rem] py-6 md:p-12 md:shadow-sm md:hover:shadow-xl transition-all group">
            {block.data?.title && (
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-500" />
                {block.data.title}
              </h3>
            )}
            <div 
              className="prose prose-lg prose-teal dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 font-medium leading-[1.8] richtext-content"
              dangerouslySetInnerHTML={{ __html: wrapArabicText(block.data?.content) }}
            />
          </div>
        </div>
      );
    }
    case "vocab":
      return (
        <div className="space-y-6 px-4 md:px-0">
          <div className="flex items-center justify-between px-0 md:px-0">
              <h4 className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-[0.3em] font-sans flex items-center gap-3">
                <Pocket className="w-4 h-4" /> {block.data?.title || "Daftar Kosakata"}
              </h4>
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full">
                {block.data?.items?.length || 0} Kata
              </div>
          </div>
          
          <div className="md:bg-[var(--color-bg-card)] md:rounded-[2.5rem] md:border md:border-[var(--color-border)] overflow-hidden md:shadow-sm md:hover:shadow-xl transition-all duration-500">
            <div className="overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full text-left border-collapse table-fixed md:table-auto">
                <thead>
                  <tr className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)]">
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
        <div className="px-4 md:px-0">
          <div className="bg-teal-500/5 border-l-8 border-teal-500 p-8 md:rounded-r-[2.5rem] flex items-start gap-6 shadow-sm">
          <div className="w-12 h-12 bg-[var(--color-bg-card)] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
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
      </div>
      );
    }
    case "youtube":
      return (
        <div className="space-y-6 px-4 md:px-0">
          {block.data?.title && (
            <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <Youtube className="w-4 h-4" /> {block.data.title}
            </h4>
          )}
          <div className="aspect-video bg-slate-900 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl md:border-4 border-slate-200 dark:border-slate-700/50 relative group">
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
        <div className="space-y-6 md:px-0">
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
          <div className="md:rounded-[3rem] overflow-hidden md:border md:border-slate-200 md:dark:border-slate-700 md:shadow-xl bg-white dark:bg-slate-800">
            <PdfViewer fileUrl={block.data?.url} height={600} />
          </div>
        </div>
      );
    case "image":
      return (
        <div className="px-4 md:px-0">
          <ImageViewer 
            src={block.data?.url} 
            title={block.data?.title || ""} 
            alt={block.data?.title}
          />
        </div>
      );
    case "audio":
      return (
        <div className="px-4 md:px-0">
          <AudioPlayer
            src={block.data?.url}
            title={block.data?.title || "Audio Pembelajaran"}
          />
        </div>
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
        <TrueFalseGame
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
    case 'memory':
      return <MemoryGame pairs={block.data.pairs} title={block.data.title} />;
    case 'hangman':
      return <HangmanGame data={block.data} />;
    case 'wordrain':
      return <WordRainGame data={block.data} title={block.data.title} />;
    case 'camelrace':
      return <CamelRaceGame data={block.data} title={block.data.title} />;
    case 'worddetective':
      return <WordDetectiveGame data={block.data} title={block.data.title} />;
    case 'interactivestory':
      return <InteractiveStoryGame data={block.data} />;
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
