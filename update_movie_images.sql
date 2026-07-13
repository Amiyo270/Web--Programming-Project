-- ============================================
-- Update Movie Poster URLs
-- Run this script to update existing movie poster images in the database
-- ============================================

USE `ticket_booking_db`;

-- Update Surongo
UPDATE `movies` SET `posterUrl` = 'https://i.postimg.cc/bvQ8XSfz/Surongo.jpg' WHERE `title` = 'Surongo';

-- Update Dahan
UPDATE `movies` SET `posterUrl` = 'https://i.postimg.cc/XYPXNCPC/Dahan.jpg' WHERE `title` = 'Dahan';

-- Update Shyamol Chhaya / Shaymol Chaya
UPDATE `movies` SET `posterUrl` = 'https://i.postimg.cc/dtzzqQB0/Shaymol-Chaya.jpg' WHERE `title` = 'Shyamol Chhaya' OR `title` = 'Shaymol Chaya';

-- Update Monpura
UPDATE `movies` SET `posterUrl` = 'https://i.postimg.cc/XYSDRHjB/Monpura.jpg' WHERE `title` = 'Monpura';

-- Update Aynabaji
UPDATE `movies` SET `posterUrl` = 'https://i.postimg.cc/MTvcbYjY/Aynabaji.jpg' WHERE `title` = 'Aynabaji';

-- Update Dhaka Attack
UPDATE `movies` SET `posterUrl` = 'https://i.postimg.cc/RhP4sr5t/Dhaka-Attack.jpg' WHERE `title` = 'Dhaka Attack';

-- Update Chandrabati / Chaandraboti
UPDATE `movies` SET `posterUrl` = 'https://i.postimg.cc/dQZ6J2Sd/Chandrabati.jpg' WHERE `title` = 'Chandrabati' OR `title` = 'Chaandraboti';
