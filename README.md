# 🎬 Movie Ticket Booking App

A full-stack web application that allows users to browse movies, select seats, and book tickets online. Admins can manage movies, showtimes, and view all bookings through a dedicated admin panel.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend (User App)** | https://bookyourtheater.netlify.app |
| **Admin Panel** | https://bookyourtheater.netlify.app/admin |
| **Backend API** | Hosted on Railway |

---

## ✨ Features

### User Side
- 🎥 Browse available movies with posters, descriptions, and pricing
- 🪑 Interactive seat selection (booked seats are blocked)
- 📋 Checkout with contact number
- 🧾 View booking receipt after payment
- 📱 Search booking history using your phone number

### Admin Side
- 🔐 Secure admin login with JWT authentication
- 📊 Dashboard with total revenue, today's revenue, and booking counts
- 🎬 Full movie management — Add, Edit, Delete movies and showtimes
- 📋 View all bookings with seat details, amount, and contact info

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (hosted on Railway) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Frontend Hosting** | Netlify |
| **Backend Hosting** | Railway |

---

## 🗄️ Database Schema

The app uses **4 MySQL tables**:

```
movies        → id, title, description, posterUrl, price
showtimes     → id, movie_id, time
bookings      → id, movie_id, showtime_id, seats (JSON), total_amount, contact_number, booking_status
seat_bookings → id, movie_id, showtime_id, seat_number, booking_id
```

> See `database.sql` for the full schema with all constraints and relationships.

---

## 📁 Project Structure

```
Movie_Ticket_BookingApp-main/
├── backend/
│   ├── server.js          ← Express API server (MySQL)
│   ├── railway.toml       ← Railway deployment config
│   ├── package.json
│   └── .env.example       ← Required environment variables
├── frontend/
│   ├── components/        ← All React UI components
│   │   ├── AdminPanelEnhanced.jsx
│   │   ├── BookingHistory.jsx
│   │   ├── BookingPageEnhanced.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── HomePage.jsx
│   │   └── SeatSelection.jsx
│   ├── index.html         ← Main user app entry point
│   ├── admin.html         ← Admin panel entry point
│   └── vite.config.js
├── database.sql           ← MySQL schema definition
├── netlify.toml           ← Netlify deployment config
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`.env`)
```
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
ADMIN_SECRET=your_admin_password
PORT=5000
```

### Frontend (`.env`)
```
VITE_API_URL=https://your-backend-url.up.railway.app
```

---

## 🚀 How to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/Amiyo270/Web--Programming-Project.git
cd Web--Programming-Project
```

### 2. Set up the database
- Import `database.sql` into your local MySQL server.

### 3. Start the backend
```bash
cd backend
npm install
# Copy .env.example to .env and fill in your values
npm start
```

### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 👨‍💻 Developed By

**Amiyo** — Web Programming Project  
Submitted as part of the Web Programming course assignment.
