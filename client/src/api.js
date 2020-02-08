// this file will communicate witht the socket
import openSocket from 'socket.io-client'
const socket = openSocket('http://localhost:8000')

function subscribeToDrawings (cb) {
  socket.on('drawing', drawing => cb(drawing))
  // the server expects to get an interval as a payload form this event
  socket.emit('subscribeToDrawings')
}

function createDrawing (name) {
  socket.emit('createDrawing', { name })
}

function publishLine ({ drawingId, line }) {
  socket.emit('publishLine', { drawingId, ...line })
}

function subscribeToDrawingLines (drawingId, cb) {
  // use id to avoid crossing events
  socket.on(`drawingLine:${drawingId}`, line => cb(line))
  socket.emit('subscribeToDrawingLines', drawingId)
}

export {
  subscribeToDrawings,
  createDrawing,
  publishLine,
  subscribeToDrawingLines
}
