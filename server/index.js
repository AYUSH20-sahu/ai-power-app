import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/auth.routes.js';
import projectRoutes from './src/routes/project.routes.js';
import generationRoutes from './src/routes/generation.routes.js';
import errorHandler from './src/middleware/error.middleware.js';
import { initializeStore } from './src/store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    await initializeStore();

    app.use(cors({ origin: true, credentials: true }));
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ extended: true }));

    app.use('/api', authRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/generate', generationRoutes);

    app.get('/health', (_req, res) => res.json({ ok: true }));
    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
