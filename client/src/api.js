// this file will communicate witht the socket
import openSocket from 'socket.io-client'
const socket = openSocket('http://localhost:8000')

function subscribeToTimer (cb) {
  socket.on('timer', timestamp => cb(timestamp))
  // the server expects to get an interval as a payload form this event
  socket.emit('subscribeToTimer', 1000)
}

export { subscribeToTimer }
