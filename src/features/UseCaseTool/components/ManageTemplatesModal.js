import React, { useState } from 'react';
import { useUseCaseStore } from '../useUseCaseStore';
import Modal from '../../../ui-kit/Modal/Modal';
import Button from '../../../ui-kit/Button/Button';
import Input from '../../../ui-kit/Input/Input';

function ManageTemplatesModal({ isOpen, onClose }) {
  const { templates, updateTemplate, deleteTemplate } = useUseCaseStore();
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  const handleRenameClick = (template) => {
    setEditingId(template.id);
    setNewName(template.name);
  };

  const handleSaveRename = () => {
    if (newName.trim()) {
      updateTemplate(editingId, newName.trim());
      setEditingId(null);
    }
  };

  const handleCancelRename = () => {
    setEditingId(null);
  };

  const footer = <Button variant="primary" onClick={onClose}>Закрыть</Button>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Управление шаблонами" footer={footer}>
      <div className="template-list">
        {templates.length === 0 ? (
          <p>У вас пока нет сохраненных шаблонов.</p>
        ) : (
          <table>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id}>
                  <td>
                    {editingId === template.id ? (
                      <Input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                      />
                    ) : (
                      template.name
                    )}
                  </td>
                  <td className="template-actions">
                    {editingId === template.id ? (
                      <>
                        <Button variant="primary" size="small" onClick={handleSaveRename}>✓</Button>
                        <Button variant="secondary" size="small" onClick={handleCancelRename}>×</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" size="small" onClick={() => handleRenameClick(template)}>Переименовать</Button>
                        <Button variant="danger" size="small" onClick={() => deleteTemplate(template.id)}>Удалить</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}

export default ManageTemplatesModal;