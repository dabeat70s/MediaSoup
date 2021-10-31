console.log("Testing LEJ");

const io = require('socket.io-client');
const mediasoupClient = require('mediasoup-client');

const socket = io("/mediasoup");

socket.on('connection-success', ({ socketId }) => {
    console.log('client socket = ',socketId)
});

let device;
let rtpCapabilities;


// https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerOptions , https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-produce
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

// A device is an endpoint connecting to a Router on the server side to send/recive media
const createDevice = async () => {
  try {
    device = new mediasoupClient.Device()

    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load , Loads the device with RTP capabilities of the Router (server side)
    await device.load({
      // see getRtpCapabilities() below
      routerRtpCapabilities: rtpCapabilities
    })

    console.log('RTP Capabilities', device.rtpCapabilities)

  } catch (error) {
    console.log(error)
    if (error.name === 'UnsupportedError')
      console.warn('browser not supported')
  }
};

const getRtpCapabilities = () => {
  // make a request to the server for Router RTP Capabilities see server's socket.on('getRtpCapabilities', ...) the server sends back data object which contains rtpCapabilities
  socket.emit('getRtpCapabilities', (data) => {
    console.log(`Router data... ${data}`)
    console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`)

    // we assign to local variable and will be used when loading the client Device (see createDevice above)
    rtpCapabilities = data.rtpCapabilities
  })
};

btnLocalVideo.addEventListener('click', getLocalStream);
btnRtpCapabilities.addEventListener('click', getRtpCapabilities)
// btnDevice.addEventListener('click', createDevice)
// btnCreateSendTransport.addEventListener('click', createSendTransport)
// btnConnectSendTransport.addEventListener('click', connectSendTransport)
// btnRecvSendTransport.addEventListener('click', createRecvTransport)
// btnConnectRecvTransport.addEventListener('click', connectRecvTransport)


