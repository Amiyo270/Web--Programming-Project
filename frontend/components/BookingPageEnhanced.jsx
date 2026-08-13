import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SeatSelection from './SeatSelection.jsx';
import { ChevronLeftIcon, CalendarIcon, ClockIcon } from './icons.jsx';
import { getApiUrl } from '../api.js';

const BookingPage = ({ selectedMovie, setCurrentBooking }) => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStep, setShowStep] = useState(1); // Step 1: Date/Showtime, Step 2: Seats, Step 3: Checkout

  const API_URL = getApiUrl();

  useEffect(() => {
    if (selectedMovie) {
      fetchShowtimes();
    }
  }, [selectedMovie]);

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/movies/${selectedMovie.id}`);
      if (!response.ok) throw new Error('Failed to fetch showtimes');
      const data = await response.json();
      setShowtimes(data.showtimes || []);

      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    } catch (err) {
      setError(err.message || 'Failed to load showtimes');
    } finally {
      setLoading(false);
    }
  };

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setShowStep(2);
  };

  const handleSeatsSelect = (seats, amount) => {
    setSelectedSeats(seats);
    setTotalAmount(amount);
  };

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat');
      return;
    }

    setCurrentBooking({
      selectedSeats,
      showtimeId: selectedShowtime.id,
      showtimeDate: selectedDate,
      showtimeTime: selectedShowtime.time,
      totalAmount,
    });

    navigate('/checkout');
  };

  if (!selectedMovie) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-300">No movie selected. Please go back and choose a movie.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-300">Loading booking information...</div>
      </div>
    );
  }

  const getTomorrowDate = (daysOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen space-y-8 p-4 bg-slate-950">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition"
        type="button"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to Movies
      </button>

      {/* Movie Header */}
      <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6">
        <div className="flex gap-6">
          <img
            src={selectedMovie.posterUrl}
            alt={selectedMovie.title}
            className="w-24 h-32 rounded-lg object-cover"
            onError={(e) => (e.target.src = 'https://via.placeholder.com/96x128?text=No+Image')}
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h2>
            <p className="text-slate-300 mb-4">{selectedMovie.description}</p>
            <p className="text-xl font-semibold text-emerald-400">
              ${selectedMovie.price?.toFixed(2) || '0.00'} per seat
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex gap-4 justify-center">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step <= showStep
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-12 h-1 ${
                  step < showStep ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Date and Showtime Selection */}
      {showStep === 1 && (
        <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-6">
          <h3 className="text-2xl font-semibold text-white">Select Date & Showtime</h3>

          {/* Date Selection */}
          <div className="space-y-3">
            <label className="text-slate-300 font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Select Date
            </label>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                const dateStr = getTomorrowDate(offset);
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={offset}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-2 rounded-lg transition text-center text-sm ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold uppercase">
                      {new Date(dateStr).toLocaleDateString('en-US', {
                        weekday: 'short',
                      })}
                    </div>
                    <div className="text-lg font-bold">
                      {new Date(dateStr).getDate()}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Showtime Selection */}
          <div className="space-y-3">
            <label className="text-slate-300 font-semibold flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Select Showtime
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {showtimes.length > 0 ? (
                showtimes.map((showtime) => (
                  <button
                    key={showtime.id}
                    onClick={() => handleShowtimeSelect(showtime)}
                    className={`p-4 rounded-lg transition border-2 ${
                      selectedShowtime?.id === showtime.id
                        ? 'border-indigo-500 bg-indigo-600/20'
                        : 'border-slate-700 bg-slate-800 hover:border-indigo-500'
                    }`}
                  >
                    <p className="text-xl font-bold text-white">{showtime.time}</p>
                  </button>
                ))
              ) : (
                <p className="text-slate-400">No showtimes available for this date</p>
              )}
            </div>
          </div>

          <button
            onClick={() => {
              if (!selectedShowtime) {
                setError('Please select a showtime');
                return;
              }
              setShowStep(2);
            }}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition"
          >
            Next: Select Seats
          </button>
        </div>
      )}

      {/* Step 2: Seat Selection */}
      {showStep === 2 && selectedShowtime && (
        <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">Select Your Seats</h3>
            <p className="text-slate-400">
              {selectedMovie.title} • {formatDate(selectedDate)} • {selectedShowtime.time}
            </p>
          </div>

          <SeatSelection
            showtimeId={selectedShowtime.id}
            selectedDate={selectedDate}
            onSeatsSelect={handleSeatsSelect}
            moviePrice={selectedMovie.price}
          />

          <div className="flex gap-4">
            <button
              onClick={() => setShowStep(1)}
              className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              Back
            </button>
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeats.length === 0}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                selectedSeats.length === 0
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
