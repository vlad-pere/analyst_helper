// src/features/MappingTool/components/ExportControls.js

import React, { useState, useEffect, useRef } from 'react';

function ExportControls({ onExportJson, onExportExcel }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = (exportFn) => {
    exportFn();
    setIsMenuOpen(false);
  };

  return (
    <div className="export-controls-container" ref={dropdownRef}>
      <button className="export-main-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        Экспорт 
        <span className={`export-arrow ${isMenuOpen ? 'up' : 'down'}`}>▼</span>
      </button>
      {isMenuOpen && (
        <div className="export-dropdown-menu">
          <ul>
            <li onClick={() => handleExport(onExportJson)}>Экспорт в JSON</li>
            <li onClick={() => handleExport(onExportExcel)}>Экспорт в Excel</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ExportControls;