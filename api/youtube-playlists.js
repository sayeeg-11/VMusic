/**
 * YouTube Playlists API
 * 
 * This endpoint fetches user's YouTube playlists and playlist items
 * using their Google OAuth access token obtained during sign-in.
 * 
 * Endpoints:
 * - GET /api/youtube-playlists?userId=xxx - Get all user playlists
 * - GET /api/youtube-playlists?userId=xxx&playlistId=yyy - Get playlist items
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, playlistId, accessToken } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!accessToken) {
      return res.status(400).json({ error: 'accessToken is required. User must sign in with Google.' });
    }

    // If playlistId provided, fetch playlist items
    if (playlistId) {
      const playlistItems = await fetchPlaylistItems(playlistId, accessToken);
      return res.status(200).json(playlistItems);
    }

    // Otherwise, fetch user's playlists
    const playlists = await fetchUserPlaylists(accessToken);
    return res.status(200).json(playlists);

  } catch (error) {
    console.error('YouTube API error:', error);
    
    if (error.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Access token expired or invalid. Please sign in again.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.message.includes('403')) {
      return res.status(403).json({ 
        error: 'YouTube API access denied. Check API key and quotas.',
        code: 'API_ACCESS_DENIED'
      });
    }

    return res.status(500).json({ 
      error: 'Failed to fetch YouTube playlists',
      details: error.message 
    });
  }
}

/**
 * Fetch user's YouTube playlists
 */
async function fetchUserPlaylists(accessToken) {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlists');
  url.searchParams.append('part', 'snippet,contentDetails');
  url.searchParams.append('mine', 'true');
  url.searchParams.append('maxResults', '50');

  console.log('🔍 Fetching YouTube playlists...');
  console.log('Token preview:', accessToken.substring(0, 30) + '...');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  console.log('YouTube API Response Status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YouTube API Error Response:', errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      console.error('Error details:', errorJson);
      throw new Error(`${response.status}: ${errorJson.error?.message || errorText}`);
    } catch (e) {
      throw new Error(`${response.status}: ${errorText}`);
    }
  }

  const data = await response.json();

  // Transform to simpler format
  const playlists = (data.items || []).map(item => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    itemCount: item.contentDetails.itemCount,
    publishedAt: item.snippet.publishedAt
  }));

  return {
    playlists,
    total: playlists.length,
    nextPageToken: data.nextPageToken || null
  };
}

/**
 * Fetch items from a specific playlist
 */
async function fetchPlaylistItems(playlistId, accessToken) {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.searchParams.append('part', 'snippet,contentDetails');
  url.searchParams.append('playlistId', playlistId);
  url.searchParams.append('maxResults', '50');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${response.status}: ${error}`);
  }

  const data = await response.json();

  // Transform to simpler format
  const items = (data.items || []).map(item => ({
    id: item.id,
    videoId: item.contentDetails.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    publishedAt: item.snippet.publishedAt,
    position: item.snippet.position
  }));

  return {
    playlistId,
    items,
    total: items.length,
    nextPageToken: data.nextPageToken || null
  };
}
