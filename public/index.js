console.log("Testing LEJ");

const io = require('socket.io-client');

const socket = io("/mediasoup");

socket.on('connection-success', ({ socketId }) => {
    console.log('client socket = ',socketId)
});

let params = {
    //mediasoup params
};

const getLocalStream = () => {
    console.log('butn cl ')
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: {
          min: 640,
          max: 1920,
        },
        height: {
          min: 400,
          max: 1080,
        }
      }
    }).then(streamSuccess).catch(error => {
      console.log(error.message)
    });
};

const streamSuccess = async (stream) => {
    console.log('stream = ',stream)
    localVideo.srcObject = stream
    const track = stream.getVideoTracks()[0]
    params = {
      track,
      ...params
    };    
};

btnLocalVideo.addEventListener('click', getLocalStream);
// btnRtpCapabilities.addEventListener('click', getRtpCapabilities)
// btnDevice.addEventListener('click', createDevice)
// btnCreateSendTransport.addEventListener('click', createSendTransport)
// btnConnectSendTransport.addEventListener('click', connectSendTransport)
// btnRecvSendTransport.addEventListener('click', createRecvTransport)
// btnConnectRecvTransport.addEventListener('click', connectRecvTransport)


