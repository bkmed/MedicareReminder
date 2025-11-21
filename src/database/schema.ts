export interface Medication {
    id?: number;
    name: string;
    dosage: string;
    frequency: string; // e.g., "Daily", "Twice a day", "Weekly"
    times: string; // JSON string of times, e.g., ["08:00", "20:00"]
    startDate: string; // ISO date string
    endDate?: string; // ISO date string, optional for ongoing medications
    notes?: string;
    reminderEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface MedicationHistory {
    id?: number;
    medicationId: number;
    takenAt: string; // ISO datetime string
    status: 'taken' | 'missed' | 'skipped';
    notes?: string;
}

export interface Appointment {
    id?: number;
    title: string;
    doctorName?: string;
    doctorId?: number;
    location?: string;
    dateTime: string; // ISO datetime string
    notes?: string;
    reminderEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Prescription {
    id?: number;
    medicationName: string;
    doctorName?: string;
    doctorId?: number;
    issueDate: string;
    expiryDate?: string;
    photoUri?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Doctor {
    id?: number;
    name: string;
    specialty?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
