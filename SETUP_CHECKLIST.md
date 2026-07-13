# Setup Checklist - Cinematic Ticket Booker

## ✅ Requirements Completed

### 1. ✅ Add More Movies
- Backend API endpoints created:
  - `createMovie.php` - Add new movies
  - `updateMovie.php` - Update existing movies
  - `deleteMovie.php` - Delete movies
- Frontend components:
  - `MovieManagement.jsx` - Full CRUD interface
  - `MovieForm.jsx` - Reusable form component
  - Inline CRUD in `HomePage` and `MovieCard`

### 2. ✅ Search Box and CRUD Operations
- **Search Functionality:**
  - Search box in `HomePage` component
  - Real-time filtering by title and description
  - Shows result count
- **CRUD Operations:**
  - ✅ **Create:** Add movies via form in HomePage or MovieManagement
  - ✅ **Read:** View all movies (with search)
  - ✅ **Update:** Edit movies inline or in MovieManagement
  - ✅ **Delete:** Delete movies with confirmation

### 3. ✅ SQL Database File
- `database.sql` created with:
  - CREATE TABLE statements for `movies`, `showtimes`, `bookings`
  - Sample data for 6 movies
  - Additional 6 movies (12 total)
  - Showtimes in 12-hour format (Bangladesh Time)
  - Foreign key constraints

## 🚀 How to Run the App

### Prerequisites:
1. **XAMPP** installed and running
2. **Node.js** and **npm** installed
3. **Database** created from `database.sql`

### Step 1: Setup Database
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Import `database.sql` file or run the SQL commands
3. Verify database `ticket_booking_db` exists with tables:
   - `movies`
   - `showtimes`
   - `bookings`

### Step 2: Start Backend (XAMPP)
1. Start **Apache** and **MySQL** in XAMPP Control Panel
2. Verify backend is accessible at:
   - `http://localhost/cinematic-ticket-booker-backend/getMovies.php`

### Step 3: Install Dependencies
```bash
cd f:\cinematic-ticket-booker
npm install
```

### Step 4: Start React App
```bash
npm run dev
```

The app will open at: **http://localhost:3004**

## 📋 Backend Files Location
- Backend: `C:\xampp\htdocs\cinematic-ticket-booker-backend\`
- Frontend: `f:\cinematic-ticket-booker\`

## 🔧 Configuration

### Backend Config (`config.php`):
- Host: `localhost`
- User: `root`
- Password: `` (empty)
- Database: `ticket_booking_db`

### Frontend API Endpoints:
- Get Movies: `http://localhost/cinematic-ticket-booker-backend/getMovies.php`
- Create Movie: `http://localhost/cinematic-ticket-booker-backend/createMovie.php`
- Update Movie: `http://localhost/cinematic-ticket-booker-backend/updateMovie.php`
- Delete Movie: `http://localhost/cinematic-ticket-booker-backend/deleteMovie.php`
- Book Seats: `http://localhost/cinematic-ticket-booker-backend/bookSeats.php`

## ✨ Features Available

1. **Home Page:**
   - View all movies
   - Search movies by title/description
   - Add new movies (inline form)
   - Edit/Delete movies (inline buttons)
   - Book tickets

2. **Movie Management Page:**
   - Full CRUD interface
   - Add/Edit/Delete movies
   - View all movies in grid

3. **Booking Flow:**
   - Select movie
   - Choose showtime (12:00 PM, 04:00 PM, 08:00 PM)
   - Select seats
   - Enter contact number
   - Confirm booking
   - View receipt

## ⚠️ Troubleshooting

### If movies don't load:
1. Check XAMPP Apache and MySQL are running
2. Verify database exists and has data
3. Check browser console for errors
4. Verify CORS headers in PHP files

### If CRUD operations fail:
1. Check backend PHP files exist
2. Verify database connection in `config.php`
3. Check browser console and network tab
4. Ensure CORS is enabled for `http://localhost:3004`

### Port Issues:
- React app runs on port **3004** (configured in `vite.config.js`)
- Backend runs on port **80** (default Apache port)

## 📝 Notes

- Showtimes are in **12-hour format** (Bangladesh Time UTC+6)
- All times display as: `12:00 PM`, `04:00 PM`, `08:00 PM`
- Database stores showtimes as VARCHAR in 12-hour format
- Bookings table uses DATETIME (converted from 12-hour format)
