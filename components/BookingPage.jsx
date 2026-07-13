import React, { useState } from 'react';
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

const BookingPage = ({ movie, onConfirmBooking, onGoBack, theme }) => {
  const [activeShowtime, setActiveShowtime] = useState(null);
  const [seats, setSeats] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const isDark = theme === 'dark';
  const panelClass = isDark ? 'border-white/10 bg-slate-900/70 shadow-black/20' : 'border-slate-200 bg-white/80 shadow-slate-200/60';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const textMuted = isDark ? 'text-slate-300' : 'text-slate-700';
  const inputClass = isDark ? 'border-slate-700 bg-slate-800/80 text-white placeholder:text-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500';

  const handleShowtimeSelect = (showtime) => {
    setActiveShowtime(showtime);
    const initialSeats = showtime.seats.map(row => row.map(seat => ({ ...seat })));
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

  const totalAmount = selectedSeats.length * (movie.price || 0);

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
      movieId: movie.id,
      movieTitle: movie.title,
      posterUrl: movie.posterUrl,
      showtime: activeShowtime.time,
      seats: selectedSeats.map(s => s.id),
      totalAmount,
      contactNumber,
    };

    onConfirmBooking(bookingDetails);
  };

  return (
    <div className="flex min-h-full flex-col gap-6">
      <header className={`rounded-[1.5rem] border p-5 shadow-xl backdrop-blur ${panelClass}`}>
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onGoBack}
            className={`rounded-full border p-2 transition ${isDark ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500 hover:bg-slate-700' : 'border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200'}`}
            type="button"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h1 className={`text-2xl font-semibold ${textPrimary}`}>{movie.title}</h1>
            {activeShowtime && <p className={`text-sm ${textSecondary}`}>{activeShowtime.time}</p>}
          </div>
          <div className="w-10" />
        </div>
      </header>

      {!activeShowtime ? (
        <div className={`flex flex-1 flex-col items-center justify-center rounded-[1.75rem] border p-8 shadow-xl ${panelClass}`}>
          <div className="mb-6 max-w-xl text-center">
            <p className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>Step 1</p>
            <h2 className={`text-3xl font-semibold ${textPrimary}`}>Choose a showtime</h2>
            <p className={`mt-3 ${textSecondary}`}>Pick the experience that fits your schedule and continue to seat selection.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {movie.showtimes.map(st => (
              <button
                key={st.time}
                onClick={() => handleShowtimeSelect(st)}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:translate-y-[-2px]"
                type="button"
              >
                {st.time}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className={`flex-1 rounded-[1.75rem] border p-6 shadow-xl ${panelClass}`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>Step 2</p>
                <h2 className={`text-2xl font-semibold ${textPrimary}`}>Select your seats</h2>
              </div>
              <button
                onClick={() => setActiveShowtime(null)}
                className={`text-sm font-medium transition ${isDark ? 'text-indigo-300 hover:text-indigo-200' : 'text-indigo-600 hover:text-indigo-700'}`}
                type="button"
              >
                Change Showtime
              </button>
            </div>

            <div className={`mb-5 rounded-3xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-slate-50'}`}>
              <div className="mb-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
              <div className={`text-center text-sm font-semibold uppercase tracking-[0.35em] ${textSecondary}`}>Screen</div>
            </div>

            {seats && (
              <div className="mx-auto flex max-w-2xl justify-center">
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${seats[0].length}, minmax(0, 1fr))` }}
                >
                  {seats.flat().map(seat => (
                    <SeatComponent key={seat.id} seat={seat} onSelect={handleSelectSeat} />
                  ))}
                </div>
              </div>
            )}

            <div className={`mt-8 flex flex-wrap justify-center gap-4 text-sm ${textSecondary}`}>
              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-t-sm bg-slate-700/80" />Available</div>
              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-t-sm bg-emerald-500" />Selected</div>
              <div className="flex items-center gap-2"><div className="h-4 w-4 rounded-t-sm bg-slate-900" />Booked</div>
            </div>
          </div>

          <aside className={`w-full rounded-[1.75rem] border p-6 shadow-xl lg:w-[340px] ${panelClass}`}>
            <h2 className={`mb-4 border-b pb-3 text-xl font-semibold ${textPrimary} ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>Booking Summary</h2>
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm font-semibold uppercase tracking-[0.25em] ${textSecondary}`}>Selected Seats</h3>
                <p className={`mt-1 break-words font-mono text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                  {selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(', ') : 'None yet'}
                </p>
              </div>
              <div>
                <h3 className={`text-sm font-semibold uppercase tracking-[0.25em] ${textSecondary}`}>Total</h3>
                <p className="mt-1 text-3xl font-semibold text-emerald-500">${totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <label htmlFor="contact" className={`mb-2 flex items-center gap-2 text-sm font-semibold ${textMuted}`}>
                  <PhoneIcon className="h-4 w-4" />Contact Number
                </label>
                <input
                  type="tel"
                  id="contact"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className={`mt-1 w-full rounded-2xl border px-3 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${inputClass}`}
                  placeholder="e.g., 1234567890"
                />
              </div>
            </div>
            {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
            <button
              onClick={handleBooking}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
              disabled={selectedSeats.length === 0 || !contactNumber}
              type="button"
            >
              <TicketIcon className="h-5 w-5" />
              Confirm Booking
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
