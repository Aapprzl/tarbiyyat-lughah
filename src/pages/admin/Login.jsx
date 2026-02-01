import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import { Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await contentService.login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error(err);
      setError('Login gagal. Periksa email dan password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-muted)] flex items-center justify-center p-4">
      <div className="bg-[var(--color-bg-card)] p-8 rounded-2xl shadow-xl w-full max-w-md border border-[var(--color-border)]">
        <div className="text-center mb-8">
          <div className="bg-[var(--color-primary)] w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-teal-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Admin Login</h1>
          <p className="text-[var(--color-text-muted)]">Masuk untuk mengelola materi.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder-[var(--color-text-muted)]/50"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder-[var(--color-text-muted)]/50"
              placeholder="Masukkan password admin"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] hover:opacity-90 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 hover:shadow-teal-500/30 active:scale-95"
          >
            {loading ? 'Memproses...' : 'Masuk Dashboard'}
          </button>
          
          <div className="text-center text-xs text-[var(--color-text-muted)] mt-4">
             Hubungi administrator jika lupa password.
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
