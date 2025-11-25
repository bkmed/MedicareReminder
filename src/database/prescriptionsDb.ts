import { storageService } from '../services/storage';
import { Prescription } from './schema';

const PRESCRIPTIONS_KEY = 'prescriptions';

// Helper functions
const getAllPrescriptions = (): Prescription[] => {
  const json = storageService.getString(PRESCRIPTIONS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveAllPrescriptions = (prescriptions: Prescription[]): void => {
  storageService.setString(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
};

export const prescriptionsDb = {
  // Get all prescriptions
  getAll: async (): Promise<Prescription[]> => {
    const prescriptions = getAllPrescriptions();
    return prescriptions.sort(
      (a, b) =>
        new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
    );
  },

  // Get expiring prescriptions (within 30 days)
  getExpiringSoon: async (): Promise<Prescription[]> => {
    const prescriptions = getAllPrescriptions();
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return prescriptions
      .filter(p => {
        if (!p.expiryDate) return false;
        const expiryDate = new Date(p.expiryDate);
        return expiryDate >= now && expiryDate <= thirtyDaysLater;
      })
      .sort(
        (a, b) =>
          new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime(),
      );
  },

  // Get prescription by ID
  getById: async (id: number): Promise<Prescription | null> => {
    const prescriptions = getAllPrescriptions();
    return prescriptions.find(p => p.id === id) || null;
  },

  // Add new prescription
  add: async (
    prescription: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<number> => {
    const prescriptions = getAllPrescriptions();
    const now = new Date().toISOString();
    const id = Date.now();

    const newPrescription: Prescription = {
      ...prescription,
      id,
      createdAt: now,
      updatedAt: now,
    };

    prescriptions.push(newPrescription);
    saveAllPrescriptions(prescriptions);

    return id;
  },

  // Update prescription
  update: async (id: number, updates: Partial<Prescription>): Promise<void> => {
    const prescriptions = getAllPrescriptions();
    const index = prescriptions.findIndex(p => p.id === id);

    if (index !== -1) {
      prescriptions[index] = {
        ...prescriptions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveAllPrescriptions(prescriptions);
    }
  },

  // Delete prescription
  delete: async (id: number): Promise<void> => {
    const prescriptions = getAllPrescriptions();
    const filtered = prescriptions.filter(p => p.id !== id);
    saveAllPrescriptions(filtered);
  },
};
