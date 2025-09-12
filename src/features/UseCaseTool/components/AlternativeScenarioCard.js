// --- START OF FILE src/features/UseCaseTool/components/AlternativeScenarioCard.js ---

import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useUseCaseStore } from '../useUseCaseStore';
import SortableStep from './SortableStep';

function AlternativeScenarioCard({ scenario, index, mainScenarioSteps }) {
  const { 
    updateAlternativeScenario, 
    deleteAlternativeScenario,
    addAltStep,
    deleteAltStep,
    updateAltStep,
    moveAltStep
  } = useUseCaseStore();
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    deleteAlternativeScenario(scenario.id);
  };

  return (
    <div className="alternative-scenario-card">
      <div className="alt-scenario-header" onClick={toggleCollapse}>
        <div className="header-content">
          <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>▼</span>
          <label>Альтернативный сценарий #{index + 1}: {scenario.name}</label>
        </div>
        <button className="delete-scenario-btn" onClick={handleDeleteClick}>Удалить сценарий</button>
      </div>
      
      {!isCollapsed && (
        <div className="alt-scenario-body">
          <div className="form-group">
            <label>Название сценария</label>
            <input type="text" value={scenario.name} onChange={(e) => updateAlternativeScenario(scenario.id, 'name', e.target.value)} />
          </div>
          <div className="alt-scenario-links">
            <div className="form-group">
              <label>Начинается с шага Основного сценария</label>
              <select value={scenario.startsAtStepId || ''} onChange={(e) => updateAlternativeScenario(scenario.id, 'startsAtStepId', e.target.value)}>
                <option value="">-- Выберите шаг --</option>
                {mainScenarioSteps.map((step, i) => <option key={step.id} value={step.id}>Шаг {i + 1}: {step.text}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Возвращается в Основной сценарий</label>
              <select value={scenario.returnsToStepId || ''} onChange={(e) => updateAlternativeScenario(scenario.id, 'returnsToStepId', e.target.value)}>
                <option value="">-- Выберите шаг --</option>
                <option value="ends">-- Сценарий завершается --</option>
                {mainScenarioSteps.map((step, i) => <option key={step.id} value={step.id}>Шаг {i + 1}: {step.text}</option>)}
              </select>
            </div>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => moveAltStep(scenario.id, e)}>
            <SortableContext items={scenario.steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
              {scenario.steps.map((step, i) => (
                <SortableStep 
                  key={step.id} 
                  step={step} 
                  index={i} 
                  onStepChange={(stepId, text) => updateAltStep(scenario.id, stepId, text)} 
                  onDeleteStep={(stepId) => deleteAltStep(scenario.id, stepId)} 
                />
              ))}
            </SortableContext>
          </DndContext>
          <button className="add-step-btn" onClick={() => addAltStep(scenario.id)}>+ Добавить шаг</button>
        </div>
      )}
    </div>
  );
}

export default AlternativeScenarioCard;