import React, { useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useUseCaseStore } from './useUseCaseStore';
import useLocalStorage from '../../hooks/useLocalStorage';
import SortableStep from './components/SortableStep';
import AlternativeScenarioCard from './components/AlternativeScenarioCard';
import CollapsibleSection from './components/CollapsibleSection';
import Input from '../../ui-kit/Input/Input';
import Button from '../../ui-kit/Button/Button';

const INITIAL_COLLAPSED_STATE = {
  purpose: false,
  preconditions: false,
  actors: false,
  mainScenario: false,
  alternativeScenarios: false,
  postconditions: false,
  successCriteria: false,
};

function UseCaseEditor({ useCase }) {
  const { 
    updateData,
    addMainStep,
    deleteMainStep,
    updateMainStep,
    moveMainStep,
    addAlternativeScenario
  } = useUseCaseStore();

  const [collapsedSections, setCollapsedSections] = useLocalStorage(
    'use-case-editor-collapsed-sections',
    INITIAL_COLLAPSED_STATE
  );

  const completeness = useMemo(() => {
    const isTextFilled = (text) => text && text.trim().length > 0;

    const mainScenarioComplete = 
      useCase.mainScenario.length > 0 && 
      useCase.mainScenario.every(step => isTextFilled(step.text));

    const alternativeScenariosComplete = 
      useCase.alternativeScenarios.length > 0 && // <-- Изменено: должно быть > 0
      useCase.alternativeScenarios.every(sc => 
        isTextFilled(sc.name) &&
        sc.startsAtStepId &&
        sc.returnsToStepId &&
        (sc.steps.length === 0 || sc.steps.every(step => isTextFilled(step.text)))
      );

    return {
      purpose: isTextFilled(useCase.purpose),
      preconditions: isTextFilled(useCase.preconditions),
      actors: isTextFilled(useCase.actors),
      mainScenario: mainScenarioComplete,
      alternativeScenarios: alternativeScenariosComplete,
      postconditions: isTextFilled(useCase.postconditions),
      successCriteria: isTextFilled(useCase.successCriteria),
    };
  }, [useCase]);

  const toggleSection = (sectionId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDataChange = (e) => updateData(e.target.name, e.target.value);

  return (
    <div className="editor-panel">
      
      <CollapsibleSection
        title="Назначение сценария (Цель)*"
        id="purpose"
        isCollapsed={collapsedSections.purpose}
        onToggle={toggleSection}
        isComplete={completeness.purpose}
      >
        <Input type="text" id="purpose" name="purpose" value={useCase.purpose} onChange={handleDataChange} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Ограничения сценария (Предусловия)"
        id="preconditions"
        isCollapsed={collapsedSections.preconditions}
        onToggle={toggleSection}
        isComplete={completeness.preconditions}
      >
        <textarea id="preconditions" name="preconditions" className="textarea-field" value={useCase.preconditions} onChange={handleDataChange}></textarea>
      </CollapsibleSection>

      <CollapsibleSection
        title="Участники сценария*"
        id="actors"
        isCollapsed={collapsedSections.actors}
        onToggle={toggleSection}
        isComplete={completeness.actors}
      >
        <textarea id="actors" name="actors" className="textarea-field" value={useCase.actors} onChange={handleDataChange}></textarea>
      </CollapsibleSection>

      <CollapsibleSection
        title="Основной сценарий*"
        id="mainScenario"
        isCollapsed={collapsedSections.mainScenario}
        onToggle={toggleSection}
        isComplete={completeness.mainScenario}
      >
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
        <Button className="add-step-btn" onClick={addMainStep}>+ Добавить шаг</Button>
      </CollapsibleSection>

      <CollapsibleSection
        title="Альтернативные сценарии"
        id="alternativeScenarios"
        isCollapsed={collapsedSections.alternativeScenarios}
        onToggle={toggleSection}
        isComplete={completeness.alternativeScenarios}
      >
        {useCase.alternativeScenarios.map((sc, i) => (
          <AlternativeScenarioCard 
            key={sc.id} 
            scenario={sc} 
            index={i} 
            mainScenarioSteps={useCase.mainScenario} 
          />
        ))}
        <Button className="add-scenario-btn" onClick={addAlternativeScenario}>+ Создать альтернативный сценарий</Button>
      </CollapsibleSection>

      <CollapsibleSection
        title="Примечание (Постусловия)"
        id="postconditions"
        isCollapsed={collapsedSections.postconditions}
        onToggle={toggleSection}
        isComplete={completeness.postconditions}
      >
        <textarea id="postconditions" name="postconditions" className="textarea-field" value={useCase.postconditions} onChange={handleDataChange}></textarea>
      </CollapsibleSection>

      <CollapsibleSection
        title="Критерии успешности (Результат)*"
        id="successCriteria"
        isCollapsed={collapsedSections.successCriteria}
        onToggle={toggleSection}
        isComplete={completeness.successCriteria}
      >
        <textarea id="successCriteria" name="successCriteria" className="textarea-field" value={useCase.successCriteria} onChange={handleDataChange}></textarea>
      </CollapsibleSection>

    </div>
  );
}

export default UseCaseEditor;