
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', socket => {
  socket.on('join-room', ({ user, room }) => {
    socket.join(room);
    socket.data.user = user;
    socket.data.room = room;
    console.log(`${user} entrou na sala ${room}`);
  });

  socket.on('draw-brush', data => {
    socket.to(data.room).emit('draw-brush', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
