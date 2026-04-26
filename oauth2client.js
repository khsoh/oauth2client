const express = require('express');
const { google } = require('googleapis');
const SECRET = require('./client.json');

const fs = require('fs');

const app = express();
const oauth2Client = new google.auth.OAuth2(
  SECRET.CLIENT_ID,
  SECRET.CLIENT_SECRET,
  `http://localhost:${SECRET.LISTEN_PORT}/callback` // This must match your Google Console setting
);

// 1. Generate the Auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // Critical for getting a Refresh Token
  prompt: 'consent',     // Forces Google to show the consent screen and provide refresh token
  scope: ['https://www.googleapis.com/auth/youtube.force-ssl']
});

console.log('Authorize this app by visiting this url:', authUrl);

// 2. The Callback Handler
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // SAVE THESE TOKENS - especially the refresh_token
    fs.writeFileSync('tokens.json', JSON.stringify(tokens));
    
    res.send('Authentication successful! You can close this tab and stop the script.');
    console.log('Tokens saved to tokens.json. You can now use them in your main script.');
    process.exit(); 
  } catch (e) {
    res.status(500).send('Authentication failed');
    console.error(e);
  }
});

app.listen(SECRET.LISTEN_PORT, () => console.log(`Waiting for callback on port ${SECRET.LISTEN_PORT}...`));
