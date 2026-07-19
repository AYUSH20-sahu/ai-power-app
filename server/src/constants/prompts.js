export const SYSTEM_PROMPT = `You are an expert web developer AI assistant. Generate a single self-contained HTML file with embedded CSS and JavaScript.`;

export const buildGenerationPrompt = (messages, currentCode, userPrompt) => {
    const recentMessages = (messages || []).slice(-8);
    const history = recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
    return `${SYSTEM_PROMPT}\n\nCONVERSATION HISTORY:\n${history}\n\nCURRENT CODE:\n${currentCode || '<empty>'}\n\nUSER REQUEST:\n${userPrompt}\n\nAssistant:`;
};
