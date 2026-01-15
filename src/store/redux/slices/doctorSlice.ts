import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Doctor } from '../../../database/schema';

interface DoctorState {
  doctors: Doctor[];
}

const initialState: DoctorState = {
  doctors: [],
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    setDoctors: (state, action: PayloadAction<Doctor[]>) => {
      state.doctors = action.payload;
    },
    addDoctor: (state, action: PayloadAction<Doctor>) => {
      state.doctors.push(action.payload);
    },
    updateDoctor: (state, action: PayloadAction<Doctor>) => {
      const index = state.doctors.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.doctors[index] = action.payload;
      }
    },
    removeDoctor: (state, action: PayloadAction<number>) => {
      state.doctors = state.doctors.filter(d => d.id !== action.payload);
    },
  },
});

export const { setDoctors, addDoctor, updateDoctor, removeDoctor } =
  doctorSlice.actions;

export default doctorSlice.reducer;
