function CodeEditor({ code, onChange, readOnly }) {
    return (
        <div className="code-editor-container">
            <textarea className="code-editor-textarea" value={code} onChange={(event) => onChange(event.target.value)} readOnly={readOnly} spellCheck="false" placeholder="Generated code will appear here..." />
        </div>
    );
}

export default CodeEditor;
