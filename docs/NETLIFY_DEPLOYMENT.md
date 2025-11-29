# 🚀 Netlify Deployment Guide

## ⚠️ Critical Security Setup

### Understanding Environment Files

VMusic uses **3 environment files**:

| File | Purpose | Git Tracked? | Contains Real Secrets? |
|------|---------|--------------|----------------------|
| `.env.local` | Local development | ❌ No | ✅ Yes (your real keys) |
| `.env` | Fallback template | ✅ Yes | ❌ No (placeholders) |
| `.env.production` | Production builds | ✅ Yes | ❌ No (placeholders) |

### How It Works

1. **Local Development**: Vite reads `.env.local` (real keys)
2. **Production Build**: Vite reads `.env.production` (placeholders)
3. **Netlify Runtime**: Replaces placeholders with environment variables from dashboard

## 📋 Pre-Deployment Checklist

### ✅ Verify Files Are Safe

Run this PowerShell command to check your build:

```powershell
# Clean build
Remove-Item -Path "dist" -Recurse -Force; npm run build

# Scan for secrets
'AIzaSy', '375b56d', '83bfb626', 'vcfvtcxuQfUbBL4ze' | ForEach-Object {
    $pattern = $_
    $found = Select-String -Path "dist/assets/*.js" -Pattern $pattern -Quiet
    if ($found) { 
        Write-Host "❌ FOUND: $pattern in build bundle!" -ForegroundColor Red
    } else { 
        Write-Host "✅ CLEAN: $pattern" -ForegroundColor Green
    }
}
```

**Expected result**: All ✅ CLEAN

### ✅ Verify Git Status

```powershell
# Check which files will be committed
git status

# Verify .env.local is NOT in the list
# Verify .env.production IS in the list
```

## 🌐 Netlify Dashboard Setup

### Step 1: Create New Site

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18 or higher

### Step 2: Set Environment Variables

Go to: **Site settings** → **Environment variables** → **Add a variable**

Add these variables with your **REAL** values:

#### Jamendo API
```
VITE_JAMENDO_CLIENT_ID = 83bfb626
```

#### Spotify API
```
VITE_SPOTIFY_CLIENT_ID = 375b56d194264fd18ddc1e4151bb6c48
VITE_SPOTIFY_REDIRECT_URI = https://your-site.netlify.app/callback
```
⚠️ Replace `your-site` with your actual Netlify site name

#### YouTube API
```
VITE_YOUTUBE_API_KEY = AIzaSyDQ4i49eBhNllyOkRh-0DyOWmkxnGGPojc
```

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY = AIzaSyAxRVuhduqnfQF9Vb-Oz7PROv2Vb4zwj9U
VITE_FIREBASE_AUTH_DOMAIN = vmusic-7806a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = vmusic-7806a
VITE_FIREBASE_STORAGE_BUCKET = vmusic-7806a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 744562805154
VITE_FIREBASE_APP_ID = 1:744562805154:web:b648e940fe59c5593b4afb
VITE_FIREBASE_MEASUREMENT_ID = G-W9H7B4JZY0
```

#### EmailJS Configuration
```
VITE_EMAILJS_USER_ID = vcfvtcxuQfUbBL4ze
VITE_EMAILJS_SERVICE_ID = service_ef4l8lb
VITE_EMAILJS_TEMPLATE_ID = template_0evqhzo
```

#### Backend API URL
```
VITE_API_BASE_URL = https://v-music-gamma.vercel.app/api
```

### Step 3: Update OAuth Redirect URIs

#### Spotify Developer Dashboard
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Click **"Edit Settings"**
4. Add Redirect URI:
   ```
   https://your-site.netlify.app/callback
   ```

#### Google Cloud Console (YouTube API)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project → **APIs & Services** → **Credentials**
3. Edit OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://your-site.netlify.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://your-site.netlify.app/__/auth/handler
   ```

#### Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Authentication** → **Settings**
3. Add **Authorized domain**:
   ```
   your-site.netlify.app
   ```

## 🚀 Deploy

### Option 1: Deploy via Netlify Dashboard
1. Click **"Deploy site"**
2. Wait for build to complete
3. Visit your site URL

### Option 2: Deploy via Git Push
```bash
git add .
git commit -m "feat: secure deployment with .env.production"
git push origin main
```

Netlify will automatically:
1. Detect the push
2. Run `npm run build` (uses `.env.production`)
3. Inject environment variables from dashboard
4. Deploy to CDN

## 🔍 Post-Deployment Verification

### Check Build Logs
1. Go to **Deploys** tab in Netlify
2. Click on the latest deploy
3. Check **Deploy log** for errors

### Test Features
- ✅ Sign In with Google
- ✅ YouTube Search (VibeTube)
- ✅ Create/Save Playlists
- ✅ Spotify Integration (VibeZone)
- ✅ Jamendo Music Player
- ✅ Contact Form (EmailJS)

### Monitor for Errors
Open browser console and check for:
- ❌ API key errors
- ❌ OAuth redirect mismatches
- ❌ CORS errors

## 🛡️ Security Best Practices

### ✅ DO
- Keep `.env.local` on your machine only
- Commit `.env.production` with placeholders
- Set real values in Netlify dashboard
- Use Firebase security rules to protect data
- Rotate API keys if accidentally exposed

### ❌ DON'T
- Don't commit `.env.local` to git
- Don't put real secrets in `.env` or `.env.production`
- Don't share screenshots of Netlify environment variables
- Don't hardcode API keys in source code

## 🐛 Troubleshooting

### Secret Scan Failed
If Netlify shows "Secret scan failed":
```powershell
# Re-run the verification script
Remove-Item -Path "dist" -Recurse -Force
npm run build

# Check for secrets in bundle
'AIzaSy', '375b56d', '83bfb626' | ForEach-Object {
    Select-String -Path "dist/assets/*.js" -Pattern $_ | 
    Select-Object -First 1 -Property LineNumber, Line
}
```

### Build Fails on Netlify
1. Check Node version: Settings → Environment → Node version (set to 18)
2. Check environment variables are set correctly
3. Check build command: `npm run build`
4. Check publish directory: `dist`

### OAuth Redirect Errors
- Verify redirect URIs match exactly (no trailing slashes)
- Check protocol is HTTPS
- Ensure domain is added to authorized lists

### API Key Errors
- Verify all environment variables are set in Netlify
- Check variable names match exactly (including `VITE_` prefix)
- Redeploy after changing environment variables

## 📚 Related Documentation

- [Environment Variables Guide](./ENVIRONMENT_VARIABLES.md)
- [Security Guide](./SECURITY.md)
- [Backend API Reference](./BACKEND_API.md)
- [YouTube OAuth Setup](./YOUTUBE_OAUTH_SETUP.md)

## 🆘 Need Help?

If you encounter issues:
1. Check Netlify deploy logs
2. Verify all environment variables are set
3. Test locally first with `.env.local`
4. Check browser console for errors
5. Review Firebase/Spotify/YouTube console for API quotas

---

**Last Updated**: January 2025
**Vite Version**: 7.2.2
**Node Version**: 18+
