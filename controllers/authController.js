const { User } = require("../models"); //, Post, SavedPost, Chat
// server/controllers/authController.js
  const authenticateUser = async (username, password) => {
    try {
      const users = await User.findAll();
      // console.log(users);
    } catch (err) {
      console.error(err);
    }
    return { username, role: 'user' };
  };

  const authenticateAgent = (username, password) => {
    // Simple authentication for demonstration purposes
    return { username, role: 'agent' };
  };
  
  module.exports = {
    authenticateUser,
    authenticateAgent,
  };
  