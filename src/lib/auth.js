import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-very-secure-secret';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
}