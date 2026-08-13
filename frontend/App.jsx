import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage.jsx';
import BookingPageEnhanced from './components/BookingPageEnhanced.jsx';
import CheckoutPage from './components/CheckoutPage.jsx';
import ReceiptPage from './components/ReceiptPage.jsx';
import BookingHistory from './components/BookingHistory.jsx';
import { SeatStatus } from './types.js';
import { FALLBACK_MOVIES } from './constants.js';
import { getApiUrl } from './api.js';

const App = () => {
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
  const [movies, setMovies] = useState(FALLBACK_MOVIES);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('amiyo-latest-booking');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return null;
  });
  
  const [currentBooking, setCurrentBooking] = useState({
    selectedSeats: [],
    showtimeId: null,
    showtimeDate: null,
    showtimeTime: null,
    totalAmount: 0,
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem('amiyo-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (bookingDetails) {
      window.localStorage.setItem('amiyo-latest-booking', JSON.stringify(bookingDetails));
    }
  }, [bookingDetails]);

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

  const fetchMovies = async () => {
    try {
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/api/movies`);
      if (response.ok) {
        const data = await response.json();
        setMovies(data);
      }
    } catch (error) {
      console.log('Backend not available - using fallback movies');
    }
  };

  useEffect(() => {
    fetchMovies();
    // Refresh movies every 10 seconds for real-time updates from admin panel
    const interval = setInterval(fetchMovies, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Routes */}
        <Route
          path="/"
          element={
            <HomePage
              movies={movies}
              setSelectedMovie={setSelectedMovie}
              theme={theme}
              setTheme={setTheme}
            />
          }
        />
        <Route
          path="/booking"
          element={
            selectedMovie ? (
              <BookingPageEnhanced
                selectedMovie={selectedMovie}
                setCurrentBooking={setCurrentBooking}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/checkout"
          element={
            selectedMovie && currentBooking.selectedSeats.length > 0 ? (
              <CheckoutPage
                movieDetails={selectedMovie}
                selectedSeats={currentBooking.selectedSeats}
                showtimeId={currentBooking.showtimeId}
                showtimeDate={currentBooking.showtimeDate}
                showtimeTime={currentBooking.showtimeTime}
                totalAmount={currentBooking.totalAmount}
                setBookingDetails={setBookingDetails}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/receipt"
          element={
            bookingDetails ? (
              <ReceiptPage bookingDetails={bookingDetails} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/my-bookings"
          element={
            <BookingHistory
              onClose={() => window.history.back()}
              onCancel={() => {}}
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;
