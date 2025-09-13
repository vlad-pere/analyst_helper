import { create } from 'zustand';
import { produce } from 'immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { v4 as uuidv4 } from 'uuid';

const createNewUseCase = () => ({
  id: `uc-${uuidv4()}`,
  purpose: "Новый сценарий использования",
  preconditions: "",
  actors: "",
  mainScenario: [{ id: `main-${uuidv4()}`, text: "" }],
  alternativeScenarios: [],
  postconditions: "",
  successCriteria: "",
});

const cloneUseCaseAsNew = (useCaseData) => {
  const newUseCase = JSON.parse(JSON.stringify(useCaseData));
  
  newUseCase.id = `uc-${uuidv4()}`;
  newUseCase.mainScenario.forEach(step => {
    step.id = `main-${uuidv4()}`;
  });
  newUseCase.alternativeScenarios.forEach(scenario => {
    scenario.id = `alt-scenario-${uuidv4()}`;
    scenario.steps.forEach(step => {
      step.id = `alt-step-${uuidv4()}`;
    });
  });
  return newUseCase;
};

export const useUseCaseStore = create(
  persist(
    (set, get) => ({
      useCases: [createNewUseCase()],
      activeUseCaseIndex: 0,
      templates: [],

      // --- ACTIONS ---

      addTab: (templateId = null) => set(produce(draft => {
        let newUseCase;
        if (templateId) {
          const template = draft.templates.find(t => t.id === templateId);
          if (template) {
            newUseCase = cloneUseCaseAsNew(template.data);
          } else {
            newUseCase = createNewUseCase(); // Fallback
          }
        } else {
          newUseCase = createNewUseCase();
        }
        draft.useCases.push(newUseCase);
        draft.activeUseCaseIndex = draft.useCases.length - 1;
      })),

      selectTab: (index) => set({ activeUseCaseIndex: index }),

      deleteTab: (idToDelete) => set(produce(draft => {
        const deletedIndex = draft.useCases.findIndex(uc => uc.id === idToDelete);
        
        draft.useCases = draft.useCases.filter(uc => uc.id !== idToDelete);

        if (draft.useCases.length === 0) {
          draft.useCases.push(createNewUseCase());
          draft.activeUseCaseIndex = 0;
          return;
        }

        if (draft.activeUseCaseIndex > deletedIndex) {
          draft.activeUseCaseIndex--;
        } else if (draft.activeUseCaseIndex === deletedIndex && draft.activeUseCaseIndex >= draft.useCases.length) {
          draft.activeUseCaseIndex = draft.useCases.length - 1;
        }
      })),
      
      // --- TEMPLATE ACTIONS ---
      saveAsTemplate: (name) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          draft.templates.push({
            id: `tpl-${uuidv4()}`,
            name,
            data: activeUseCase
          });
        }
      })),

      updateTemplate: (id, newName) => set(produce(draft => {
        const template = draft.templates.find(t => t.id === id);
        if (template) {
          template.name = newName;
        }
      })),

      deleteTemplate: (id) => set(produce(draft => {
        draft.templates = draft.templates.filter(t => t.id !== id);
      })),

      // --- ACTIONS FOR ACTIVE USE CASE ---

      updateData: (fieldName, value) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          activeUseCase[fieldName] = value;
        }
      })),

      addMainStep: () => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          activeUseCase.mainScenario.push({ id: `main-${uuidv4()}`, text: "" });
        }
      })),
      
      deleteMainStep: (stepId) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          activeUseCase.mainScenario = activeUseCase.mainScenario.filter(s => s.id !== stepId);
        }
      })),

      updateMainStep: (stepId, text) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          const step = activeUseCase.mainScenario.find(s => s.id === stepId);
          if (step) step.text = text;
        }
      })),

      moveMainStep: ({ active, over }) => {
        if (active.id !== over.id) {
          set(produce(draft => {
            const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
            if (activeUseCase) {
              const oldIdx = activeUseCase.mainScenario.findIndex(s => s.id === active.id);
              const newIdx = activeUseCase.mainScenario.findIndex(s => s.id === over.id);
              activeUseCase.mainScenario = arrayMove(activeUseCase.mainScenario, oldIdx, newIdx);
            }
          }));
        }
      },

      addAlternativeScenario: () => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          activeUseCase.alternativeScenarios.push({
            id: `alt-scenario-${uuidv4()}`,
            name: "Новый альтернативный сценарий",
            startsAtStepId: null,
            returnsToStepId: null,
            steps: [],
          });
        }
      })),

      deleteAlternativeScenario: (scenarioId) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          activeUseCase.alternativeScenarios = activeUseCase.alternativeScenarios.filter(sc => sc.id !== scenarioId);
        }
      })),

      updateAlternativeScenario: (scenarioId, field, value) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          const scenario = activeUseCase.alternativeScenarios.find(sc => sc.id === scenarioId);
          if (scenario) scenario[field] = value;
        }
      })),

      addAltStep: (scenarioId) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          const scenario = activeUseCase.alternativeScenarios.find(sc => sc.id === scenarioId);
          if (scenario) scenario.steps.push({ id: `alt-step-${uuidv4()}`, text: "" });
        }
      })),

      deleteAltStep: (scenarioId, stepId) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          const scenario = activeUseCase.alternativeScenarios.find(sc => sc.id === scenarioId);
          if (scenario) scenario.steps = scenario.steps.filter(s => s.id !== stepId);
        }
      })),

      updateAltStep: (scenarioId, stepId, text) => set(produce(draft => {
        const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
        if (activeUseCase) {
          const scenario = activeUseCase.alternativeScenarios.find(sc => sc.id === scenarioId);
          if (scenario) {
            const step = scenario.steps.find(s => s.id === stepId);
            if (step) step.text = text;
          }
        }
      })),

      moveAltStep: (scenarioId, { active, over }) => {
        if (active.id !== over.id) {
          set(produce(draft => {
            const activeUseCase = draft.useCases[draft.activeUseCaseIndex];
            if (activeUseCase) {
              const scenario = activeUseCase.alternativeScenarios.find(sc => sc.id === scenarioId);
              if (scenario) {
                const oldIdx = scenario.steps.findIndex(s => s.id === active.id);
                const newIdx = scenario.steps.findIndex(s => s.id === over.id);
                scenario.steps = arrayMove(scenario.steps, oldIdx, newIdx);
              }
            }
          }));
        }
      },
    }),
    {
      name: 'use-case-builder-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);