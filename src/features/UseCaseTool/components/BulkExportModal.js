import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUseCaseStore } from '../useUseCaseStore';
import { exportService } from '../services/exportService';
import Modal from '../../../ui-kit/Modal/Modal';
import Button from '../../../ui-kit/Button/Button';
import Input from '../../../ui-kit/Input/Input';

function SortableItem({ item, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="sortable-item">
      <span className="drag-handle" {...attributes} {...listeners}>&#x2630;</span>
      <input type="checkbox" checked={item.isSelected} onChange={() => onToggle(item.id)} />
      <span className="item-label">{item.purpose}</span>
    </div>
  );
}

function BulkExportModal({ isOpen, onClose }) {
  const { useCases } = useUseCaseStore();
  const [items, setItems] = useState([]);
  const [format, setFormat] = useState('docx');
  const [filename, setFilename] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setItems(useCases.map(uc => ({ ...uc, isSelected: true })));
      const date = new Date().toISOString().slice(0, 10);
      setFilename(`use-case-report-${date}`);
      setSearchQuery('');
    }
  }, [isOpen, useCases]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    return items.filter(item => item.purpose.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    }
  };

  const handleToggleItem = (id) => {
    setItems(currentItems => currentItems.map(item => item.id === id ? { ...item, isSelected: !item.isSelected } : item));
  };

  const handleSelectAll = (isSelected) => {
    setItems(currentItems => currentItems.map(item => ({ ...item, isSelected })));
  };

  const handleExport = () => {
    const selectedUseCases = items.filter(item => item.isSelected);
    if (selectedUseCases.length > 0) {
      exportService.exportMultipleUseCases(selectedUseCases, format, filename);
      onClose();
    }
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Отмена</Button>
      <Button variant="primary" onClick={handleExport} disabled={items.filter(i => i.isSelected).length === 0}>Экспортировать</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Сборный экспорт сценариев" footer={footer}>
      <p>Выберите сценарии для включения в итоговый документ. Вы можете изменить порядок, перетаскивая элементы.</p>
      <div className="bulk-export-controls">
        <Button size="small" onClick={() => handleSelectAll(true)}>Выбрать все</Button>
        <Button size="small" onClick={() => handleSelectAll(false)}>Снять все</Button>
        <Input
          type="text"
          placeholder="Поиск по названию..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="bulk-export-list">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {filteredItems.map(item => <SortableItem key={item.id} item={item} onToggle={handleToggleItem} />)}
          </SortableContext>
        </DndContext>
      </div>
      <div className="bulk-export-footer">
        <div className="form-group">
          <label htmlFor="export-filename">Имя файла</label>
          <Input id="export-filename" type="text" value={filename} onChange={e => setFilename(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="export-format">Формат</label>
          <select id="export-format" className="select-field" value={format} onChange={e => setFormat(e.target.value)}>
            <option value="docx">Word (.docx)</option>
            <option value="html">HTML (.html)</option>
            <option value="md">Markdown (.md)</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export default BulkExportModal;