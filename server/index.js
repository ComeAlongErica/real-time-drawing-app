const io = require('socket.io')()

io.on('connection', client => {
  // on handles events
  client.on('subscribeToTimer', interval => {
    console.log('client is subscribing to timer w/ interval', interval)
    setInterval(() => {
      //  emit published events
      client.emit('timer', new Date())
    }, interval)
  })
})

const port = 8000
io.listen(8000)
console.log('listening on port ', port)
