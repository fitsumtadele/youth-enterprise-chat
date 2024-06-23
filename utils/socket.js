const { parse } = require('cookie');
const jwt = require('jsonwebtoken');
const { Chat, Message, User } = require('../models'); // Assuming you have Chat and Message models
const { authenticateAgent, authenticateUser } = require("../controllers/authController");
const { Op } = require('sequelize'); // Import Op for Sequelize operators

let connectedUsers = {};

const handleSocketConnection = (io) => {
  io.use((socket, next) => {
    const cookies = socket.handshake.headers.cookie;
    if (cookies) {
      const cookie = parse(cookies);
      socket.cookies = cookie;
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('authenticate', async (callback) => {
      try {
        const token = socket.cookies.token;
        let user, role;
        if (token) {
          const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
          socket.userId = decodedData.id;
          role = decodedData.isAdmin ? "Agent" : "User";
          user = { userId: decodedData.id, role };
          if (role === 'Agent') {
            socket.join('agent');
          }
        }

        if (user) {
          connectedUsers[socket.id] = { userId: socket.userId, role };
          callback({ success: true, user });
        } else {
          callback({ success: false, message: 'Authentication failed' });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        callback({ success: false, message: 'Authentication error' });
      }
    });

    socket.on('broadcastMessage', async (data) => {
      const { message } = data;
      try {
        await Message.create({
          chatId: null, // Broadcast messages might not belong to a specific chat
          senderId: socket.userId,
          content: message
        });
        io.emit('broadcastMessage', { senderId: socket.userId, message });
      } catch (error) {
        console.error('Error saving broadcast message:', error);
      }
    });
    socket.on('private_message', async (data, callback) => {
      const { recipientUserId, message, listingId, chatId } = data;
      const recipientSocketId = Object.keys(connectedUsers).find(socketId => connectedUsers[socketId].userId === recipientUserId);
    
      try {
        let chat;
        // Check if a chat exists for these users and listingId
        if (chatId) {
          chat = await Chat.findOne({
            where: {
              id: chatId
            }
          });
        } else {
          chat = await Chat.findOne({
            where: {
              users: { [Op.contains]: [socket.userId, recipientUserId] },
              listingId: listingId
            }
          });
        }
    
        // If no chat exists, create one
        if (!chat) {
          chat = await Chat.create({
            users: [socket.userId, recipientUserId],
            listingId: listingId
          });
        }
        // Create the message
        const msg = await Message.create({
          chatId: chat.id,
          senderId: socket.userId,
          recipientId: recipientUserId,
          content: message
        });
    
        const messageObj = await Message.findOne({
          where: { id: msg.id },
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'email'] // Include necessary fields
            },
            {
              model: User,
              as: 'recipient',
              attributes: ['id', 'username', 'email'] // Include necessary fields
            }
          ]
        });
    
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('private_message', messageObj);
        } else {
          io.to('agent').emit('private_message', messageObj);
        }
    
        // Callback with the message object
        if (callback) {
          callback({ success: true, message: messageObj });
        }
      } catch (error) {
        console.error('Error sending private message:', error);
        if (callback) {
          callback({ success: false, message: 'Error sending private message' });
        }
      }
    });
    

    socket.on('disconnect', () => {
      console.log('Client disconnected', socket.id);
      delete connectedUsers[socket.id];
    });
  });
};

module.exports = {
  handleSocketConnection,
};
