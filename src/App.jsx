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
const CopyrightEditor = lazy(() => import('./pages/admin/CopyrightEditor'));
const LibraryManager = lazy(() => import('./pages/admin/LibraryManager'));
const MigrationTools = lazy(() => import('./pages/admin/MigrationTools'));

import { ToastProvider, ConfirmProvider } from './components/Toast';
import { FontProvider } from './components/FontProvider';
import { ThemeProvider } from './components/ThemeProvider';

import Intro from './components/Intro';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [showIntro, setShowIntro] = React.useState(() => {
    return !sessionStorage.getItem('introShown');
  });

  const handleEnterWebsite = () => {
    sessionStorage.setItem('introShown', 'true');
    setShowIntro(false);
  };

  return (
    <ThemeProvider>
      <ToastProvider>
      <ConfirmProvider>
        <FontProvider>
          {showIntro && <Intro onEnter={handleEnterWebsite} />}
          <Router>
            <ScrollToTop />
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Memuat...</div>}>
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
                    <Route path="db-migration" element={<MigrationTools />} />
                    <Route path="font-editor" element={<FontEditor />} />
                    <Route path="copyright" element={<CopyrightEditor />} />
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
