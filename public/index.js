console.log("Testing LEJ");
const io = require('socket.io-client');

const socket = io("/mediasoup");

socket.on('connection-success', ({ socketId }) => {
    console.log('client socket = ',socketId)
  });