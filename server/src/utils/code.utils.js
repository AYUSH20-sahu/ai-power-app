import { GoogleGenAI } from '@google/genai';

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });

export const parseGenerationResponse = (responseText) => {
    let code = '';
    let description = '';
    const marker = '```html';
    const startIndex = responseText.indexOf(marker);

    if (startIndex !== -1) {
        description = responseText.slice(0, startIndex).trim();
        const codeStart = startIndex + marker.length;
        const endIndex = responseText.indexOf('```', codeStart);
        code = endIndex !== -1 ? responseText.slice(codeStart, endIndex).trim() : '';
    } else {
        const genericStart = responseText.indexOf('```');
        if (genericStart !== -1) {
            description = responseText.slice(0, genericStart).trim();
            const genericCodeStart = genericStart + 3;
            const genericEnd = responseText.indexOf('```', genericCodeStart);
            code = genericEnd !== -1 ? responseText.slice(genericCodeStart, genericEnd).trim() : '';
        } else {
            description = responseText.trim();
        }
    }

    return { description, code };
};

export const createFallbackHtml = (prompt) => {
    const safePrompt = (prompt || 'your idea').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const title = safePrompt.length > 60 ? `${safePrompt.slice(0, 57)}...` : safePrompt;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: Arial, sans-serif; min-height: 100vh; display: grid; place-items: center; background: linear-gradient(135deg, #0f172a, #1d4ed8); color: #f8fafc; padding: 24px; }
    .card { max-width: 640px; width: 100%; background: rgba(15, 23, 42, 0.82); border: 1px solid rgba(255,255,255,0.12); border-radius: 24px; padding: 28px; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35); }
    h1 { margin: 0 0 12px; font-size: 2rem; }
    p { line-height: 1.6; opacity: 0.95; }
    button { margin-top: 12px; border: 0; border-radius: 999px; padding: 10px 18px; background: #38bdf8; color: #052e16; font-weight: 700; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <h1>AI Power App Builder</h1>
    <p>${safePrompt}</p>
    <button>Try it</button>
  </div>
</body>
</html>`;
};

export const generateHtmlFromPrompt = async (prompt, currentCode, history = []) => {
    const normalizedPrompt = (prompt || '').trim();
    const promptText = [
        'You are an expert web developer AI assistant.',
        'Return ONLY a single self-contained HTML file with embedded CSS and JavaScript.',
        'Do not use markdown fences. Output raw HTML only.',
        'Make the page feel tailored to the user request: include the right layout, sections, colors, and interactions implied by the request.',
        'If the request is a specific app, build a realistic UI for it rather than a generic placeholder.',
        'Use semantic HTML, modern styling, and small interactive details that fit the prompt.',
        `User request: ${normalizedPrompt}`,
        `Current code: ${currentCode || '<empty>'}`,
        `Conversation history: ${history.slice(-6).map((item) => `${item.role}: ${item.content}`).join('\n')}`,
    ].join('\n\n');

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: promptText,
            config: {
                temperature: 0.4,
                maxOutputTokens: 1600,
            },
        });

        const rawText = response?.text || '';
        const parsed = parseGenerationResponse(rawText);
        if (parsed.code) {
            return { description: parsed.description, code: parsed.code };
        }
        return { description: parsed.description || 'Here is your generated app.', code: createFallbackHtml(prompt) };
    } catch (error) {
        return {
            description: 'I generated a fallback starter app because the AI model was unavailable.',
            code: createFallbackHtml(prompt),
            error: error?.message || 'Generation failed',
        };
    }
};
