import React, { useState, useEffect } from 'react';
import './Modals.css';

function SaveTemplateModal({ isOpen, onClose, onSave, currentName }) {
  const [templateName, setTemplateName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setTemplateName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Сохранить как шаблон</h2>
        <p>Введите имя для нового шаблона. Это имя будет отображаться в списке при создании нового сценария.</p>
        <div className="form-group">
          <label htmlFor="templateName">Имя шаблона</label>
          <input
            type="text"
            id="templateName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="modal-actions">
          <button className="button-secondary" onClick={onClose}>Отмена</button>
          <button className="button-primary" onClick={handleSave} disabled={!templateName.trim()}>Сохранить</button>
        </div>
      </div>
    </div>
  );
}

export default SaveTemplateModal;