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
import { appointmentsDb } from '../../database/appointmentsDb';
import { notificationService } from '../../services/notificationService';

export const AddAppointmentScreen = ({ navigation, route }: any) => {
    const appointmentId = route.params?.appointmentId;
    const isEdit = !!appointmentId;

    const [title, setTitle] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [notes, setNotes] = useState('');
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            loadAppointment();
        }
    }, [appointmentId]);

    const loadAppointment = async () => {
        try {
            const appt = await appointmentsDb.getById(appointmentId);
            if (appt) {
                setTitle(appt.title);
                setDoctorName(appt.doctorName || '');
                setLocation(appt.location || '');

                const dateTime = new Date(appt.dateTime);
                setDate(dateTime.toISOString().split('T')[0]);
                setTime(dateTime.toTimeString().substring(0, 5));

                setNotes(appt.notes || '');
                setReminderEnabled(appt.reminderEnabled);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load appointment');
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        setLoading(true);
        try {
            const dateTime = `${date}T${time}:00.000Z`;

            const appointmentData = {
                title: title.trim(),
                doctorName: doctorName.trim() || undefined,
                location: location.trim() || undefined,
                dateTime,
                notes: notes.trim() || undefined,
                reminderEnabled,
            };

            let id: number;
            if (isEdit) {
                await appointmentsDb.update(appointmentId, appointmentData);
                id = appointmentId;
                // Cancel old reminder
                await notificationService.cancelAppointmentReminder(appointmentId);
            } else {
                id = await appointmentsDb.add(appointmentData);
            }

            // Schedule new reminder
            if (reminderEnabled) {
                await notificationService.scheduleAppointmentReminder(id, title, dateTime);
            }

            navigation.goBack();
        } catch (error) {
            console.error('Error saving appointment:', error);
            Alert.alert('Error', 'Failed to save appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Annual Checkup"
            />

            <Text style={styles.label}>Doctor Name</Text>
            <TextInput
                style={styles.input}
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="e.g., Smith"
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Main Street Clinic"
            />

            <Text style={styles.label}>Date *</Text>
            <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Time *</Text>
            <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
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
                <Text style={styles.label}>Enable Reminder (1 hour before)</Text>
                <Switch value={reminderEnabled} onValueChange={setReminderEnabled} />
            </View>

            <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Save'} Appointment</Text>
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
