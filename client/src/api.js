// this file will communicate witht the socket
import openSocket from 'socket.io-client'
import Rx from 'rxjs/Rx'
import createSync from 'rxsync'

// hacky, only doing this for working locally
console.log(parseInt(window.location.search.replace('?', ''), 10))
const port = parseInt(window.location.search.replace('?', ''), 10) || 8000
const socket = openSocket(`http://localhost:${port}`)
function subscribeToDrawings (cb) {
  socket.on('drawing', drawing => cb(drawing))
  // the server expects to get an interval as a payload form this event
  socket.emit('subscribeToDrawings')
}

function createDrawing (name) {
  socket.emit('createDrawing', { name })
}

const sync = createSync({
  maxRetries: 10,
  delayBetweenRetries: 1000,
  syncAction: line =>
    new Promise((resolve, reject) => {
      let sent = false

      socket.emit('publishLine', line, () => {
        sent = true
        resolve()
      })

      setTimeout(() => {
        if (!sent) {
          reject()
        }
      }, 2000)
    })
})

sync.failedItems.subscribe(x => console.error('failed line sync', x))
sync.syncedItems.subscribe(x => console.log('line synced', x))

function publishLine ({ drawingId, line }) {
  sync.queue({ drawingId, ...line })
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

  // reopen sub after client is able to reconnect
  const reconnectStream = Rx.Observable.fromEventPattern(
    handler => socket.on('connect', handler),
    handler => socket.off('connect', handler)
  )

  // gives us the latest timestamp coming through
  const maxSteam = lineStream
    .map(line => new Date(line.timestamp).getTime())
    .scan((a, b) => (a > b ? a : b), 0)

  reconnectStream
    .scan(maxSteam)
    .withLatestFrom(maxSteam)
    .subscribe(joined => {
      const lastRecievedTimestamp = joined[1]
      socket.emit('subscribeToDrawingLines', {
        drawingId,
        from: lastRecievedTimestamp
      })
    })

  bufferedTimeStream.subscribe(linesEvent => cb(linesEvent))
  socket.emit('subscribeToDrawingLines', { drawingId })
}

function subscribeToConnectionEvent (cb) {
  socket.on('connect', () => cb({ state: 'connected', port }))
  socket.on('disconnect', () => cb({ state: 'disconnected', port }))
  socket.on('connect_error', () => cb({ state: 'disconnected', port }))
}

export {
  subscribeToDrawings,
  createDrawing,
  publishLine,
  subscribeToDrawingLines,
  subscribeToConnectionEvent
}
