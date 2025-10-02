import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TonConnectServer, AuthRequestTypes } from '@tonapps/tonconnect-server';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const tonconnect = new TonConnectServer({
  staticSecret: process.env.TONCONNECT_SECRET
});

const hostname = process.env.HOSTNAME;
const PORT = process.env.PORT || 3000;
const allowedAddress = process.env.ALLOWED_ADDRESS;

// Generate auth request
app.get('/auth-request', (req, res) => {
  const request = tonconnect.createRequest({
    image_url: 'https://ddejfvww7sqtk.cloudfront.net/images/landing/ton-nft-tegro-dog/avatar/image_d0315e1461.jpg',
    callback_url: `${hostname}/tonconnect`,
    items: [
      { type: AuthRequestTypes.ADDRESS, required: true },
      { type: AuthRequestTypes.OWNERSHIP, required: true }
    ],
  });

  const deeplinkURL = `https://app.tonkeeper.com/ton-login/${request.toString()}`;
  res.json({ request, deeplinkURL });
});

// Callback endpoint
app.get('/tonconnect', async (req, res) => {
  try {
    const response = tonconnect.decodeResponse(req.query.tonlogin);
    let connectedAddress = null;

    for (let payload of response.payload) {
      if(payload.type === AuthRequestTypes.ADDRESS){
        connectedAddress = payload.address;
      }
    }

    if(connectedAddress === allowedAddress){
      console.log("✅ Correct wallet connected:", connectedAddress);
      res.send("Connected to the correct wallet!");
    } else {
      console.log("❌ Unauthorized wallet tried to connect:", connectedAddress);
      res.send("This wallet is not authorized.");
    }

  } catch (err) {
    console.log(err);
    res.status(400).send('Verification failed');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
