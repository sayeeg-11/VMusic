# 🎬 YouTube Playlists Feature - Architecture Overview

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            VibeTube Page (/vibetube)                │    │
│  │  ┌──────────────────────────────────────────┐      │    │
│  │  │       SearchBar Component                 │      │    │
│  │  │  [🔍 Search] [🕒 History] [📺 YouTube]  │      │    │
│  │  └──────────────────────────────────────────┘      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Click YouTube button
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  YouTubePlaylists Modal                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  📺 My YouTube Playlists        [Close]             │    │
│  │  ────────────────────────────────────────            │    │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                  │    │
│  │  │ 🎵 │ │ 🎸 │ │ 🎹 │ │ 🎤 │  (Playlist Grid)    │    │
│  │  └─────┘ └─────┘ └─────┘ └─────┘                  │    │
│  │                                                      │    │
│  │  Click playlist → Show videos → Click video → Play  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### **1. User Authentication Flow**

```
User clicks "Sign in with Google"
        │
        ▼
┌──────────────────────┐
│  firebase.js         │
│  googleProvider      │
│  + YouTube scope     │  ← YouTube readonly permission requested
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  Google OAuth 2.0    │  ← User approves permissions
│  Consent Screen      │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  AuthContext.jsx     │
│  signInWithGoogle()  │
│  - Captures token    │  ← Extract oauthAccessToken
│  - Stores in state   │
│  - Saves to MongoDB  │
└──────────────────────┘
        │
        ▼
┌──────────────────────┐
│  MongoDB Database    │
│  users collection    │
│  {                   │
│    googleAccessToken │  ← Persistent storage
│    tokenExpiresAt    │
│  }                   │
└──────────────────────┘
```

### **2. YouTube Playlists Import Flow**

```
User clicks YouTube button
        │
        ▼
┌──────────────────────────────┐
│  VibeTube.jsx                │
│  setShowYouTubePlaylists()   │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  YouTubePlaylists.jsx        │
│  - Modal opens               │
│  - fetchPlaylists()          │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  src/api/youtube.js          │
│  getUserPlaylists()          │
│  - userId + accessToken      │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  api/youtube-playlists.js    │  ← Vercel Serverless Function
│  GET /api/youtube-playlists  │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  YouTube Data API v3         │  ← Google's API
│  playlists.list              │
│  - part: snippet             │
│  - mine: true                │
│  - Authorization: Bearer     │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Response Data               │
│  {                           │
│    items: [                  │
│      { id, title, thumbnail }│
│    ]                         │
│  }                           │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  YouTubePlaylists.jsx        │
│  - Display playlists         │
│  - User clicks playlist      │
│  - fetchPlaylistItems()      │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  YouTube Data API v3         │
│  playlistItems.list          │
│  - playlistId                │
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  VideoPlayer                 │
│  - Play selected video       │
└──────────────────────────────┘
```

---

## 🗂️ File Structure

```
VMusic/
│
├── src/
│   ├── config/
│   │   └── firebase.js              ← OAuth scope configuration
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx          ← Token management
│   │
│   ├── api/
│   │   └── youtube.js               ← Frontend API client
│   │
│   ├── components/vibetube/
│   │   ├── SearchBar.jsx            ← YouTube button
│   │   └── YouTubePlaylists.jsx     ← Playlist modal
│   │
│   └── pages/
│       └── VibeTube.jsx             ← Main page
│
├── api/
│   └── youtube-playlists.js         ← Backend API endpoint
│
└── .env                             ← Environment variables
```

---

## 🔐 Authentication Architecture

### **Token Lifecycle**

```
┌─────────────────────────────────────────────────────┐
│                  Token Lifecycle                     │
└─────────────────────────────────────────────────────┘

1. ACQUISITION (Sign-in)
   ┌──────────────────┐
   │  User signs in   │
   │  with Google     │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Receive token   │  ← oauthAccessToken
   │  (expires 1hr)   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Store in:       │
   │  - React State   │  ← Immediate use
   │  - MongoDB       │  ← Persistence
   └──────────────────┘

2. USAGE (API Calls)
   ┌──────────────────┐
   │  Get token from  │
   │  React Context   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Pass to API     │
   │  as Bearer token │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  YouTube API     │
   │  validates       │
   └──────────────────┘

3. RESTORATION (Page Refresh)
   ┌──────────────────┐
   │  User refresh    │
   │  or revisit      │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Load from       │
   │  MongoDB         │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Check expiry    │
   │  (tokenExpiresAt)│
   └────────┬─────────┘
            │
     ┌──────┴───────┐
     │              │
     ▼              ▼
 Valid          Expired
 Use it         Re-auth

4. EXPIRATION (After 1 hour)
   ┌──────────────────┐
   │  Token invalid   │
   │  API returns 401 │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Show friendly   │
   │  error message   │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │  Prompt user to  │
   │  sign in again   │
   └──────────────────┘
```

---

## 🎨 Component Hierarchy

```
App.jsx
└── AuthProvider (AuthContext)
    └── Router
        └── VibeTube.jsx
            ├── VibeTubeHeader
            │   └── SearchBar
            │       └── [🔍][🕒][📺] Buttons
            │
            ├── SearchResults
            │   └── VideoCards[]
            │
            ├── VideoPlayer
            │   └── YouTube iFrame
            │
            ├── PlaylistSidebar
            │   └── CurrentPlaylist
            │
            └── YouTubePlaylists (Modal)
                ├── Playlists Grid View
                │   └── PlaylistCard[]
                │
                └── Playlist Items View
                    └── VideoItem[]
                        └── Play button
```

---

## 📡 API Endpoints

### **Backend (Vercel Serverless)**

```
GET /api/youtube-playlists
  Query Params:
    - userId: string (required)
    - accessToken: string (required)
    - playlistId: string (optional)
  
  Response:
    {
      playlists: [{
        id: string,
        title: string,
        thumbnail: string,
        itemCount: number
      }],
      total: number
    }
```

### **YouTube Data API v3**

```
1. Fetch User Playlists
   GET https://www.googleapis.com/youtube/v3/playlists
   Headers:
     Authorization: Bearer {accessToken}
   Params:
     part=snippet,contentDetails
     mine=true
     maxResults=50

2. Fetch Playlist Items
   GET https://www.googleapis.com/youtube/v3/playlistItems
   Headers:
     Authorization: Bearer {accessToken}
   Params:
     part=snippet,contentDetails
     playlistId={id}
     maxResults=50
```

---

## 🔧 Configuration Files

### **1. firebase.js**
```javascript
googleProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
```

### **2. AuthContext.jsx**
```javascript
const token = result._tokenResponse.oauthAccessToken;
setGoogleAccessToken(token);
```

### **3. .env**
```env
VITE_YOUTUBE_API_KEY=...        # For public searches
VITE_FIREBASE_PROJECT_ID=...    # Must match OAuth project
```

---

## 🎯 State Management

```javascript
// Global State (AuthContext)
{
  currentUser: User | null,
  googleAccessToken: string | null,  ← YouTube API token
  loading: boolean
}

// VibeTube Component State
{
  showYouTubePlaylists: boolean,     ← Modal visibility
  searchResults: Video[],
  currentTrack: Video | null,
  isPlaying: boolean
}

// YouTubePlaylists Component State
{
  playlists: Playlist[],             ← User's playlists
  selectedPlaylist: Playlist | null,
  playlistItems: Video[],            ← Videos in selected playlist
  loading: boolean,
  error: string | null
}
```

---

## ⚡ Performance Optimizations

1. **Lazy Loading**: Playlists only fetch when modal opens
2. **Token Caching**: Store in MongoDB to avoid re-auth
3. **Conditional Rendering**: YouTube button only shows when token exists
4. **Error Boundaries**: Graceful error handling
5. **Loading States**: Smooth UX with spinners and animations

---

## 🛡️ Security Features

1. **Backend Proxy**: Token never exposed in frontend API calls
2. **CORS Protection**: Vercel serverless functions handle CORS
3. **Token Validation**: Check expiration before API calls
4. **Scope Limitation**: Only request `youtube.readonly` (read-only)
5. **Environment Variables**: Sensitive data in `.env`

---

## 📊 Error Handling

```javascript
// Token Expired
if (error.code === 'TOKEN_EXPIRED') {
  message = 'Sign in with Google again to get a fresh token';
}

// API Disabled
if (error.code === 'API_ACCESS_DENIED') {
  message = 'Enable YouTube Data API v3 in Google Cloud Console';
}

// Network Error
if (error.message.includes('fetch')) {
  message = 'Check your internet connection';
}

// No Playlists
if (playlists.length === 0) {
  message = 'Create playlists on YouTube first!';
}
```

---

## 🚀 Deployment Checklist

- [ ] YouTube Data API v3 enabled in Google Cloud
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created with correct redirect URIs
- [ ] Same Google Cloud project for Firebase + OAuth
- [ ] Environment variables set in Vercel
- [ ] CORS headers configured in API endpoints
- [ ] Error handling tested
- [ ] Token expiration flow tested

---

## 📈 Future Enhancements

1. **Refresh Token Support** - Auto-renew expired tokens
2. **Playlist Creation** - Create YouTube playlists from app
3. **Batch Import** - Import multiple playlists at once
4. **Sync Status** - Show which playlists are imported
5. **Offline Mode** - Cache playlists for offline access
6. **Analytics** - Track playlist import usage

---

## 🎉 Current Features

✅ Google OAuth with YouTube scope
✅ Token acquisition and storage
✅ Playlist fetching
✅ Playlist item fetching
✅ Beautiful UI with animations
✅ Error handling with friendly messages
✅ Token expiration detection
✅ MongoDB persistence
✅ One-click video playback
✅ Responsive design

**Everything is implemented! Just complete the OAuth setup in Google Cloud Console.**
