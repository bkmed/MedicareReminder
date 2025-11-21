import { medicationsDb } from '../database/medicationsDb';
import { appointmentsDb } from '../database/appointmentsDb';
import { prescriptionsDb } from '../database/prescriptionsDb';

export interface AnalyticsData {
    totalMedications: number;
    upcomingAppointments: number;
    expiringPrescriptions: number;
    medicationAdherence: number; // Percentage
    weeklyMedications: { day: string; count: number }[];
}

export const analyticsService = {
    // Get overall analytics
    getAnalytics: async (): Promise<AnalyticsData> => {
        try {
            const [medications, appointments, prescriptions] = await Promise.all([
                medicationsDb.getAll(),
                appointmentsDb.getUpcoming(),
                prescriptionsDb.getExpiringSoon(),
            ]);

            // Calculate weekly medication distribution
            const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const weeklyMedications = daysOfWeek.map((day, index) => ({
                day,
                count: medications.length, // Simplified: all meds every day
            }));

            // Calculate adherence (simplified: assume 80% for demo)
            const medicationAdherence = 80;

            return {
                totalMedications: medications.length,
                upcomingAppointments: appointments.length,
                expiringPrescriptions: prescriptions.length,
                medicationAdherence,
                weeklyMedications,
            };
        } catch (error) {
            console.error('Error getting analytics:', error);
            return {
                totalMedications: 0,
                upcomingAppointments: 0,
                expiringPrescriptions: 0,
                medicationAdherence: 0,
                weeklyMedications: [],
            };
        }
    },

    // Get medication adherence for last 7 days
    getMedicationAdherence: async (): Promise<{ labels: string[]; data: number[] }> => {
        // Simplified implementation - returns mock data
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toLocaleDateString('en-US', { weekday: 'short' });
        });

        // Mock adherence data (would come from medication_history in real implementation)
        const adherenceData = [85, 90, 75, 100, 80, 95, 88];

        return {
            labels: last7Days,
            data: adherenceData,
        };
    },

    // Get upcoming appointments count by week
    getUpcomingAppointmentsChart: async (): Promise<{ labels: string[]; data: number[] }> => {
        const appointments = await appointmentsDb.getUpcoming();

        // Group by next 4 weeks
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const data = [0, 0, 0, 0];

        appointments.forEach((appt) => {
            const apptDate = new Date(appt.dateTime);
            const now = new Date();
            const diffDays = Math.floor((apptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const weekIndex = Math.floor(diffDays / 7);

            if (weekIndex >= 0 && weekIndex < 4) {
                data[weekIndex]++;
            }
        });

        return { labels: weeks, data };
    },
};
