// this file will communicate witht the socket
import openSocket from 'socket.io-client'
import Rx from 'rxjs/Rx'
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
  // returns an item from observable every time event fires
  const lineStream = Rx.Observable.fromEventPattern(
    // subscribes
    handler => socket.on(`drawingLine:${drawingId}`, handler),
    // unsubscribes
    handler => socket.off(`drawingLine:${drawingId}`, handler)
  )

  // groups up in time segments with operator
  const bufferedTimeStream = lineStream
    .bufferTime(100)
    .map(lines => ({ lines }))

  bufferedTimeStream.subscribe(linesEvent => cb(linesEvent))
  socket.emit('subscribeToDrawingLines', drawingId)
}

export {
  subscribeToDrawings,
  createDrawing,
  publishLine,
  subscribeToDrawingLines
}
