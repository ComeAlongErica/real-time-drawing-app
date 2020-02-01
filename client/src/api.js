// this file will communicate witht the socket
import openSocket from 'socket.io-client'
const socket = openSocket('http://localhost:8000')

function subscribeToDrawings (cb) {
  socket.on('drawing', cb)
  // the server expects to get an interval as a payload form this event
  socket.emit('subscribeToDrawings', 1000)
}

function createDrawing (name) {
  socket.emit('createDrawing', { name })
}

export { subscribeToDrawings, createDrawing }
