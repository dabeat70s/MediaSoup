import express from 'express';
const app = express();

import https from 'httpolyglot';
import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();

import {Server} from 'socket.io';

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

peers.on('connection', socket =>{
    console.log('socket id = ',socket.id);
    socket.emit('connection-success', {
        socketId: socket.id
    });

});