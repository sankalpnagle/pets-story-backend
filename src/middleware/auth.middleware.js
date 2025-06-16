const { admin } = require('../../config/firebaseConfig');

// Middleware to check Firebase Authentication token
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = authMiddleware;
