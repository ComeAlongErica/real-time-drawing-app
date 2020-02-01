const io = require('socket.io')()
const r = require('rethinkdb')

// opens connection
r.connect({
  host: 'localhost',
  port: 28015,
  db: 'awesome_whiteboard'
}).then(connection => {
  // use returned promise from rethinkfb to handle socket to get time and values
  io.on('connection', client => {
    // on handles events
    client.on('subscribeToTimer', interval => {
      // open new query on rethinkDB w/ table method, interested in changes, run the query and pass connection, use promise to handle cursor and call each on the values
      r
        .table('timers')
        .changes()
        .run(connection)
        .then(cursor => {
          cursor.each((err, timerRow) => {
            console.log(err)
            //  emit published events with timestamp
            client.emit('timer', timerRow.new_val.timestamp)
          })
        })
    })
  })
})

const port = 8000
io.listen(8000)
console.log('listening on port ', port)
