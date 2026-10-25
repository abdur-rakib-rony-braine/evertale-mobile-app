import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CheckoutStepState {
  currentStep: number;
  completedSteps: number[];
  setCurrentStep: (step: number) => void;
  markStepComplete: (step: number) => void;
  canProceedToStep: (step: number) => boolean;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  resetSteps: () => void;
}

export const useCheckoutStepStore = create<CheckoutStepState>()(
  persist(
    (set, get) => ({
      currentStep: 1,
      completedSteps: [],
      
      setCurrentStep: (step) => set({ currentStep: step }),
      
      markStepComplete: (step) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(step)) {
          set({ completedSteps: [...completedSteps, step] });
        }
      },
      
      canProceedToStep: (step) => {
        const { completedSteps } = get();
        return step === 1 || completedSteps.includes(step - 1);
      },
      
      goToNextStep: () => {
        const { currentStep, completedSteps } = get();
        if (currentStep < 4) {
          if (!completedSteps.includes(currentStep)) {
            set({ 
              completedSteps: [...completedSteps, currentStep],
              currentStep: currentStep + 1 
            });
          } else {
            set({ currentStep: currentStep + 1 });
          }
        }
      },
      
      goToPreviousStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      resetSteps: () => set({ currentStep: 1, completedSteps: [] }),
    }),
    {
      name: 'checkout-step-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
      }),
    }
  )
);