import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [/^http:\/\/localhost:\d+$/],
  credentials: true
}));
app.use(express.json());

// In-memory database (fallback data)
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

app.get('/api/movies', (req, res) => {
  try {
    res.json(moviesDB);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const { data: movie, error } = await supabase
      .from('movies')
      .select('*, showtimes(id, time)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('Supabase error fetching movie:', error);
      return res.status(500).json({ error: 'Failed to fetch movie' });
    }

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

app.post('/api/admin/movies', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { title, description, posterUrl, price } = req.body;
  if (!title || !description || !posterUrl || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('movies')
      .insert([{ title, description, posterUrl, price }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating movie:', error);
      return res.status(500).json({ error: 'Failed to create movie' });
    }

    res.status(201).json({ ...data, message: 'Movie created successfully' });
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

app.put('/api/admin/movies/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { title, description, posterUrl, price } = req.body;

  try {
    const { error } = await supabase
      .from('movies')
      .update({ title, description, posterUrl, price })
      .eq('id', req.params.id);

    if (error) {
      console.error('Supabase error updating movie:', error);
      return res.status(500).json({ error: 'Failed to update movie' });
    }

    res.json({ message: 'Movie updated successfully' });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

app.delete('/api/admin/movies/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Supabase error deleting movie:', error);
      return res.status(500).json({ error: 'Failed to delete movie' });
    }

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

app.post('/api/admin/movies/:id/showtimes', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  const { time } = req.body;
  if (!time) return res.status(400).json({ error: 'Showtime required' });

  try {
    const { data, error } = await supabase
      .from('showtimes')
      .insert([{ movie_id: req.params.id, time }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding showtime:', error);
      return res.status(500).json({ error: 'Failed to add showtime' });
    }

    res.status(201).json({ ...data, message: 'Showtime added successfully' });
  } catch (error) {
    console.error('Error adding showtime:', error);
    res.status(500).json({ error: 'Failed to add showtime' });
  }
});

app.delete('/api/admin/showtimes/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const { error } = await supabase
      .from('showtimes')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Supabase error deleting showtime:', error);
      return res.status(500).json({ error: 'Failed to delete showtime' });
    }

    res.json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    console.error('Error deleting showtime:', error);
    res.status(500).json({ error: 'Failed to delete showtime' });
  }
});

app.get('/api/admin/bookings', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, movies(title)')
      .eq('booking_status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.get('/api/admin/statistics', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized' });

  try {
    const { data: total, error } = await supabase
      .from('bookings')
      .select('total_amount', { count: 'exact' });

    if (error) {
      console.error('Supabase error fetching statistics:', error);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    const totalBookings = total.length;
    const totalRevenue = total.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);

    const { data: today } = await supabase
      .from('bookings')
      .select('total_amount', { count: 'exact' })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const todayBookings = today.length;
    const todayRevenue = today.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);

    res.json({ total_bookings: totalBookings, total_revenue: totalRevenue, today_bookings: todayBookings, today_revenue: todayRevenue });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.get('/api/seats/availability/:showtimeId/:date', async (req, res) => {
  const { showtimeId, date } = req.params;
  try {
    const { data: seats, error } = await supabase
      .from('seat_bookings')
      .select('*')
      .eq('showtime_id', showtimeId)
      .eq('showtime_date', date)
      .order('seat_number', { ascending: true });

    if (error) {
      console.error('Supabase error fetching seat availability:', error);
      return res.status(500).json({ error: 'Failed to fetch seat availability' });
    }

    if (!seats.length) {
      const allSeats = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 1; j <= 12; j++) {
          const seatNumber = String.fromCharCode(65 + i) + j;
          allSeats.push({ showtime_id: Number(showtimeId), showtime_date: date, seat_number: seatNumber, status: 'available' });
        }
      }

      const { data: newSeats, error: insertError } = await supabase
        .from('seat_bookings')
        .insert(allSeats)
        .select();

      if (insertError) {
        console.error('Supabase error initializing seats:', insertError);
        return res.status(500).json({ error: 'Failed to initialize seat availability' });
      }

      return res.json(newSeats);
    }

    res.json(seats);
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({ error: 'Failed to fetch seat availability' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { movie_id, showtime_id, showtime_date, showtime_time, seats, total_amount, contact_number, email, customer_name } = req.body;
  if (!movie_id || !showtime_id || !showtime_date || !seats || !total_amount || !contact_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'Invalid seats selection' });
  }

  try {
    const { data: existingSeats, error: seatError } = await supabase
      .from('seat_bookings')
      .select('*')
      .eq('showtime_id', showtime_id)
      .eq('showtime_date', showtime_date)
      .in('seat_number', seats);

    if (seatError) {
      console.error('Supabase error checking seats:', seatError);
      return res.status(500).json({ error: 'Failed to check seats' });
    }

    const bookedSeats = existingSeats.filter(s => s.status === 'booked');
    if (bookedSeats.length > 0) {
      return res.status(409).json({ error: 'Some seats are already booked', bookedSeats: bookedSeats.map(s => s.seat_number) });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{ movie_id, showtime_id, showtime_date, showtime_time, seats, total_amount, contact_number, email, customer_name: customer_name || 'Guest', payment_status: 'completed', booking_status: 'active' }])
      .select()
      .single();

    if (bookingError) {
      console.error('Supabase error creating booking:', bookingError);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    const { error: updateError } = await supabase
      .from('seat_bookings')
      .update({ booking_id: booking.id, status: 'booked' })
      .eq('showtime_id', showtime_id)
      .eq('showtime_date', showtime_date)
      .in('seat_number', seats);

    if (updateError) {
      console.error('Supabase error updating seats:', updateError);
      return res.status(500).json({ error: 'Failed to update seat status' });
    }

    res.status(201).json({ id: booking.id, message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, movies(title, posterurl)')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('Supabase error fetching booking:', error);
      return res.status(500).json({ error: 'Failed to fetch booking' });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

app.post('/api/bookings/search/contact', async (req, res) => {
  const { contact_number } = req.body;
  if (!contact_number) return res.status(400).json({ error: 'Contact number required' });

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, movies(title, posterurl)')
      .eq('contact_number', contact_number)
      .eq('booking_status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching bookings:', error);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.post('/api/bookings/:id/cancel', async (req, res) => {
  const { contact_number, reason } = req.body;
  const bookingId = req.params.id;
  if (!contact_number) return res.status(400).json({ error: 'Contact number required' });

  try {
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId);

    if (bookingError) {
      console.error('Supabase error fetching booking:', bookingError);
      return res.status(500).json({ error: 'Failed to fetch booking' });
    }

    const booking = bookings?.[0];
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.contact_number !== contact_number) return res.status(403).json({ error: 'Invalid contact number' });

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ booking_status: 'cancelled', cancellation_reason: reason || 'Customer requested', refund_amount: booking.total_amount, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Supabase error cancelling booking:', updateError);
      return res.status(500).json({ error: 'Failed to cancel booking' });
    }

    const { error: seatUpdateError } = await supabase
      .from('seat_bookings')
      .update({ status: 'available', booking_id: null, updated_at: new Date().toISOString() })
      .eq('booking_id', bookingId);

    if (seatUpdateError) {
      console.error('Supabase error releasing seats:', seatUpdateError);
      return res.status(500).json({ error: 'Failed to release seats' });
    }

    res.json({ message: 'Booking cancelled successfully', refundAmount: booking.total_amount, bookingId });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Supabase backend running on http://localhost:${PORT}`);
});
