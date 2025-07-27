const express = require('express');         // Express framework
const http = require('http');               // Node HTTP module
const socketIo = require('socket.io');      // Socket.IO for signaling
const path = require('path');               // Path helper

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set EJS as template engine and serve static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Route: Render index.ejs on root
app.get('/', (req, res) => {
    res.render('index');
});

// Socket.IO signaling logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    const room = io.sockets.adapter.rooms.get(roomId);

    if (room && room.size === 2) {
      const clients = Array.from(room);
      const initiator = clients[0]; // ✅ First joined peer creates offer

      io.to(initiator).emit('ready'); // ✅ Tell first peer to create offer
    }
  });

  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', offer);
  });

  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', answer);
  });

  socket.on('ice-candidate', ({ roomId, candidate }) => {
  if (candidate) {
    // ✅ Relay entire candidate object
    socket.to(roomId).emit('ice-candidate', { candidate });
  }
});


  socket.on('call-ended', (roomId) => {
    socket.to(roomId).emit('call-ended');
  });
});

// Define PORT and start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
