import { connectToDatabase } from '../db/mongo.js';
import { buildGenerationPrompt } from '../constants/prompts.js';
import { generateHtmlFromPrompt } from '../utils/code.utils.js';

export const generateCode = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ success: false, message: 'Please describe what you want to build.' });
        }
        const db = await connectToDatabase();
        const project = await db.collection('projects').findOne({ _id: req.params.projectId, userId: req.user.id });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        const fullPrompt = buildGenerationPrompt(project.messages, project.generatedCode, prompt.trim());
        const aiResult = await generateHtmlFromPrompt(prompt.trim(), project.generatedCode, project.messages || []);
        const description = aiResult.description || 'Here is your generated code.';
        const code = aiResult.code || '';

        const update = {
            $push: {
                messages: {
                    $each: [
                        { role: 'user', content: prompt.trim(), timestamp: new Date().toISOString() },
                        { role: 'assistant', content: description || 'Here is your generated code.', timestamp: new Date().toISOString() },
                    ],
                },
            },
            $set: {
                updatedAt: new Date().toISOString(),
            },
        };
        if (project.generatedCode && code) {
            update.$push.versions = { $each: [{ code: project.generatedCode, prompt: prompt.trim(), createdAt: new Date().toISOString() }] };
        }
        if (code) {
            update.$set.generatedCode = code;
        }
        if (project.title === 'Untitled Project' && project.messages.length <= 2) {
            update.$set.title = prompt.trim().slice(0, 50) + (prompt.trim().length > 50 ? '...' : '');
        }
        const result = await db.collection('projects').findOneAndUpdate(
            { _id: req.params.projectId, userId: req.user.id },
            update,
            { returnDocument: 'after' }
        );
        res.json({ success: true, data: { message: { role: 'assistant', content: description || 'Here is your generated code.', timestamp: new Date().toISOString() }, generatedCode: result.value?.generatedCode || code, versionIndex: result.value?.versions?.length || 0 } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Generation failed.' });
    }
};
