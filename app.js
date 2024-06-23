const express = require('express');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv').config();
const { handleSocketConnection } = require('./utils/socket');
const authRoutes = require('./routes/authRoutes');

const corsOptions = {
  origin: [
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:5173",
    "http://192.168.100.10:5173",
    "http://127.0.0.1:5173",
    "https://home.youthdigitalhealthalliance.com/",
    "https://youthdigitalhealthalliance.com/"
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:5173','http://127.0.0.1:5173', 'https://admin.socket.io'],
    credentials: true
  }
});

// Middleware
app.use(express.json());

// Routes
// app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Chat system server is running');
});

var dbs = require('./models');
dbs.sequelize.sync();
// Handle Socket.IO connections
handleSocketConnection(io);

const chatRoute = require("./routes/chat.route.js");
app.use("/api/chat", chatRoute);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
