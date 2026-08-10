-- ============================================
-- Cinematic Ticket Booker Database Schema
-- Database: ticket_booking_db
-- ============================================

-- Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS `ticket_booking_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `ticket_booking_db`;

-- ============================================
-- Table: movies
-- Stores movie information
-- ============================================
CREATE TABLE IF NOT EXISTS `movies` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `posterUrl` VARCHAR(500) NOT NULL,
  `price` DECIMAL(10, 2) DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Table: showtimes
-- Stores showtime information for movies
-- Time stored in 12-hour format (e.g., "12:00 PM", "04:00 PM", "08:00 PM")
-- ============================================
CREATE TABLE IF NOT EXISTS `showtimes` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `movie_id` INT(11) NOT NULL,
  `time` VARCHAR(10) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `showtimes_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Table: bookings
-- Stores booking information
-- ============================================
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `movie_id` INT(11) NOT NULL,
  `showtime_id` INT(11) NOT NULL,
  `showtime_date` DATE NOT NULL,
  `showtime_time` VARCHAR(10) NOT NULL,
  `seats` JSON NOT NULL,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `contact_number` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255),
  `customer_name` VARCHAR(255),
  `payment_status` ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
  `booking_status` ENUM('active', 'cancelled') DEFAULT 'active',
  `cancellation_reason` TEXT,
  `refund_amount` DECIMAL(10, 2),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  KEY `showtime_id` (`showtime_id`),
  KEY `booking_status` (`booking_status`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Table: seat_bookings
-- Tracks individual seat bookings for real-time availability
-- ============================================
CREATE TABLE IF NOT EXISTS `seat_bookings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `showtime_id` INT(11) NOT NULL,
  `showtime_date` DATE NOT NULL,
  `seat_number` VARCHAR(10) NOT NULL,
  `booking_id` INT(11),
  `status` ENUM('available', 'booked', 'on_hold') DEFAULT 'available',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_seat_per_showtime` (`showtime_id`, `showtime_date`, `seat_number`),
  KEY `showtime_id` (`showtime_id`),
  KEY `booking_id` (`booking_id`),
  KEY `status` (`status`),
  CONSTRAINT `seat_bookings_ibfk_1` FOREIGN KEY (`showtime_id`) REFERENCES `showtimes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `seat_bookings_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- Sample Data: Movies
-- ============================================
INSERT INTO `movies` (`id`, `title`, `description`, `posterUrl`, `price`, `created_at`) VALUES
(1, 'Poran', 'A romantic thriller inspired by true events, where a college girl falls for a local thug.', 'https://image2url.com/images/1763730217047-8232ed05-96fb-4cd5-8f48-36155f8e3de1.jpg', 180.00, '2025-11-21 23:38:38'),
(2, 'Surongo', 'A tragic romance and crime drama about Masud, an ex-convict trying to rebuild his life.', 'https://i.postimg.cc/bvQ8XSfz/Surongo.jpg', 200.00, '2025-11-21 23:38:38'),
(3, 'Priyotoma', 'A tragic romantic drama starring Shakib Khan, portraying love and sacrifice.', 'https://image2url.com/images/1763730264212-f1b56430-4021-42fb-8711-d34752941b23.webp', 200.00, '2025-11-21 23:38:38'),
(4, 'No Bed of Roses', 'Drama starring Irrfan Khan, exploring family and relationships.', 'https://image2url.com/images/1763730328128-0e1c7739-56c7-4cdb-98a6-5988ca654f4e.jpg', 220.00, '2025-11-21 23:38:38'),
(5, 'Hawa', 'Mystery-drama set on a fishing trawler, praised for its cinematography.', 'https://image2url.com/images/1763730394418-ed947af4-b3af-4b1e-9fd4-eebf41a8d3f2.webp', 250.00, '2025-11-21 23:38:38'),
(6, 'Rehana Maryam Noor', 'Psychological drama, critically acclaimed and selected for Cannes Film Festival.', 'https://image2url.com/images/1763730437891-f7af5502-8dd4-4fe1-801f-fbed050a9921.webp', 150.00, '2025-11-21 23:38:38');

-- ============================================
-- Sample Data: Showtimes
-- ============================================
-- Showtimes in Bangladesh Time (UTC+6) - 12-hour format
-- 3 showtimes per movie: 12:00 PM, 04:00 PM, 08:00 PM
INSERT INTO `showtimes` (`movie_id`, `time`) VALUES
(1, '12:00 PM'),
(1, '04:00 PM'),
(1, '08:00 PM'),
(2, '12:00 PM'),
(2, '04:00 PM'),
(2, '08:00 PM'),
(3, '12:00 PM'),
(3, '04:00 PM'),
(3, '08:00 PM'),
(4, '12:00 PM'),
(4, '04:00 PM'),
(4, '08:00 PM'),
(5, '12:00 PM'),
(5, '04:00 PM'),
(5, '08:00 PM'),
(6, '12:00 PM'),
(6, '04:00 PM'),
(6, '08:00 PM');

-- ============================================
-- Sample Data: Bookings (Optional)
-- ============================================
-- Example bookings (you can add more as needed)
-- All times are in Bangladesh Time (UTC+6) - 12-hour format
-- Note: showtime in bookings table is DATETIME, so it includes date and time
-- INSERT INTO `bookings` (`movie_id`, `showtime`, `seats`, `total_amount`, `contact_number`) VALUES
-- (1, '2025-12-13 12:00:00', 'A1,A2,A3', 540.00, '1234567890'),
-- (2, '2025-12-13 16:00:00', 'B5,B6', 400.00, '0987654321');

-- ============================================
-- Additional Movies (More movies to add)
-- ============================================
INSERT INTO `movies` (`title`, `description`, `posterUrl`, `price`) VALUES
('Dahan', 'A gripping thriller about a woman seeking justice in a patriarchal society.', 'https://i.postimg.cc/XYPXNCPC/Dahan.jpg', 180.00),
('Shyamol Chhaya', 'A period drama set during the Bangladesh Liberation War.', 'https://i.postimg.cc/dtzzqQB0/Shaymol-Chaya.jpg', 220.00),
('Monpura', 'A romantic drama set in the riverine landscape of Bangladesh.', 'https://i.postimg.cc/XYSDRHjB/Monpura.jpg', 190.00),
('Aynabaji', 'A psychological thriller about identity and deception.', 'https://i.postimg.cc/MTvcbYjY/Aynabaji.jpg', 210.00),
('Dhaka Attack', 'Action thriller based on real events, featuring intense police operations.', 'https://i.postimg.cc/RhP4sr5t/Dhaka-Attack.jpg', 200.00),
('Chandrabati', 'A historical drama about the legendary poet Chandrabati.', 'https://i.postimg.cc/dQZ6J2Sd/Chandrabati.jpg', 175.00);

-- ============================================
-- End of SQL Script
-- ============================================
