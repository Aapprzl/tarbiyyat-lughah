import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookOpen, Box, Activity, Hash, ChevronDown, ChevronRight, GraduationCap, Lock, Star, Zap, Bookmark, Layout, Flag, Smile, Home, User, Award, Hexagon, Layers, Image } from 'lucide-react';
import { contentService } from '../services/contentService';

const iconMap = {
  BookOpen, Box, Activity, Hash, Star, Zap, Bookmark, Layout, Flag, Smile, GraduationCap, Award, Hexagon, Layers
};

const Sidebar = ({ isOpen, onClose }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [specialPrograms, setSpecialPrograms] = useState([]);

  // Load Identity
  const [siteConfig, setSiteConfig] = useState(() => {
      const syncConf = contentService.getHomeConfigSync();
      return syncConf || { siteTitle: 'اللغة العربية', sidebarTitle: 'اللغة العربية', siteLogoType: 'icon', siteLogoIcon: 'GraduationCap', sidebarTitleSize: 'text-xl' };
  });

  useEffect(() => {
    const load = async () => {
      // In a real app these typically come from the same service or API
      const curr = await contentService.getCurriculum();
      setCurriculum(curr);
      
      const progs = await contentService.getSpecialPrograms();
      setSpecialPrograms(progs);

      const conf = await contentService.getHomeConfig();
      if (conf) {
          // Fallback
           if (!conf.sidebarTitle) conf.sidebarTitle = 'اللغة العربية';
           if (!conf.sidebarTitleSize) conf.sidebarTitleSize = 'text-xl';
           setSiteConfig(conf);
      }
    };
    load();
  }, []);

  const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const LogoIcon = iconMap[siteConfig.siteLogoIcon] || GraduationCap;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]/50 shrink-0">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity gap-3 overflow-hidden">
             {siteConfig.siteLogoType === 'image' && siteConfig.siteLogoUrl ? (
                <img src={siteConfig.siteLogoUrl} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
            ) : (
                <LogoIcon className="w-8 h-8 text-[var(--color-primary)] shrink-0" />
            )}
            <h1 className={`font-bold text-[var(--color-text-main)] font-arabic leading-none truncate pt-1 ${siteConfig.sidebarTitleSize || 'text-xl'}`}>
                {siteConfig.sidebarTitle}
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg mb-6 transition-colors ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-main)]'}`}
          >
            <Home className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Beranda</span>
          </NavLink>

          <NavLink 
            to="/profil" 
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg mb-6 transition-colors ${isActive ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-main)]'}`}
          >
            <User className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">Profil</span>
          </NavLink>

          <div className="mb-6">
            <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Kurikulum
            </h2>
            {curriculum.map((section) => {
              const Icon = iconMap[section.icon] || BookOpen;
              const isExpanded = expandedSection === section.id;

              return (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                      ${isExpanded 
                        ? 'bg-[var(--color-primary)] text-white shadow-md' 
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-main)]'}
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                    {section.topics.map(topic => (
                      <NavLink
                        key={topic.id}
                        to={`/materi/${topic.id}`}
                        onClick={onClose} // Auto close on mobile
                        className={({ isActive }) => `
                          block pl-12 pr-4 py-2 text-sm rounded-md transition-colors relative
                          ${isActive 
                            ? 'text-[var(--color-primary)] bg-teal-500/10 font-bold' 
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]'}
                        `}
                      >
                        <span className="arabic-sidebar-content">{topic.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Program Khusus
            </h2>
            {specialPrograms.map((category) => {
              const Icon = iconMap[category.icon] || Star;
              const isExpanded = expandedSection === category.id;

              return (
                <div key={category.id} className="mb-2">
                  <button
                    onClick={() => toggleSection(category.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors
                      ${isExpanded 
                        ? 'bg-amber-500 text-white shadow-md' 
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-main)]'}
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium text-sm">{category.title}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                    {category.topics?.map(topic => (
                      <NavLink
                        key={topic.id}
                        to={`/program/${topic.id}`}
                        onClick={(e) => { e.stopPropagation(); onClose && onClose(); }}
                        className={({ isActive }) => `
                          block pl-12 pr-4 py-2 text-sm rounded-md transition-colors
                          ${isActive 
                            ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold' 
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-hover)]'}
                        `}
                      >
                        <span className="arabic-sidebar-content">{topic.title}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>
        
        {/* Admin Link (Footer) */}
        <div className="p-4 border-t border-[var(--color-border)]/50 mt-auto">
          <NavLink
            to="/admin/login"
            className="flex items-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors px-4 py-2"
          >
            <Lock className="w-4 h-4 mr-2" />
            <span className="font-medium">Admin Access</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
