import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from './MovieCard.jsx';
import { FilmIcon, SunIcon, MoonIcon, LogOutIcon } from './icons.jsx';

const HomePage = ({ movies, setSelectedMovie, theme, setTheme }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';
  const surfaceClass = isDark ? 'border-slate-800 bg-slate-950/80 shadow-black/20' : 'border-slate-200 bg-white/80 shadow-slate-200/60';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-300' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputClass = isDark ? 'border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500';
  const pillClass = isDark ? 'border-indigo-400/30 bg-indigo-500/10 text-indigo-200' : 'border-indigo-200 bg-indigo-50 text-indigo-700';

  const handleBookNow = (movie) => {
    setSelectedMovie(movie);
    navigate('/booking');
  };

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) {
      return movies;
    }
    const query = searchQuery.toLowerCase();
    return movies.filter(movie =>
      movie.title?.toLowerCase().includes(query) ||
      movie.description?.toLowerCase().includes(query)
    );
  }, [movies, searchQuery]);

  return (
    <main className={`min-h-screen px-4 py-8 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="mx-auto max-w-7xl space-y-10">
        <header className={`rounded-[2rem] border p-6 shadow-2xl shadow-black/20 backdrop-blur-xl ${isDark ? 'border-white/10 bg-slate-950/80' : 'border-slate-200 bg-white/85'}`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className={`text-sm font-semibold uppercase tracking-[0.35em] ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                Movie booking studio
              </p>
              <h1 className={`mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl ${textPrimary}`}>
                Discover and reserve your next screening.
              </h1>
              <p className={`mt-4 max-w-2xl text-base leading-7 ${textSecondary}`}>
                Explore featured movies, search instantly, and manage your bookings in one polished experience.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-start sm:justify-end">
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`inline-flex items-center justify-center rounded-2xl border px-3 py-2 transition ${isDark ? 'border-slate-700 bg-slate-900 text-yellow-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'}`}
              >
                {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-bookings')}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-700 px-4 py-2 text-white transition hover:bg-slate-600"
              >
                My Bookings
              </button>
            </div>
          </div>
        </header>

        <section className={`rounded-[2rem] border p-6 shadow-2xl sm:p-8 lg:p-10 ${isDark ? 'border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-indigo-950/90 shadow-black/30' : 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-100 shadow-slate-200/60'}`}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${pillClass}`}>
                <FilmIcon className="h-4 w-4" />
                Premium cinema experience
              </div>
              <h2 className={`text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl ${textPrimary}`}>
                Reserve your next premiere in minutes.
              </h2>
              <p className={`mt-4 max-w-xl text-base leading-7 sm:text-lg ${textSecondary}`}>
                Discover hand-picked releases, secure your seats, and enjoy a refined booking flow designed for modern movie lovers.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <div className={`rounded-2xl border p-4 backdrop-blur ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'}`}>
                <div className={`text-2xl font-semibold ${textPrimary}`}>{movies.length}</div>
                <div className={`text-sm ${textMuted}`}>Now Showing</div>
              </div>
              <div className={`rounded-2xl border p-4 backdrop-blur ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'}`}>
                <div className={`text-2xl font-semibold ${textPrimary}`}>24/7</div>
                <div className={`text-sm ${textMuted}`}>Instant Booking</div>
              </div>
              <div className={`rounded-2xl border p-4 backdrop-blur ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/70'}`}>
                <div className={`text-2xl font-semibold ${textPrimary}`}>4.9</div>
                <div className={`text-sm ${textMuted}`}>Guest Rating</div>
              </div>
            </div>
          </div>
        </section>

        <section className={`rounded-[1.5rem] border p-4 shadow-xl backdrop-blur sm:p-6 ${surfaceClass}`}>
          <label className={`mb-2 block text-sm font-medium ${textSecondary}`} htmlFor="movie-search">
            Find a movie
          </label>
          <div className="relative max-w-3xl">
            <input
              id="movie-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title or description..."
              className={`w-full rounded-2xl border py-3 pl-12 pr-4 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${inputClass}`}
            />
            <svg
              className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${textMuted}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className={`text-2xl font-semibold ${textPrimary}`}>Featured Movies</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMovies.length > 0 ? (
              filteredMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onBookNow={() => handleBookNow(movie)}
                  theme={theme}
                />
              ))
            ) : (
              <div className={`col-span-full rounded-[1.5rem] border border-dashed py-16 text-center ${isDark ? 'border-slate-700 bg-slate-900/60' : 'border-slate-300 bg-slate-50'}`}>
                <p className={`text-lg ${textMuted}`}>No movies found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default HomePage;
