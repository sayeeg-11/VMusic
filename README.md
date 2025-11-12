# 🎵 VMusic

> **"Feel the Indie Beat. Free. Forever."**

A modern, professional-grade music streaming web app featuring indie music from Jamendo API and Spotify integration for discovering trending tracks. Built with React, Vite, Tailwind CSS, Firebase, and more.

---

## ✨ Features

### 🎧 **Music Streaming**
- Full-length royalty-free songs from Jamendo
- 30-second previews from Spotify (Vibe Zone)
- Mini floating player with volume controls
- Play/pause, seek, and track progress

### 🔍 **Discovery & Search**
- Search songs, artists, and albums (Jamendo)
- Browse artists with location filters (12 countries)
- Spotify Vibe Zone with 7 categories (Hindi, Bollywood, Trending, etc.)
- Album details with track listings

### 👤 **User Features**
- Firebase authentication (email/password, Google OAuth)
- User profiles with avatar uploads (Firebase Storage)
- Favorites/liked tracks (synced with Firestore)
- Password reset via EmailJS
- Personalized dashboard

### 🎨 **UI/UX**
- Modern glassmorphism design with gradients
- Dark theme optimized for music listening
- Fully responsive (mobile, tablet, desktop)
- Smooth animations with Framer Motion
- Toast notifications for user feedback

---

## 🛠️ Tech Stack

### **Frontend**
- **React** 19.2.0 - UI library
- **Vite** 7.2.2 - Build tool & dev server
- **React Router DOM** 7.1.1 - Client-side routing
- **Tailwind CSS** 4.1.17 - Utility-first styling
- **Framer Motion** 12.23.24 - Animation library

### **Backend & Services**
- **Firebase** 11.2.0
  - Authentication (Email/Password, Google OAuth)
  - Firestore Database (user data, favorites)
  - Storage (profile pictures)
- **EmailJS** - Password reset emails
- **Vercel Serverless Functions** - Secure Spotify token generation

### **APIs**
- **Jamendo API** - Primary music source (royalty-free)
- **Spotify Web API** - Vibe Zone music discovery (Client Credentials flow)

### **UI Components & Icons**
- **Lucide React** 0.469.0 - Icon library
- **React Hot Toast** 2.4.1 - Toast notifications

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Firebase Account** - [Create one](https://console.firebase.google.com/)
- **Jamendo API Key** - [Get free key](https://devportal.jamendo.com/)
- **Spotify Developer Account** - [Get credentials](https://developer.spotify.com/dashboard)
- **EmailJS Account** - [Sign up](https://www.emailjs.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/VMusic.git
cd VMusic

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Edit .env with your API keys (see below)
```

### Environment Variables Setup

Create a `.env` file in the root directory:

```bash
# Jamendo API Configuration
VITE_JAMENDO_CLIENT_ID=your_jamendo_client_id_here

# Spotify API Configuration (for Vibe Zone)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# EmailJS Configuration (for password reset)
VITE_EMAILJS_USER_ID=your_emailjs_user_id
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
```

### Getting API Keys

#### 1. **Jamendo API**
1. Visit [Jamendo Developer Portal](https://devportal.jamendo.com/)
2. Sign up for free account
3. Create new app
4. Copy Client ID to `VITE_JAMENDO_CLIENT_ID`

#### 2. **Spotify API**
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create new app
3. Add `http://localhost:5173/callback` to Redirect URIs
4. Copy Client ID to `VITE_SPOTIFY_CLIENT_ID`
5. Copy Client Secret to `VITE_SPOTIFY_CLIENT_SECRET`

#### 3. **Firebase**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Authentication (Email/Password, Google)
4. Create Firestore Database (start in test mode)
5. Enable Storage
6. Go to Project Settings → Copy config values to `.env`

#### 4. **EmailJS**
1. Sign up at [EmailJS](https://www.emailjs.com/)
2. Create email service (Gmail, Outlook, etc.)
3. Create email template for password reset
4. Copy User ID, Service ID, and Template ID to `.env`

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` 🎉

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
VMusic/
├── api/
│   └── spotify-token.js      # Vercel serverless function
├── docs/
│   └── ENVIRONMENT_VARIABLES.md
├── public/
│   └── logo.png
├── src/
│   ├── api/
│   │   └── jamendo.js        # Jamendo API integration
│   ├── components/
│   │   ├── auth/             # SignIn, SignUp components
│   │   ├── layout/           # Navbar, Footer
│   │   ├── player/           # Music player
│   │   └── Toast.jsx         # Toast notifications
│   ├── config/
│   │   └── firebase.js       # Firebase configuration
│   ├── contexts/
│   │   ├── AuthContext.jsx   # Authentication state
│   │   └── PlayerContext.jsx # Player state
│   ├── pages/
│   │   ├── Album.jsx         # Album details page
│   │   ├── Artists.jsx       # Artists with albums
│   │   ├── Dashboard.jsx     # User dashboard
│   │   ├── Explore.jsx       # Music discovery
│   │   ├── Favorites.jsx     # Liked tracks
│   │   ├── Profile.jsx       # User profile
│   │   ├── TrackDetails.jsx  # Track info
│   │   └── VibeZone.jsx      # Spotify integration
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env                       # Your API keys (DO NOT COMMIT)
├── .env.example               # Template for environment variables
├── .gitignore
├── package.json
├── README.md
├── ROADMAP.md
├── tailwind.config.cjs
├── VERCEL_SETUP.md           # Deployment guide
├── VIBE_ZONE_DEPLOYMENT.md   # Vibe Zone specific setup
├── vercel.json               # Vercel configuration
└── vite.config.js
```

---

## 🎯 Key Features Breakdown

### 🎵 **Jamendo Integration**
- Browse 500,000+ royalty-free tracks
- Search by artist, album, track name
- Filter by genre, mood, country
- Album downloads (when available)
- Full track streaming

### 🎧 **Vibe Zone (Spotify)**
- Secure token management (Client Credentials flow)
- 7 music categories (Hindi, Bollywood, Romantic, Trending, Lo-Fi, Party, Chill)
- Custom search with Indian market focus (market=IN)
- 30-second preview playback
- Album artwork and artist info
- Direct Spotify links

### 🔐 **Authentication & User Management**
- Email/password authentication
- Google OAuth sign-in
- Password reset via email
- User profile with avatar upload
- Secure session management

### ❤️ **Favorites & Personalization**
- Like/unlike tracks
- Synced across devices (Firestore)
- Separate favorites for Jamendo and Spotify
- Persistent storage

---

## 🚢 Deployment

### **Deploy to Vercel** (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# Settings → Environment Variables → Add:
# - SPOTIFY_CLIENT_SECRET (without VITE_ prefix)
# - All other variables with VITE_ prefix

# Redeploy
vercel --prod
```

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed instructions.

---

## 📚 Documentation

- **[ROADMAP.md](./ROADMAP.md)** - Development roadmap and progress tracker
- **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** - Deployment instructions
- **[VIBE_ZONE_DEPLOYMENT.md](./VIBE_ZONE_DEPLOYMENT.md)** - Vibe Zone setup guide
- **[docs/ENVIRONMENT_VARIABLES.md](./docs/ENVIRONMENT_VARIABLES.md)** - Complete environment variables guide

---

## 🎨 Current Features Status

| Feature | Status |
|---------|--------|
| Jamendo Music Streaming | ✅ Complete |
| Search & Filters | ✅ Complete |
| Artist Discovery | ✅ Complete |
| Album Pages | ✅ Complete |
| Spotify Vibe Zone | ✅ Complete |
| Firebase Authentication | ✅ Complete |
| User Profiles | ✅ Complete |
| Favorites/Likes | ✅ Complete |
| Password Reset | ✅ Complete |
| Mini Player | ✅ Complete |
| Responsive Design | ✅ Complete |
| Dark Theme | ✅ Complete |
| Toast Notifications | ✅ Complete |

---

## 🔧 Development

### Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Code Style
- React functional components with hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Environment variables for secrets

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Credits & Acknowledgments

### Music APIs
- **[Jamendo](https://www.jamendo.com/)** - Royalty-free music platform
- **[Spotify Web API](https://developer.spotify.com/)** - Music discovery and previews

### Technologies
- **[React](https://react.dev/)** - UI library
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework
- **[Firebase](https://firebase.google.com/)** - Backend services
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide Icons](https://lucide.dev/)** - Icon library
- **[EmailJS](https://www.emailjs.com/)** - Email service

---

## 📧 Support & Contact

For questions, issues, or feature requests:
- Open an issue on GitHub
- Use the Contact page in the app
- Email: your-email@example.com

---

**Built with ❤️ by VISHALBHAI**

**Happy Listening! 🎵**
