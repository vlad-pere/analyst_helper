// --- START OF FILE src/features/MappingTool/components/TypeSelector.js ---

import React, { useState } from 'react';

const ALLOWED_TYPES = ['string', 'number', 'boolean', 'null', 'object', 'array'];

function TypeSelector({ currentType, onChange }) {
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = ALLOWED_TYPES.includes(currentType);

  if (!canEdit) {
    return <span className="json-type">({currentType})</span>;
  }

  const handleSelectionChange = (e) => {
    onChange(e.target.value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <select
        className="meta-input"
        value={currentType}
        onChange={handleSelectionChange}
        onBlur={() => setIsEditing(false)}
        onClick={(e) => e.stopPropagation()}
        autoFocus
        style={{ padding: '0 2px', height: 'auto' }}
      >
        {ALLOWED_TYPES.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>
    );
  }

  return (
    <span 
      className="json-type" 
      onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true); }} 
      title="Двойной клик для изменения типа"
      style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
    >
      ({currentType})
    </span>
  );
}

export default TypeSelector;