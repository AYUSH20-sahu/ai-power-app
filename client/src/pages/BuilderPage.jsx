import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContext } from '../context/ToastContext.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import LivePreview from '../components/LivePreview.jsx';
import { getProject, updateProject } from '../services/projectService.js';
import { generateCode } from '../services/generationService.js';
import '../styles/builder.css';

const EXAMPLE_PROMPTS = ['A personal portfolio website with a dark theme', 'A simple calculator app', 'A weather dashboard with cards', 'A landing page for a coffee shop'];

function BuilderPage() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useContext(ToastContext);
    const [project, setProject] = useState(null);
    const [messages, setMessages] = useState([]);
    const [code, setCode] = useState('');
    const [activeTab, setActiveTab] = useState('preview');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState('');

    useEffect(() => {
        const loadProject = async () => {
            try {
                const data = await getProject(projectId);
                setProject(data);
                setMessages(data.messages || []);
                setCode(data.generatedCode || '');
                setEditTitle(data.title || 'Untitled Project');
            } catch {
                showToast('Project not found.', 'error');
                navigate('/dashboard');
            } finally {
                setPageLoading(false);
            }
        };
        loadProject();
    }, [projectId, navigate, showToast]);

    const handleSend = async (prompt) => {
        if (loading) return;
        const userMessage = { role: 'user', content: prompt, timestamp: new Date().toISOString() };
        setMessages((current) => [...current, userMessage]);
        setLoading(true);

        try {
            const result = await generateCode(projectId, prompt);
            const fallbackUsed = typeof result?.message?.content === 'string' && result.message.content.toLowerCase().includes('fallback');
            if (fallbackUsed) {
                showToast('The AI model is unavailable, so a starter fallback page was used instead.', 'warning');
            }
            setMessages((current) => [...current, result.message]);
            if (result.generatedCode) {
                setCode(result.generatedCode);
                setActiveTab('preview');
            }
            if (project && project.title === 'Untitled Project') {
                const newTitle = prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt;
                setProject((current) => ({ ...current, title: newTitle }));
                setEditTitle(newTitle);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Generation failed. Please try again.';
            showToast(message, 'error');
            setMessages((current) => current.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    const handleTitleSave = async () => {
        setIsEditingTitle(false);
        if (editTitle.trim() && editTitle !== project?.title) {
            try {
                await updateProject(projectId, { title: editTitle.trim() });
                setProject((current) => ({ ...current, title: editTitle.trim() }));
            } catch {
                showToast('Failed to rename project.', 'error');
            }
        }
    };

    const handleDownload = () => {
        if (!code) return;
        const blob = new Blob([code], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${project?.title || 'my-app'}.html`;
        link.click();
        URL.revokeObjectURL(url);
        showToast('Code downloaded!', 'success');
    };

    if (pageLoading) {
        return (
            <div className="loading-state" style={{ flex: 1 }}>
                <div className="spinner" />
                <p>Loading project...</p>
            </div>
        );
    }

    return (
        <div className="builder">
            <div className="builder-chat">
                <div className="builder-chat-header">
                    {isEditingTitle ? (
                        <input className="builder-title-input" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} onBlur={handleTitleSave} onKeyDown={(event) => { if (event.key === 'Enter') handleTitleSave(); }} autoFocus />
                    ) : (
                        <h2 className="builder-chat-title" onClick={() => setIsEditingTitle(true)} title="Click to rename">{project?.title || 'Untitled Project'}</h2>
                    )}
                </div>
                <div className="builder-messages">
                    {messages.length === 0 ? (
                        <div className="builder-empty-chat">
                            <p className="builder-empty-icon">◇</p>
                            <p className="builder-empty-title">What would you like to build?</p>
                            <p className="builder-empty-subtitle">Describe your idea and AI will generate the code.</p>
                            <div className="builder-examples">
                                {EXAMPLE_PROMPTS.map((prompt, index) => (
                                    <button key={index} className="builder-example-chip" onClick={() => handleSend(prompt)}>{prompt}</button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="builder-messages-list">
                            {messages.map((message, index) => (
                                <ChatMessage key={index} message={message} />
                            ))}
                            {loading && (
                                <div className="builder-typing">
                                    <span className="builder-typing-dot">.</span>
                                    <span className="builder-typing-dot">.</span>
                                    <span className="builder-typing-dot">.</span>
                                    <span className="builder-typing-text">AI is generating your code</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <ChatInput onSend={handleSend} loading={loading} disabled={false} />
            </div>
            <div className="builder-preview">
                <div className="builder-tabs">
                    <div className="builder-tabs-left">
                        <button className={`builder-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>Preview</button>
                        <button className={`builder-tab ${activeTab === 'code' ? 'active' : ''}`} onClick={() => setActiveTab('code')}>Code</button>
                    </div>
                    <div className="builder-tabs-right">{code && <button className="builder-action-btn" onClick={handleDownload}>Download</button>}</div>
                </div>
                <div className="builder-content">
                    {activeTab === 'preview' ? <LivePreview code={code} /> : <CodeEditor code={code} onChange={setCode} readOnly={false} />}
                </div>
            </div>
        </div>
    );
}

export default BuilderPage;
