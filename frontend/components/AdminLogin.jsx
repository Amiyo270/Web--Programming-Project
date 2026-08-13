import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilmIcon } from './icons.jsx';
import { getApiUrl } from '../api.js';

const AdminLogin = ({ setAdminToken }) => {
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = getApiUrl();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : null;

      if (response.ok && data?.token) {
        localStorage.setItem('admin_token', data.token);
        setAdminToken(data.token);
        navigate('/dashboard');
      } else if (data?.error) {
        setError(data.error);
      } else if (response.status === 404) {
        setError(`Backend API not found at ${API_URL}. Check Railway deployment and VITE_API_URL on Vercel.`);
      } else {
        setError(`Server error (${response.status}). Verify the backend is running on Railway.`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Failed to connect to ${API_URL}. Check VITE_API_URL includes https:// and Railway is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FilmIcon className="h-8 w-8 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">Cinematic</h1>
            </div>
            <p className="text-slate-400">Admin Panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="secret-code" className="block text-sm font-medium text-slate-300 mb-2">
                Secret Code
              </label>
              <input
                id="secure-admin-entry"
                name="secure-admin-entry"
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="Enter admin secret code"
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                disabled={loading}
                required
                autoComplete="new-password"
                data-lpignore="true"
                data-1p-ignore="true"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-semibold py-3 rounded-lg hover:from-indigo-500 hover:to-fuchsia-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login to Admin Panel'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Only authorized admins can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
