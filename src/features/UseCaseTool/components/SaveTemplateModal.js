import React, { useState, useEffect } from 'react';
import Modal from '../../../ui-kit/Modal/Modal';
import Button from '../../../ui-kit/Button/Button';
import Input from '../../../ui-kit/Input/Input';

function SaveTemplateModal({ isOpen, onClose, onSave, currentName }) {
  const [templateName, setTemplateName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setTemplateName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName.trim());
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Отмена</Button>
      <Button variant="primary" onClick={handleSave} disabled={!templateName.trim()}>Сохранить</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Сохранить как шаблон" footer={footer}>
      <p>Введите имя для нового шаблона. Это имя будет отображаться в списке при создании нового сценария.</p>
      <div className="form-group">
        <label htmlFor="templateName">Имя шаблона</label>
        <Input
          type="text"
          id="templateName"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          autoFocus
        />
      </div>
    </Modal>
  );
}

export default SaveTemplateModal;