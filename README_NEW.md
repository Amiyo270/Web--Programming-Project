# 🎬 Movie Ticket Booking App

A modern, full-stack movie ticket booking application with separate customer and admin interfaces.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)

### Installation

1. **Setup Database**
   ```bash
   mysql -u root -p < database.sql
   ```

2. **Setup Backend** (Terminal 1)
   ```bash
   cd backend
   npm install
   npm start
   # Runs on http://localhost:5000
   ```

3. **Setup Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:5173
   ```

## 📋 Features

### 👥 Customer Interface
- ✅ Browse movies
- ✅ Search functionality
- ✅ Select showtimes
- ✅ Choose seats
- ✅ Book tickets
- ✅ Dark/Light theme toggle
- ✅ Real-time movie updates

### 🔐 Admin Panel
- ✅ **Login**: Secret code authentication (`amiyo270`)
- ✅ **Create**: Add new movies
- ✅ **Read**: View all movies and bookings
- ✅ **Update**: Edit movie details
- ✅ **Delete**: Remove movies
- ✅ **Real-time Sync**: Changes visible instantly to customers

## 📁 Project Structure

```
├── frontend/               # React + Vite
│   ├── components/
│   │   ├── HomePage.jsx
│   │   ├── AdminLogin.jsx
│   │   ├── AdminPanel.jsx
│   │   └── ...
│   ├── App.jsx
│   └── vite.config.js
│
├── backend/               # Node.js + Express
│   ├── server.js          # API endpoints
│   ├── .env              # Configuration
│   └── package.json
│
└── database.sql          # MySQL schema
```

## 🔑 Admin Credentials

**Secret Code**: `amiyo270`

## 📡 API Endpoints

### Public
- `GET /api/movies` - List all movies
- `POST /api/bookings` - Create booking

### Admin (Authenticated)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/movies` - Add movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, React Router, TailwindCSS
- **Backend**: Node.js, Express, MySQL, JWT
- **Database**: MySQL

## 📖 Detailed Setup

See [SETUP_NEW.md](./SETUP_NEW.md) for comprehensive installation and usage guide.

## 🔒 Security

- JWT-based authentication
- Admin secret code validation
- Protected admin endpoints
- Secure password storage ready

## 📝 License

Created with ❤️ by Amiyo

---

**Ready to use!** Start with the Quick Start section above. 🚀
