import { connectToDatabase } from '../db/mongo.js';
import { v4 as uuid } from 'uuid';

export const getProjects = async (req, res) => {
    const db = await connectToDatabase();
    const projects = await db.collection('projects').find({ userId: req.user.id }).sort({ updatedAt: -1 }).toArray();
    res.json({ success: true, data: projects });
};

export const createProject = async (req, res) => {
    const db = await connectToDatabase();
    const project = {
        _id: uuid(),
        userId: req.user.id,
        title: req.body.title || 'Untitled Project',
        description: '',
        messages: [],
        generatedCode: '',
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    await db.collection('projects').insertOne(project);
    res.status(201).json({ success: true, data: project });
};

export const getProject = async (req, res) => {
    const db = await connectToDatabase();
    const project = await db.collection('projects').findOne({ _id: req.params.id, userId: req.user.id });
    if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, data: project });
};

export const updateProject = async (req, res) => {
    const db = await connectToDatabase();
    const update = { updatedAt: new Date().toISOString() };
    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.description !== undefined) update.description = req.body.description;
    const result = await db.collection('projects').findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { $set: update },
        { returnDocument: 'after' }
    );
    if (!result.value) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, data: result.value });
};

export const deleteProject = async (req, res) => {
    const db = await connectToDatabase();
    const result = await db.collection('projects').deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    res.json({ success: true, data: { message: 'Project deleted successfully.' } });
};
