const io = require('socket.io')()
const r = require('rethinkdb')

function createDrawing ({ connection, name }) {
  r.table('drawings')
    .insert({ name, timestamp: new Date() })
    .run(connection)
    .then(() => console.log('created a drawing with name: ', name))
}

function subscribeToDrawings ({ client, connection }) {
  r.table('drawings')
    .changes({ include_initial: true })
    .run(connection)
    .then(cursor => {
      cursor.each((err, drawingRow) =>
        client.emit('drawing', drawingRow.new_val)
      )
    })
}

function handleLinePublish ({ connection, line, callback }) {
  console.log('saving line to the db')
  r.table('lines')
    .insert(Object.assign(line, { timestamp: new Date() }))
    .run(connection)
    .then(callback)
}

function subscribeToDrawingLines ({ client, connection, drawingId, from }) {
  let query = r.row('drawingId').eq(drawingId)
  if (from) query = query.and(r.row('timestamp').ge(new Date(from)))
  return r
    .table('lines')
    .filter(query) // filter only lines we want to display
    .changes({ include_initial: true, include_types: true })
    .run(connection)
    .then(cursor => {
      cursor.each((err, lineRow) =>
        client.emit(`drawingLine:${drawingId}`, lineRow.new_val)
      )
    })
}

// opens connection
r.connect({
  host: 'localhost',
  port: 28015,
  db: 'awesome_whiteboard'
}).then(connection => {
  // use returned promise from rethinkfb to handle sockets to get time and values
  io.on('connection', client => {
    // on handles events
    client.on('createDrawing', ({ name }) => {
      createDrawing({ connection, name })
    })

    client.on('subscribeToDrawings', () =>
      subscribeToDrawings({ client, connection })
    )

    client.on('publishLine', (line, callback) =>
      handleLinePublish({
        line,
        connection,
        callback
      })
    )

    client.on('subscribeToDrawingLines', ({ drawingId, from }) => {
      subscribeToDrawingLines({
        client,
        connection,
        drawingId,
        from
      })
    })
  })
})
console.log(parseInt(process.argv[2], 10))
const port = parseInt(process.argv[2], 10) || 8000
io.listen(port)
console.log('listening on port ', port)
