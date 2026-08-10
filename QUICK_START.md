# ⚡ Quick Reference Card

## 🚀 Get Started in 5 Minutes

### 1. Open Two Terminals

#### Terminal 1: Start Backend
```bash
cd e:\Movie_Ticket_BookingApp-main\backend
npm install
npm start
```
✅ Backend ready at: http://localhost:5000

#### Terminal 2: Start Frontend
```bash
cd e:\Movie_Ticket_BookingApp-main\frontend
npm install
npm run dev
```
✅ Frontend ready at: http://localhost:5173

### 2. Setup Database (Once)
```bash
mysql -u root -p < e:\Movie_Ticket_BookingApp-main\database.sql
```

## 🎬 Using the App

### As a Customer
1. Visit http://localhost:5173
2. Browse movies, search, select seats, book tickets

### As an Admin
1. Click "Admin" button on homepage
2. Enter code: **`amiyo270`**
3. Add/Edit/Delete movies in real-time

## 📂 Important Folders

| Folder | Purpose |
|--------|---------|
| `frontend/` | React app for customers + admin UI |
| `backend/` | Node.js API server |
| `frontend/components/AdminPanel.jsx` | Admin CRUD interface |
| `backend/server.js` | All API routes |

## 🔑 Key Files to Know

- **Admin Login**: `frontend/components/AdminLogin.jsx`
- **Admin Dashboard**: `frontend/components/AdminPanel.jsx`
- **Backend API**: `backend/server.js`
- **Database**: `database.sql`

## ⚙️ Configuration Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend settings (DB, secret code) |
| `frontend/.env` | Frontend settings (API URL) |
| `backend/package.json` | Backend dependencies |
| `frontend/package.json` | Frontend dependencies |

## 🆘 Quick Fixes

**Backend won't start?**
```bash
# Check if MySQL is running
# Check if port 5000 is free
# Verify .env file
```

**Can't see admin changes?**
```bash
# Refresh the browser
# Check backend is running
# Verify token in browser console
```

**Database connection error?**
```bash
# Make sure MySQL is running
# Check credentials in backend/.env
# Run: mysql -u root -p < database.sql
```

## 📞 Admin Secret Code
```
amiyo270
```

## 🔗 Important URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Admin Login | http://localhost:5173/admin/login |
| API Health | http://localhost:5000/api/health |

## 📚 Documentation

- **Quick Start**: See `README_NEW.md`
- **Detailed Setup**: See `SETUP_NEW.md`
- **Migration Info**: See `MIGRATION_GUIDE.md`

---

**Ready?** Start both servers and visit http://localhost:5173! 🚀
