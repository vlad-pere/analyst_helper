// --- START OF FILE src/features/UseCaseTool/UseCaseEditor.js ---

import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useUseCaseStore } from './useUseCaseStore';
import SortableStep from './components/SortableStep';
import AlternativeScenarioCard from './components/AlternativeScenarioCard';

function UseCaseEditor({ useCase }) {
  const { 
    updateData,
    addMainStep,
    deleteMainStep,
    updateMainStep,
    moveMainStep,
    addAlternativeScenario
  } = useUseCaseStore();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDataChange = (e) => updateData(e.target.name, e.target.value);

  return (
    <div className="editor-panel">
      <div className="form-group">
        <label htmlFor="purpose">Назначение сценария (Цель)*</label>
        <input type="text" id="purpose" name="purpose" value={useCase.purpose} onChange={handleDataChange} />
      </div>
      <div className="form-group">
        <label htmlFor="preconditions">Ограничения сценария (Предусловия)</label>
        <textarea id="preconditions" name="preconditions" value={useCase.preconditions} onChange={handleDataChange}></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="actors">Участники сценария*</label>
        <textarea id="actors" name="actors" value={useCase.actors} onChange={handleDataChange}></textarea>
      </div>
      <div className="form-group">
        <label>Основной сценарий*</label>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={moveMainStep}>
          <SortableContext items={useCase.mainScenario.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {useCase.mainScenario.map((step, i) => 
              <SortableStep 
                key={step.id} 
                step={step} 
                index={i} 
                onStepChange={updateMainStep} 
                onDeleteStep={deleteMainStep} 
              />
            )}
          </SortableContext>
        </DndContext>
        <button className="add-step-btn" onClick={addMainStep}>+ Добавить шаг</button>
      </div>
      <div className="form-group">
        <label>Альтернативные сценарии</label>
        {useCase.alternativeScenarios.map((sc, i) => (
          <AlternativeScenarioCard 
            key={sc.id} 
            scenario={sc} 
            index={i} 
            mainScenarioSteps={useCase.mainScenario} 
          />
        ))}
        <button className="add-scenario-btn" onClick={addAlternativeScenario}>+ Создать альтернативный сценарий</button>
      </div>
      <div className="form-group">
        <label htmlFor="postconditions">Примечание (Постусловия)</label>
        <textarea id="postconditions" name="postconditions" value={useCase.postconditions} onChange={handleDataChange}></textarea>
      </div>
      <div className="form-group">
        <label htmlFor="successCriteria">Критерии успешности (Результат)*</label>
        <textarea id="successCriteria" name="successCriteria" value={useCase.successCriteria} onChange={handleDataChange}></textarea>
      </div>
    </div>
  );
}

export default UseCaseEditor;