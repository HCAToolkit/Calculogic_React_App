import { create } from 'zustand'; // Use named import for 'create'

type Field = { id: string; type: string; label: string };

interface Store {
  structure: Field[];
  setStructure: (s: Field[]) => void;
}

export const useStore = create<Store>((set) => ({
  structure: [],
  setStructure: (s) => set({ structure: s }),
}));
