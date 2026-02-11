import React, { Suspense, lazy } from 'react';
import { createHashRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import MaterialIndex from './pages/MaterialIndex';
import GameIndex from './pages/GameIndex';
import MaterialDetail from './pages/MaterialDetail';
const Library = lazy(() => import('./pages/Library'));


// Lazy Load Admin Components to improve performance
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
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
import { ToastProvider, ConfirmProvider } from './components/ui/Toast';
import { FontProvider } from './components/providers/FontProvider';
import { ThemeProvider } from './components/providers/ThemeProvider';

import Intro from './components/features/Intro';
import ScrollToTop from './components/ui/ScrollToTop';

// Helper component to wrap routes with ScrollToTop (since RouterProvider doesn't use standard Router wrapper)
const RouterWrapper = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);

function App() {
  const [loading, setLoading] = React.useState(true);
  const [introConfig, setIntroConfig] = React.useState(null);
  const [homeConfig, setHomeConfig] = React.useState(null);
  const [showIntro, setShowIntro] = React.useState(false);

  React.useEffect(() => {
    const initApp = async () => {
      // Remove critical CSS fix after hydration
      const fix = document.getElementById('dark-theme-flash-fix');
      if (fix) fix.remove();

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

  const router = React.useMemo(() => createHashRouter([
    {
      element: <RouterWrapper />,
      children: [
        {
          path: "/",
          element: <Layout />,
          children: [
            { index: true, element: <Home /> },
            { path: "materi", element: <MaterialIndex /> },
            { path: "permainan", element: <GameIndex /> },
            { path: "materi/:topicId", element: <MaterialDetail /> },
            { path: "program/:topicId", element: <MaterialDetail /> },
            { path: "perpustakaan", element: <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-main)] text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat...</div>}><Library /></Suspense> },
            { path: "admin/login", element: <Suspense fallback={null}><LoginPage /></Suspense> },
            {
              path: "admin",
              element: <Suspense fallback={null}><AdminLayout /></Suspense>,
              children: [
                { index: true, element: <Navigate to="dashboard" replace /> },
                { path: "dashboard", element: <AdminDashboard /> },
                { path: "programs", element: <AdminPrograms /> },
                { path: "games", element: <AdminGames /> },
                { path: "home-editor", element: <AdminHomeEditor /> },
                { path: "library-manager", element: <LibraryManager /> },
                { path: "intro-editor", element: <IntroEditor /> },
                { path: "font-editor", element: <FontEditor /> },
                { path: "edit/:topicId", element: <LessonEditor /> },
              ]
            },
          ]
        },
        { path: "*", element: <Navigate to="/" replace /> }
      ]
    }
  ]), []);

  if (loading) {
    const isDark = typeof window !== 'undefined' && localStorage.getItem('arp_theme') === 'dark';
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center z-[10000]"
        style={{ backgroundColor: isDark ? '#131f24' : '#fcfbf9' }}
      >
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
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-main)] text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat...</div>}>
              <RouterProvider router={router} />
            </Suspense>
          </FontProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
