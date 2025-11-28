#!/usr/bin/env node

/**
 * YouTube OAuth Setup Verification Script
 * 
 * This script checks if your VMusic app is properly configured for YouTube playlist import.
 * Run: node verify-youtube-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 YouTube OAuth Setup Verification\n');
console.log('═'.repeat(60));

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const { green, red, yellow, blue, cyan, reset } = colors;

let errors = 0;
let warnings = 0;
let passed = 0;

const check = (condition, message, type = 'error') => {
  if (condition) {
    console.log(`${green}✅ PASS${reset} ${message}`);
    passed++;
    return true;
  } else {
    if (type === 'error') {
      console.log(`${red}❌ FAIL${reset} ${message}`);
      errors++;
    } else {
      console.log(`${yellow}⚠️  WARN${reset} ${message}`);
      warnings++;
    }
    return false;
  }
};

const info = (message) => {
  console.log(`${cyan}ℹ️  INFO${reset} ${message}`);
};

const section = (title) => {
  console.log(`\n${blue}${title}${reset}`);
  console.log('─'.repeat(60));
};

// Check 1: .env file exists
section('1. Environment Configuration');

const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!check(envExists, '.env file exists')) {
  console.log(`   ${red}Create a .env file in the root directory${reset}`);
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check required variables
  const requiredVars = [
    'VITE_YOUTUBE_API_KEY',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'MONGODB_URI',
    'VITE_API_BASE_URL'
  ];

  requiredVars.forEach(varName => {
    const hasVar = envContent.includes(varName) && 
                   !envContent.match(new RegExp(`${varName}=\\s*$`, 'm'));
    check(hasVar, `${varName} is set`, hasVar ? 'pass' : 'error');
  });

  // Check Firebase project ID
  const projectIdMatch = envContent.match(/VITE_FIREBASE_PROJECT_ID=(.+)/);
  if (projectIdMatch) {
    const projectId = projectIdMatch[1].trim();
    info(`Firebase Project ID: ${projectId}`);
    
    // Warn about OAuth project mismatch
    if (projectId !== 'vmusic-478107') {
      console.log(`   ${yellow}⚠️  Note: OAuth credentials provided are for 'vmusic-478107'${reset}`);
      console.log(`   ${yellow}   Make sure OAuth Client ID is from project: ${projectId}${reset}`);
    }
  }
}

// Check 2: Firebase config
section('2. Firebase Configuration');

const firebaseConfigPath = path.join(__dirname, 'src/config/firebase.js');
if (check(fs.existsSync(firebaseConfigPath), 'firebase.js exists')) {
  const firebaseContent = fs.readFileSync(firebaseConfigPath, 'utf8');
  
  check(
    firebaseContent.includes('youtube.readonly'),
    'YouTube readonly scope is added to googleProvider'
  );
  
  check(
    firebaseContent.includes('addScope'),
    'googleProvider.addScope() is called'
  );
  
  check(
    firebaseContent.includes('GoogleAuthProvider'),
    'GoogleAuthProvider is imported'
  );
}

// Check 3: AuthContext
section('3. Authentication Context');

const authContextPath = path.join(__dirname, 'src/contexts/AuthContext.jsx');
if (check(fs.existsSync(authContextPath), 'AuthContext.jsx exists')) {
  const authContent = fs.readFileSync(authContextPath, 'utf8');
  
  check(
    authContent.includes('googleAccessToken'),
    'googleAccessToken state exists'
  );
  
  check(
    authContent.includes('oauthAccessToken'),
    'Captures oauthAccessToken from sign-in response'
  );
  
  check(
    authContent.includes('setGoogleAccessToken'),
    'Sets googleAccessToken state'
  );
  
  check(
    authContent.includes('usersAPI.syncUser'),
    'Syncs user data to MongoDB'
  );
}

// Check 4: YouTube API Client
section('4. YouTube API Client');

const youtubeApiPath = path.join(__dirname, 'src/api/youtube.js');
if (check(fs.existsSync(youtubeApiPath), 'youtube.js API client exists')) {
  const youtubeContent = fs.readFileSync(youtubeApiPath, 'utf8');
  
  check(
    youtubeContent.includes('getUserPlaylists'),
    'getUserPlaylists() function exists'
  );
  
  check(
    youtubeContent.includes('getPlaylistItems'),
    'getPlaylistItems() function exists'
  );
  
  check(
    youtubeContent.includes('Authorization'),
    'Sets Authorization header with Bearer token'
  );
}

// Check 5: Backend API Endpoint
section('5. Backend API Endpoint');

const backendApiPath = path.join(__dirname, 'api/youtube-playlists.js');
if (check(fs.existsSync(backendApiPath), 'youtube-playlists.js backend exists')) {
  const backendContent = fs.readFileSync(backendApiPath, 'utf8');
  
  check(
    backendContent.includes('youtube/v3/playlists'),
    'Calls YouTube Data API v3 playlists endpoint'
  );
  
  check(
    backendContent.includes('youtube/v3/playlistItems'),
    'Calls YouTube Data API v3 playlistItems endpoint'
  );
  
  check(
    backendContent.includes('Bearer'),
    'Uses Bearer token authentication'
  );
  
  check(
    backendContent.includes('Access-Control-Allow'),
    'CORS headers configured'
  );
}

// Check 6: UI Components
section('6. UI Components');

const youtubePlaylistsPath = path.join(__dirname, 'src/components/vibetube/YouTubePlaylists.jsx');
check(fs.existsSync(youtubePlaylistsPath), 'YouTubePlaylists.jsx component exists');

const searchBarPath = path.join(__dirname, 'src/components/vibetube/SearchBar.jsx');
if (check(fs.existsSync(searchBarPath), 'SearchBar.jsx component exists')) {
  const searchBarContent = fs.readFileSync(searchBarPath, 'utf8');
  
  check(
    searchBarContent.includes('Youtube') || searchBarContent.includes('youtube'),
    'YouTube button/icon exists in SearchBar'
  );
  
  check(
    searchBarContent.includes('onShowYouTubePlaylists'),
    'onShowYouTubePlaylists handler exists'
  );
}

const vibeTubePath = path.join(__dirname, 'src/pages/VibeTube.jsx');
if (check(fs.existsSync(vibeTubePath), 'VibeTube.jsx page exists')) {
  const vibeTubeContent = fs.readFileSync(vibeTubePath, 'utf8');
  
  check(
    vibeTubeContent.includes('showYouTubePlaylists'),
    'showYouTubePlaylists state exists'
  );
  
  check(
    vibeTubeContent.includes('YouTubePlaylists'),
    'YouTubePlaylists component is imported and used'
  );
  
  check(
    vibeTubeContent.includes('googleAccessToken'),
    'Uses googleAccessToken from AuthContext'
  );
}

// Check 7: Package dependencies
section('7. Package Dependencies');

const packageJsonPath = path.join(__dirname, 'package.json');
if (check(fs.existsSync(packageJsonPath), 'package.json exists')) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  check(deps['firebase'], 'firebase package installed');
  check(deps['framer-motion'], 'framer-motion package installed');
  check(deps['lucide-react'], 'lucide-react package installed');
}

// Summary
section('Summary');

console.log(`\n${green}✅ Passed: ${passed}${reset}`);
if (warnings > 0) console.log(`${yellow}⚠️  Warnings: ${warnings}${reset}`);
if (errors > 0) console.log(`${red}❌ Errors: ${errors}${reset}`);

console.log('\n' + '═'.repeat(60));

if (errors === 0 && warnings === 0) {
  console.log(`\n${green}🎉 All checks passed!${reset}`);
  console.log('\n📋 Next Steps:');
  console.log('   1. Go to Google Cloud Console');
  console.log('   2. Enable YouTube Data API v3');
  console.log('   3. Configure OAuth consent screen');
  console.log('   4. Create OAuth 2.0 Client ID');
  console.log('   5. Add redirect URIs');
  console.log('   6. Deploy to Vercel');
  console.log('\n📖 See YOUTUBE_OAUTH_SETUP.md for detailed instructions\n');
} else {
  console.log(`\n${red}⚠️  Issues found!${reset}`);
  console.log('\nFix the errors above and run this script again.');
  console.log('See YOUTUBE_OAUTH_SETUP.md for setup instructions.\n');
  process.exit(1);
}
