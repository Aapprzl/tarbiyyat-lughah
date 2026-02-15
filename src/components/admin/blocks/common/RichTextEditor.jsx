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
    Languages,
    Type,
    ChevronDown,
    Palette,
    Highlighter,
    Baseline
} from 'lucide-react';
import { wrapArabicText } from '../../../../utils/textUtils';
import DOMPurify from 'dompurify';

const FormatButton = ({ icon, title, isActive, onAction }) => (
  <button
    type="button"
    onClick={onAction}
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

const RichTextEditor = ({ value, onChange, placeholder = 'Tulis konten di sini...' }) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);

  const textColors = [
    { name: 'Default', value: 'inherit', class: 'bg-white border-slate-200' },
    { name: 'Gray', value: '#6b7280', class: 'bg-[#6b7280]' },
    { name: 'Brown', value: '#92400e', class: 'bg-[#92400e]' },
    { name: 'Orange', value: '#ea580c', class: 'bg-[#ea580c]' },
    { name: 'Yellow', value: '#a16207', class: 'bg-[#a16207]' },
    { name: 'Green', value: '#16a34a', class: 'bg-[#16a34a]' },
    { name: 'Blue', value: '#2563eb', class: 'bg-[#2563eb]' },
    { name: 'Purple', value: '#9333ea', class: 'bg-[#9333ea]' },
    { name: 'Pink', value: '#db2777', class: 'bg-[#db2777]' },
    { name: 'Red', value: '#dc2626', class: 'bg-[#dc2626]' },
  ];

  const bgColors = [
    { name: 'None', value: 'transparent', class: 'bg-transparent border-slate-200' },
    { name: 'Gray', value: 'rgba(107, 114, 128, 0.2)', class: 'bg-[#6b7280]/20' },
    { name: 'Brown', value: 'rgba(146, 64, 14, 0.2)', class: 'bg-[#92400e]/20' },
    { name: 'Orange', value: 'rgba(234, 88, 12, 0.2)', class: 'bg-[#ea580c]/20' },
    { name: 'Yellow', value: 'rgba(161, 98, 7, 0.2)', class: 'bg-[#a16207]/20' },
    { name: 'Green', value: 'rgba(22, 163, 74, 0.2)', class: 'bg-[#16a34a]/20' },
    { name: 'Blue', value: 'rgba(37, 99, 235, 0.2)', class: 'bg-[#2563eb]/20' },
    { name: 'Purple', value: 'rgba(147, 51, 234, 0.2)', class: 'bg-[#9333ea]/20' },
    { name: 'Pink', value: 'rgba(219, 39, 119, 0.2)', class: 'bg-[#db2777]/20' },
    { name: 'Red', value: 'rgba(220, 38, 38, 0.2)', class: 'bg-[#dc2626]/20' },
  ];

  useEffect(() => {
    // Set default paragraph separator to 'p'
    document.execCommand('defaultParagraphSeparator', false, 'p');
    // Enable CSS styling for cleaner markup (spans instead of font tags)
    document.execCommand('styleWithCSS', false, true);
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Allow style attribute for colors
      editorRef.current.innerHTML = value ? DOMPurify.sanitize(value, { ADD_ATTR: ['style', 'class', 'dir'] }) : '<p><br></p>';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      // We don't wrap live while typing to avoid cursor issues
      // But we wrap the output for the parent
      // Allow style attribute for colors
      const cleanHTML = DOMPurify.sanitize(editorRef.current.innerHTML, { ADD_ATTR: ['style', 'class', 'dir'] });
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
      fontSize: document.queryCommandValue('fontSize'),
      foreColor: document.queryCommandValue('foreColor'),
      hiliteColor: document.queryCommandValue('hiliteColor'),
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
    const handleClickOutside = (e) => {
      if (!e.target.closest('.color-picker-container')) {
        setShowTextColor(false);
        setShowBgColor(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.removeEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  // FormatButton moved outside


  return (
    <>
      <div className="border border-[var(--color-border)] rounded-lg focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 bg-[var(--color-bg-card)] relative">
        {/* Toolbar */}
        <div className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] p-2 flex flex-wrap gap-1 sticky top-0 z-10 rounded-t-lg">
          <FormatButton icon={<Bold />} command="bold" title="Tebal (Ctrl+B)" isActive={activeFormats.bold} onAction={() => execCommand('bold')} />
          <FormatButton icon={<Italic />} command="italic" title="Miring (Ctrl+I)" isActive={activeFormats.italic} onAction={() => execCommand('italic')} />
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>
          
          <FormatButton icon={<Heading />} command="formatBlock" title="Heading 2" value="h2" onAction={() => execCommand('formatBlock', 'h2')} />
          <FormatButton icon={<Heading />} command="formatBlock" title="Heading 3" value="h3" onAction={() => execCommand('formatBlock', 'h3')} />
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>
          
          <FormatButton icon={<List />} command="insertUnorderedList" title="Daftar Bullet" isActive={activeFormats.insertUnorderedList} onAction={() => execCommand('insertUnorderedList')} />
          <FormatButton icon={<ListOrdered />} command="insertOrderedList" title="Daftar Nomor" isActive={activeFormats.insertOrderedList} onAction={() => execCommand('insertOrderedList')} />
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>
          
          <FormatButton icon={<AlignLeft />} title="Teks Kiri (LTR)" isActive={activeFormats.ltr} onAction={() => toggleDirection('ltr')} />
          <FormatButton icon={<AlignRight />} title="Teks Kanan (RTL)" isActive={activeFormats.rtl} onAction={() => toggleDirection('rtl')} />
          
          <div className="w-px bg-[var(--color-border)] mx-1"></div>

          <FormatButton icon={<Quote />} title="Kutipan (Toggle)" isActive={activeFormats.blockquote} onAction={toggleBlockquote} />
          <FormatButton icon={<LinkIcon />} title="Tautan (Toggle)" isActive={activeFormats.link} onAction={toggleLink} />

          <div className="w-px bg-[var(--color-border)] mx-1"></div>

          {/* Text Color Picker */}
          <div className="relative color-picker-container">
            <button
              type="button"
              onClick={() => { setShowTextColor(!showTextColor); setShowBgColor(false); }}
              className={`p-2 rounded transition-all hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)] ${showTextColor ? 'bg-teal-50 dark:bg-teal-500/10' : ''}`}
              title="Warna Tulisan"
            >
              <div className="flex flex-col items-center">
                <Baseline className="w-4 h-4" />
                <div className="w-4 h-0.5 mt-0.5 rounded-full" style={{ backgroundColor: activeFormats.foreColor || 'currentColor' }} />
              </div>
            </button>
            {showTextColor && (
              <div className="absolute top-full right-0 mt-1 p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 min-w-[220px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Warna Tulisan</p>
                <div className="grid grid-cols-5 gap-2">
                  {textColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => { execCommand('foreColor', color.value); setShowTextColor(false); }}
                      className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 shadow-sm ${color.class} ${activeFormats.foreColor === color.value ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900 border-white' : 'border-black/5'}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BG Color Picker */}
          <div className="relative color-picker-container">
            <button
              type="button"
              onClick={() => { setShowBgColor(!showBgColor); setShowTextColor(false); }}
              className={`p-2 rounded transition-all hover:bg-[var(--color-bg-hover)] text-[var(--color-text-main)] ${showBgColor ? 'bg-teal-50 dark:bg-teal-500/10' : ''}`}
              title="Warna Latar Belakang"
            >
              <div className="flex flex-col items-center">
                <Highlighter className="w-4 h-4" />
                <div className="w-4 h-0.5 mt-0.5 rounded-full" style={{ backgroundColor: activeFormats.hiliteColor || 'transparent' }} />
              </div>
            </button>
            {showBgColor && (
              <div className="absolute top-full right-0 mt-1 p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 min-w-[220px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Warna Latar</p>
                <div className="grid grid-cols-5 gap-2">
                  {bgColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => { execCommand('hiliteColor', color.value); setShowBgColor(false); }}
                      className={`w-7 h-7 rounded-lg border transition-transform hover:scale-110 shadow-sm ${color.class} ${activeFormats.hiliteColor === color.value ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900 border-white' : 'border-black/5'}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px bg-[var(--color-border)] mx-1"></div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded px-2 hover:border-teal-500 transition-colors">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <select
              className="bg-transparent text-[11px] font-bold text-[var(--color-text-main)] outline-none py-1.5 cursor-pointer appearance-none pr-1"
              value={activeFormats.fontSize || "3"}
              onChange={(e) => execCommand('fontSize', e.target.value)}
              title="Ukuran Font"
            >
              <option value="1" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">Kecil (12px)</option>
              <option value="2" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">Agak Kecil (14px)</option>
              <option value="3" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">Normal (16px)</option>
              <option value="4" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">Sedang (18px)</option>
              <option value="5" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">Besar (24px)</option>
              <option value="6" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">Sangat Besar (32px)</option>
              <option value="7" className="bg-[var(--color-bg-card)] text-[var(--color-text-main)]">Raksasa (48px)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 -ml-1 pointer-events-none" />
          </div>
          
          <div className="flex-1"></div>
          
          <FormatButton icon={<Undo />} command="undo" title="Undo (Ctrl+Z)" onAction={() => execCommand('undo')} />
          <FormatButton icon={<Redo />} command="redo" title="Redo (Ctrl+Y)" onAction={() => execCommand('redo')} />
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

          /* Font Size Mapping */
          [contentEditable] font[size="1"] { font-size: 12px; line-height: 1.5; }
          [contentEditable] font[size="2"] { font-size: 14px; line-height: 1.6; }
          [contentEditable] font[size="3"] { font-size: 16px; line-height: 1.8; }
          [contentEditable] font[size="4"] { font-size: 18px; line-height: 1.8; }
          [contentEditable] font[size="5"] { font-size: 24px; line-height: 1.4; }
          [contentEditable] font[size="6"] { font-size: 32px; line-height: 1.3; }
          [contentEditable] font[size="7"] { font-size: 48px; line-height: 1.2; }
        `}</style>
      </div>
    </>
  );
};

export default RichTextEditor;
