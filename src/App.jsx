import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MaterialIndex from './pages/MaterialIndex';
import GameIndex from './pages/GameIndex';
import MaterialDetail from './pages/MaterialDetail';
const Library = lazy(() => import('./pages/Library'));


// Lazy Load Admin Components to improve performance
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const LoginPage = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminPrograms = lazy(() => import('./pages/admin/Programs'));
const AdminGames = lazy(() => import('./pages/admin/Games'));
const AdminHomeEditor = lazy(() => import('./pages/admin/HomeEditor'));
const LessonEditor = lazy(() => import('./pages/admin/LessonEditor'));
const FontEditor = lazy(() => import('./pages/admin/FontEditor'));
const LibraryManager = lazy(() => import('./pages/admin/LibraryManager'));
const IntroEditor = lazy(() => import('./pages/admin/IntroEditor'));

import { contentService } from './services/contentService';
import { ToastProvider, ConfirmProvider } from './components/Toast';
import { FontProvider } from './components/FontProvider';
import { ThemeProvider } from './components/ThemeProvider';

import Intro from './components/Intro';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [loading, setLoading] = React.useState(true);
  const [introConfig, setIntroConfig] = React.useState(null);
  const [homeConfig, setHomeConfig] = React.useState(null);
  const [showIntro, setShowIntro] = React.useState(false);

  React.useEffect(() => {
    const initApp = async () => {
      try {
        const [config, hConfig] = await Promise.all([
          contentService.getIntroConfig(),
          contentService.getHomeConfig()
        ]);
        
        setIntroConfig(config);
        setHomeConfig(hConfig);
        
        const introShown = sessionStorage.getItem('introShown');
        if (config.intro_active && !introShown) {
          setShowIntro(true);
        }
      } catch (err) {
        console.error("Failed to init app config:", err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const handleEnterWebsite = () => {
    sessionStorage.setItem('introShown', 'true');
    setShowIntro(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg-main)] z-[10000]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
      <ConfirmProvider>
        <FontProvider>
          {showIntro && <Intro onEnter={handleEnterWebsite} config={introConfig} homeConfig={homeConfig} />}
          <Router>
            <ScrollToTop />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-main)] text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="materi" element={<MaterialIndex />} />
                  <Route path="permainan" element={<GameIndex />} /> {/* Added public route for games */}
                  <Route path="materi/:topicId" element={<MaterialDetail />} />
                  <Route path="program/:topicId" element={<MaterialDetail />} />
                  <Route path="perpustakaan" element={<Library />} />

                  {/* Admin Routes Integrated */}
                  <Route path="admin/login" element={<LoginPage />} />
                  <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="programs" element={<AdminPrograms />} />
                    <Route path="games" element={<AdminGames />} /> {/* Added admin route for games */}
                    <Route path="home-editor" element={<AdminHomeEditor />} />
                    <Route path="library-manager" element={<LibraryManager />} />
                    <Route path="intro-editor" element={<IntroEditor />} />
                    <Route path="font-editor" element={<FontEditor />} />
                    <Route path="edit/:topicId" element={<LessonEditor />} />
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </FontProvider>
      </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
