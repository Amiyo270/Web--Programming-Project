import React, { useState } from 'react';
import MovieForm from './MovieForm.jsx';

const MovieCard = ({ movie, onBookNow, onEdit, onDelete, theme }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isDark = theme === 'dark';
  const cardClass = isDark ? 'border-slate-800 bg-slate-950/90 shadow-black/30' : 'border-slate-200 bg-white/90 shadow-slate-200/60';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  if (!movie) {
    return <div className={`rounded-[1.5rem] border p-4 ${isDark ? 'border-slate-800 bg-slate-950/80 text-slate-300' : 'border-slate-200 bg-white/90 text-slate-700'}`}>No movie data available</div>;
  }

  const handleEdit = async (updatedData) => {
    if (!movie || !movie.id) {
      alert('Invalid movie data. Cannot edit.');
      return;
    }
    try {
      const result = await onEdit(movie.id, updatedData);
      if (result && result.success) {
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Error updating movie:', error);
      alert('Failed to update movie. Please check the console for details.');
    }
  };

  const handleDelete = () => {
    if (!movie || !movie.id) {
      alert('Invalid movie data. Cannot delete.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete "${movie.title || 'this movie'}"?`)) {
      onDelete(movie.id);
    }
  };

  if (showEditForm) {
    return (
      <div className={`rounded-[1.5rem] border p-4 shadow-xl ${isDark ? 'border-slate-800 bg-slate-950/95 shadow-indigo-500/10' : 'border-indigo-200 bg-white/95 shadow-indigo-100'}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${textPrimary}`}>Edit Movie: {movie?.title || 'Untitled'}</h3>
          <button
            onClick={() => setShowEditForm(false)}
            className={`cursor-pointer text-xl transition ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            title="Close"
            type="button"
          >
            ×
          </button>
        </div>
        <MovieForm
          key={movie.id}
          movie={movie}
          theme={theme}
          onSubmit={handleEdit}
          onCancel={() => setShowEditForm(false)}
        />
      </div>
    );
  }

  return (
    <div className={`group overflow-hidden rounded-[1.5rem] border shadow-2xl transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40 ${cardClass}`}>
      <div className="relative">
        <img
          src={imageError || !movie?.posterUrl ? 'https://via.placeholder.com/500x750?text=No+Image' : (movie.posterUrl || '').trim()}
          alt={movie?.title || 'Movie Poster'}
          className="h-80 w-full object-cover transition duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className={`absolute left-4 top-4 rounded-full border px-3 py-1 text-sm font-semibold backdrop-blur ${isDark ? 'border-white/15 bg-slate-950/70 text-indigo-200' : 'border-slate-200 bg-white/80 text-indigo-700'}`}>
          ${movie?.price ? movie.price.toFixed(2) : '0.00'}
        </div>

        {onEdit && onDelete && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEditForm(true);
              }}
              className="rounded-lg bg-blue-600/90 p-2 text-white shadow-lg transition hover:bg-blue-500"
              title="Edit Movie"
              type="button"
              aria-label="Edit Movie"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              className="rounded-lg bg-rose-600/90 p-2 text-white shadow-lg transition hover:bg-rose-500"
              title="Delete Movie"
              type="button"
              aria-label="Delete Movie"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className={`text-xl font-semibold ${textPrimary}`}>{movie?.title || 'Untitled Movie'}</h3>
          <p className={`mt-2 line-clamp-3 text-sm leading-6 ${textSecondary}`}>
            {movie?.description || 'No description available.'}
          </p>
        </div>

        <button
          onClick={() => onBookNow(movie)}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-semibold text-white transition hover:from-indigo-500 hover:to-fuchsia-500"
          type="button"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
