# Google OAuth & YouTube API Setup

## ✅ Current Status
- OAuth app is in **TESTING mode**
- Verification is **NOT required**
- Works for up to **100 test users**
- YouTube API only works for **test users**

## 🚨 CRITICAL: Add Test Users

### Step 1: Go to Google Cloud Console
https://console.cloud.google.com/

### Step 2: Navigate to OAuth Consent Screen
1. Click **"APIs & Services"** → **"OAuth consent screen"**
2. Scroll down to **"Test users"** section
3. Click **"+ ADD USERS"**

### Step 3: Add These Email Addresses
```
baraiyavishalbhai32@gmail.com
baraiyanayanbhai32@gmail.com
```

### Step 4: Add More Users (Optional)
Anyone who wants to use YouTube features must be added here.

---

## ✅ Verify OAuth Scopes

### Step 1: Check OAuth Consent Screen
Make sure these scopes are enabled:
- `https://www.googleapis.com/auth/youtube.readonly`
- `email`
- `profile`
- `openid`

### Step 2: Check Your Code
File: `src/config/firebase.js`

Should have:
```javascript
googleProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');
```

---

## ✅ Enable YouTube Data API v3

### Step 1: Go to API Library
1. Click **"APIs & Services"** → **"Library"**
2. Search for **"YouTube Data API v3"**
3. Click **"ENABLE"**

### Step 2: Check API is Enabled
1. Go to **"APIs & Services"** → **"Enabled APIs & services"**
2. Verify **"YouTube Data API v3"** appears in the list

---

## ✅ Verify Authorized Redirect URIs

### Go to Credentials
1. Click **"APIs & Services"** → **"Credentials"**
2. Click your **OAuth 2.0 Client ID**
3. Under **"Authorized redirect URIs"**, add:

```
http://localhost:5174
http://localhost:5174/
https://v-music-gamma.vercel.app
https://v-music-gamma.vercel.app/
```

4. Under **"Authorized JavaScript origins"**, add:

```
http://localhost:5174
https://v-music-gamma.vercel.app
```

---

## 🔍 Debugging Token Issues

### Check if Token is Being Obtained

1. Open browser console
2. Sign in with Google
3. Look for:
```
✅ Google access token obtained for YouTube API
✅ Access token saved to MongoDB
```

### If Token is Null

**Possible causes:**
1. ❌ User is not added to test users
2. ❌ Scope is not requested in `firebase.js`
3. ❌ OAuth consent screen missing scope
4. ❌ Redirect URI mismatch

**Fix:**
1. Add user to test users
2. Check `googleProvider.addScope()` in firebase.js
3. Sign out completely
4. Clear browser cache
5. Sign in again

---

## 📋 Testing Checklist

### Before Testing YouTube Features:

- [ ] YouTube Data API v3 is enabled
- [ ] OAuth consent screen has `youtube.readonly` scope
- [ ] Test user email is added to test users list
- [ ] Redirect URIs are correct
- [ ] User signs in with Google (not email/password)
- [ ] Console shows "access token obtained"
- [ ] Token is not null in logs

### Test Flow:

1. ✅ Sign out completely
2. ✅ Sign in with Google (use test user email)
3. ✅ Check console for access token
4. ✅ Go to VibeTube
5. ✅ Click "Import from YouTube" button
6. ✅ Should see your playlists

---

## ⚠️ Important Notes

### OAuth Testing Mode Limitations:
- Only 100 test users allowed
- Each user must be explicitly added
- Non-test users get "App not verified" error
- YouTube API only works for test users

### When to Publish (Optional):
If you want public access:
1. Submit app for verification
2. Google reviews it (2-6 weeks)
3. All users can sign in
4. YouTube API works for everyone

**For now:** Testing mode is perfect for development!

---

## 🐛 Common Errors & Solutions

### Error: "This app is not verified"
**Solution:** Add user email to test users list

### Error: "YouTube API access denied"
**Solutions:**
1. Enable YouTube Data API v3
2. Add user to test users
3. Check OAuth scopes
4. Verify token is obtained

### Error: "Token is null"
**Solutions:**
1. Check firebase.js has `addScope('youtube.readonly')`
2. Add user to test users
3. Clear browser cache and sign in again
4. Check redirect URI matches exactly

### Error: "Failed to get document (offline)"
**Solution:** This is normal, Firestore will sync when online

---

## 📞 Support

If you need help:
- Check browser console for errors
- Verify all steps above
- Test with a test user account
- Check Google Cloud Console for API errors
