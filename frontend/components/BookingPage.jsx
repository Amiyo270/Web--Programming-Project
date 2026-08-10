import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SeatStatus } from '../types.js';
import { ChevronLeftIcon, TicketIcon, PhoneIcon, ArmchairIcon } from './icons.jsx';

const SeatComponent = ({ seat, onSelect }) => {
  const getSeatClass = (status) => {
    switch (status) {
      case SeatStatus.Available:
        return 'bg-slate-700/80 hover:bg-indigo-500 cursor-pointer text-slate-300';
      case SeatStatus.Selected:
        return 'bg-emerald-500 cursor-pointer text-white';
      case SeatStatus.Booked:
        return 'bg-slate-900 cursor-not-allowed text-slate-600';
      default:
        return 'bg-slate-700/80';
    }
  };

  return (
    <div
      onClick={() =>
        (seat.status === SeatStatus.Available || seat.status === SeatStatus.Selected)
          ? onSelect(seat.id)
          : null
      }
      className={`flex h-6 w-6 items-center justify-center rounded-t-md border border-white/10 text-xs font-medium transition duration-200 md:h-8 md:w-8 md:text-sm ${getSeatClass(seat.status)}`}
      title={seat.id}
    >
      {seat.status === SeatStatus.Booked ? <ArmchairIcon className="h-4 w-4 opacity-50" /> : seat.id}
    </div>
  );
};

const BookingPage = ({ selectedMovie, setBookingDetails, generateSeats }) => {
  const navigate = useNavigate();
  const [activeShowtime, setActiveShowtime] = useState(null);
  const [seats, setSeats] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  
  const isDark = true;
  const panelClass = 'border-white/10 bg-slate-900/70 shadow-black/20';
  const textPrimary = 'text-white';
  const textSecondary = 'text-slate-400';
  const inputClass = 'border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-400';

  if (!selectedMovie) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-300">No movie selected. Please go back and choose a movie.</p>
      </div>
    );
  }

  const DEFAULT_SHOWTIMES = ["12:00 PM", "04:00 PM", "08:00 PM"];

  const handleShowtimeSelect = (showtime) => {
    setActiveShowtime(showtime);
    const initialSeats = generateSeats(8, 12);
    setSeats(initialSeats);
    setSelectedSeats([]);
    setError('');
  };

  const handleSelectSeat = (seatId) => {
    if (!seats) return;

    const newSeats = seats.map(row => row.map(seat => ({ ...seat })));
    const row = seatId.charCodeAt(0) - 65;
    const col = parseInt(seatId.substring(1), 10) - 1;
    const seat = newSeats[row][col];

    if (seat.status === SeatStatus.Available) {
      seat.status = SeatStatus.Selected;
      setSelectedSeats([...selectedSeats, seat]);
    } else if (seat.status === SeatStatus.Selected) {
      seat.status = SeatStatus.Available;
      setSelectedSeats(selectedSeats.filter(s => s.id !== seatId));
    }
    setSeats(newSeats);
  };

  const totalAmount = selectedSeats.length * (selectedMovie.price || 0);

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }
    if (!contactNumber.trim() || !/^\d{10,}$/.test(contactNumber.trim())) {
      setError('Please enter a valid contact number (at least 10 digits).');
      return;
    }
    if (!activeShowtime) {
      setError('An unexpected error occurred. Please select a showtime again.');
      return;
    }
    setError('');
    
    const bookingDetails = {
      movieId: selectedMovie.id,
      movieTitle: selectedMovie.title,
      posterUrl: selectedMovie.posterUrl,
      showtime: activeShowtime,
      seats: selectedSeats.map(s => s.id),
      totalAmount,
      contactNumber,
    };

    setBookingDetails(bookingDetails);
    navigate('/receipt');
  };

  return (
    <div className="min-h-screen space-y-8 p-4">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition"
        type="button"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back to Movies
      </button>

      <div className={`rounded-[1.5rem] border p-6 shadow-xl ${panelClass}`}>
        <h2 className={`text-2xl font-semibold ${textPrimary} mb-4`}>{selectedMovie.title}</h2>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <img
            src={selectedMovie.posterUrl}
            alt={selectedMovie.title}
            className="rounded-xl object-cover w-full md:col-span-1 h-64"
            onError={(e) => e.target.src = 'https://via.placeholder.com/500x750?text=No+Image'}
          />
          <div className={`md:col-span-2 space-y-4 ${textSecondary}`}>
            <p>{selectedMovie.description}</p>
            <p className={`text-xl font-semibold text-indigo-400`}>Price per seat: ${selectedMovie.price?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className={`${textPrimary} font-semibold mb-4`}>Select Showtime</h3>
          <div className="flex gap-3 flex-wrap">
            {DEFAULT_SHOWTIMES.map((showtime) => (
              <button
                key={showtime}
                onClick={() => handleShowtimeSelect(showtime)}
                className={`px-4 py-2 rounded-lg transition ${
                  activeShowtime === showtime
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
                type="button"
              >
                {showtime}
              </button>
            ))}
          </div>
        </div>

        {seats && activeShowtime && (
          <div className="mt-8">
            <h3 className={`${textPrimary} font-semibold mb-4`}>Select Seats</h3>
            <div className="space-y-2 inline-block">
              {seats.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-2">
                  <span className={`${textSecondary} w-6 text-center`}>{String.fromCharCode(65 + rowIndex)}</span>
                  {row.map((seat) => (
                    <SeatComponent key={seat.id} seat={seat} onSelect={handleSelectSeat} />
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className={`${textSecondary} block mb-2`}>Contact Number</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Enter your contact number"
                  className={`w-full px-4 py-2 rounded-lg border ${inputClass}`}
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className={`${textPrimary} font-semibold`}>
                Selected Seats: {selectedSeats.map(s => s.id).join(', ') || 'None'}
              </div>
              <div className={`${textPrimary} font-semibold text-lg`}>
                Total Amount: ${totalAmount.toFixed(2)}
              </div>

              <button
                onClick={handleBooking}
                className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-400 transition flex items-center justify-center gap-2"
                type="button"
              >
                <TicketIcon className="h-5 w-5" />
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
