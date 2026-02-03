import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', detail: 'Access token required' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('authenticateToken: JWT_SECRET is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
