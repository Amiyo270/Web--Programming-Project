import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ChevronLeftIcon, XIcon } from './icons.jsx';
import { getApiUrl } from '../api.js';

const BookingHistory = ({ onClose, onCancel }) => {
  const [searchContact, setSearchContact] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const API_URL = getApiUrl();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchContact.trim() || !/^\d{10,}$/.test(searchContact.trim())) {
      setError('Please enter a valid contact number (at least 10 digits).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/bookings/search/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contact_number: searchContact }),
      });

      if (!response.ok) throw new Error('Failed to fetch bookings');

      const data = await response.json();
      setBookings(data);
      setSearched(true);

      if (data.length === 0) {
        setError('No bookings found for this contact number.');
      }
    } catch (err) {
      setError(err.message || 'Failed to search bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = (booking) => {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    let y = 60;

    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), 'F');

    pdf.setFontSize(26);
    pdf.setTextColor('#ffffff');
    pdf.text('Cinematic Ticket', margin, y);

    y += 30;
    pdf.setFontSize(14);
    pdf.setTextColor('#94a3b8');
    pdf.text('Booking Confirmation', margin, y);

    y += 30;
    pdf.setDrawColor('#334155');
    pdf.setLineWidth(1);
    pdf.line(margin, y, pageWidth - margin, y);

    const seatsList = Array.isArray(booking.seats) ? booking.seats : JSON.parse(booking.seats);

    y += 30;
    pdf.setFontSize(12);
    pdf.setTextColor('#cbd5e1');
    pdf.text(`Movie: ${booking.title}`, margin, y);
    y += 20;
    pdf.text(`Date: ${new Date(booking.showtime_date).toLocaleDateString()}`, margin, y);
    y += 20;
    pdf.text(`Showtime: ${booking.showtime_time}`, margin, y);
    y += 20;
    pdf.text(`Seats: ${seatsList.join(', ')}`, margin, y);
    y += 20;
    pdf.text(`Total Tickets: ${seatsList.length}`, margin, y);
    y += 20;
    pdf.text(`Amount Paid: $${booking.total_amount.toFixed(2)}`, margin, y);
    y += 20;
    pdf.text(`Contact Number: ${booking.contact_number}`, margin, y);

    y += 30;
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(18);
    pdf.text('Enjoy your movie!', margin, y);

    const fileName = `ticket-${booking.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
    pdf.save(fileName);
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a cancellation reason.');
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/bookings/${cancellingBookingId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contact_number: searchContact,
            reason: cancelReason,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      // Remove cancelled booking from list
      setBookings(bookings.filter((b) => b.id !== cancellingBookingId));
      setShowCancelModal(false);
      setCancellingBookingId(null);
      setCancelReason('');

      if (onCancel) onCancel();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="min-h-screen space-y-6 p-4">
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition"
        type="button"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back
      </button>

      {/* Search Form */}
      <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Your Bookings</h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="tel"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Enter your contact number"
              className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg font-semibold transition"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && !searched && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && searched && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Bookings List */}
      {searched && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{booking.title}</h3>
                  <p className="text-sm text-slate-400">
                    Booking ID: <span className="font-mono">{booking.id}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">
                    ${booking.total_amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-800/30 rounded-lg p-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Date</p>
                  <p className="text-white font-semibold">
                    {new Date(booking.showtime_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Time</p>
                  <p className="text-white font-semibold">{booking.showtime_time}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Seats</p>
                  <p className="text-emerald-400 font-semibold">
                    {Array.isArray(booking.seats)
                      ? booking.seats.join(', ')
                      : JSON.parse(booking.seats).join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                  <p className="text-blue-400 font-semibold capitalize">
                    {booking.booking_status}
                  </p>
                </div>
              </div>

              {booking.booking_status === 'active' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDownloadTicket(booking)}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-semibold"
                  >
                    Download Ticket
                  </button>
                  <button
                    onClick={() => {
                      setCancellingBookingId(booking.id);
                      setShowCancelModal(true);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-semibold"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {searched && bookings.length === 0 && !error && (
        <div className="border border-white/10 bg-slate-900/70 rounded-xl p-12 text-center">
          <p className="text-slate-400">No bookings found for this contact number.</p>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Cancel Booking</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300">
              Are you sure you want to cancel this booking? You will receive a full refund.
            </p>

            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation (optional)"
              className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition font-semibold"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
