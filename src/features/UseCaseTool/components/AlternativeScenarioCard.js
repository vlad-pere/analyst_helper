import React, { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useUseCaseStore } from '../useUseCaseStore';
import SortableStep from './SortableStep';
import Button from '../../../ui-kit/Button/Button';
import Input from '../../../ui-kit/Input/Input';

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
          <span className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <label>Альтернативный сценарий #{index + 1}: {scenario.name}</label>
        </div>
        <Button variant="danger-outline" onClick={handleDeleteClick}>Удалить сценарий</Button>
      </div>
      
      {!isCollapsed && (
        <div className="alt-scenario-body">
          <div className="form-group">
            <label>Название сценария</label>
            <Input type="text" value={scenario.name} onChange={(e) => updateAlternativeScenario(scenario.id, 'name', e.target.value)} />
          </div>
          <div className="alt-scenario-links">
            <div className="form-group">
              <label>Начинается с шага</label>
              <select className="select-field" value={scenario.startsAtStepId || ''} onChange={(e) => updateAlternativeScenario(scenario.id, 'startsAtStepId', e.target.value)}>
                <option value="">-- Выберите шаг --</option>
                {mainScenarioSteps.map((step, i) => <option key={step.id} value={step.id}>Шаг {i + 1}: {step.text}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Возвращается в шаг</label>
              <select className="select-field" value={scenario.returnsToStepId || ''} onChange={(e) => updateAlternativeScenario(scenario.id, 'returnsToStepId', e.target.value)}>
                <option value="">-- Выберите шаг --</option>
                <option value="ends">-- Сценарий завершается --</option>
                {mainScenarioSteps.map((step, i) => <option key={step.id} value={step.id}>Шаг {i + 1}: {step.text}</option>)}
              </select>
            </div>
          </div>
          <div className="alt-scenario-steps">
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
            <Button onClick={() => addAltStep(scenario.id)}>+ Добавить шаг</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlternativeScenarioCard;