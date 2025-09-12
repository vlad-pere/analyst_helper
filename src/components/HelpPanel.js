import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './HelpPanel.css';

function HelpPanel({ isOpen, onClose }) {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetch('help/helpArticle.md')
        .then(response => response.text())
        .then(text => setMarkdown(text))
        .catch(err => {
          console.error("Failed to load help article:", err);
          setMarkdown("Не удалось загрузить справочный материал.");
        });
    }
  }, [isOpen]);

  return (
    <>
      <div className={`help-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <div className={`help-panel ${isOpen ? 'open' : ''}`}>
        <div className="help-panel-header">
          <h3>Справка: Как писать Use Case</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="help-panel-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}

export default HelpPanel;