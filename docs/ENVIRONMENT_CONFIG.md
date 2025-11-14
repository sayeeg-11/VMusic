# 🔧 Environment Configuration Guide

## Overview

VMusic uses environment variables to configure API endpoints and services. This allows you to easily switch between local development, Render, and Vercel deployments.

---

## 📝 Configuration Files

### `.env` (Your Active Configuration)
Contains your actual API keys and URLs - **NEVER commit this file to Git**

### `.env.example` (Template)
Template file showing required variables - Safe to commit to Git

---

## 🌐 Backend API URL Configuration

### Environment Variable
```env
VITE_API_BASE_URL=<your_backend_url>
```

### Available Options

#### **1. Local Development (Node.js)**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```
Use when running backend locally with `npm test` or `npm start`

#### **2. Render Deployment**
```env
VITE_API_BASE_URL=https://your-app-name.onrender.com/api
```
Replace `your-app-name` with your Render app name

#### **3. Vercel Deployment (Serverless)**
```env
VITE_API_BASE_URL=https://v-music-gamma.vercel.app/api
```
Current production URL on Vercel

---

## 🚀 Quick Setup

### Step 1: Copy Environment Template
```powershell
Copy-Item .env.example .env
```

### Step 2: Configure Backend URL

**For Local Development:**
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**For Render Production:**
```env
VITE_API_BASE_URL=https://vmusic-backend.onrender.com/api
```

**For Vercel Production:**
```env
VITE_API_BASE_URL=https://v-music-gamma.vercel.app/api
```

### Step 3: Add MongoDB URI
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### Step 4: Restart Dev Server
```powershell
npm run dev
```

---

## 🔄 Switching Between Environments

### Development → Local Backend
```env
# .env
VITE_API_BASE_URL=http://localhost:3000/api
```

```powershell
# Terminal 1: Start backend
npm test

# Terminal 2: Start frontend
npm run dev
```

### Development → Render Backend
```env
# .env
VITE_API_BASE_URL=https://your-app.onrender.com/api
```

```powershell
# Only need frontend running
npm run dev
```

### Production → Vercel
```env
# .env (on Vercel dashboard)
VITE_API_BASE_URL=https://v-music-gamma.vercel.app/api
```

---

## 📦 Deploying to Render

### 1. Create Render Account
Go to: https://render.com/

### 2. Create New Web Service
- **Type:** Web Service
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. Add Environment Variables
In Render dashboard, add:
```
MONGODB_URI=mongodb+srv://i_am_vishal_1014:1014@cluster0.r4bt2.mongodb.net
PORT=3000
```

### 4. Deploy
Render will provide a URL like: `https://vmusic-backend.onrender.com`

### 5. Update Frontend .env
```env
VITE_API_BASE_URL=https://vmusic-backend.onrender.com/api
```

### 6. Redeploy Frontend
```powershell
# Commit and push to trigger Vercel deployment
git add .
git commit -m "Update backend URL to Render"
git push origin main
```

---

## 🧪 Testing Configuration

### Check Current Backend URL
```javascript
// In browser console
console.log(import.meta.env.VITE_API_BASE_URL);
```

### Test Backend Connection
```powershell
# Test users endpoint
Invoke-RestMethod -Uri "$env:VITE_API_BASE_URL/users?userId=test"

# Or with current .env value
$apiUrl = "http://localhost:3000/api"  # or your URL
Invoke-RestMethod -Uri "$apiUrl/users?userId=test"
```

---

## 📋 All Environment Variables

### Frontend (Vite) Variables
```env
# API URLs
VITE_API_BASE_URL=http://localhost:3000/api

# External APIs
VITE_JAMENDO_CLIENT_ID=83bfb626
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
VITE_YOUTUBE_API_KEY=your_api_key

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config

# EmailJS
VITE_EMAILJS_USER_ID=your_user_id
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

### Backend (Node.js) Variables
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net

# Server
PORT=3000
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore`
- Use `.env.example` as template
- Rotate API keys regularly
- Use environment-specific values
- Store secrets in deployment platform (Vercel/Render)

### ❌ DON'T:
- Commit `.env` to Git
- Share API keys publicly
- Use production keys in development
- Hardcode URLs in source code

---

## 🐛 Troubleshooting

### Issue: "API Base URL undefined"
**Solution:** Make sure variable name starts with `VITE_`
```env
# ❌ Wrong
API_BASE_URL=http://localhost:3000/api

# ✅ Correct
VITE_API_BASE_URL=http://localhost:3000/api
```

### Issue: "Changes not reflected"
**Solution:** Restart dev server after changing `.env`
```powershell
# Stop server (Ctrl+C)
npm run dev
```

### Issue: "CORS error"
**Solution:** Ensure backend URL is correct and backend is running
```powershell
# Check backend status
curl http://localhost:3000/api/users?userId=test
```

### Issue: "404 on API calls"
**Solution:** Verify `/api` suffix in URL
```env
# ✅ Correct
VITE_API_BASE_URL=http://localhost:3000/api

# ❌ Wrong (missing /api)
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📊 Environment Comparison

| Environment | Frontend | Backend | Database |
|-------------|----------|---------|----------|
| **Local Dev** | `localhost:5173` | `localhost:3000` | MongoDB Atlas |
| **Render** | Vercel | Render | MongoDB Atlas |
| **Vercel** | Vercel | Vercel Serverless | MongoDB Atlas |

---

## 🎯 Quick Commands

### Development (Local Backend)
```powershell
# Terminal 1: Backend
npm test

# Terminal 2: Frontend
npm run dev

# .env setting
VITE_API_BASE_URL=http://localhost:3000/api
```

### Development (Remote Backend)
```powershell
# Terminal: Frontend only
npm run dev

# .env setting
VITE_API_BASE_URL=https://your-app.onrender.com/api
```

### Check Current Config
```powershell
# View .env file
Get-Content .env

# Test backend URL
$url = (Get-Content .env | Select-String "VITE_API_BASE_URL").ToString().Split("=")[1]
Invoke-RestMethod -Uri "$url/users?userId=test"
```

---

## 📝 Example Configurations

### Local Development
```env
VITE_API_BASE_URL=http://localhost:3000/api
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### Render Production
```env
VITE_API_BASE_URL=https://vmusic-api.onrender.com/api
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

### Vercel Serverless
```env
VITE_API_BASE_URL=https://v-music-gamma.vercel.app/api
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
```

---

**Last Updated:** November 14, 2025
