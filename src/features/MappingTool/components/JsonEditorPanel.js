import React, { useState, useCallback } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';

const JsonEditorPanel = ({ value, onValueChange, onValidationChange }) => {
  const [error, setError] = useState(null);

  const handleCodeChange = useCallback((newCode) => {
    onValueChange(newCode);
    try {
      JSON.parse(newCode);
      setError(null);
      onValidationChange(true);
    } catch (e) {
      setError(e.message);
      onValidationChange(false);
    }
  }, [onValueChange, onValidationChange]);

  return (
    <div className="json-editor-panel">
      <Editor
        value={value}
        onValueChange={handleCodeChange}
        highlight={(code) => highlight(code, languages.json, 'json')}
        padding={10}
        className="json-editor-container"
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 13,
          outline: 0,
        }}
      />
      {error && (
        <div className="json-editor-error">
          <span role="img" aria-label="error">❌</span> {error}
        </div>
      )}
    </div>
  );
};

export default React.memo(JsonEditorPanel);