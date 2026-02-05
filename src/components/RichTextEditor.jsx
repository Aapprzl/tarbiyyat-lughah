import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading, Quote, Link as LinkIcon, Undo, Redo } from 'lucide-react';
import DOMPurify from 'dompurify';

const RichTextEditor = ({ value, onChange, placeholder = 'Tulis konten di sini...' }) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Sanitize incoming value as well to be safe, though mainly we care about output
      editorRef.current.innerHTML = value ? DOMPurify.sanitize(value) : '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const cleanHTML = DOMPurify.sanitize(editorRef.current.innerHTML);
      onChange(cleanHTML);
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
    
    // Check if current selection is in blockquote or link
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let node = selection.anchorNode;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'BLOCKQUOTE') {
          formats.blockquote = true;
        }
        if (node.nodeName === 'A') {
          formats.link = true;
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

  const toggleLink = () => {
    if (activeFormats.link) {
      document.execCommand('unlink');
    } else {
      const selection = window.getSelection();
      let url = selection.toString().trim();
      
      if (!url) {
        alert('Silakan pilih teks terlebih dahulu!');
        return;
      }

      // If selection looks like a URL, use it, otherwise use #
      if (!url.includes('.') || url.includes(' ')) {
        url = '#';
      } else if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      document.execCommand('createLink', false, url);
    }
    editorRef.current?.focus();
    
    // Trigger onChange
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
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
          
          {formatButton(<LinkIcon className="w-4 h-4" />, null, 'Tautan (Toggle)', null, activeFormats.link, toggleLink)}
          
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
    </>
  );
};

export default RichTextEditor;
