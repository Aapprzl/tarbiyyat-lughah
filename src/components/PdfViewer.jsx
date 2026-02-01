import React, { useState, useMemo } from 'react';
import { FileText, Download, ExternalLink, AlertCircle, Eye } from 'lucide-react';
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
  const [showPreview, setShowPreview] = useState(false);
  
  // Backwards compatibility: use src or fileUrl
  const finalSrc = src || fileUrl;
  
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

  // Show action card (default) or embedded preview  
  if (!showPreview) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-500/20 overflow-hidden" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-20 h-20 bg-[var(--color-bg-card)] rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-[var(--color-border)]">
            <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h4 className="text-lg font-bold text-[var(--color-text-main)] mb-2">Dokumen PDF</h4>
          <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-sm">
            Klik tombol di bawah untuk melihat dokumen PDF ini.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {/* Preview in Page */}
            <button 
              onClick={() => setShowPreview(true)}
              className="flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Lihat Preview
            </button>
            
            {/* Open in New Tab */}
            <a 
              href={blobUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center bg-[var(--color-bg-card)] text-blue-600 dark:text-blue-400 border border-blue-500/30 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-500/10 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Tab Baru
            </a>
            
            {/* Download Button */}
            {allowDownload && (
              <a 
                href={blobUrl} 
                download={fileName}
                className="flex items-center bg-[var(--color-bg-card)] text-[var(--color-text-main)] border border-[var(--color-border)] px-5 py-2.5 rounded-lg font-medium hover:bg-[var(--color-bg-main)] transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Embedded Preview Mode
  return (
    <div className="bg-[var(--color-bg-main)] rounded-xl overflow-hidden border border-[var(--color-border)]" style={{ height }}>
      <div className="bg-gray-800 dark:bg-black px-4 py-2 flex items-center justify-between">
        <span className="text-white text-sm font-medium">📄 Preview PDF</span>
        <div className="flex gap-2">
          <a 
            href={blobUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-300 hover:text-white"
          >
            Buka di Tab Baru
          </a>
          <button 
            onClick={() => setShowPreview(false)}
            className="text-xs text-gray-300 hover:text-white"
          >
            Tutup
          </button>
        </div>
      </div>
      <iframe 
        src={blobUrl}
        className={`w-full bg-white transition-all duration-500`}
        style={{ 
          height: typeof height === 'number' ? height - 40 : 'calc(100% - 40px)',
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
