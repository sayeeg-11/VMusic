// Vercel Serverless Function to get Spotify Access Token
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientId = process.env.VITE_SPOTIFY_CLIENT_ID || '375b56d194264fd18ddc1e4151bb6c48';
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || 'ac0814caa22742a4bf8074e401bc9f36';

    // Encode credentials
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Request token from Spotify
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Set cache headers to cache token for 55 minutes (tokens expire in 1 hour)
    res.setHeader('Cache-Control', 's-maxage=3300, stale-while-revalidate');
    
    return res.status(200).json({
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in
    });
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return res.status(500).json({ 
      error: 'Failed to get Spotify token',
      message: error.message 
    });
  }
}
