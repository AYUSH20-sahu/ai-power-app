import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const payload = { id: user.id, email: user.email };
    return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

export const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
