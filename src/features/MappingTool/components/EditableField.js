// --- START OF FILE src/features/MappingTool/components/EditableField.js ---

import React, { useState, useEffect, useRef } from 'react';

const EditableField = ({ initialValue, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    // --- ИЗМЕНЕНИЕ: Разрешаем сохранять пустую строку ---
    // Если пользователь намеренно стер значение, мы должны это учесть.
    if (value !== initialValue) {
      onSave(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="editable-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        style={{ width: '100%', boxSizing: 'border-box' }}
      />
    );
  }

  // --- ИЗМЕНЕНИЕ: Обработка пустых значений для отображения ---
  const isValueEmpty = initialValue === null || initialValue === undefined || initialValue === '';

  return (
    <span
      className={`${className} editable-span ${isValueEmpty ? 'placeholder' : ''}`}
      onDoubleClick={() => setIsEditing(true)}
      title="Двойной клик для редактирования"
    >
      {isValueEmpty ? '(пусто)' : initialValue}
    </span>
  );
};

export default EditableField;