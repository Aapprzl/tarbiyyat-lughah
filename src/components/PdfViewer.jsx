import React, { useMemo } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';

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
       // Also check width just in case
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
          <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
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

  // Mobile Fallback: Direct Button
  if (isMobile) {
      return (
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] p-8 flex flex-col items-center justify-center text-center shadow-sm" style={{ minHeight: 300 }}>
             <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
                  <FileText className="w-10 h-10" />
             </div>
             <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-2">Materi PDF</h3>
             <p className="text-[var(--color-text-muted)] mb-6 max-w-xs text-sm">
                 Pratinjau PDF tidak tersedia di tampilan mobile. Silakan buka file untuk membaca.
             </p>
             <a 
                href={blobUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                download={fileName} // Mobile browsers often prefer download for data URIs
                className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-transform active:scale-95 shadow-lg shadow-red-600/20 flex items-center"
             >
                 Buka File PDF
             </a>
        </div>
      );
  }

  // Direct Render Mode (Desktop)
  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm" style={{ height }}>
      <iframe 
        src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=0`}
        className="w-full h-full bg-white"
        style={{ 
          height: '100%',
          filter: theme === 'dark' ? 'invert(0.9) hue-rotate(180deg)' : 'none'
        }}
        title="PDF Viewer"
      />
    </div>
  );
};

// Export both (Named and Default) to satisfy all imports in the project
export { PdfViewer };
export default PdfViewer;
