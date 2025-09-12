// src/components/Tabs.js

import React, { memo } from 'react';

function Tabs({ items, activeIndex, onSelectTab, onAddTab, onDeleteTab }) {
  return (
    <div className="tabs-container">
      {items.map((item, index) => (
        <div 
          key={item.id} 
          className={`tab ${index === activeIndex ? 'active' : ''}`}
          onClick={() => onSelectTab(index)}
        >
          <span>{item.name || item.purpose || `Вкладка ${index + 1}`}</span>
          {items.length > 1 && (
            <button 
              className="close-tab-btn" 
              onClick={(e) => {
                e.stopPropagation(); 
                onDeleteTab(item.id);
              }}
            >
              &times;
            </button>
          )}
        </div>
      ))}
      <button className="add-tab-btn" onClick={onAddTab}>+</button>
    </div>
  );
}

export default memo(Tabs);