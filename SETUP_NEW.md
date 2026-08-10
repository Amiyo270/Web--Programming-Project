# Movie Ticket Booking App - Setup Guide

## Project Structure

```
Movie_Ticket_BookingApp-main/
├── frontend/              # React + Vite Frontend (Customer & Admin)
│   ├── components/        # React components
│   ├── App.jsx           # Main app with routing
│   ├── index.jsx         # Entry point
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
│
├── backend/              # Node.js + Express Backend
│   ├── server.js         # Express server with API routes
│   ├── package.json      # Backend dependencies
│   └── .env             # Environment variables
│
└── database.sql         # MySQL database schema
```

## Features

### 👥 Customer Features
- Browse all available movies
- Search movies by title or description
- Select showtimes (12:00 PM, 4:00 PM, 8:00 PM)
- Select seats with real-time availability
- Book tickets and get confirmation receipt
- Dark/Light theme toggle
- View admin login button on homepage

### 🔐 Admin Features
- **Secret Code Authentication**: Log in with code `amiyo270`
- **Full CRUD Operations**:
  - Create new movies
  - Edit movie details (title, description, poster URL, price)
  - Delete movies
  - Add/manage showtimes
- **Real-time Updates**: Changes immediately reflect on customer page
- **Movie Management Dashboard**: View all movies and manage inventory

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### 1. Setup Database

```bash
# Import the database schema
mysql -u root -p < database.sql
```

Or copy-paste the SQL from `database.sql` into your MySQL client.

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Update .env file with your database credentials
# IMPORTANT: Make sure PORT=5000 and ADMIN_SECRET=amiyo270

# Start backend server
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on: **http://localhost:5000**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

## Usage

### For Customers
1. Open http://localhost:5173
2. Browse available movies
3. Click "Book Now" on any movie
4. Select a showtime
5. Choose seats
6. Enter contact number
7. Confirm booking and receive receipt

### For Admins
1. On homepage, click "Admin" button (top right)
2. Enter secret code: **amiyo270**
3. Access admin dashboard
4. **Add Movie**: Fill form and click "Add Movie" button
5. **Edit Movie**: Click "✏️ Edit" button on any movie
6. **Delete Movie**: Click "🗑️ Delete" button (with confirmation)
7. All changes are immediately visible to customers

## API Endpoints

### Public Endpoints
- `GET /api/movies` - Get all movies
- `GET /api/movies/:id` - Get movie details
- `POST /api/bookings` - Create a booking

### Admin Endpoints (Require Bearer Token)
- `POST /api/admin/login` - Admin login with secret code
- `POST /api/admin/movies` - Create movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie
- `POST /api/admin/movies/:id/showtimes` - Add showtime
- `DELETE /api/admin/showtimes/:id` - Delete showtime

## Authentication

The admin panel uses JWT (JSON Web Tokens) for authentication:

1. Admin enters secret code (`amiyo270`)
2. Backend validates and returns JWT token
3. Token is stored in localStorage
4. All admin API requests include the token in Authorization header

## Real-time Updates

The customer homepage automatically fetches movies every 10 seconds, ensuring:
- New movies added by admin appear immediately
- Updated movie prices reflect in real-time
- Deleted movies disappear instantly

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify MySQL is running
- Check database credentials in `.env`

### Frontend can't connect to backend
- Ensure backend is running on http://localhost:5000
- Check CORS settings in backend (should allow localhost:5173)
- Open browser console for error messages

### Admin login fails
- Verify secret code is exactly: `amiyo270`
- Check backend is running
- Look for errors in backend console

## Environment Variables

### Backend (.env)
```
PORT=5000
ADMIN_SECRET=amiyo270
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ticket_booking_db
JWT_SECRET=your_jwt_secret_key_amiyo270
NODE_ENV=development
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Database Schema

### Movies Table
- id (Primary Key)
- title
- description
- posterUrl
- price
- created_at

### Showtimes Table
- id (Primary Key)
- movie_id (Foreign Key)
- time
- created_at

### Bookings Table
- id (Primary Key)
- movie_id (Foreign Key)
- showtime
- seats
- total_amount
- contact_number
- created_at

## Security Notes

⚠️ **Important for Production:**
1. Change `ADMIN_SECRET` from default value
2. Change `JWT_SECRET` to a strong, random value
3. Use environment-specific `.env` files
4. Enable HTTPS in production
5. Implement rate limiting on login endpoint
6. Add proper error handling and logging

## Future Enhancements

- User registration and login (for customers)
- Booking history
- Payment gateway integration
- Email notifications
- Multi-language support
- Booking cancellation
- Seat layout management
- Advanced analytics

---

**Created with ❤️ by Amiyo**
