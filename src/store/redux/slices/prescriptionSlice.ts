import { Prescription } from '../../../database/schema';

interface PrescriptionState {
    prescriptions: Prescription[];
}

const initialState: PrescriptionState = {
    prescriptions: [],
};

const prescriptionSlice = createSlice({
    name: 'prescriptions',
    initialState,
    reducers: {
        setPrescriptions: (state, action: PayloadAction<Prescription[]>) => {
            state.prescriptions = action.payload;
        },
        addPrescription: (state, action: PayloadAction<Prescription>) => {
            state.prescriptions.push(action.payload);
        },
        updatePrescription: (state, action: PayloadAction<Prescription>) => {
            const index = state.prescriptions.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.prescriptions[index] = action.payload;
            }
        },
        removePrescription: (state, action: PayloadAction<number>) => {
            state.prescriptions = state.prescriptions.filter(p => p.id !== action.payload);
        },
    },
});

export const {
    setPrescriptions,
    addPrescription,
    updatePrescription,
    removePrescription,
} = prescriptionSlice.actions;

export default prescriptionSlice.reducer;
