const jwt = require('jsonwebtoken');

const masterAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Master Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.MASTER_ADMIN_JWT_SECRET || 'master_fallback_secret');
    
    if (decoded.role !== 'MasterAdmin') {
        return res.status(403).json({ message: 'Forbidden. Master Admin privileges required.' });
    }

    req.masterAdmin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired master token' });
  }
};

module.exports = masterAuthMiddleware;
