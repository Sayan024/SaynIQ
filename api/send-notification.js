import axios from 'axios';

export default async function handler(req, res) {
  // Add CORS headers for local development
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { tokens, notification, options, accessToken: bodyAccessToken } = req.body;

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    return res.status(400).json({ error: 'Tokens are required and must be an array' });
  }

  const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
  // Use the token from the request body if provided (override), otherwise use the environment variable
  const accessToken = bodyAccessToken || process.env.EXPO_ACCESS_TOKEN;

  // Format messages for Expo
  const messages = tokens.map(token => ({
    to: token,
    title: notification.title,
    body: notification.message,
    subtitle: options.subtitle || '',
    badge: parseInt(options.badge) || 0,
    sound: options.sound || 'default',
    ttl: parseInt(options.ttl) || 0,
    channelId: options.channelId || 'default',
    image: notification.imageUrl || null,
    data: { 
      ...options.data,
      imageUrl: notification.imageUrl,
      url: notification.deepLink || 'https://sayn-iq.vercel.app/?utm_source=chatgpt.com'
    },
    mutableContent: true,
    _displayInForeground: true,
    priority: 'high',
  }));

  try {
    console.log(`Attempting to send ${messages.length} notifications...`);
    
    const response = await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(accessToken && accessToken !== 'your_expo_access_token_here' && { 'Authorization': `Bearer ${accessToken}` })
      },
    });

    console.log('Expo API Response:', JSON.stringify(response.data));
    return res.status(200).json(response.data);
  } catch (error) {
    const errorData = error.response?.data || error.message;
    console.error('Push Request Failed:', errorData);
    
    return res.status(error.response?.status || 500).json({
      error: 'Failed to send notification via Expo',
      details: errorData
    });
  }
}
