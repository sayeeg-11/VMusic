# ⚡ Quick Reference - Backend URL Configuration

## 🎯 Current Setup

Your `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🔄 Switch Backend URL

### → Local Backend
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
Then run: `npm test` (backend) + `npm run dev` (frontend)

### → Render Backend
```env
VITE_API_BASE_URL=https://your-app.onrender.com/api
```
Then run: `npm run dev` (frontend only)

### → Vercel Backend
```env
VITE_API_BASE_URL=https://v-music-gamma.vercel.app/api
```
Then run: `npm run dev` (frontend only)

---

## ✅ How It Works

All API clients now use:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

**Files Updated:**
- ✅ `src/api/users.js`
- ✅ `src/api/favorites.js`
- ✅ `src/api/youtube.js`

---

## 🚀 Deploy to Render

1. Create Web Service on Render
2. Add environment variable: `MONGODB_URI`
3. Get your URL: `https://your-app.onrender.com`
4. Update `.env`:
   ```env
   VITE_API_BASE_URL=https://your-app.onrender.com/api
   ```
5. Restart: `npm run dev`

---

## 🧪 Test Configuration

```powershell
# Check current URL
(Get-Content .env | Select-String "VITE_API_BASE_URL").ToString()

# Test backend
$url = "http://localhost:3000/api"  # or your URL
Invoke-RestMethod -Uri "$url/users?userId=test"
```

---

## 📝 Remember

- ⚠️ Always restart `npm run dev` after changing `.env`
- 🔒 Never commit `.env` to Git
- ✅ Use `.env.example` as template
- 🌐 Backend URL must end with `/api`

---

**Quick Access:**
- Full Guide: `docs/ENVIRONMENT_CONFIG.md`
- API Docs: `docs/BACKEND_API.md`
