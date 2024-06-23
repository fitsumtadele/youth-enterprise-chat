// server/routes/authRoutes.js
const express = require('express');
const { authenticateUser, authenticateAgent } = require('../controllers/authController');
const router = express.Router();

// Define routes (e.g., login)
router.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  let user;
  if (role === 'user') {
    user = authenticateUser(username, password);
  } else if (role === 'agent') {
    user = authenticateAgent(username, password);
  }

  if (user) {
    res.status(200).json({ success: true, user });
  } else {
    res.status(401).json({ success: false });
  }
});

module.exports = router;
