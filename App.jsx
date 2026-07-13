import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage.jsx';
import BookingPage from './components/BookingPage.jsx';
import ReceiptPage from './components/ReceiptPage.jsx';
import MovieManagement from './components/MovieManagement.jsx';
import { SeatStatus } from './types.js';
import { FALLBACK_MOVIES } from './constants.js';

const App = () => {
  const [view, setView] = useState('home');
  const [movies, setMovies] = useState(FALLBACK_MOVIES);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('amiyo-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('amiyo-theme', theme);
  }, [theme]);

  const DEFAULT_SHOWTIMES = ["12:00 PM", "04:00 PM", "08:00 PM"]; // Bangladesh Time (UTC+6)

  const generateSeats = (rows = 8, cols = 12) => {
    const seats = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      const rowLetter = String.fromCharCode(65 + i);
      for (let j = 0; j < cols; j++) {
        const isBooked = Math.random() < 0.2;
        row.push({
          id: `${rowLetter}${j + 1}`,
          status: isBooked ? SeatStatus.Booked : SeatStatus.Available,
        });
      }
      seats.push(row);
    }
    return seats;
  };

  const fetchMovies = () => {
    fetch("http://localhost/cinematic-ticket-booker-backend/getMovies.php")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && Array.isArray(data.data)) {
          const mappedMovies = data.data.map(m => ({
            id: parseInt(m.id),
            title: m.title || "Untitled Movie",
            description: m.description || "No description available.",
            posterUrl: (m.posterUrl || "https://via.placeholder.com/500x750?text=No+Image").trim(),
            price: m.price ? parseFloat(m.price) : 12.50,
            showtimes: DEFAULT_SHOWTIMES.map(time => ({
              time,
              seats: generateSeats()
            }))
          }));
          setMovies(mappedMovies);
        }
      })
      .catch(err => {
        console.error("Error fetching movies:", err);
      });
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setView('booking');
  };

  const handleAddMovie = async (movieData) => {
    try {
      const response = await fetch("http://localhost/cinematic-ticket-booker-backend/createMovie.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movieData)
      });

      const data = await response.json();
      if (data.status === "success") {
        fetchMovies();
      } else {
        alert(`Failed to add movie: ${data.message}`);
      }
    } catch (error) {
      console.error("Error adding movie:", error);
      alert("Error adding movie. Please try again.");
    }
  };

  const handleEditMovie = async (movieId, movieData) => {
    try {
      const response = await fetch("http://localhost/cinematic-ticket-booker-backend/updateMovie.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: movieId,
          ...movieData
        })
      });

      const data = await response.json();
      if (data.status === "success") {
        await fetchMovies();
        return { success: true };
      } else {
        alert(`Failed to update movie: ${data.message}`);
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error("Error updating movie:", error);
      alert("Error updating movie. Please try again.");
      return { success: false, error: error.message };
    }
  };

  const handleDeleteMovie = async (movieId) => {
    try {
      const response = await fetch("http://localhost/cinematic-ticket-booker-backend/deleteMovie.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: movieId })
      });

      const data = await response.json();
      if (data.status === "success") {
        fetchMovies();
      } else {
        alert(`Failed to delete movie: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting movie:", error);
      alert("Error deleting movie. Please try again.");
    }
  };

  const handleConfirmBooking = async (details) => {
    try {
      const response = await fetch("http://localhost/cinematic-ticket-booker-backend/bookSeats.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: details.movieId,
          showtime: details.showtime,
          seats: details.seats,
          totalAmount: details.totalAmount,
          contactNumber: details.contactNumber,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        setBookingDetails({
          bookingId: data.bookingId,
          movieTitle: details.movieTitle,
          posterUrl: details.posterUrl,
          showtime: details.showtime,
          seats: details.seats,
          totalAmount: details.totalAmount,
          contactNumber: details.contactNumber,
        });
        setView("receipt");
      } else {
        console.error("Booking failed:", data.message);
        alert(`Booking failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error booking seats:", error);
      alert("Error booking seats. Please try again.");
    }
  };

  const handleGoHome = () => {
    setSelectedMovie(null);
    setBookingDetails(null);
    setView('home');
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const renderView = () => {
    switch (view) {
      case 'booking':
        return selectedMovie && (
          <BookingPage
            movie={selectedMovie}
            onConfirmBooking={handleConfirmBooking}
            onGoBack={handleGoHome}
            theme={theme}
          />
        );
      case 'receipt':
        return bookingDetails && (
          <ReceiptPage bookingDetails={bookingDetails} onGoHome={handleGoHome} theme={theme} />
        );
      case 'management':
        return (
          <MovieManagement
            movies={movies}
            onMoviesUpdate={fetchMovies}
            onGoBack={handleGoHome}
            theme={theme}
          />
        );
      default:
        return movies.length === 0
          ? <p className="text-center mt-10 text-slate-300">Loading movies...</p>
          : <HomePage
              movies={movies}
              onSelectMovie={handleSelectMovie}
              onAddMovie={handleAddMovie}
              onEditMovie={handleEditMovie}
              onDeleteMovie={handleDeleteMovie}
              theme={theme}
            />;
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100' : 'bg-gradient-to-br from-slate-100 via-white to-indigo-50 text-slate-900'}`}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className={`mb-6 rounded-[1.75rem] border px-4 py-4 shadow-2xl backdrop-blur-xl sm:px-6 ${theme === 'dark' ? 'border-white/10 bg-slate-900/70 shadow-black/30' : 'border-slate-200 bg-white/80 shadow-slate-200/60'}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-3 text-left"
              type="button"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-lg font-semibold shadow-lg shadow-indigo-500/20">
                A
              </div>
              <div>
                <p className={`text-sm font-medium uppercase tracking-[0.28em] ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>Amiyo Theatre</p>
                <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Premium Movie Booking</h1>
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${theme === 'dark' ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-500 hover:bg-slate-700/80' : 'border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200'}`}
                type="button"
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              {view === 'home' ? (
                <button
                  onClick={() => setView('management')}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${theme === 'dark' ? 'border-indigo-400/40 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20' : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  type="button"
                >
                  Manage Movies
                </button>
              ) : (
                <button
                  onClick={handleGoHome}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${theme === 'dark' ? 'border-slate-700 bg-slate-800/70 text-slate-200 hover:border-slate-500 hover:bg-slate-700/80' : 'border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200'}`}
                  type="button"
                >
                  {view === 'management' ? 'Back to Home' : 'Go Home'}
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">{renderView()}</main>
      </div>
    </div>
  );
};

export default App;
