import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const AddAppointmentScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Doctor Name</Text>
            <TextInput
                style={styles.input}
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="e.g., Smith"
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Location</Text>
            <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g., Main Street Clinic"
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Date *</Text>
            <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Time *</Text>
            <TextInput
                style={styles.input}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
                style={[styles.input, styles.notesInput]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional notes..."
                placeholderTextColor={theme.colors.subText}
                multiline
                numberOfLines={4}
            />

            <View style={styles.switchRow}>
                <Text style={styles.label}>Enable Reminder (1 hour before)</Text>
                <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={theme.colors.surface}
                />
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

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.m,
    },
    label: {
        ...theme.textVariants.caption,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
        marginTop: theme.spacing.m,
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.s,
        padding: theme.spacing.m,
        fontSize: 16,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    notesInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.m,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.s,
        alignItems: 'center',
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xl,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        ...theme.textVariants.button,
        color: theme.colors.surface,
    },
});
