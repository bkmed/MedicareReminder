import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
} from 'react-native';
import { medicationsDb } from '../../database/medicationsDb';
import { notificationService } from '../../services/notificationService';

export const AddMedicationScreen = ({ navigation, route }: any) => {
    const medicationId = route.params?.medicationId;
    const isEdit = !!medicationId;

    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('Daily');
    const [times, setTimes] = useState(['08:00', '20:00']);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState('');
    const [notes, setNotes] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            loadMedication();
        }
    }, [medicationId]);

    const loadMedication = async () => {
        try {
            const med = await medicationsDb.getById(medicationId);
            if (med) {
                setName(med.name);
                setDosage(med.dosage);
                setFrequency(med.frequency);
                setTimes(JSON.parse(med.times));
                setStartDate(med.startDate);
                setEndDate(med.endDate || '');
                setNotes(med.notes || '');
                setReminderEnabled(med.reminderEnabled);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load medication');
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !dosage.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            const medicationData = {
                name: name.trim(),
                dosage: dosage.trim(),
                frequency,
                times: JSON.stringify(times),
                startDate,
                endDate: endDate || undefined,
                notes: notes.trim() || undefined,
                reminderEnabled,
            };

            let id: number;
            if (isEdit) {
                await medicationsDb.update(medicationId, medicationData);
                id = medicationId;
            } else {
                id = await medicationsDb.add(medicationData);
            }

            // Schedule notifications
            if (reminderEnabled) {
                const medication = await medicationsDb.getById(id);
                if (medication) {
                    await notificationService.scheduleMedicationReminders(medication);
                }
            }

            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', 'Failed to save medication');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTime = () => {
        setTimes([...times, '12:00']);
    };

    const handleRemoveTime = (index: number) => {
        setTimes(times.filter((_, i) => i !== index));
    };

    const handleTimeChange = (index: number, value: string) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., Aspirin"
            />

            <Text style={styles.label}>Dosage *</Text>
            <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g., 100mg"
            />

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyContainer}>
                {['Daily', 'Twice a day', 'Weekly'].map((freq) => (
                    <TouchableOpacity
                        key={freq}
                        style={[styles.frequencyButton, frequency === freq && styles.frequencyButtonActive]}
                        onPress={() => setFrequency(freq)}
                    >
                        <Text style={[styles.frequencyText, frequency === freq && styles.frequencyTextActive]}>
                            {freq}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Reminder Times</Text>
            {times.map((time, index) => (
                <View key={index} style={styles.timeRow}>
                    <TextInput
                        style={[styles.input, styles.timeInput]}
                        value={time}
                        onChangeText={(value) => handleTimeChange(index, value)}
                        placeholder="HH:MM"
                    />
                    {times.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveTime(index)} style={styles.removeButton}>
                            <Text style={styles.removeButtonText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ))}
            <TouchableOpacity onPress={handleAddTime} style={styles.addTimeButton}>
                <Text style={styles.addTimeButtonText}>+ Add Time</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Start Date</Text>
            <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>End Date (Optional)</Text>
            <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes..."
                multiline
                numberOfLines={4}
            />

            <View style={styles.switchRow}>
                <Text style={styles.label}>Enable Reminders</Text>
                <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
            </View>

            <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Save'} Medication</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    content: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    notesInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    frequencyContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    frequencyButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    frequencyButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    frequencyText: {
        fontSize: 14,
        color: '#666',
    },
    frequencyTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    timeInput: {
        flex: 1,
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    addTimeButton: {
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 8,
        borderStyle: 'dashed',
    },
    addTimeButtonText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '600',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
