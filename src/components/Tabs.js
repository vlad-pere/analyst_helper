import React from 'react';
import './Tabs.css';

function Tabs({ items, activeIndex, onSelectTab, onAddTab, onDeleteTab, onToggleHelp }) {
  const handleTabDelete = (e, id) => {
    e.stopPropagation();
    onDeleteTab(id);
  };

  return (
    <div className="tabs-container">
      <div className="tabs">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`tab ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onSelectTab(index)}
          >
            <span>{item.purpose}</span>
            {items.length > 1 && (
              <button
                className="close-tab-btn"
                onClick={(e) => handleTabDelete(e, item.id)}
              >
                &times;
              </button>
            )}
          </div>
        ))}
        <button className="add-tab-btn" onClick={onAddTab}>+</button>
      </div>
      
      <div className="tabs-controls">
        <button className="help-btn" title="Инструкция" onClick={onToggleHelp}>?</button>
        {/* Здесь можно будет добавлять новые кнопки в будущем */}
      </div>
    </div>
  );
}

export default Tabs;