const express = require('express'); // Express framework
const http = require('http');       // Node HTTP module
const socketIo = require('socket.io'); // Socket.IO for signaling
const path = require('path');       // Path helper

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set EJS as template engine and serve static files
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Route: Render index.ejs on root
app.get('/', (req, res) => {
    res.render('index');
});

// Socket.IO signaling logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (roomId) => {
        socket.join(roomId);  // Socket.IO joins socket to the given room
        console.log(`${socket.id} joined room ${roomId}`);
    });

    socket.on('offer', ({ roomId, offer }) => {
        socket.to(roomId).emit('offer', offer);  // only to this room
    });

    socket.on('answer', ({ roomId, answer }) => {
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('ice-candidate', candidate);
    });
});

// ✅ Define PORT variable here
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
