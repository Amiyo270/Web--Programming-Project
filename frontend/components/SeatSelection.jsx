import React, { useState, useEffect } from 'react';
import { ArmchairIcon } from './icons.jsx';
import { getApiUrl } from '../api.js';

const SeatSelection = ({ showtimeId, selectedDate, onSeatsSelect, moviePrice }) => {
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  const API_URL = getApiUrl();

  useEffect(() => {
    fetchSeatAvailability();
  }, [showtimeId, selectedDate]);

  useEffect(() => {
    setTotalPrice(selectedSeats.length * moviePrice);
    onSeatsSelect(selectedSeats, selectedSeats.length * moviePrice);
  }, [selectedSeats, moviePrice, onSeatsSelect]);

  const fetchSeatAvailability = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${API_URL}/api/seats/availability/${showtimeId}/${selectedDate}`
      );
      if (!response.ok) throw new Error('Failed to fetch seats');
      const data = await response.json();
      
      // Group seats by row
      const seatsByRow = {};
      data.forEach((seat) => {
        const row = seat.seat_number.charAt(0);
        if (!seatsByRow[row]) {
          seatsByRow[row] = [];
        }
        seatsByRow[row].push(seat);
      });

      setSeats(seatsByRow);
    } catch (err) {
      setError(err.message || 'Failed to load seat availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatStatus = (seatData) => {
    if (selectedSeats.includes(seatData.seat_number)) return 'selected';
    return seatData.status;
  };

  const getSeatColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-slate-700 hover:bg-indigo-500 cursor-pointer border-slate-600';
      case 'selected':
        return 'bg-emerald-500 cursor-pointer border-emerald-400';
      case 'booked':
        return 'bg-slate-900 cursor-not-allowed border-slate-800 opacity-50';
      case 'on_hold':
        return 'bg-yellow-600 cursor-not-allowed border-yellow-500';
      default:
        return 'bg-slate-700 border-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Loading seat availability...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"></div>
          <span className="text-sm text-slate-400">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-emerald-500 border border-emerald-400 rounded"></div>
          <span className="text-sm text-slate-400">Selected</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-slate-900 border border-slate-800 rounded opacity-50"></div>
          <span className="text-sm text-slate-400">Booked</span>
        </div>
      </div>

      {/* Theater Screen */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl h-3 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full opacity-70 transform perspective"></div>
        </div>
        <p className="text-center text-xs text-slate-500 uppercase tracking-wider">Screen</p>

        {/* Seats Grid */}
        <div className="space-y-3 px-4">
          {Object.keys(seats)
            .sort()
            .map((row) => (
              <div key={row} className="flex items-center gap-2 justify-center">
                <div className="w-6 text-center text-slate-500 font-semibold text-sm">{row}</div>
                <div className="flex gap-2">
                  {seats[row]
                    .sort((a, b) => {
                      const numA = parseInt(a.seat_number.substring(1));
                      const numB = parseInt(b.seat_number.substring(1));
                      return numA - numB;
                    })
                    .map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() =>
                          seat.status === 'available' ||
                          selectedSeats.includes(seat.seat_number)
                            ? handleSeatClick(seat.seat_number)
                            : null
                        }
                        disabled={
                          seat.status === 'booked' || seat.status === 'on_hold'
                        }
                        className={`w-8 h-8 rounded-t-md border transition duration-200 flex items-center justify-center text-xs font-semibold text-white ${getSeatColor(
                          getSeatStatus(seat)
                        )} ${
                          seat.status !== 'available' &&
                          !selectedSeats.includes(seat.seat_number)
                            ? 'cursor-not-allowed'
                            : ''
                        }`}
                        title={`Seat ${seat.seat_number} - ${getSeatStatus(seat)}`}
                      >
                        {seat.status === 'booked' ? (
                          <ArmchairIcon className="w-4 h-4" />
                        ) : (
                          seat.seat_number.substring(1)
                        )}
                      </button>
                    ))}
                </div>
                <div className="w-6 text-center text-slate-500 font-semibold text-sm">{row}</div>
              </div>
            ))}
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-4xl h-3 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full opacity-70 transform perspective"></div>
        </div>
      </div>

      {/* Selected Seats Summary */}
      <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Selected Seats:</span>
          <span className="text-emerald-400 font-semibold">
            {selectedSeats.length > 0 ? selectedSeats.sort().join(', ') : 'None'}
          </span>
        </div>
        <div className="border-t border-slate-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Price per seat:</span>
            <span className="text-white">${moviePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-slate-300 font-semibold">Total Amount:</span>
            <span className="text-lg font-bold text-emerald-400">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={fetchSeatAvailability}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
        >
          Refresh Availability
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
