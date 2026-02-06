import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Library, Package, LineChart, Link2, ChevronDown, GraduationCap, ShieldCheck, Award, Rocket, Pocket, LayoutGrid, Milestone, Heart, Compass, CircleUser, Medal, Hexagon, Layers, X, Gamepad } from 'lucide-react';
import { contentService } from '../services/contentService';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const iconMap = {
  BookOpen: Library, 
  Box: Package, 
  Activity: LineChart, 
  Hash: Link2, 
  Star: Award, 
  Zap: Rocket, 
  Bookmark: Pocket, 
  Layout: LayoutGrid, 
  Flag: Milestone, 
  Smile: Heart, 
  PlayCircle: Gamepad, 
  Play: Gamepad, 
  GraduationCap, 
  Award: Medal, 
  Hexagon, 
  Layers
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
      const curr = await contentService.getCurriculum();
      setCurriculum(curr);
      
      const progs = await contentService.getSpecialPrograms();
      setSpecialPrograms(progs);

      const conf = await contentService.getHomeConfig();
      if (conf) {
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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-0 left-0 z-[70] h-full w-80 bg-slate-50 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/5 shrink-0">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity gap-3 overflow-hidden" onClick={onClose}>
             <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                {siteConfig.siteLogoType === 'image' && siteConfig.siteLogoUrl ? (
                    <img src={siteConfig.siteLogoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                    <LogoIcon className="w-6 h-6 text-white" />
                )}
             </div>
            <h1 className={cn("font-bold text-slate-900 dark:text-white leading-none truncate pt-1", siteConfig.sidebarTitleSize || 'text-xl')}>
                {siteConfig.sidebarTitle}
            </h1>
          </Link>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-teal-600 dark:hover:text-white transition-colors">
             <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <h2 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
              Menu Utama
            </h2>
            <div className="space-y-1">
              <NavLink 
                to="/" 
                onClick={onClose}
                className={({ isActive }) => cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all group relative",
                    isActive ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "text-slate-400 hover:text-teal-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <Home className="w-5 h-5 mr-3" />
                <span className="font-bold text-sm">Beranda</span>
              </NavLink>

              <NavLink 
                to="/profil" 
                onClick={onClose}
                className={({ isActive }) => cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all group",
                    isActive ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" : "text-slate-400 hover:text-teal-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <CircleUser className="w-5 h-5 mr-3" />
                <span className="font-bold text-sm">Profil</span>
              </NavLink>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
              Kurikulum
            </h2>
            {curriculum.map((section) => {
              const Icon = iconMap[section.icon] || Library;
              const isExpanded = expandedSection === section.id;

              return (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => !section.isLocked && toggleSection(section.id)}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                        section.isLocked 
                          ? "opacity-50 cursor-not-allowed bg-slate-100/50 dark:bg-white/5" 
                          : isExpanded ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-400 hover:text-teal-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className={cn("w-5 h-5 mr-3 transition-colors", section.isLocked ? "text-slate-400" : isExpanded ? "text-teal-500" : "text-slate-500")} />
                      <span className={cn("font-bold text-sm", section.isLocked ? "text-slate-400" : "")}>{section.title}</span>
                    </div>
                    {section.isLocked ? (
            <ShieldCheck className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    ) : (
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isExpanded ? "rotate-180 text-teal-500" : "text-slate-400")} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-white/[0.02] rounded-b-xl border-l border-slate-100 dark:border-white/5 ml-6 mt-1"
                      >
                        {section.topics.map(topic => (
                          <div key={topic.id} className="relative group/side">
                            {topic.isLocked ? (
                              <div className="flex items-center pl-6 pr-4 py-2.5 text-sm transition-all text-slate-400/80 cursor-not-allowed select-none border-l border-slate-100 dark:border-white/5">
                                <ShieldCheck className="w-3 h-3 mr-2 text-slate-300 dark:text-slate-700 shrink-0" />
                                <span className="arabic-sidebar-content opacity-60">{topic.title}</span>
                              </div>
                            ) : (
                              <NavLink
                                to={`/materi/${topic.id}`}
                                onClick={onClose}
                                className={({ isActive }) => cn(
                                    "block pl-6 pr-4 py-2.5 text-sm transition-all relative border-l border-slate-100 dark:border-white/5",
                                    isActive ? "text-teal-600 dark:text-teal-400 font-black border-teal-500 bg-teal-500/5" : "text-slate-500 hover:text-teal-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                                )}
                              >
                                <span className="arabic-sidebar-content">{topic.title}</span>
                              </NavLink>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mb-8">
            <h2 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
              Program Khusus
            </h2>
            {specialPrograms.map((category) => {
              const Icon = iconMap[category.icon] || Star;
              const isExpanded = expandedSection === category.id;

              return (
                <div key={category.id} className="mb-2">
                  <button
                    onClick={() => !category.isLocked && toggleSection(category.id)}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                        category.isLocked 
                          ? "opacity-50 cursor-not-allowed bg-slate-100/50 dark:bg-white/5"
                          : isExpanded ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white" : "text-slate-400 hover:text-teal-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className={cn("w-5 h-5 mr-3 transition-colors", category.isLocked ? "text-slate-400" : isExpanded ? "text-amber-500" : "text-slate-500")} />
                      <span className={cn("font-bold text-sm", category.isLocked ? "text-slate-400" : "")}>{category.title}</span>
                    </div>
                    {category.isLocked ? (
            <ShieldCheck className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    ) : (
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isExpanded ? "rotate-180 text-amber-500" : "text-slate-400")} />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50/50 dark:bg-white/[0.02] rounded-b-xl border-l border-slate-100 dark:border-white/5 ml-6 mt-1"
                      >
                        {category.topics?.map(topic => (
                          <div key={topic.id} className="relative group/side">
                            {topic.isLocked ? (
                              <div className="flex items-center pl-6 pr-4 py-2.5 text-sm transition-all text-slate-400/80 cursor-not-allowed select-none border-l border-slate-100 dark:border-white/5">
                                <ShieldCheck className="w-3 h-3 mr-2 text-slate-300 dark:text-slate-700 shrink-0" />
                                <span className="arabic-sidebar-content opacity-60">{topic.title}</span>
                              </div>
                            ) : (
                              <NavLink
                                key={topic.id}
                                to={`/program/${topic.id}`}
                                onClick={onClose}
                                className={({ isActive }) => cn(
                                    "block pl-6 pr-4 py-2.5 text-sm transition-all relative border-l border-slate-100 dark:border-white/5",
                                    isActive ? "text-amber-600 dark:text-amber-400 font-black border-amber-500 bg-amber-500/5" : "text-slate-500 hover:text-amber-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                                )}
                              >
                                <span className="arabic-sidebar-content">{topic.title}</span>
                              </NavLink>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </nav>
        
        {/* Admin Link (Footer) */}

      </aside>
    </>
  );
};

export default Sidebar;
