import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MaterialIndex from './pages/MaterialIndex';
import MaterialDetail from './pages/MaterialDetail';
import Profile from './pages/Profile';

import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminPrograms from './pages/admin/Programs';
import AdminHomeEditor from './pages/admin/HomeEditor';
import AdminAboutEditor from './pages/admin/AboutEditor';
import LessonEditor from './pages/admin/LessonEditor';
import FontEditor from './pages/admin/FontEditor';
import CopyrightEditor from './pages/admin/CopyrightEditor';
import ProfileEditor from './pages/admin/ProfileEditor';
import MigrationTools from './pages/admin/MigrationTools'; // New Import
import About from './pages/About';

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
                <Route path="db-migration" element={<MigrationTools />} /> {/* New Route */}
                <Route path="font-editor" element={<FontEditor />} />
                {/* Copyright Route */}
                <Route path="copyright" element={<CopyrightEditor />} />
                <Route path="edit/:topicId" element={<LessonEditor />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </FontProvider>
      </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
