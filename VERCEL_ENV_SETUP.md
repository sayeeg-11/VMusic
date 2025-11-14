# Vercel Environment Variable Setup

## ⚠️ CRITICAL: MongoDB Not Working

Your database is empty because **Vercel doesn't have the MongoDB URI environment variable**.

## 🔧 Fix Steps:

### 1. Go to Vercel Dashboard
Open: https://vercel.com/

### 2. Select Your Project
- Click on **v-music** project
- Or go directly to: https://vercel.com/your-username/v-music

### 3. Add Environment Variable
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New** button
4. Fill in:
   - **Key**: `MONGODB_URI`
   - **Value**: `mongodb+srv://i_am_vishal_1014:1014@cluster0.r4bt2.mongodb.net/vmusic?retryWrites=true&w=majority`
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**

### 4. Redeploy
1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~1-2 minutes)

### 5. Test
1. Open: https://v-music-gamma.vercel.app
2. Sign in with Google
3. Check MongoDB Atlas:
   - Go to: https://cloud.mongodb.com
   - Database → Browse Collections
   - Check `vmusic` database → `users` collection
   - Your user should appear!

## 📝 Current Environment Variables Needed in Vercel:

```
MONGODB_URI=mongodb+srv://i_am_vishal_1014:1014@cluster0.r4bt2.mongodb.net/vmusic?retryWrites=true&w=majority
```

All other variables (VITE_*) are bundled into the frontend at build time and don't need to be in Vercel.

## ✅ After Setup

Once the environment variable is added and redeployed:
- User login data will save to MongoDB
- Search history will be tracked
- Favorites will persist
- YouTube tokens will be stored

## 🐛 Current Error

```
{"error":"Internal server error","details":"Cannot read properties of undefined (reading 'startsWith')"}
```

This error happens because `process.env.MONGODB_URI` is undefined in the serverless function.
