import React from 'react';
import { CalendarIcon, ClockIcon, ArmchairIcon, HashIcon, PhoneIcon, FilmIcon, CheckCircleIcon } from './icons.jsx';

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start">
    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-indigo-400">{icon}</div>
    <div className="ml-3">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  </div>
);

const ReceiptPage = ({ bookingDetails, onGoHome, theme }) => {
  const isDark = theme === 'dark';
  const panelClass = isDark ? 'border-white/10 bg-slate-900/80 shadow-black/30' : 'border-slate-200 bg-white/90 shadow-slate-200/60';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const cardClass = isDark ? 'border-white/10 bg-slate-950/70' : 'border-slate-200 bg-slate-50';

  if (!bookingDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-slate-300">No booking details available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center py-4">
      <div className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl ${panelClass}`}>
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/20" />
        <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-fuchsia-500/20" />

        <div className="relative z-10 text-center">
          <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
          <h1 className={`text-3xl font-semibold ${textPrimary}`}>Booking Confirmed!</h1>
          <p className={`mt-2 ${textSecondary}`}>Thank you for your purchase. Your seats are reserved.</p>
        </div>

        <div className={`relative z-10 mt-8 rounded-[1.5rem] border p-6 ${cardClass}`}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={bookingDetails.posterUrl}
              alt={bookingDetails.movieTitle}
              className="h-28 w-20 rounded-xl object-cover shadow-lg"
            />
            <div>
              <h2 className={`text-xl font-semibold ${textPrimary}`}>{bookingDetails.movieTitle}</h2>
              <p className={`mt-1 text-lg font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>${bookingDetails.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-5 border-t border-slate-800 pt-5">
            <DetailItem icon={<CalendarIcon />} label="Date" value={new Date().toLocaleDateString()} />
            <DetailItem icon={<ClockIcon />} label="Showtime" value={bookingDetails.showtime} />
            <DetailItem icon={<ArmchairIcon />} label="Seats" value={bookingDetails.seats.join(', ')} />
            <DetailItem icon={<HashIcon />} label="Total Tickets" value={bookingDetails.seats.length} />
            <DetailItem icon={<PhoneIcon />} label="Contact Number" value={bookingDetails.contactNumber} />
          </div>
        </div>

        <button
          onClick={onGoHome}
          className="relative z-10 mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-semibold text-white transition hover:from-indigo-500 hover:to-fuchsia-500"
          type="button"
        >
          <FilmIcon className="h-5 w-5" />
          Book Another Movie
        </button>
      </div>
    </div>
  );
};

export default ReceiptPage;
