import express from 'express';
const app = express();

import https from 'httpolyglot';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();

import {Server} from 'socket.io';
import mediasoup from 'mediasoup';

app.get('/', (req, res) => {
    res.send('Hi from mediasoup app by CQ LEJ!');
});

//express middleware to serve static files from public folder
app.use('/sfu', express.static(path.join(__dirname, 'public')))
// SSL cert for HTTPS access
const options = {
    key: fs.readFileSync('./server/ssl/key.pem', 'utf-8'),
    cert: fs.readFileSync('./server/ssl/cert.pem', 'utf-8')
  }

const httpsServer = https.createServer(options, app)
httpsServer.listen(3000, () => {
  console.log('CQ: listening on port: ' + 3000)
});

const io = new Server(httpsServer);

// socket.io namespace (could represent a room?)
const peers = io.of('/mediasoup');


let worker;
let router;

const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2020,
  })
  console.log(`worker pid ${worker.pid}`)

  worker.on('died', error => {
    // This implies something serious happened, so kill the application
    console.error('mediasoup worker has died')
    setTimeout(() => process.exit(1), 2000) // exit in 2 seconds
  })

  return worker
};


// We create a Worker as soon as our application starts
worker = createWorker();

// This is an Array of RtpCapabilities, https://mediasoup.org/documentation/v3/mediasoup/rtp-parameters-and-capabilities/#RtpCodecCapability, list of media codecs supported by mediasoup ... https://github.com/versatica/mediasoup/blob/v3/src/supportedRtpCapabilities.ts
const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
]


peers.on('connection', async socket =>{
  console.log('socket id = ',socket.id);
  socket.emit('connection-success', {
      socketId: socket.id
  });

  socket.on('disconnect', () => {
    // do some cleanup
    console.log('peer disconnected**')
  })

   // worker.createRouter(options), options = { mediaCodecs, appData }, mediaCodecs -> defined above, appData -> custom application data - we are not supplying any, none of the two are required
  router = await worker.createRouter({ mediaCodecs });

  // Client emits a request for RTP Capabilities. This event responds to the request
  socket.on('getRtpCapabilities', (callback) => {

    const rtpCapabilities = router.rtpCapabilities

    console.log('rtp Capabilities', rtpCapabilities)

    // call callback from the client and send back the rtpCapabilities
    callback({ rtpCapabilities })
  });

});