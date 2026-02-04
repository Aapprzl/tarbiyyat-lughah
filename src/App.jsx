import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MaterialIndex from './pages/MaterialIndex';
import MaterialDetail from './pages/MaterialDetail';
import Profile from './pages/Profile';
import About from './pages/About';

// Lazy Load Admin Components to improve performance
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const LoginPage = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminPrograms = lazy(() => import('./pages/admin/Programs'));
const AdminHomeEditor = lazy(() => import('./pages/admin/HomeEditor'));
const AdminAboutEditor = lazy(() => import('./pages/admin/AboutEditor'));
const LessonEditor = lazy(() => import('./pages/admin/LessonEditor'));
const FontEditor = lazy(() => import('./pages/admin/FontEditor'));
const CopyrightEditor = lazy(() => import('./pages/admin/CopyrightEditor'));
const ProfileEditor = lazy(() => import('./pages/admin/ProfileEditor'));
const MigrationTools = lazy(() => import('./pages/admin/MigrationTools'));

import { ToastProvider, ConfirmProvider } from './components/Toast';
import { FontProvider } from './components/FontProvider';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
      <ConfirmProvider>
        <FontProvider>
          <Router>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Memuat...</div>}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="about" element={<About />} />
                  <Route path="materi" element={<MaterialIndex />} />
                  <Route path="materi/:topicId" element={<MaterialDetail />} />
                  <Route path="program/:topicId" element={<MaterialDetail />} />
                  <Route path="profil" element={<Profile />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="programs" element={<AdminPrograms />} />
                  <Route path="home-editor" element={<AdminHomeEditor />} />
                  <Route path="about-cms" element={<AdminAboutEditor />} />
                  <Route path="profile-editor" element={<ProfileEditor />} />
                  <Route path="db-migration" element={<MigrationTools />} />
                  <Route path="font-editor" element={<FontEditor />} />
                  <Route path="copyright" element={<CopyrightEditor />} />
                  <Route path="edit/:topicId" element={<LessonEditor />} />
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
