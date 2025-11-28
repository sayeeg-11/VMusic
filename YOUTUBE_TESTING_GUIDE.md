# 🧪 YouTube OAuth Testing Guide

## Quick Test Checklist

### ✅ Step 1: Verify Configuration
```bash
# Check if Firebase config matches OAuth project
grep "VITE_FIREBASE_PROJECT_ID" .env
# Should output: VITE_FIREBASE_PROJECT_ID=vmusic-7806a

# The OAuth credentials you provided are for: vmusic-478107
# ⚠️ MISMATCH DETECTED! You need to fix this.
```

### ✅ Step 2: Test Google Sign-In

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console (F12)

3. Click "Sign in with Google"

4. Look for these logs:
   ```
   🔍 Google Sign-In Result: { hasOAuthAccessToken: true }
   ✅ Google access token obtained for YouTube API
   🎯 Token length: [number]
   ⏰ Token expires at: [date/time]
   ```

### ✅ Step 3: Test YouTube Playlists Button

1. Go to `/vibetube` page

2. Check if YouTube icon button appears in search bar

3. Console should show:
   ```
   🔍 VibeTube Auth Status: {
     hasUser: true,
     hasToken: true,
     tokenPreview: "ya29.a0..."
   }
   ```

4. Click YouTube button (inside search bar, right side)

5. Should see playlist modal open

### ✅ Step 4: Test Playlist Loading

**If API Enabled:**
```
✅ Modal opens
✅ Shows loading spinner
✅ Displays your playlists
✅ Click playlist → shows videos
```

**If API Not Enabled:**
```
❌ Error: "YouTube API is not available..."
→ Follow setup guide to enable API
```

### ✅ Step 5: Token Expiration Test

1. Wait 1 hour (or modify expiration time for testing)
2. Try loading playlists
3. Should see: "⏰ Your Google sign-in session has expired"
4. Sign out and sign in again → fresh token

---

## 🐛 Debug Commands

### Check Token in MongoDB
```javascript
// In browser console after sign-in
fetch('https://v-music-gamma.vercel.app/api/users?userId=' + currentUser.uid)
  .then(r => r.json())
  .then(data => console.log('Token:', data.googleAccessToken?.substring(0, 50)));
```

### Validate Token Manually
```javascript
// In browser console
const token = "YOUR_TOKEN_HERE";
fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`)
  .then(r => r.json())
  .then(data => console.log('Token Info:', data));
```

### Test YouTube API Direct Call
```javascript
// In browser console with valid token
const token = "YOUR_TOKEN_HERE";
fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=5', {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(data => console.log('Playlists:', data));
```

---

## 🔧 Common Issues

### Issue: "No YouTube button visible"

**Check:**
```javascript
// In browser console on /vibetube page
console.log('User:', !!currentUser);
console.log('Token:', !!googleAccessToken);
```

**Solution:**
- Both must be `true`
- If token is `false`, sign out and sign in with Google again

### Issue: "401 Unauthorized"

**Causes:**
1. Token expired (>1 hour old)
2. Wrong token format
3. Token not from correct Google project

**Solution:** Sign out and sign in again

### Issue: "403 Forbidden"

**Causes:**
1. YouTube API not enabled
2. Quota exceeded
3. OAuth consent screen not configured

**Solution:** Complete Google Cloud Console setup

### Issue: "Invalid Client"

**Cause:** Firebase project ≠ OAuth project

**Solution:**
1. Go to Google Cloud Console
2. Select **vmusic-7806a** (Firebase project)
3. Create new OAuth credentials in this project
4. Update authorized redirect URIs

---

## 🎯 Expected Behavior

### First Sign-In (Email/Password)
```
❌ No YouTube button (no Google OAuth token)
```

### Sign-In with Google
```
✅ YouTube button appears
✅ Token stored in MongoDB
✅ Token expires in 1 hour
✅ Can import playlists
```

### Subsequent Visits (within 1 hour)
```
✅ Token restored from MongoDB
✅ YouTube button appears
✅ Can import playlists
```

### After 1 Hour
```
⚠️ Token expired
❌ Playlist fetch fails with friendly error
→ User must sign in with Google again
```

---

## 📊 Monitoring

### Check Token Status
```javascript
// Add to VibeTube.jsx for debugging
useEffect(() => {
  if (googleAccessToken) {
    youtubeAPI.validateAccessToken(googleAccessToken)
      .then(valid => console.log('Token valid:', valid));
  }
}, [googleAccessToken]);
```

### Log All YouTube API Calls
```javascript
// Already implemented in api/youtube-playlists.js
console.log('🔍 Fetching YouTube playlists...');
console.log('Token preview:', accessToken.substring(0, 30) + '...');
```

---

## ✅ Success Indicators

1. **Sign-in works**
   - Console shows token obtained
   - Token saved to MongoDB
   - Token has expiration time

2. **YouTube button appears**
   - Visible in search bar
   - Only when signed in with Google
   - Disappears when token expires

3. **Playlists load**
   - Modal opens smoothly
   - Playlists display with thumbnails
   - Videos play when clicked

4. **Error handling works**
   - Expired token → friendly message
   - API disabled → helpful instructions
   - Network error → retry option

---

## 🚀 Production Deployment

### Before Deploy

1. ✅ Test locally with dev Firebase
2. ✅ Enable YouTube API in production project
3. ✅ Add production URLs to OAuth redirect URIs
4. ✅ Set environment variables in Vercel

### Vercel Environment Variables

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=vmusic-7806a
VITE_YOUTUBE_API_KEY=...
MONGODB_URI=...
```

### Post-Deploy Tests

1. Sign in with Google on production
2. Check browser console for token logs
3. Try importing YouTube playlists
4. Verify MongoDB stores tokens correctly

---

## 📞 Support

If issues persist after following setup guide:

1. Check browser console for errors
2. Check Vercel function logs
3. Verify all environment variables
4. Confirm YouTube API is enabled
5. Check OAuth redirect URIs match exactly

---

## 🎉 When Everything Works

You'll see:
- ✅ Smooth Google OAuth flow
- ✅ YouTube button in search bar
- ✅ Beautiful playlist modal
- ✅ All your playlists with thumbnails
- ✅ One-click video playback
- ✅ Friendly error messages

**No additional code needed!** Just configure Google Cloud Console. 🚀
