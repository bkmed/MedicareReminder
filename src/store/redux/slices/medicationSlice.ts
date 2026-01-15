import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Medication, MedicationHistory } from '../../../database/schema';

interface MedicationState {
  medications: Medication[];
  history: MedicationHistory[];
}

const initialState: MedicationState = {
  medications: [],
  history: [],
};

const medicationSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    setMedications: (state, action: PayloadAction<Medication[]>) => {
      state.medications = action.payload;
    },
    addMedication: (state, action: PayloadAction<Medication>) => {
      state.medications.push(action.payload);
    },
    updateMedication: (state, action: PayloadAction<Medication>) => {
      const index = state.medications.findIndex(
        m => m.id === action.payload.id,
      );
      if (index !== -1) {
        state.medications[index] = action.payload;
      }
    },
    removeMedication: (state, action: PayloadAction<number>) => {
      state.medications = state.medications.filter(
        m => m.id !== action.payload,
      );
      state.history = state.history.filter(
        h => h.medicationId !== action.payload,
      );
    },
    setHistory: (state, action: PayloadAction<MedicationHistory[]>) => {
      state.history = action.payload;
    },
    addHistoryEntry: (state, action: PayloadAction<MedicationHistory>) => {
      state.history.push(action.payload);
    },
  },
});

export const {
  setMedications,
  addMedication,
  updateMedication,
  removeMedication,
  setHistory,
  addHistoryEntry,
} = medicationSlice.actions;

export default medicationSlice.reducer;
