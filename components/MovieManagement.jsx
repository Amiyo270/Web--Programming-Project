import React, { useState, useEffect } from 'react';
import { FilmIcon } from './icons.jsx';

const MovieManagement = ({ movies, onMoviesUpdate, onGoBack, theme }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const isDark = theme === 'dark';
  const surfaceClass = isDark ? 'border-slate-800 bg-slate-950/80 shadow-black/20' : 'border-slate-200 bg-white/80 shadow-slate-200/60';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputClass = isDark ? 'border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500';

  const resetForm = () => {
    setFormData({ title: '', description: '', posterUrl: '', price: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (movie) => {
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      posterUrl: movie.posterUrl || '',
      price: movie.price || ''
    });
    setEditingId(movie.id);
    setIsAdding(false);
    setMessage({ type: '', text: '' });
  };

  const handleAdd = () => {
    resetForm();
    setIsAdding(true);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingId) {
        // Update existing movie
        const response = await fetch("http://localhost/cinematic-ticket-booker-backend/updateMovie.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            ...formData,
            price: parseFloat(formData.price)
          })
        });

        const data = await response.json();
        if (data.status === "success") {
          setMessage({ type: "success", text: "Movie updated successfully!" });
          resetForm();
          onMoviesUpdate();
        } else {
          setMessage({ type: "error", text: data.message || "Failed to update movie" });
        }
      } else {
        // Create new movie
        const response = await fetch("http://localhost/cinematic-ticket-booker-backend/createMovie.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: parseFloat(formData.price)
          })
        });

        const data = await response.json();
        if (data.status === "success") {
          setMessage({ type: "success", text: "Movie added successfully!" });
          resetForm();
          onMoviesUpdate();
        } else {
          setMessage({ type: "error", text: data.message || "Failed to add movie" });
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch("http://localhost/cinematic-ticket-booker-backend/deleteMovie.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.status === "success") {
        setMessage({ type: "success", text: "Movie deleted successfully!" });
        onMoviesUpdate();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete movie" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
          <FilmIcon className="w-10 h-10 text-indigo-400" />
          <h1 className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
            Movie Management
          </h1>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleAdd}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-500"
          >
            Add New Movie
          </button>
          <button
            onClick={onGoBack}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </header>

      {message.text && (
        <div className={`mb-6 rounded-lg p-4 ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
          {message.text}
        </div>
      )}

      {(isAdding || editingId) && (
        <div className={`mb-8 rounded-lg border p-6 ${surfaceClass}`}>
          <h2 className={`mb-4 text-xl font-bold ${textPrimary}`}>
            {editingId ? "Edit Movie" : "Add New Movie"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`mb-2 block text-sm font-medium ${textSecondary}`}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${textSecondary}`}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${textSecondary}`}>Poster URL</label>
              <input
                type="url"
                name="posterUrl"
                value={formData.posterUrl}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${textSecondary}`}>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : editingId ? "Update Movie" : "Add Movie"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={`rounded-lg px-6 py-2 transition-colors ${isDark ? 'bg-slate-600 text-white hover:bg-slate-500' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map(movie => (
          <div key={movie.id} className={`overflow-hidden rounded-lg border shadow-lg ${surfaceClass}`}>
            <img
              src={movie.posterUrl || 'https://via.placeholder.com/500x750?text=No+Image'}
              alt={movie.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h3 className={`mb-2 text-xl font-bold ${textPrimary}`}>{movie.title}</h3>
              <p className={`mb-2 text-sm line-clamp-2 ${textMuted}`}>{movie.description}</p>
              <p className={`mb-4 font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>${parseFloat(movie.price || 0).toFixed(2)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(movie)}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(movie.id)}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieManagement;
