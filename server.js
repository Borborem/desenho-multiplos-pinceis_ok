const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', socket => {
  socket.on('join-room', ({ user, room }) => {
    if (typeof user !== 'string' || typeof room !== 'string') return;

    socket.join(room);
    socket.data.user = user;
    socket.data.room = room;
    console.log(`${user} entrou na sala ${room}`);
  });

  socket.on('draw-brush', data => {
    const room = socket.data.room;
    if (!room) return;

    socket.to(room).emit('draw-brush', data);
  });

  socket.on('disconnect', () => {
    console.log(`${socket.data.user || 'Alguém'} saiu da sala ${socket.data.room || ''}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0');
// server.listen(PORT, () => {
//   console.log(`Servidor rodando na porta ${PORT}`);
// });
