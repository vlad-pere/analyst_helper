import React, { useState } from 'react';
import UseCaseEditor from './UseCaseEditor';
import UseCasePreview from './UseCasePreview';
import Tabs from '../../components/Tabs';
import Toaster from '../../components/Toaster';
import HelpPanel from '../../components/HelpPanel';
import SaveTemplateModal from './components/SaveTemplateModal';
import ManageTemplatesModal from './components/ManageTemplatesModal';
import BulkExportModal from './components/BulkExportModal'; // <-- Импорт
import { useUseCaseStore } from './useUseCaseStore';
import './UseCaseTool.css';

function UseCaseToolPage() {
  const { 
    useCases, 
    activeUseCaseIndex, 
    addTab, 
    selectTab, 
    deleteTab,
    saveAsTemplate,
    templates
  } = useUseCaseStore();

  const [notification, setNotification] = useState({ message: '', type: 'success', key: 0 });
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isBulkExportModalOpen, setIsBulkExportModalOpen] = useState(false); // <-- Состояние

  const showNotification = (message, type = 'success') => {
    setNotification(prev => ({ message, type, key: prev.key + 1 }));
  };

  const clearNotification = () => {
    setNotification(prev => ({ ...prev, message: '' }));
  };

  const handleSaveTemplate = (name) => {
    saveAsTemplate(name);
    setIsSaveModalOpen(false);
    showNotification(`Сценарий сохранен как шаблон "${name}"`);
  };

  const activeUseCase = useCases[activeUseCaseIndex];

  if (!activeUseCase) {
    return (
      <div className="empty-state">
        <h2>Нет открытых сценариев</h2>
        <button className="add-scenario-btn" onClick={() => addTab()}>Создать первый сценарий</button>
      </div>
    );
  }

  return (
    <div className="use-case-tool-page"> 
      <Tabs
        items={useCases}
        templates={templates}
        activeIndex={activeUseCaseIndex}
        onSelectTab={selectTab}
        onAddTab={addTab}
        onDeleteTab={deleteTab}
        onToggleHelp={() => setIsHelpPanelOpen(true)}
        onSaveAsTemplate={() => setIsSaveModalOpen(true)}
        onManageTemplates={() => setIsManageModalOpen(true)}
        onBulkExport={() => setIsBulkExportModalOpen(true)} // <-- Пропс
      />
      <div className="app-container">
        <UseCaseEditor key={activeUseCase.id} useCase={activeUseCase} />
        <UseCasePreview useCase={activeUseCase} onShowNotification={showNotification} />
      </div>
      <Toaster notification={notification} onClear={clearNotification} />
      <HelpPanel isOpen={isHelpPanelOpen} onClose={() => setIsHelpPanelOpen(false)} />
      <SaveTemplateModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveTemplate}
        currentName={activeUseCase.purpose}
      />
      <ManageTemplatesModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
      <BulkExportModal
        isOpen={isBulkExportModalOpen}
        onClose={() => setIsBulkExportModalOpen(false)}
      />
    </div>
  );
}

export default UseCaseToolPage;