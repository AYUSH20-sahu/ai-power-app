import jwt from 'jsonwebtoken';
import { connectToDatabase } from '../db/mongo.js';

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Please log in to access this route.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        const db = await connectToDatabase();
        const user = await db.collection('users').findOne({ $or: [{ id: decoded.id }, { _id: decoded.id }] });

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }
};

export default authenticate;
