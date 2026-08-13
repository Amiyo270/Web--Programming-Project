import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FilmIcon, LogOutIcon } from './icons.jsx';
import { getApiUrl } from '../api.js';

const MovieForm = ({ movie = null, onSubmit, onCancel, theme, isLoading }) => {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    description: movie?.description || '',
    posterUrl: movie?.posterUrl || '',
    price: movie?.price || 0,
  });

  useEffect(() => {
    if (movie && movie.id) {
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        posterUrl: (movie.posterUrl || '').trim(),
        price: movie.price ? parseFloat(movie.price) : 0,
      });
    }
  }, [movie]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      title: (formData.title || '').trim(),
      description: (formData.description || '').trim(),
      posterUrl: (formData.posterUrl || '').trim(),
      price: parseFloat(formData.price) || 0,
    };

    if (!submitData.title || !submitData.description || !submitData.posterUrl) {
      alert('Please fill all required fields');
      return;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows="3"
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Poster URL *</label>
        <input
          type="url"
          value={formData.posterUrl}
          onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Price ($) *</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>
      <div className="flex gap-2 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (movie ? 'Update' : 'Add')} Movie
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const AdminDashboard = ({ token, onLogout, movies, setMovies }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_URL = getApiUrl();

  const handleAddMovie = async (formData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/admin/movies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMovies([...movies, { id: data.id, ...formData }]);
        setSuccess('Movie added successfully!');
        setShowForm(false);
      } else {
        setError(data.error || 'Failed to add movie');
      }
    } catch (err) {
      console.error('Error adding movie:', err);
      setError('Failed to add movie. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMovie = async (formData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/admin/movies/${editingMovie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMovies(movies.map(m => m.id === editingMovie.id ? { id: editingMovie.id, ...formData } : m));
        setSuccess('Movie updated successfully!');
        setEditingMovie(null);
        setShowForm(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update movie');
      }
    } catch (err) {
      console.error('Error updating movie:', err);
      setError('Failed to update movie. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/admin/movies/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setMovies(movies.filter(m => m.id !== movieId));
        setSuccess('Movie deleted successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete movie');
      }
    } catch (err) {
      console.error('Error deleting movie:', err);
      setError('Failed to delete movie. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FilmIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
          type="button"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-200">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add/Edit Movie Form */}
        <div className="lg:col-span-1">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">
              {showForm ? (editingMovie ? 'Edit Movie' : 'Add New Movie') : 'Movie Management'}
            </h2>

            {showForm ? (
              <MovieForm
                movie={editingMovie}
                onSubmit={editingMovie ? handleUpdateMovie : handleAddMovie}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMovie(null);
                }}
                isLoading={isLoading}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-500 transition"
                type="button"
              >
                + Add New Movie
              </button>
            )}
          </div>
        </div>

        {/* Movies List */}
        <div className="lg:col-span-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-6">Current Movies ({movies.length})</h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {movies.length > 0 ? (
                movies.map(movie => (
                  <div key={movie.id} className="flex gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-indigo-500 transition">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-16 h-24 rounded object-cover"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/64x96?text=No+Image'}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{movie.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{movie.description}</p>
                      <p className="text-indigo-400 font-semibold mt-1">${movie.price?.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMovie(movie);
                          setShowForm(true);
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition"
                        type="button"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMovie(movie.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
                        type="button"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No movies yet. Add your first movie!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = ({ token, onLogout, movies, setMovies }) => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/admin/dashboard" />}
      />
      <Route
        path="/dashboard"
        element={<AdminDashboard token={token} onLogout={onLogout} movies={movies} setMovies={setMovies} />}
      />
    </Routes>
  );
};

export default AdminPanel;
