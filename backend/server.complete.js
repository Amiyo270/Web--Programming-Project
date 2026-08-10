import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/, 'http://127.0.0.1:5173', 'http://localhost:5173', 'http://127.0.0.1:3004', 'http://localhost:3004'],
  credentials: true
}));
app.use(express.json());

// ==================== IN-MEMORY DATABASE ====================
let moviesDB = [
  {
    id: 1,
    title: 'Poran',
    posterUrl: 'https://image2url.com/images/1763730217047-8232ed05-96fb-4cd5-8f48-36155f8e3de1.jpg',
    description: 'A romantic thriller filled with suspense, where a college girl falls for a local thug.',
    price: 180,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Priyotoma',
    posterUrl: 'https://image2url.com/images/1763730264212-f1b56430-4021-42fb-8711-d34752941b23.webp',
    description: 'Romantic drama starring Shakib Khan, one of the highest-grossing Bangladeshi films.',
    price: 200,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'No Bed of Roses',
    posterUrl: 'https://image2url.com/images/1763730328128-0e1c7739-56c7-4cdb-98a6-5988ca654f4e.jpg',
    description: 'A touching love story that transcends cultural and religious boundaries.',
    price: 150,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Nabab',
    posterUrl: 'https://image2url.com/images/1763730372626-6adf90f7-5aed-4fb6-8bf1-b2d3c74f3c6a.jpg',
    description: 'A blockbuster drama with action and suspense that keeps you on the edge of your seat.',
    price: 180,
    created_at: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Prem er Kahini',
    posterUrl: 'https://image2url.com/images/1763730412509-4cbea19a-1b0d-48a4-9e77-5f3c8a8b1d2e.jpg',
    description: 'A sweet romantic comedy that tells the story of a love that overcomes all odds.',
    price: 170,
    created_at: new Date().toISOString(),
  }
];

let showtimesDB = [
  { id: 1, movie_id: 1, time: '12:00 PM', created_at: new Date().toISOString() },
  { id: 2, movie_id: 1, time: '04:00 PM', created_at: new Date().toISOString() },
  { id: 3, movie_id: 1, time: '08:00 PM', created_at: new Date().toISOString() },
  { id: 4, movie_id: 2, time: '12:00 PM', created_at: new Date().toISOString() },
  { id: 5, movie_id: 2, time: '04:00 PM', created_at: new Date().toISOString() },
  { id: 6, movie_id: 2, time: '08:00 PM', created_at: new Date().toISOString() },
  { id: 7, movie_id: 3, time: '12:00 PM', created_at: new Date().toISOString() },
  { id: 8, movie_id: 3, time: '04:00 PM', created_at: new Date().toISOString() },
  { id: 9, movie_id: 3, time: '08:00 PM', created_at: new Date().toISOString() },
  { id: 10, movie_id: 4, time: '12:00 PM', created_at: new Date().toISOString() },
  { id: 11, movie_id: 4, time: '04:00 PM', created_at: new Date().toISOString() },
  { id: 12, movie_id: 4, time: '08:00 PM', created_at: new Date().toISOString() },
  { id: 13, movie_id: 5, time: '12:00 PM', created_at: new Date().toISOString() },
  { id: 14, movie_id: 5, time: '04:00 PM', created_at: new Date().toISOString() },
  { id: 15, movie_id: 5, time: '08:00 PM', created_at: new Date().toISOString() },
];

let bookingsDB = [];
let nextMovieId = 6;
let nextShowtimeId = 16;
let nextBookingId = 1;

// ==================== MIDDLEWARE ====================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== AUTHENTICATION ENDPOINTS ====================
app.post('/api/admin/login', (req, res) => {
  const { secretCode } = req.body;
  if (secretCode !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid secret code' });
  }
  const token = jwt.sign(
    { role: 'admin', timestamp: Date.now() },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, role: 'admin', message: 'Admin authenticated successfully' });
});

app.post('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, role: req.user.role });
});

// ==================== MOVIES ENDPOINTS ====================
app.get('/api/movies', (req, res) => {
  try {
    res.json(moviesDB);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

app.get('/api/movies/:id', (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movie = moviesDB.find(m => m.id === movieId);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const movieShowtimes = showtimesDB.filter(s => s.movie_id === movieId);
    
    res.json({
      ...movie,
      showtimes: movieShowtimes
    });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

app.post('/api/admin/movies', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { title, description, posterUrl, price } = req.body;
  if (!title || !description || !posterUrl || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newMovie = {
      id: nextMovieId++,
      title,
      description,
      posterUrl,
      price: parseFloat(price),
      created_at: new Date().toISOString()
    };
    moviesDB.push(newMovie);
    res.status(201).json({ ...newMovie, message: 'Movie created successfully' });
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

app.put('/api/admin/movies/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const movieId = parseInt(req.params.id);
  const { title, description, posterUrl, price } = req.body;

  try {
    const movie = moviesDB.find(m => m.id === movieId);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    if (title) movie.title = title;
    if (description) movie.description = description;
    if (posterUrl) movie.posterUrl = posterUrl;
    if (price) movie.price = parseFloat(price);

    res.json({ message: 'Movie updated successfully' });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

app.delete('/api/admin/movies/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const movieId = parseInt(req.params.id);

  try {
    moviesDB = moviesDB.filter(m => m.id !== movieId);
    showtimesDB = showtimesDB.filter(s => s.movie_id !== movieId);
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// ==================== SHOWTIMES ENDPOINTS ====================
app.post('/api/admin/movies/:id/showtimes', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const movieId = parseInt(req.params.id);
  const { time } = req.body;
  if (!time) return res.status(400).json({ error: 'Showtime required' });

  try {
    const movie = moviesDB.find(m => m.id === movieId);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const newShowtime = {
      id: nextShowtimeId++,
      movie_id: movieId,
      time,
      created_at: new Date().toISOString()
    };
    showtimesDB.push(newShowtime);
    res.status(201).json({ ...newShowtime, message: 'Showtime added successfully' });
  } catch (error) {
    console.error('Error adding showtime:', error);
    res.status(500).json({ error: 'Failed to add showtime' });
  }
});

app.delete('/api/admin/showtimes/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const showtimeId = parseInt(req.params.id);

  try {
    showtimesDB = showtimesDB.filter(s => s.id !== showtimeId);
    res.json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    console.error('Error deleting showtime:', error);
    res.status(500).json({ error: 'Failed to delete showtime' });
  }
});

// ==================== BOOKINGS ENDPOINTS ====================
app.get('/api/admin/bookings', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const activeBookings = bookingsDB.filter(b => b.booking_status === 'active');
    const bookingsWithMovies = activeBookings.map(b => {
      const movie = moviesDB.find(m => m.id === b.movie_id);
      return { ...b, movie };
    });
    res.json(bookingsWithMovies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.get('/api/admin/statistics', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const totalBookings = bookingsDB.length;
    const totalRevenue = bookingsDB.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookingsDB.filter(b => b.created_at.startsWith(today)).length;
    const todayRevenue = bookingsDB
      .filter(b => b.created_at.startsWith(today))
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);

    res.json({ 
      total_bookings: totalBookings, 
      total_revenue: totalRevenue, 
      today_bookings: todayBookings, 
      today_revenue: todayRevenue 
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.get('/api/admin/seat-management/summary', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const activeBookings = bookingsDB.filter(b => b.booking_status === 'active');
    const bookedSeats = activeBookings.reduce((count, b) => count + (Array.isArray(b.seats) ? b.seats.length : 0), 0);
    const totalSeats = showtimesDB.length * 8 * 12;

    res.json({
      active_bookings: activeBookings.length,
      booked_seats: bookedSeats,
      total_seats: totalSeats,
    });
  } catch (error) {
    console.error('Error fetching seat management summary:', error);
    res.status(500).json({ error: 'Failed to fetch seat management summary' });
  }
});

app.post('/api/admin/seat-management/reset', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const removed = bookingsDB.filter(b => b.booking_status === 'active').length;
    bookingsDB = bookingsDB.filter(b => b.booking_status !== 'active');

    res.json({ message: `Seat bookings reset successfully. ${removed} active booking(s) removed.` });
  } catch (error) {
    console.error('Error resetting seat bookings:', error);
    res.status(500).json({ error: 'Failed to reset seat bookings' });
  }
});

app.get('/api/seats/availability/:showtimeId/:date', (req, res) => {
  const { showtimeId, date } = req.params;
  try {
    const bookedSeats = bookingsDB
      .filter(b => b.showtime_id === parseInt(showtimeId) && b.showtime_date === date)
      .flatMap(b => b.seats || []);

    const allSeats = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 1; j <= 12; j++) {
        const seatNumber = String.fromCharCode(65 + i) + j;
        allSeats.push({
          id: `${showtimeId}-${date}-${seatNumber}`,
          seat_number: seatNumber,
          status: bookedSeats.includes(seatNumber) ? 'booked' : 'available'
        });
      }
    }
    res.json(allSeats);
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({ error: 'Failed to fetch seat availability' });
  }
});

app.post('/api/bookings', (req, res) => {
  const { movie_id, showtime_id, showtime_date, showtime_time, seats, total_amount, contact_number, email, customer_name } = req.body;
  
  if (!movie_id || !showtime_id || !showtime_date || !seats || !total_amount || !contact_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'Invalid seats selection' });
  }

  try {
    // Check if seats are already booked
    const bookedSeats = bookingsDB
      .filter(b => b.showtime_id === showtime_id && b.showtime_date === showtime_date)
      .flatMap(b => b.seats || []);
    
    const conflictingSeats = seats.filter(s => bookedSeats.includes(s));
    if (conflictingSeats.length > 0) {
      return res.status(409).json({ 
        error: 'Some seats are already booked', 
        bookedSeats: conflictingSeats 
      });
    }

    const newBooking = {
      id: nextBookingId++,
      movie_id,
      showtime_id,
      showtime_date,
      showtime_time,
      seats,
      total_amount,
      contact_number,
      email: email || null,
      customer_name: customer_name || 'Guest',
      payment_status: 'completed',
      booking_status: 'active',
      cancellation_reason: null,
      refund_amount: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    bookingsDB.push(newBooking);
    res.status(201).json({ id: newBooking.id, message: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings/:id', (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const booking = bookingsDB.find(b => b.id === bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const movie = moviesDB.find(m => m.id === booking.movie_id);
    res.json({ ...booking, movie });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

app.post('/api/bookings/search/contact', (req, res) => {
  const { contact_number } = req.body;
  if (!contact_number) return res.status(400).json({ error: 'Contact number required' });

  try {
    const bookings = bookingsDB
      .filter(b => b.contact_number === contact_number && b.booking_status === 'active')
      .map(b => {
        const movie = moviesDB.find(m => m.id === b.movie_id);
        return { ...b, movie };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(bookings);
  } catch (error) {
    console.error('Error searching bookings:', error);
    res.status(500).json({ error: 'Failed to search bookings' });
  }
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  const { contact_number, reason } = req.body;
  const bookingId = parseInt(req.params.id);
  
  if (!contact_number) return res.status(400).json({ error: 'Contact number required' });

  try {
    const booking = bookingsDB.find(b => b.id === bookingId);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.contact_number !== contact_number) return res.status(403).json({ error: 'Invalid contact number' });

    booking.booking_status = 'cancelled';
    booking.cancellation_reason = reason || 'Customer requested';
    booking.refund_amount = booking.total_amount;
    booking.updated_at = new Date().toISOString();

    res.json({ 
      message: 'Booking cancelled successfully', 
      refundAmount: booking.total_amount, 
      bookingId 
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running successfully' });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`📺 Movies: ${moviesDB.length}`);
  console.log(`🎬 Showtimes: ${showtimesDB.length}`);
});
