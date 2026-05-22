import { create } from 'zustand';

export const useStore = create((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
  mayaExpression: 'idle',
  setMayaExpression: (expr) => set({ mayaExpression: expr }),
  mayaSpeech: '',
  setMayaSpeech: (speech) => set({ mayaSpeech: speech }),
}));
