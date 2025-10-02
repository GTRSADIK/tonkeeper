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

// Memory storage for connected addresses (replace with DB in production)
let connectedUsers = [];

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

app.get('/tonconnect', async (req, res) => {
  try {
    const response = tonconnect.decodeResponse(req.query.tonlogin);
    let connectedAddress = null;

    for (let payload of response.payload) {
      if(payload.type === AuthRequestTypes.ADDRESS){
        connectedAddress = payload.address;
      }
    }

    if(connectedAddress){
      if(!connectedUsers.includes(connectedAddress)){
        connectedUsers.push(connectedAddress);
      }

      console.log("✅ User connected:", connectedAddress);
      console.log("All connected users:", connectedUsers);
      res.send(`Wallet connected: ${connectedAddress}`);
    } else {
      res.status(400).send('Wallet not found');
    }

  } catch (err) {
    console.log(err);
    res.status(400).send('Verification failed');
  }
});

// Optional endpoint to get all connected addresses
app.get('/connected-users', (req, res) => {
  res.json(connectedUsers);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
