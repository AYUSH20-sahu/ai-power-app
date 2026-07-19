import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { generateToken } from '../utils/jwt.utils.js';
import { connectToDatabase } from '../db/mongo.js';

export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        }
        const db = await connectToDatabase();
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { _id: uuid(), id: uuid(), name, email, password: hashedPassword, createdAt: new Date().toISOString() };
        await db.collection('users').insertOne(user);
        const token = generateToken(user);
        res.status(201).json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
    } catch (error) {
        next(error);
    }
};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }
        const db = await connectToDatabase();
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        const token = generateToken(user);
        res.json({ success: true, data: { token, user: { id: user.id, name: user.name, email: user.email } } });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (req, res) => {
    res.json({ success: true, data: { id: req.user.id, name: req.user.name, email: req.user.email } });
};

export const logout = (_req, res) => {
    res.json({ success: true, data: { message: 'Logged out successfully' } });
};
