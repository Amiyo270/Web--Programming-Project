-- Supabase/Postgres schema for Cinematic Ticket Booker

-- movies table
CREATE TABLE IF NOT EXISTS movies (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  posterurl text NOT NULL,
  price numeric(10,2) DEFAULT 0.00,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- showtimes table
CREATE TABLE IF NOT EXISTS showtimes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  movie_id bigint NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  time text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  movie_id bigint NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  showtime_id bigint NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  showtime_date date NOT NULL,
  showtime_time text NOT NULL,
  seats jsonb NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  contact_number text NOT NULL,
  email text,
  customer_name text,
  payment_status text DEFAULT 'completed',
  booking_status text DEFAULT 'active',
  cancellation_reason text,
  refund_amount numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- seat_bookings table
CREATE TABLE IF NOT EXISTS seat_bookings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  showtime_id bigint NOT NULL REFERENCES showtimes(id) ON DELETE CASCADE,
  showtime_date date NOT NULL,
  seat_number text NOT NULL,
  booking_id bigint REFERENCES bookings(id) ON DELETE SET NULL,
  status text DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (showtime_id, showtime_date, seat_number)
);
