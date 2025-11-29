// Vercel Serverless Function: Refresh Google OAuth Token
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'vmusic';
const COLLECTION_NAME = 'users';

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Get user's refresh token
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    
    if (!user || !user.googleRefreshToken) {
      await client.close();
      return res.status(400).json({ 
        error: 'NO_REFRESH_TOKEN',
        message: 'No refresh token found. Please sign in with Google again.' 
      });
    }

    // Call Google OAuth token endpoint to refresh
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: user.googleRefreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Google token refresh failed:', errorData);
      await client.close();
      
      return res.status(400).json({ 
        error: 'REFRESH_FAILED',
        message: 'Failed to refresh token. Please sign in with Google again.',
        details: errorData
      });
    }

    const tokenData = await tokenResponse.json();
    const newAccessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 3600; // Default 1 hour
    const expiresAt = Date.now() + (expiresIn * 1000);

    // Update access token in database
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          googleAccessToken: newAccessToken,
          tokenExpiresAt: expiresAt,
          lastTokenRefresh: new Date()
        } 
      }
    );

    await client.close();

    console.log(`✅ Token refreshed for user ${userId}`);

    return res.status(200).json({ 
      success: true,
      accessToken: newAccessToken,
      expiresAt: expiresAt
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
