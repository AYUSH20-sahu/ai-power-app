import { useState } from 'react';

function ChatInput({ onSend, loading, disabled }) {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        if (!input.trim() || loading || disabled) return;
        onSend(input.trim());
        setInput('');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="chat-input-container">
            <textarea className="chat-input-textarea" placeholder="Describe what you want to build..." value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} disabled={loading || disabled} rows={1} />
            <button className="chat-send-btn" onClick={handleSubmit} disabled={!input.trim() || loading || disabled}>
                {loading ? 'Generating...' : 'Generate'}
            </button>
        </div>
    );
}

export default ChatInput;
