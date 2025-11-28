import { MongoClient, ObjectId } from 'mongodb';

// MongoDB connection
const uri = process.env.MONGODB_URI;
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('vmusic');
    const playlistsCollection = db.collection('playlists');

    // GET - Fetch user's playlists
    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const playlists = await playlistsCollection
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray();
      
      return res.status(200).json({
        playlists: playlists || []
      });
    }

    // POST - Create new playlist
    if (req.method === 'POST') {
      const { userId, name, tracks, source } = req.body;

      if (!userId || !name) {
        return res.status(400).json({ error: 'User ID and playlist name are required' });
      }

      const now = new Date().toISOString();

      const playlist = {
        userId,
        name,
        tracks: tracks || [],
        source: source || 'vibetube', // vibetube, jamendo, spotify
        createdAt: now,
        updatedAt: now
      };

      const result = await playlistsCollection.insertOne(playlist);

      return res.status(200).json({
        message: 'Playlist created',
        playlist: { ...playlist, _id: result.insertedId },
        success: true
      });
    }

    // PUT - Update playlist (add/remove tracks, rename)
    if (req.method === 'PUT') {
      const { playlistId, name, tracks, addTrack, removeTrackId } = req.body;

      if (!playlistId) {
        return res.status(400).json({ error: 'Playlist ID is required' });
      }

      const updateFields = {
        updatedAt: new Date().toISOString()
      };

      if (name) updateFields.name = name;
      if (tracks) updateFields.tracks = tracks;

      // Add a single track to playlist
      if (addTrack) {
        await playlistsCollection.updateOne(
          { _id: new ObjectId(playlistId) },
          {
            $push: { tracks: addTrack },
            $set: { updatedAt: new Date().toISOString() }
          }
        );

        return res.status(200).json({
          message: 'Track added to playlist',
          success: true
        });
      }

      // Remove a track from playlist
      if (removeTrackId) {
        await playlistsCollection.updateOne(
          { _id: new ObjectId(playlistId) },
          {
            $pull: { tracks: { id: removeTrackId } },
            $set: { updatedAt: new Date().toISOString() }
          }
        );

        return res.status(200).json({
          message: 'Track removed from playlist',
          success: true
        });
      }

      // Update playlist
      await playlistsCollection.updateOne(
        { _id: new ObjectId(playlistId) },
        { $set: updateFields }
      );

      return res.status(200).json({
        message: 'Playlist updated',
        success: true
      });
    }

    // DELETE - Delete playlist
    if (req.method === 'DELETE') {
      const { playlistId } = req.body;

      if (!playlistId) {
        return res.status(400).json({ error: 'Playlist ID is required' });
      }

      await playlistsCollection.deleteOne({ _id: new ObjectId(playlistId) });

      return res.status(200).json({
        message: 'Playlist deleted',
        success: true
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
