import React, { createContext, useContext, useEffect, useState } from 'react';
import { contentService } from '../services/contentService';

const FontContext = createContext();

export const useFont = () => useContext(FontContext);

const ARABIC_FAMILIES = [
  { name: 'Cairo', style: "'Cairo', sans-serif" },
  { name: 'Amiri', style: "'Amiri', serif" },
  { name: 'Scheherazade New', style: "'Scheherazade New', serif" },
  { name: 'Almarai', style: "'Almarai', sans-serif" },
  { name: 'Noto Naskh Arabic', style: "'Noto Naskh Arabic', serif" },
  { name: 'El Messiri', style: "'El Messiri', sans-serif" },
  { name: 'Noto Sans Arabic', style: "'Noto Sans Arabic', sans-serif" },
  { name: 'Tajawal', style: "'Tajawal', sans-serif" }
];

const LATIN_FAMILIES = [
  { name: 'Plus Jakarta Sans', style: "'Plus Jakarta Sans', sans-serif" },
  { name: 'Inter', style: "'Inter', sans-serif" },
  { name: 'Roboto', style: "'Roboto', sans-serif" },
  { name: 'System Default', style: "system-ui, -apple-system, sans-serif" }
];

export const FontProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const load = async () => {
      const cfg = await contentService.getFontConfig();
      setConfig(cfg);
      applyConfig(cfg);
    };
    load();
  }, []);

  const applyConfig = (cfg) => {
    const effectiveConfig = cfg || {
       fontFamily: 'Cairo',
       latinFontFamily: 'Plus Jakarta Sans',
       titleSize: 'text-4xl',
       contentSize: 'text-xl',
       sidebarSize: 'text-2xl',
       sidebarLinkSize: 'text-lg',
       indexTopicSize: 'text-xl',
       mobileNavScale: '0.8' // Default 80%
    };

    const arabicStyle = ARABIC_FAMILIES.find(f => f.name === effectiveConfig.fontFamily)?.style || "'Cairo', sans-serif";
    const latinStyle = LATIN_FAMILIES.find(f => f.name === effectiveConfig.latinFontFamily)?.style || "'Plus Jakarta Sans', sans-serif";
    
    // Map Tailwind-like classes to actual pixel or rem values if needed, 
    // but here we just pass the values to CSS variables.
    // However, the variables in index.css expect values like 2.25rem.
    // Let's create a map for the sizes.
    
    const sizeMap = {
      'text-base': '1rem',
      'text-lg': '1.125rem',
      'text-xl': '1.25rem',
      'text-2xl': '1.5rem',
      'text-3xl': '1.875rem',
      'text-4xl': '2.25rem',
      'text-5xl': '3rem'
    };

    document.documentElement.style.setProperty('--font-arabic', arabicStyle);
    document.documentElement.style.setProperty('--font-latin', latinStyle);
    document.documentElement.style.setProperty('--font-arabic-title-size', sizeMap[effectiveConfig.titleSize] || effectiveConfig.titleSize);
    document.documentElement.style.setProperty('--font-arabic-content-size', sizeMap[effectiveConfig.contentSize] || effectiveConfig.contentSize);
    document.documentElement.style.setProperty('--font-arabic-sidebar-size', sizeMap[effectiveConfig.sidebarSize] || effectiveConfig.sidebarSize);
    document.documentElement.style.setProperty('--font-arabic-sidebar-content-size', sizeMap[effectiveConfig.sidebarLinkSize] || effectiveConfig.sidebarLinkSize);
    document.documentElement.style.setProperty('--font-arabic-index-topic-size', sizeMap[effectiveConfig.indexTopicSize] || effectiveConfig.indexTopicSize);
    document.documentElement.style.setProperty('--mobile-nav-scale', effectiveConfig.mobileNavScale || '0.8');
  };

  const updateFontConfig = async (newConfig) => {
    await contentService.saveFontConfig(newConfig);
    setConfig(newConfig);
    applyConfig(newConfig);
  };

  return (
    <FontContext.Provider value={{ config, updateFontConfig, refreshFonts: applyConfig }}>
      {children}
    </FontContext.Provider>
  );
};
