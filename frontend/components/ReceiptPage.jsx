import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
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

const ReceiptPage = ({ bookingDetails }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const ticketRef = useRef(null);

  const handleDownloadTicket = () => {
    if (!bookingDetails) return;

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

    y += 30;
    pdf.setFontSize(12);
    pdf.setTextColor('#cbd5e1');
    pdf.text(`Movie: ${bookingDetails.movieTitle}`, margin, y);
    y += 20;
    pdf.text(`Date: ${new Date(bookingDetails.showtimeDate).toLocaleDateString()}`, margin, y);
    y += 20;
    pdf.text(`Showtime: ${bookingDetails.showtime}`, margin, y);
    y += 20;
    pdf.text(`Seats: ${bookingDetails.seats.join(', ')}`, margin, y);
    y += 20;
    pdf.text(`Total Tickets: ${bookingDetails.seats.length}`, margin, y);
    y += 20;
    pdf.text(`Amount Paid: $${bookingDetails.totalAmount.toFixed(2)}`, margin, y);
    y += 20;
    pdf.text(`Contact Number: ${bookingDetails.contactNumber}`, margin, y);

    y += 30;
    pdf.setTextColor('#ffffff');
    pdf.setFontSize(18);
    pdf.text('Enjoy your movie!', margin, y);

    const fileName = `ticket-${bookingDetails.movieTitle.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
    pdf.save(fileName);
  };

  useEffect(() => {
    if (bookingDetails) {
      setIsProcessing(true);
      const timer = setTimeout(() => setIsProcessing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [bookingDetails]);

  if (!bookingDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-slate-300">No booking details available.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center py-4">
      <div className={`relative w-full max-w-xl overflow-hidden rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl ${
        'border-white/10 bg-slate-900/80 shadow-black/30'
      }`}>
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/20" />
        <div className="absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-fuchsia-500/20" />

        <div className="relative z-10 text-center">
          <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-emerald-400" />
          <h1 className={`text-3xl font-semibold text-white`}>Booking Confirmed!</h1>
          <p className={`mt-2 text-slate-400`}>Thank you for your purchase. Your seats are reserved.</p>
        </div>

        <div className={`relative z-10 mt-8 rounded-[1.5rem] border p-6 ${'border-white/10 bg-slate-950/70'}`}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={bookingDetails.posterUrl}
              alt={bookingDetails.movieTitle}
              className="h-28 w-20 rounded-xl object-cover shadow-lg"
              onError={(e) => e.target.src = 'https://via.placeholder.com/500x750?text=No+Image'}
            />
            <div>
              <h2 className={`text-xl font-semibold text-white`}>{bookingDetails.movieTitle}</h2>
              <p className={`mt-1 text-lg font-semibold text-indigo-300`}>${bookingDetails.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-5 border-t border-slate-800 pt-5">
            <DetailItem icon={<CalendarIcon />} label="Date" value={new Date(bookingDetails.showtimeDate).toLocaleDateString()} />
            <DetailItem icon={<ClockIcon />} label="Showtime" value={bookingDetails.showtime} />
            <DetailItem icon={<ArmchairIcon />} label="Seats" value={bookingDetails.seats.join(', ')} />
            <DetailItem icon={<HashIcon />} label="Total Tickets" value={bookingDetails.seats.length} />
            <DetailItem icon={<PhoneIcon />} label="Contact Number" value={bookingDetails.contactNumber} />
          </div>
        </div>

        <div className="relative z-10 mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleDownloadTicket}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-700/90 px-4 py-3 font-semibold text-white transition hover:bg-slate-600"
            type="button"
          >
            <FilmIcon className="h-5 w-5" />
            Download Your Ticket
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-4 py-3 font-semibold text-white transition hover:from-indigo-500 hover:to-fuchsia-500"
            type="button"
          >
            <FilmIcon className="h-5 w-5" />
            Book Another Movie
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;
