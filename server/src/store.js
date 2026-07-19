import { connectToDatabase } from './db/mongo.js';

let initialized = false;

export const initializeStore = async () => {
    if (initialized) return;
    const db = await connectToDatabase();
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('projects').createIndex({ userId: 1, _id: 1 });
    initialized = true;
};

export const loadState = async () => {
    await initializeStore();
    const db = await connectToDatabase();
    const [users, projects] = await Promise.all([
        db.collection('users').find({}).toArray(),
        db.collection('projects').find({}).toArray(),
    ]);
    return { users, projects };
};

export const saveState = async (nextState) => {
    const db = await connectToDatabase();
    await Promise.all([
        db.collection('users').deleteMany({}),
        db.collection('projects').deleteMany({}),
    ]);
    if (nextState.users?.length) {
        await db.collection('users').insertMany(nextState.users);
    }
    if (nextState.projects?.length) {
        await db.collection('projects').insertMany(nextState.projects);
    }
};

export const getState = async () => loadState();

export const setState = async (nextState) => {
    await saveState(nextState);
};
