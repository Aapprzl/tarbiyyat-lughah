import React, { useMemo } from 'react';
import { 
  ClipboardList, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Download,
  Loader2
} from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider';
import { cn } from '../../utils/cn';
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js Worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

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

const CanvasPdf = ({ url, containerHeight }) => {
  const [numPages, setNumPages] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const canvasRef = React.useRef(null);
  const renderTaskRef = React.useRef(null);

  React.useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
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

        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPage);
        
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

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
  }, [url, currentPage, numPages]);

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
      <div className="flex-1 overflow-auto p-0 flex justify-center scrollbar-hide">
        <canvas ref={canvasRef} className="shadow-2xl max-w-full h-auto" />
      </div>

      {/* Modern Compact Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button 
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-black text-slate-500 min-w-[60px] text-center uppercase tracking-widest">
            {currentPage} / {numPages}
          </span>
          <button 
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all font-black uppercase text-[10px] tracking-widest shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Maximize2 className="w-4 h-4" /> Fullscreen
        </a>
      </div>
    </div>
  );
};

const PdfViewer = ({ src, fileUrl, height = 500, allowDownload = true, fileName = 'document.pdf' }) => {
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
      {isMobile ? (
        <CanvasPdf url={blobUrl} containerHeight={height} />
      ) : (
        <iframe 
          src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full bg-white transition-opacity duration-700"
          style={{ 
            height: '100%',
            filter: theme === 'dark' ? 'invert(0.9) hue-rotate(180deg)' : 'none'
          }}
          title="PDF Viewer"
        />
      )}
    </div>
  );
};

// Export both (Named and Default) to satisfy all imports in the project
export { PdfViewer };
export default PdfViewer;
