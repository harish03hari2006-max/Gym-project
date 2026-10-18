// middleware/auth.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify the JWT sent in the Authorization header.
 * Attaches req.user on success.
 */
async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised, no token' });
  }
  try {
    const token   = header.split(' ')[1];
    const secret  = process.env.JWT_SECRET || 'vitaflex_super_jwt_secret_token_key_2025';
    const decoded = jwt.verify(token, secret);
    req.user      = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
}

/** Restrict to admin role */
function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
}

module.exports = { protect, adminOnly };
