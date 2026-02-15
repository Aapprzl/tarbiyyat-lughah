import React, { useMemo } from 'react';
import { 
  ClipboardList, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Download,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { cn } from '../../utils/cn';

// Lazy load PDF.js - only when component is used
let pdfjsLib = null;
let pdfjsInitialized = false;

const initializePdfjs = async () => {
  if (pdfjsInitialized) return pdfjsLib;
  
  try {
    // Dynamic import of pdfjs-dist
    pdfjsLib = await import('pdfjs-dist');
    
    // Dynamic import of worker
    const pdfWorkerModule = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerModule.default;
    
    pdfjsInitialized = true;
    return pdfjsLib;
  } catch (error) {
    console.error('Failed to initialize PDF.js:', error);
    throw error;
  }
};

// Helper: Convert base64 data URL to Blob URL
const dataUrlToBlobUrl = (dataUrl) => {
  try {
    const [header, base64Data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'application/pdf';
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Failed to convert data URL to blob:', e);
    return null;
  }
};

const CanvasPdf = ({ url, containerHeight, isMobile, onBack }) => {
  const [numPages, setNumPages] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [scale, setScale] = React.useState(0.6);
  const [loading, setLoading] = React.useState(true);
  const canvasRef = React.useRef(null);
  const renderTaskRef = React.useRef(null);

  React.useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const pdfjs = await initializePdfjs();
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setLoading(false);
      }
    };
    loadPdf();
  }, [url]);

  React.useEffect(() => {
    const renderPage = async () => {
      if (!numPages) return;
      
      try {
        // Cancel existing render task
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const pdfjs = await initializePdfjs();
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPage);
        
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        
        // Use devicePixelRatio for sharper rendering on high-DPI screens
        const dpr = window.devicePixelRatio || 1;
        canvas.height = viewport.height * dpr;
        canvas.width = viewport.width * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(dpr, dpr);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error("Error rendering page:", err);
        }
      }
    };
    renderPage();
  }, [url, currentPage, numPages, scale]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.05, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.05, 0.5));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12" style={{ height: containerHeight }}>
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Menyiapkan Dokumen...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-900/50">
      {/* Top Toolbar: Zoom Controls & Optional Back */}
      <div className="p-2 md:p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 md:gap-4">
            {onBack && (
                <button 
                    onClick={onBack}
                    className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all text-slate-600 dark:text-slate-400 font-black uppercase text-[8px] md:text-[10px] tracking-widest border border-slate-200 dark:border-slate-800"
                    title="Kembali"
                >
                    <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Kembali</span>
                </button>
            )}

            <div className="flex items-center gap-1 md:gap-2">
                <button 
                    onClick={handleZoomOut}
                    disabled={scale <= 0.5}
                    className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-400"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <span className="text-[9px] md:text-[10px] font-black text-slate-500 min-w-[40px] md:min-w-[50px] text-center uppercase tracking-widest">
                    {Math.round(scale * 100)}%
                </span>
                <button 
                    onClick={handleZoomIn}
                    disabled={scale >= 3}
                    className="p-1.5 md:p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg disabled:opacity-30 transition-colors text-slate-600 dark:text-slate-400"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
                </button>
            </div>
        </div>

        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-black uppercase text-[8px] md:text-[9px] tracking-widest active:scale-95"
        >
          <Maximize2 className="w-3 md:w-3.5 h-3 md:h-3.5" /> 
          <span className="hidden xs:inline">Fullscreen</span>
        </a>
      </div>

      <div className="flex-1 overflow-auto p-0 flex justify-center scrollbar-hide bg-slate-200 dark:bg-slate-950/50">
        <canvas ref={canvasRef} className="shadow-2xl max-w-none h-auto" />
      </div>

      {/* Bottom Toolbar: Navigation */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <button 
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="group flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-slate-500">Prev</span>
          </button>

          <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
              {currentPage} <span className="text-slate-400 mx-1">/</span> {numPages}
            </span>
          </div>

          <button 
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="group flex items-center gap-2 px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl disabled:opacity-30 transition-all"
          >
            <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-slate-500">Next</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const PdfViewer = ({ src, fileUrl, height = 500, allowDownload = true, fileName = 'document.pdf', onBack }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = React.useState(false);
  
  // Backwards compatibility: use src or fileUrl
  const finalSrc = src || fileUrl;
  
  // Detect Mobile
  React.useEffect(() => {
    const checkMobile = () => {
       const userAgent = typeof navigator === 'undefined' ? '' : navigator.userAgent;
       const mobile = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
       const smallScreen = window.innerWidth < 768;
       setIsMobile(mobile || smallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const blobUrl = useMemo(() => {
    if (!finalSrc) return null;
    if (finalSrc.startsWith('data:')) {
      return dataUrlToBlobUrl(finalSrc);
    }
    return finalSrc;
  }, [finalSrc]);

  // If no source, show placeholder
  if (!finalSrc) {
    return (
      <div className="flex items-center justify-center bg-[var(--color-bg-main)] rounded-xl text-[var(--color-text-muted)] border border-[var(--color-border)]" style={{ height }}>
        <div className="text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Tidak ada file PDF</p>
        </div>
      </div>
    );
  }

  // Failed to create blob URL
  if (finalSrc.startsWith('data:') && !blobUrl) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 flex items-center justify-center" style={{ height }}>
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Gagal memproses file PDF</p>
        </div>
      </div>
    );
  }

  // Unified Renderer
  return (
    <div 
      className={cn(
        "bg-[var(--color-bg-card)] overflow-hidden transition-all",
        isMobile 
          ? "w-full border-y border-[var(--color-border)]" 
          : "rounded-[2.5rem] border border-[var(--color-border)] shadow-xl hover:shadow-2xl"
      )} 
      style={{ height }}
    >
      <CanvasPdf url={blobUrl} containerHeight={height} isMobile={isMobile} onBack={onBack} />
    </div>
  );
};

// Export both (Named and Default) to satisfy all imports in the project
export { PdfViewer };
export default PdfViewer;
