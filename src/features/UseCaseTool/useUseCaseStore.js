// --- START OF FILE src/features/UseCaseTool/useUseCaseStore.js ---

import { create } from 'zustand';
import { produce } from 'immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';

const createNewUseCase = () => ({
  id: `uc-${Date.now()}`,
  purpose: "Новый сценарий использования",
  preconditions: "",
  actors: "",
  mainScenario: [{ id: `main-${Date.now()}`, text: "" }],
  alternativeScenarios: [],
  postconditions: "",
  successCriteria: "",
});

export const useUseCaseStore = create(
  persist(
    (set, get) => ({
      useCases: [createNewUseCase()],
      activeUseCaseIndex: 0,

      // --- ACTIONS ---

      addTab: () => set(produce(draft => {
        const newUseCase = createNewUseCase();
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
          activeUseCase.mainScenario.push({ id: `main-${Date.now()}`, text: "" });
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
            id: `alt-scenario-${Date.now()}`,
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
          if (scenario) scenario.steps.push({ id: `alt-step-${Date.now()}`, text: "" });
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
      name: 'use-case-builder-session', // ключ в localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);