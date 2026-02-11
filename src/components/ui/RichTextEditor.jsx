import React, { useRef, useEffect, useState } from 'react';
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Heading, 
    Quote, 
    Link as LinkIcon, 
    Undo, 
    Redo,
    AlignLeft,
    AlignRight,
    Languages
} from 'lucide-react';
import { wrapArabicText } from '../../utils/textUtils';
import DOMPurify from 'dompurify';

const RichTextEditor = ({ value, onChange, placeholder = 'Tulis konten di sini...' }) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});

  useEffect(() => {
    // Set default paragraph separator to 'p'
    document.execCommand('defaultParagraphSeparator', false, 'p');
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value ? DOMPurify.sanitize(value) : '<p><br></p>';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      // We don't wrap live while typing to avoid cursor issues
      // But we wrap the output for the parent
      const cleanHTML = DOMPurify.sanitize(editorRef.current.innerHTML);
      const wrappedHTML = wrapArabicText(cleanHTML);
      onChange(wrappedHTML);
      updateActiveFormats();
    }
  };

  const handleFocus = () => {
    if (editorRef.current && (editorRef.current.innerHTML === '' || editorRef.current.innerHTML === '<br>')) {
      editorRef.current.innerHTML = '<p><br></p>';
    }
  };

  const handleSelectionChange = () => {
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    if (!editorRef.current) return;

    const formats = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
    };
    
    // Check selection for complex states
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node?.nodeType === 3) node = node.parentNode;

      let directionFound = false;
      while (node && node !== editorRef.current) {
        if (node.nodeName === 'BLOCKQUOTE') formats.blockquote = true;
        if (node.nodeName === 'A') formats.link = true;
        
        // Track Direction - Mutual Exclusivity and Closest takes precedence
        if (!directionFound && node.getAttribute?.('dir')) {
           const dir = node.getAttribute('dir');
           if (dir === 'rtl') formats.rtl = true;
           if (dir === 'ltr') formats.ltr = true;
           directionFound = true;
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

  const toggleDirection = (dir) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node?.nodeType === 3) node = node.parentNode;

      // Find the closest block element or parent
      const blockTags = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'LI', 'UL', 'OL'];
      let targetNode = node;
      
      while (targetNode && targetNode !== editorRef.current) {
        if (blockTags.includes(targetNode.nodeName)) {
          break;
        }
        targetNode = targetNode.parentNode;
      }

      // If we are at the top level or inside a list but not a specific item
      if (targetNode === editorRef.current || !targetNode) {
         document.execCommand('formatBlock', false, 'p');
         const newSelection = window.getSelection();
         let newNode = newSelection.anchorNode;
         if (newNode?.nodeType === 3) newNode = newNode.parentNode;
         while (newNode && newNode !== editorRef.current) {
            if (blockTags.includes(newNode.nodeName)) {
                targetNode = newNode;
                break;
            }
            newNode = newNode.parentNode;
         }
      }

      if (targetNode && targetNode !== editorRef.current) {
         targetNode.setAttribute('dir', dir);
         // Apply appropriate font-class or variable
         if (dir === 'rtl') {
            targetNode.classList.add('arabic-content', 'dir-rtl');
            targetNode.style.textAlign = 'right';
         } else {
            targetNode.classList.remove('arabic-content', 'dir-rtl');
            targetNode.style.textAlign = 'left';
         }
      }
    }
    handleInput();
    
    // Slight delay to ensure browser layout catches up for the cursor
    setTimeout(() => {
        editorRef.current?.focus();
    }, 10);
  };

  const toggleBlockquote = () => {
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

      if (!url.includes('.') || url.includes(' ')) {
        url = '#';
      } else if (!url.startsWith('http')) {
        url = 'https://' + url;
      }

      document.execCommand('createLink', false, url);
    }
    editorRef.current?.focus();
    handleInput();
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
      {React.cloneElement(icon, { className: "w-4 h-4" })}
    </button>
  );

  return (
    <>
      <div className="border border-[var(--color-border)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 bg-[var(--color-bg-card)]">
        {/* Toolbar */}
        <div className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] p-2 flex flex-wrap gap-1 sticky top-0 z-10">
          {formatButton(<Bold />, 'bold', 'Tebal (Ctrl+B)', null, activeFormats.bold)}
          {formatButton(<Italic />, 'italic', 'Miring (Ctrl+I)', null, activeFormats.italic)}
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>
          
          {formatButton(<Heading />, 'formatBlock', 'Heading 2', 'h2')}
          {formatButton(<Heading />, 'formatBlock', 'Heading 3', 'h3')}
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>
          
          {formatButton(<List />, 'insertUnorderedList', 'Daftar Bullet', null, activeFormats.insertUnorderedList)}
          {formatButton(<ListOrdered />, 'insertOrderedList', 'Daftar Nomor', null, activeFormats.insertOrderedList)}
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>
          
          {formatButton(<AlignLeft />, null, 'Teks Kiri (LTR)', null, activeFormats.ltr, () => toggleDirection('ltr'))}
          {formatButton(<AlignRight />, null, 'Teks Kanan (RTL)', null, activeFormats.rtl, () => toggleDirection('rtl'))}
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>

          {formatButton(<Quote />, null, 'Kutipan (Toggle)', null, activeFormats.blockquote, toggleBlockquote)}
          {formatButton(<LinkIcon />, null, 'Tautan (Toggle)', null, activeFormats.link, toggleLink)}
          
          <div className="flex-1"></div>
          
          {formatButton(<Undo />, 'undo', 'Undo (Ctrl+Z)')}
          {formatButton(<Redo />, 'redo', 'Redo (Ctrl+Y)')}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={handleFocus}
          className="w-full p-6 outline-none min-h-[300px] max-h-[600px] overflow-y-auto bg-[var(--color-bg-card)] text-[var(--color-text-main)] prose prose-teal dark:prose-invert max-w-none font-sans"
          style={{
            lineHeight: '1.8',
          }}
          data-placeholder={placeholder}
        />

        <style>{`
          [contentEditable]:empty:before {
            content: attr(data-placeholder);
            color: var(--color-text-muted);
            opacity: 0.6;
          }
          
          [contentEditable] p[dir="rtl"] {
             text-align: right;
             direction: rtl;
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
