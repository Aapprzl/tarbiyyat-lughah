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

  // Direct Render Mode (No intermediate buttons)
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
