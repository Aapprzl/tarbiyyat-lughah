import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, BookOpen, Star, Box, Activity, Hash, Zap, Bookmark, Layout, Flag, Smile, Sun, Moon, Award, Hexagon, Layers, Image } from 'lucide-react';
import { contentService } from '../services/contentService';
import { useTheme } from './ThemeProvider';

const iconMap = {
  BookOpen, Star, Box, Activity, Hash, Zap, Bookmark, Layout, Flag, Smile, Award, Hexagon, Layers
};

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [allContent, setAllContent] = React.useState([]);
  
  // Load content once on mount
  const [siteConfig, setSiteConfig] = React.useState(() => {
      // Try sync load first to prevent blink
      const syncConf = contentService.getHomeConfigSync();
      return syncConf || { siteTitle: 'Bahasa Arab Praktis', siteLogoType: 'icon', siteLogoIcon: 'BookOpen', headerTitleSize: 'text-lg' };
  });

  React.useEffect(() => {
     const load = async () => {
         try {
             // Load Search Content
             const content = await contentService.getAllContent();
             setAllContent(content);
             
             // Load Site Config (Identity)
             const conf = await contentService.getHomeConfig();
             if (conf) setSiteConfig(conf);

         } catch (e) {
             console.error("Failed to load header data", e);
         }
     };
     load();
  }, []);

  // Filter logic
  React.useEffect(() => {
     if (!searchQuery.trim()) {
         setSearchResults([]);
         return;
     }
     
     const query = searchQuery.toLowerCase();
     const results = allContent.filter(item => 
         item.title.toLowerCase().includes(query)
     ).slice(0, 5); // Limit to 5 results

     setSearchResults(results);
  }, [searchQuery, allContent]);

  const handleSearchSubmit = (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      window.location.href = `/materi?search=${encodeURIComponent(searchQuery)}`;
      setShowSearch(false);
  };
  
  const handleResultClick = (path) => {
      window.location.href = path; // Force navigation
      setShowSearch(false);
      setSearchQuery('');
  };

  const LogoIcon = iconMap[siteConfig.siteLogoIcon] || BookOpen;

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-72 h-16 bg-[var(--color-bg-card)]/90 backdrop-blur-md border-b border-[var(--color-border)] z-30 px-4 flex items-center justify-between transition-all duration-300 shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={onMenuClick}
            className="p-2 mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden text-[var(--color-text-main)]"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-lg font-bold text-[var(--color-text-main)] hidden md:flex items-center hover:text-[var(--color-primary)] transition-colors tracking-tight gap-2">
            <span className={`font-arabic ${siteConfig.headerTitleSize || 'text-lg'}`}>{siteConfig.siteTitle || 'Bahasa Arab Praktis'}</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3 relative">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-[var(--color-primary)] transition-all active:scale-95"
            title={theme === 'light' ? 'Mode Malam' : 'Mode Siang'}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
          </button>

          {/* Search Trigger */}
          <div className="relative hidden md:block z-50">
               {showSearch ? (
                  <div className="relative">
                    <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-1.5 w-72 transition-all border border-transparent focus-within:border-[var(--color-primary)] focus-within:bg-white dark:focus-within:bg-gray-900 focus-within:shadow-md">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        <input 
                            className="bg-transparent border-none outline-none text-sm text-[var(--color-text-main)] w-full placeholder-gray-400" 
                            placeholder="Cari materi..."
                            autoFocus
                            onBlur={() => setTimeout(() => !searchQuery && setShowSearch(false), 200)} // Delay to allow click
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </form>
                    
                    {/* Dropdown Results */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg-card)] rounded-xl shadow-xl border border-[var(--color-border)] overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                            <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Hasil Pencarian</p>
                            <ul>
                                {searchResults.map((result) => {
                                    const Icon = iconMap[result.icon] || BookOpen;
                                    return (
                                        <li key={result.types + result.id}>
                                            <button 
                                                onClick={() => handleResultClick(result.path)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-900/30 flex items-center group transition-colors"
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${result.type === 'special' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-[var(--color-text-main)] group-hover:text-teal-700">{result.title}</div>
                                                    {result.desc && <div className="text-xs text-[var(--color-text-muted)] line-clamp-1 mb-0.5">{result.desc}</div>}
                                                    {result.sectionTitle && <div className="text-[10px] text-[var(--color-text-muted)] opacity-70">{result.sectionTitle}</div>}
                                                    {result.type === 'special' && <div className="text-[10px] text-amber-500 font-medium">Program Spesial</div>}
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="border-t border-[var(--color-border)] mt-2 pt-2 text-center">
                                <button onClick={handleSearchSubmit} className="text-xs text-[var(--color-primary)] font-medium hover:underline pb-1">
                                    Lihat semua hasil
                                </button>
                            </div>
                        </div>
                    )}
                  </div>
               ) : (
                  <button onClick={() => setShowSearch(true)} className="p-2 text-gray-400 hover:text-[var(--color-primary)] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full">
                    <Search className="w-5 h-5" />
                  </button>
               )}
          </div>
          <button onClick={() => setShowSearch(!showSearch)} className="md:hidden p-2 text-gray-400 hover:text-[var(--color-primary)]">
             <Search className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
          
          <Link to="/materi" className="flex items-center bg-[var(--color-primary)] text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:bg-[var(--color-primary-dark)] hover:shadow-lg transform hover:-translate-y-0.5 transition-all outline-none">
            Mulai Belajar
          </Link>
        </div>
      </header>
      
      {/* Mobile Search Overlay */}
      {showSearch && (
          <div className="md:hidden fixed top-16 left-0 right-0 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] p-4 z-20 shadow-lg animate-in slide-in-from-top-2">
              <form onSubmit={handleSearchSubmit} className="flex items-center bg-[var(--color-bg-muted)] rounded-lg px-4 py-2 mb-4">
                  <Search className="w-5 h-5 text-[var(--color-text-muted)] mr-3" />
                  <input 
                    className="bg-transparent border-none outline-none text-base text-[var(--color-text-main)] w-full placeholder-[var(--color-text-muted)]" 
                    placeholder="Cari materi..."
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
              </form>
              
               {/* Mobile Results */}
               {searchResults.length > 0 && (
                   <ul className="space-y-2">
                       {searchResults.map((result) => (
                           <li key={result.id}>
                               <button 
                                    onClick={() => handleResultClick(result.path)}
                                    className="w-full text-left p-3 rounded-xl bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] flex items-center"
                               >
                                   <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${result.type === 'special' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-teal-100 dark:bg-teal-900/30 text-teal-600'}`}>
                                       <Search className="w-5 h-5" />
                                   </div>
                                   <div>
                                       <div className="font-bold text-[var(--color-text-main)]">{result.title}</div>
                                       {result.sectionTitle && <div className="text-xs text-[var(--color-text-muted)]">{result.sectionTitle}</div>}
                                   </div>
                               </button>
                           </li>
                       ))}
                   </ul>
               )}
          </div>
      )}
    </>
  );
};
export default Header;
