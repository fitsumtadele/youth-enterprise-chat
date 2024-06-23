const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  console.log("Received token:", token);

  if (!token) {
    return res.status(401).json({ message: "Not Authenticated!" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(403).json({ message: "Token is not valid!" });
    }

    // Log the decoded payload for debugging
    // console.log("Decoded token payload:", decoded);

    // Attach userId from token payload to request object
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    console.log("decoded=>", req.userEmail);
    // Proceed to next middleware or route handler
    next();
  });
};

module.exports = {
  verifyToken,
};
