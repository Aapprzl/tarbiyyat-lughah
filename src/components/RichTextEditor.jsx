import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading, Quote, Link as LinkIcon, Undo, Redo } from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Tulis konten di sini...' }) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  };

  const handleSelectionChange = () => {
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    };
    
    // Check if current selection is in blockquote
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'BLOCKQUOTE') {
          formats.blockquote = true;
          break;
        }
        node = node.parentNode;
      }
    }
    
    setActiveFormats(formats);
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const toggleBlockquote = () => {
    // If already in blockquote, convert to paragraph
    if (activeFormats.blockquote) {
      document.execCommand('formatBlock', false, 'p');
    } else {
      document.execCommand('formatBlock', false, 'blockquote');
    }
    editorRef.current?.focus();
    updateActiveFormats();
  };

  const openLinkModal = () => {
    // Check if text is selected
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
      alert('Silakan pilih/select text terlebih dahulu sebelum menambahkan link!');
      return;
    }
    
    setLinkUrl('');
    setShowLinkModal(true);
  };

  const insertLink = () => {
    if (linkUrl.trim()) {
      // Ensure URL has protocol
      let finalUrl = linkUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      document.execCommand('createLink', false, finalUrl);
      editorRef.current?.focus();
      
      // Trigger onChange to save the new content
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  const formatButton = (icon, command, title, value = null, isActive = false, customHandler = null) => (
    <button
      type="button"
      onClick={() => customHandler ? customHandler() : execCommand(command, value)}
      className={`p-2 rounded transition-all ${
        isActive 
          ? 'bg-teal-600 text-white shadow-sm' 
          : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)]'
      }`}
      title={title}
    >
      {icon}
    </button>
  );

  return (
    <>
      <div className="border border-[var(--color-border)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
        {/* Toolbar */}
        <div className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] p-2 flex flex-wrap gap-1">
          {formatButton(<Bold className="w-4 h-4" />, 'bold', 'Tebal (Ctrl+B)', null, activeFormats.bold)}
          {formatButton(<Italic className="w-4 h-4" />, 'italic', 'Miring (Ctrl+I)', null, activeFormats.italic)}
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          {formatButton(<Heading className="w-4 h-4" />, 'formatBlock', 'Heading 2', 'h2')}
          {formatButton(<Heading className="w-3 h-3" />, 'formatBlock', 'Heading 3', 'h3')}
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          {formatButton(<List className="w-4 h-4" />, 'insertUnorderedList', 'Daftar Bullet', null, activeFormats.insertUnorderedList)}
          {formatButton(<ListOrdered className="w-4 h-4" />, 'insertOrderedList', 'Daftar Nomor', null, activeFormats.insertOrderedList)}
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          {formatButton(<Quote className="w-4 h-4" />, null, 'Kutipan (Toggle)', null, activeFormats.blockquote, toggleBlockquote)}
          
          <div className="w-px bg-gray-300 mx-1"></div>
          
          {formatButton(<LinkIcon className="w-4 h-4" />, null, 'Sisipkan Link/Tautan', null, false, openLinkModal)}
          
          <div className="flex-1"></div>
          
          {formatButton(<Undo className="w-4 h-4" />, 'undo', 'Undo (Ctrl+Z)')}
          {formatButton(<Redo className="w-4 h-4" />, 'redo', 'Redo (Ctrl+Y)')}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          className="w-full p-4 outline-none min-h-[300px] max-h-[600px] overflow-y-auto bg-[var(--color-bg-card)] text-[var(--color-text-main)] prose prose-teal dark:prose-invert max-w-none"
          style={{
            lineHeight: '1.6',
          }}
          data-placeholder={placeholder}
        />

        <style>{`
          [contentEditable]:empty:before {
            content: attr(data-placeholder);
            color: var(--color-text-muted);
            opacity: 0.6;
          }
          
          [contentEditable] h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.5em 0;
          }
          
          [contentEditable] h3 {
            font-size: 1.25em;
            font-weight: bold;
            margin: 0.5em 0;
          }
          
          [contentEditable] ul, [contentEditable] ol {
            margin: 0.5em 0;
            padding-left: 2em;
          }
          
          [contentEditable] blockquote {
            border-left: 4px solid var(--color-primary);
            padding-left: 1em;
            margin: 0.5em 0;
            font-style: italic;
            opacity: 0.9;
          }
          
          [contentEditable] p {
            margin: 0.5em 0;
          }
          
          [contentEditable] strong {
            font-weight: bold;
          }
          
          [contentEditable] em {
            font-style: italic;
          }
          
          [contentEditable] a {
            color: #0d9488 !important;
            text-decoration: underline !important;
            cursor: pointer;
            font-weight: 500;
          }
          
          [contentEditable] a:hover {
            color: #0f766e !important;
            text-decoration: underline !important;
          }
        `}</style>
      </div>

      {/* Custom Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowLinkModal(false)}>
          <div className="bg-[var(--color-bg-card)] rounded-xl shadow-2xl border border-[var(--color-border)] p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-4">Sisipkan Link/Tautan</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">
                URL Alamat
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') insertLink();
                  if (e.key === 'Escape') setShowLinkModal(false);
                }}
                placeholder="https://example.com"
                className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                autoFocus
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                Pilih teks terlebih dahulu, lalu masukkan URL lengkap (termasuk https://)
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-lg text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={insertLink}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
              >
                Sisipkan Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RichTextEditor;
