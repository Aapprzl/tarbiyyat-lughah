/**
 * Utility to automatically wrap Arabic text segments in HTML with a specific class
 * for proper font application.
 */

import DOMPurify from 'dompurify';

export const wrapArabicText = (html) => {
  if (!html || typeof html !== 'string') return html;

  // SECURITY: Sanitize HTML input to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    ALLOW_DATA_ATTR: false
  });

  // Regex to match Arabic characters including extended ranges, harakat, etc.
  // This range covers most Arabic, Persian, Urdu scripts.
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

  // We need to parse the HTML to avoid wrapping text inside tags or attributes
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${sanitizedHtml}</div>`, 'text/html');
  const container = doc.body.firstChild;

  const processNode = (node) => {
    // If it's a text node, process it
    if (node.nodeType === 3) { // Node.TEXT_NODE
      const text = node.textContent;
      if (arabicRegex.test(text)) {
        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        let match;
        
        // Reset regex state
        arabicRegex.lastIndex = 0;
        
        while ((match = arabicRegex.exec(text)) !== null) {
          // Add non-arabic part before
          if (match.index > lastIdx) {
            frag.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
          }
          
          // Add arabic part wrapped in span
          const span = document.createElement('span');
          span.className = 'arabic-content inline-block';
          span.textContent = match[0];
          frag.appendChild(span);
          
          lastIdx = arabicRegex.lastIndex;
        }
        
        // Add remaining part
        if (lastIdx < text.length) {
          frag.appendChild(document.createTextNode(text.substring(lastIdx)));
        }
        
        node.parentNode.replaceChild(frag, node);
      }
    } else if (node.nodeType === 1) { // Node.ELEMENT_NODE
      // If it's already an arabic-content span, don't re-process its children to avoid nesting
      if (node.classList.contains('arabic-content')) return;
      
      // Process children
      const children = Array.from(node.childNodes);
      children.forEach(processNode);
    }
  };

  processNode(container);
  return container.innerHTML;
};

export const isArabic = (text) => {
  if (!text) return false;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

/**
 * Detects the first character with "strong" directionality.
 * Returns 'rtl' if it's Arabic, 'ltr' otherwise.
 */
export const getDirection = (text) => {
  if (!text || typeof text !== 'string') return 'ltr';
  
  // Rule: If it contains ANY Latin characters, we treat it as LTR (Mixed Format)
  // as per user request to favor LTR even if there is Arabic text in certain parts.
  const hasLatin = /[a-zA-Z]/.test(text);
  if (hasLatin) return 'ltr';

  // If no Latin, check for the first strong character (usually Arabic for RTL)
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Arabic, Hebrew, etc.
    if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0590-\u05FF]/.test(char)) return 'rtl';
    // If we find a Latin character (already covered by hasLatin but for completeness)
    if (/[a-zA-Z\u00C0-\u00FF\u0100-\u017F]/.test(char)) return 'ltr';
  }

  return 'ltr'; // Fallback
};
