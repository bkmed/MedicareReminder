import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  analyticsService,
  AnalyticsData,
} from '../../../services/analyticsService';

interface AnalyticsState {
  data: AnalyticsData;
  adherenceChart: { labels: string[]; data: number[] } | null;
  appointmentsChart: { labels: string[]; data: number[] } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: {
    totalMedications: 0,
    upcomingAppointments: 0,
    expiringPrescriptions: 0,
    medicationAdherence: 0,
    weeklyMedications: [],
  },
  adherenceChart: null,
  appointmentsChart: null,
  loading: false,
  error: null,
};

// Async thunk to fetch all analytics data
export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const [data, adherence, appointments] = await Promise.all([
        analyticsService.getAnalytics(),
        analyticsService.getMedicationAdherence(),
        analyticsService.getUpcomingAppointmentsChart(),
      ]);
      return { data, adherence, appointments };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch analytics');
    }
  },
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAnalytics.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.adherenceChart = action.payload.adherence;
        state.appointmentsChart = action.payload.appointments;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
