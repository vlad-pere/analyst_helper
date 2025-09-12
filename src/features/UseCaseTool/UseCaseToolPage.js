// src/features/UseCaseTool/UseCaseToolPage.js

import React from 'react';
import UseCaseEditor from './UseCaseEditor';
import UseCasePreview from './UseCasePreview';
import Tabs from '../../components/Tabs';
import { useUseCaseStore } from './useUseCaseStore';
import './UseCaseTool.css';

function UseCaseToolPage() {
  const { 
    useCases, 
    activeUseCaseIndex, 
    addTab, 
    selectTab, 
    deleteTab 
  } = useUseCaseStore();

  const activeUseCase = useCases[activeUseCaseIndex];

  if (!activeUseCase) {
    return (
      <div className="empty-state">
        <h2>Нет открытых сценариев</h2>
        <button className="add-scenario-btn" onClick={addTab}>Создать первый сценарий</button>
      </div>
    );
  }

  return (
    <>
      <Tabs
        items={useCases}
        activeIndex={activeUseCaseIndex}
        onSelectTab={selectTab}
        onAddTab={addTab}
        onDeleteTab={deleteTab}
      />
      <div className="app-container">
        <UseCaseEditor key={activeUseCase.id} useCase={activeUseCase} />
        <UseCasePreview useCase={activeUseCase} />
      </div>
    </>
  );
}

export default UseCaseToolPage;