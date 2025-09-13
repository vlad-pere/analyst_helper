import React, { useState } from 'react';
import { useUseCaseStore } from '../useUseCaseStore';
import './Modals.css';

function ManageTemplatesModal({ isOpen, onClose }) {
  const { templates, updateTemplate, deleteTemplate } = useUseCaseStore();
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h2>Управление шаблонами</h2>
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
                        <input
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
                          <button className="button-primary small" onClick={handleSaveRename}>✓</button>
                          <button className="button-secondary small" onClick={handleCancelRename}>×</button>
                        </>
                      ) : (
                        <>
                          <button className="button-secondary small" onClick={() => handleRenameClick(template)}>Переименовать</button>
                          <button className="button-danger small" onClick={() => deleteTemplate(template.id)}>Удалить</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="modal-actions">
          <button className="button-primary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
}

export default ManageTemplatesModal;