import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const frontendUrlClean = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim().replace(/\/+$/, '') : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return callback(null, true);
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    if (frontendUrlClean && (origin === frontendUrlClean || origin.replace(/\/+$/, '') === frontendUrlClean)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication Middleware
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

// ==================== ADMIN AUTHENTICATION ====================

// Admin Login with Secret Code
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

  res.json({ 
    token,
    role: 'admin',
    message: 'Admin authenticated successfully'
  });
});

// Verify Token
app.post('/api/admin/verify', authMiddleware, (req, res) => {
  res.json({ 
    valid: true,
    role: req.user.role
  });
});

// ==================== MOVIES CRUD ====================

// Get All Movies
app.get('/api/movies', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [movies] = await connection.query(
      'SELECT m.*, COUNT(s.id) as showtime_count FROM movies m LEFT JOIN showtimes s ON m.id = s.movie_id GROUP BY m.id ORDER BY m.created_at DESC'
    );
    connection.release();
    
    const parsed = movies.map(m => ({ ...m, price: parseFloat(m.price) || 0 }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get Movie Details with Showtimes
app.get('/api/movies/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [movies] = await connection.query(
      'SELECT * FROM movies WHERE id = ?',
      [req.params.id]
    );
    const [showtimes] = await connection.query(
      'SELECT * FROM showtimes WHERE movie_id = ?',
      [req.params.id]
    );
    connection.release();

    if (movies.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ ...movies[0], showtimes });
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
});

// Create Movie (Admin Only)
app.post('/api/admin/movies', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { title, description, posterUrl, price } = req.body;

  if (!title || !description || !posterUrl || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO movies (title, description, posterUrl, price) VALUES (?, ?, ?, ?)',
      [title, description, posterUrl, price]
    );
    connection.release();

    res.status(201).json({ 
      id: result.insertId,
      title,
      description,
      posterUrl,
      price,
      message: 'Movie created successfully'
    });
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
});

// Update Movie (Admin Only)
app.put('/api/admin/movies/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { title, description, posterUrl, price } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE movies SET title = ?, description = ?, posterUrl = ?, price = ? WHERE id = ?',
      [title, description, posterUrl, price, req.params.id]
    );
    connection.release();

    res.json({ message: 'Movie updated successfully' });
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
});

// Delete Movie (Admin Only)
app.delete('/api/admin/movies/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.query(
      'DELETE FROM movies WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
});

// ==================== SHOWTIMES CRUD ====================

// Add Showtime to Movie (Admin Only)
app.post('/api/admin/movies/:id/showtimes', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { time } = req.body;

  if (!time) {
    return res.status(400).json({ error: 'Showtime required' });
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO showtimes (movie_id, time) VALUES (?, ?)',
      [req.params.id, time]
    );
    connection.release();

    res.status(201).json({ 
      id: result.insertId,
      movie_id: req.params.id,
      time,
      message: 'Showtime added successfully'
    });
  } catch (error) {
    console.error('Error adding showtime:', error);
    res.status(500).json({ error: 'Failed to add showtime' });
  }
});

// Delete Showtime (Admin Only)
app.delete('/api/admin/showtimes/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.query(
      'DELETE FROM showtimes WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    res.json({ message: 'Showtime deleted successfully' });
  } catch (error) {
    console.error('Error deleting showtime:', error);
    res.status(500).json({ error: 'Failed to delete showtime' });
  }
});

// ==================== BOOKINGS ====================

// Get All Bookings (Admin Only)
app.get('/api/admin/bookings', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const connection = await pool.getConnection();
    const [bookings] = await connection.query(
      'SELECT b.*, m.title FROM bookings b JOIN movies m ON b.movie_id = m.id WHERE b.booking_status = "active" ORDER BY b.created_at DESC'
    );
    connection.release();

    const parsed = bookings.map(b => ({
      ...b,
      total_amount: parseFloat(b.total_amount) || 0,
      seats: typeof b.seats === 'string' ? JSON.parse(b.seats) : b.seats
    }));
    res.json(parsed);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get Booking Statistics (Admin Only)
app.get('/api/admin/statistics', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const connection = await pool.getConnection();
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_bookings,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END) as today_revenue
      FROM bookings WHERE booking_status = 'active'
    `);
    connection.release();

    const raw = stats[0] || { total_bookings: 0, total_revenue: 0, today_bookings: 0, today_revenue: 0 };
    res.json({
      total_bookings: parseInt(raw.total_bookings) || 0,
      total_revenue: parseFloat(raw.total_revenue) || 0,
      today_bookings: parseInt(raw.today_bookings) || 0,
      today_revenue: parseFloat(raw.today_revenue) || 0
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.get('/api/admin/seat-management/summary', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const connection = await pool.getConnection();
    const [[activeBookingsCount]] = await connection.query(
      `SELECT COUNT(*) as active_bookings FROM bookings WHERE booking_status = 'active'`
    );
    const [[bookedSeatsCount]] = await connection.query(
      `SELECT SUM(JSON_LENGTH(seats)) as booked_seats FROM bookings WHERE booking_status = 'active'`
    );
    const [[totalSeatsCount]] = await connection.query(
      `SELECT COUNT(*) as total_seats FROM seat_bookings`
    );
    connection.release();

    res.json({
      active_bookings: activeBookingsCount.active_bookings || 0,
      booked_seats: bookedSeatsCount.booked_seats || 0,
      total_seats: totalSeatsCount.total_seats || 0,
    });
  } catch (error) {
    console.error('Error fetching seat management summary:', error);
    res.status(500).json({ error: 'Failed to fetch seat management summary' });
  }
});

app.post('/api/admin/seat-management/reset', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.query('START TRANSACTION');

    const [deleted] = await connection.query(
      `DELETE FROM bookings WHERE booking_status = 'active'`
    );

    await connection.query(
      `UPDATE seat_bookings SET status = 'available', booking_id = NULL, updated_at = NOW()`
    );

    await connection.query('COMMIT');
    connection.release();

    res.json({ message: `Seat bookings reset successfully. ${deleted.affectedRows || 0} active bookings removed.` });
  } catch (error) {
    console.error('Error resetting seat bookings:', error);
    res.status(500).json({ error: 'Failed to reset seat bookings' });
  }
});

// Get Seat Availability for Showtime and Date
app.get('/api/seats/availability/:showtimeId/:date', async (req, res) => {
  const { showtimeId, date } = req.params;

  try {
    const connection = await pool.getConnection();
    
    // Get all seats for the specified showtime and date
    const [seats] = await connection.query(
      `SELECT * FROM seat_bookings 
       WHERE showtime_id = ? AND showtime_date = ?
       ORDER BY seat_number`,
      [showtimeId, date]
    );

    // If no seats exist yet, initialize them
    if (seats.length === 0) {
      // Initialize all seats for the first time
      const allSeats = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 1; j <= 12; j++) {
          const seatNumber = String.fromCharCode(65 + i) + j;
          allSeats.push([showtimeId, date, seatNumber, null, 'available']);
        }
      }

      // Batch insert all seats
      await connection.query(
        `INSERT INTO seat_bookings (showtime_id, showtime_date, seat_number, booking_id, status) 
         VALUES ?`,
        [allSeats]
      );

      // Fetch the newly created seats
      const [newSeats] = await connection.query(
        `SELECT * FROM seat_bookings 
         WHERE showtime_id = ? AND showtime_date = ?
         ORDER BY seat_number`,
        [showtimeId, date]
      );
      
      connection.release();
      return res.json(newSeats);
    }

    connection.release();
    res.json(seats);
  } catch (error) {
    console.error('Error fetching seat availability:', error);
    res.status(500).json({ error: 'Failed to fetch seat availability' });
  }
});

// Create Booking (Customer)
app.post('/api/bookings', async (req, res) => {
  const { movie_id, showtime_id, showtime_date, showtime_time, seats, total_amount, contact_number, email, customer_name } = req.body;

  if (!movie_id || !showtime_id || !showtime_date || !seats || !total_amount || !contact_number) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ error: 'Invalid seats selection' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Start transaction-like behavior
    await connection.query('START TRANSACTION');

    // Check if all seats are available
    const [existingSeats] = await connection.query(
      `SELECT * FROM seat_bookings 
       WHERE showtime_id = ? AND showtime_date = ? AND seat_number IN (${seats.map(() => '?').join(',')})`,
      [showtime_id, showtime_date, ...seats]
    );

    // Check if any seat is already booked
    const bookedSeats = existingSeats.filter(s => s.status === 'booked');
    if (bookedSeats.length > 0) {
      await connection.query('ROLLBACK');
      connection.release();
      return res.status(409).json({ 
        error: 'Some seats are already booked', 
        bookedSeats: bookedSeats.map(s => s.seat_number)
      });
    }

    // Create booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (movie_id, showtime_id, showtime_date, showtime_time, seats, total_amount, contact_number, email, customer_name, payment_status, booking_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', 'active')`,
      [movie_id, showtime_id, showtime_date, showtime_time, JSON.stringify(seats), total_amount, contact_number, email || null, customer_name || 'Guest']
    );

    const bookingId = bookingResult.insertId;

    // Update seat bookings
    await connection.query(
      `UPDATE seat_bookings 
       SET booking_id = ?, status = 'booked', updated_at = NOW()
       WHERE showtime_id = ? AND showtime_date = ? AND seat_number IN (${seats.map(() => '?').join(',')})`,
      [bookingId, showtime_id, showtime_date, ...seats]
    );

    await connection.query('COMMIT');
    connection.release();

    res.status(201).json({ 
      id: bookingId,
      message: 'Booking created successfully',
      booking: {
        id: bookingId,
        movie_id,
        showtime_date,
        showtime_time,
        seats,
        total_amount,
        contact_number,
        email,
        customer_name
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get Booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [bookings] = await connection.query(
      `SELECT b.*, m.title, m.posterUrl FROM bookings b 
       JOIN movies m ON b.movie_id = m.id 
       WHERE b.id = ?`,
      [req.params.id]
    );
    connection.release();

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];
    // mysql2 auto-parses JSON columns; only parse if still a string
    if (typeof booking.seats === 'string') booking.seats = JSON.parse(booking.seats);
    booking.total_amount = parseFloat(booking.total_amount) || 0;
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Get Bookings by Contact Number
app.post('/api/bookings/search/contact', async (req, res) => {
  const { contact_number } = req.body;

  if (!contact_number) {
    return res.status(400).json({ error: 'Contact number required' });
  }

  try {
    const connection = await pool.getConnection();
    const [bookings] = await connection.query(
      `SELECT b.*, m.title, m.posterUrl FROM bookings b 
       JOIN movies m ON b.movie_id = m.id 
       WHERE b.contact_number = ? AND b.booking_status = 'active'
       ORDER BY b.created_at DESC`,
      [contact_number]
    );
    connection.release();

    const parsedBookings = bookings.map(b => ({
      ...b,
      total_amount: parseFloat(b.total_amount) || 0,
      seats: typeof b.seats === 'string' ? JSON.parse(b.seats) : b.seats
    }));

    res.json(parsedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Cancel Booking (Admin or Customer with correct contact number)
app.post('/api/bookings/:id/cancel', async (req, res) => {
  const { contact_number, reason } = req.body;
  const bookingId = req.params.id;

  if (!contact_number) {
    return res.status(400).json({ error: 'Contact number required' });
  }

  try {
    const connection = await pool.getConnection();
    
    // Get booking details
    const [bookings] = await connection.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (bookings.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];

    // Verify contact number matches
    if (booking.contact_number !== contact_number) {
      connection.release();
      return res.status(403).json({ error: 'Invalid contact number' });
    }

    // Start transaction
    await connection.query('START TRANSACTION');

    // Get refund amount (full refund for cancellation)
    const refundAmount = booking.total_amount;

    // Update booking status
    await connection.query(
      `UPDATE bookings 
       SET booking_status = 'cancelled', 
           cancellation_reason = ?, 
           refund_amount = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [reason || 'Customer requested', refundAmount, bookingId]
    );

    // Release booked seats
    await connection.query(
      `UPDATE seat_bookings 
       SET status = 'available', booking_id = NULL, updated_at = NOW()
       WHERE booking_id = ?`,
      [bookingId]
    );

    await connection.query('COMMIT');
    connection.release();

    res.json({ 
      message: 'Booking cancelled successfully',
      refundAmount,
      bookingId
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
