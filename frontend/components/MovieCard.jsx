import React, { useState } from 'react';

const MovieCard = ({ movie, onBookNow, theme }) => {
  const [imageError, setImageError] = useState(false);
  const isDark = theme === 'dark';
  const cardClass = isDark ? 'border-slate-800 bg-slate-950/90 shadow-black/30' : 'border-slate-200 bg-white/90 shadow-slate-200/60';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';

  if (!movie) {
    return <div className={`rounded-[1.5rem] border p-4 ${isDark ? 'border-slate-800 bg-slate-950/80 text-slate-300' : 'border-slate-200 bg-white/90 text-slate-700'}`}>No movie data available</div>;
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
      </div>

      <div className="p-4">
        <h3 className={`text-lg font-semibold ${textPrimary} line-clamp-1`}>{movie.title}</h3>
        <p className={`mt-2 text-sm ${textSecondary} line-clamp-2`}>{movie.description}</p>
        
        <button
          onClick={onBookNow}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 font-semibold text-white transition hover:from-indigo-500 hover:to-fuchsia-500"
          type="button"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
