import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, CheckCircleIcon } from './icons.jsx';

const CheckoutPage = ({
  movieDetails,
  selectedSeats,
  showtimeId,
  showtimeDate,
  showtimeTime,
  totalAmount,
  setBookingDetails,
}) => {
  const navigate = useNavigate();
  const [contactNumber, setContactNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const validateForm = () => {
    if (!contactNumber.trim() || !/^\d{10,}$/.test(contactNumber.trim())) {
      setError('Please enter a valid contact number (at least 10 digits).');
      return false;
    }
    if (!customerName.trim()) {
      setError('Please enter your name.');
      return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions.');
      return false;
    }
    return true;
  };

  const handleConfirmBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_id: movieDetails.id,
          showtime_id: showtimeId,
          showtime_date: showtimeDate,
          showtime_time: showtimeTime,
          seats: selectedSeats,
          total_amount: totalAmount,
          contact_number: contactNumber,
          email: email || null,
          customer_name: customerName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const bookingData = await response.json();

      setBookingDetails({
        id: bookingData.id,
        movieTitle: movieDetails.title,
        posterUrl: movieDetails.posterUrl,
        showtime: showtimeTime,
        showtimeDate,
        seats: selectedSeats,
        totalAmount,
        contactNumber,
        email,
        customerName,
        createdAt: new Date().toISOString(),
      });

      // Navigate to receipt page
      navigate('/receipt');
    } catch (err) {
      setError(err.message || 'Failed to process booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition"
        type="button"
      >
        <ChevronLeftIcon className="h-5 w-5" />
        Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Booking Summary - Left Side */}
        <div className="md:col-span-2 space-y-6">
          {/* Movie Details */}
          <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-4">
            <h2 className="text-2xl font-bold text-white">Booking Summary</h2>

            <div className="grid grid-cols-3 gap-4">
              <img
                src={movieDetails.posterUrl}
                alt={movieDetails.title}
                className="col-span-1 rounded-lg object-cover h-32"
                onError={(e) =>
                  (e.target.src = 'https://via.placeholder.com/100x150?text=No+Image')
                }
              />
              <div className="col-span-2 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Movie</p>
                <p className="text-lg font-semibold text-white">{movieDetails.title}</p>
                <p className="text-sm text-slate-400">{movieDetails.description}</p>
              </div>
            </div>
          </div>

          {/* Show Details */}
          <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-4">
            <h3 className="text-xl font-semibold text-white">Show Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Date
                </p>
                <p className="text-lg font-semibold text-white">
                  {new Date(showtimeDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                  Time
                </p>
                <p className="text-lg font-semibold text-white">{showtimeTime}</p>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Selected Seats
              </p>
              <p className="text-emerald-400 font-semibold text-lg">
                {selectedSeats.join(', ')}
              </p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-3">
            <h3 className="text-xl font-semibold text-white">Price Breakdown</h3>

            <div className="space-y-2 border-b border-slate-700 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-400">
                  {selectedSeats.length} × ${movieDetails.price?.toFixed(2) || '0.00'}
                </span>
                <span className="text-white font-semibold">
                  ${(selectedSeats.length * movieDetails.price).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <span className="text-slate-300 font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Form - Right Side */}
        <div className="space-y-6">
          <div className="border border-white/10 bg-slate-900/70 rounded-xl p-6 space-y-4 sticky top-4">
            <h3 className="text-xl font-semibold text-white">Your Details</h3>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">Full Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Enter 10+ digit number"
                className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Terms Agreement */}
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-xs text-slate-400">
                  I agree to the terms and conditions and cancellation policy
                </span>
              </label>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={loading || !agreeTerms}
              className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                loading || !agreeTerms
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Confirm & Pay
                </>
              )}
            </button>

            {/* Payment Info */}
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
              <p className="text-xs text-blue-300 text-center">
                ✓ Secure Payment Processing<br />
                ✓ 100% Safe & Secure<br />
                ✓ Instant Confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
