import React, { useState, useRef, useEffect } from 'react';
import { exportService } from '../services/exportService';
import Button from '../../../ui-kit/Button/Button';

function ExportControls({ useCase, onShowNotification }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (action) => {
    setIsOpen(false);
    try {
      switch (action) {
        case 'copy-rich':
          await exportService.copyHtmlToClipboard(useCase);
          onShowNotification('Скопировано в буфер (Rich Text)');
          break;
        case 'copy-md':
          await exportService.copyMarkdownToClipboard(useCase);
          onShowNotification('Markdown скопирован в буфер');
          break;
        case 'download-html':
          exportService.downloadHtml(useCase);
          onShowNotification('HTML файл успешно создан');
          break;
        case 'download-md':
          exportService.downloadMarkdown(useCase);
          onShowNotification('Markdown файл успешно создан');
          break;
        case 'download-docx':
          await exportService.downloadDocx(useCase);
          onShowNotification('Word файл успешно создан');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      onShowNotification('Ошибка экспорта. См. консоль.', 'error');
    }
  };

  return (
    <div className="export-controls" ref={dropdownRef}>
      <Button onClick={() => setIsOpen(!isOpen)}>
        Экспорт ▾
      </Button>
      {isOpen && (
        <div className="export-dropdown">
          <div className="export-dropdown-header">Копировать в буфер</div>
          <button onClick={() => handleExport('copy-rich')}>Как таблицу (Rich Text)</button>
          <button onClick={() => handleExport('copy-md')}>Как Markdown</button>
          <hr className="export-dropdown-divider" />
          <div className="export-dropdown-header">Скачать файл</div>
          <button onClick={() => handleExport('download-html')}>HTML (.html)</button>
          <button onClick={() => handleExport('download-md')}>Markdown (.md)</button>
          <button onClick={() => handleExport('download-docx')}>Word (.docx)</button>
        </div>
      )}
    </div>
  );
}

export default ExportControls;