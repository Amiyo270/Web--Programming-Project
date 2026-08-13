import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, XIcon, PlusIcon, TrashIcon, EditIcon } from './icons.jsx';
import { getApiUrl } from '../api.js';

const AdminPanel = ({ setAdminToken, adminToken, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [refreshMessage, setRefreshMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef(null);

  // Movie form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    posterUrl: '',
    price: '',
  });
  const [editingMovieId, setEditingMovieId] = useState(null);
  const [showMovieForm, setShowMovieForm] = useState(false);

  // Showtime form state
  const [showtimeForm, setShowtimeForm] = useState({ time: '', movie_id: '' });
  const [showtimesByMovie, setShowtimesByMovie] = useState({});

  const API_URL = getApiUrl();

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStatistics();
    if (activeTab === 'movies') fetchMovies();
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  const loadMovieShowtimes = async (moviesArray) => {
    const showtimeMap = {};
    await Promise.all(
      moviesArray.map(async (movie) => {
        try {
          const response = await fetch(`${API_URL}/api/movies/${movie.id}`);
          if (!response.ok) return;
          const data = await response.json();
          showtimeMap[movie.id] = data.showtimes || [];
        } catch (err) {
          // ignore individual showtime failures
        }
      })
    );
    setShowtimesByMovie(showtimeMap);
  };

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/statistics`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/movies`);
      if (!response.ok) throw new Error('Failed to fetch movies');
      const data = await response.json();
      setMovies(data);
      await loadMovieShowtimes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Movie CRUD Operations
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.posterUrl || !formData.price) {
      setError('All fields are required');
      return;
    }

    try {
      const method = editingMovieId ? 'PUT' : 'POST';
      const url = editingMovieId
        ? `${API_URL}/api/admin/movies/${editingMovieId}`
        : `${API_URL}/api/admin/movies`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) throw new Error('Failed to save movie');

      setFormData({ title: '', description: '', posterUrl: '', price: '' });
      setEditingMovieId(null);
      setShowMovieForm(false);
      setError('');
      fetchMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMovie = async (movieId) => {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/movies/${movieId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) throw new Error('Failed to delete movie');

      fetchMovies();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditMovie = (movie) => {
    setFormData({
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      price: movie.price,
    });
    setEditingMovieId(movie.id);
    setShowMovieForm(true);

    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleAddShowtime = async (movieId, time) => {
    if (!time || !movieId) {
      setError('Please enter a valid showtime.');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/movies/${movieId}/showtimes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ time }),
      });
      if (!response.ok) throw new Error('Failed to add showtime');
      await response.json();
      setShowtimeForm({ time: '', movie_id: '' });
      setError('');
      fetchMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/showtimes/${showtimeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!response.ok) throw new Error('Failed to delete showtime');
      setError('');
      fetchMovies();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">🎬 Admin Dashboard</h1>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
        >
          Logout
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-700">
        {['dashboard', 'movies', 'bookings'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setError('');
              setRefreshMessage('');
            }}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === tab
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-200 hover:text-red-100">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid md:grid-cols-2 gap-6">
          {statistics && (
            <>
              <div className="border border-indigo-500/30 bg-indigo-950/20 rounded-xl p-6">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                  Total Bookings
                </p>
                <p className="text-4xl font-bold text-indigo-400">
                  {statistics.total_bookings}
                </p>
              </div>
              <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-6">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                  Total Revenue
                </p>
                <p className="text-4xl font-bold text-emerald-400">
                  ${statistics.total_revenue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="border border-blue-500/30 bg-blue-950/20 rounded-xl p-6">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                  Today's Bookings
                </p>
                <p className="text-4xl font-bold text-blue-400">
                  {statistics.today_bookings}
                </p>
              </div>
              <div className="border border-purple-500/30 bg-purple-950/20 rounded-xl p-6">
                <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">
                  Today's Revenue
                </p>
                <p className="text-4xl font-bold text-purple-400">
                  ${statistics.today_revenue?.toFixed(2) || '0.00'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Movie Management</h2>
            <button
              onClick={() => {
                setShowMovieForm(!showMovieForm);
                if (showMovieForm) {
                  setFormData({ title: '', description: '', posterUrl: '', price: '' });
                  setEditingMovieId(null);
                }
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Movie
            </button>
          </div>

          {/* Movie Form */}
          {showMovieForm && (
            <div ref={formRef} className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-white">
                {editingMovieId ? 'Edit Movie' : 'Add New Movie'}
              </h3>
              <form onSubmit={handleSaveMovie} className="space-y-4">
                <input
                  type="text"
                  placeholder="Movie Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Poster URL"
                  value={formData.posterUrl}
                  onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                />
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition font-semibold"
                  >
                    Save Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMovieForm(false);
                      setFormData({ title: '', description: '', posterUrl: '', price: '' });
                      setEditingMovieId(null);
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Movies List */}
          <div className="grid md:grid-cols-2 gap-6">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="border border-white/10 bg-slate-900/70 rounded-xl overflow-hidden"
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-48 object-cover"
                  onError={(e) =>
                    (e.target.src = 'https://via.placeholder.com/300x200?text=No+Image')
                  }
                />
                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-white">{movie.title}</h3>
                  <p className="text-sm text-slate-400 line-clamp-2">
                    {movie.description}
                  </p>
                  <p className="text-emerald-400 font-semibold">
                    ${movie.price?.toFixed(2) || '0.00'} per seat
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {(showtimesByMovie[movie.id] || []).map((showtime) => (
                        <div key={showtime.id} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-2 flex items-center gap-2 text-sm text-slate-200">
                          <span>{showtime.time}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteShowtime(showtime.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add showtime (e.g. 10:30 AM)"
                        value={showtimeForm.movie_id === movie.id ? showtimeForm.time : ''}
                        onChange={(e) => setShowtimeForm({ time: e.target.value, movie_id: movie.id })}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                      />
                      <button
                        onClick={() => handleAddShowtime(movie.id, showtimeForm.movie_id === movie.id ? showtimeForm.time : '')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEditMovie(movie)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <EditIcon className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie.id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Recent Bookings</h2>
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-white/10 bg-slate-900/70 rounded-xl p-4 grid md:grid-cols-5 gap-4 items-center"
            >
              <div>
                <p className="text-xs text-slate-500 uppercase">Movie</p>
                <p className="font-semibold text-white">{booking.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Seats</p>
                <p className="text-emerald-400 font-semibold">
                  {Array.isArray(booking.seats)
                    ? booking.seats.join(', ')
                    : JSON.parse(booking.seats || '[]').join(', ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Amount</p>
                <p className="text-lg font-bold text-emerald-400">
                  ${booking.total_amount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Contact</p>
                <p className="font-mono text-white">{booking.contact_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Date</p>
                <p className="text-white">
                  {new Date(booking.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
