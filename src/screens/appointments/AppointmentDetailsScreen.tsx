import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { appointmentsDb } from '../../database/appointmentsDb';
import { notificationService } from '../../services/notificationService';
import { Appointment } from '../../database/schema';

export const AppointmentDetailsScreen = ({ navigation, route }: any) => {
    const { appointmentId } = route.params;
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointment();
    }, [appointmentId]);

    const loadAppointment = async () => {
        try {
            const appt = await appointmentsDb.getById(appointmentId);
            setAppointment(appt);
        } catch (error) {
            Alert.alert('Error', 'Failed to load appointment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Appointment',
            'Are you sure you want to delete this appointment?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await appointmentsDb.delete(appointmentId);
                            await notificationService.cancelAppointmentReminder(appointmentId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete appointment');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        navigation.navigate('AddAppointment', { appointmentId });
    };

    if (loading || !appointment) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const formatDateTime = () => {
        const date = new Date(appointment.dateTime);
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
        return `${dateStr} at ${timeStr}`;
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.section}>
                <Text style={styles.title}>{appointment.title}</Text>
                <Text style={styles.dateTime}>{formatDateTime()}</Text>
            </View>

            {appointment.doctorName && (
                <View style={styles.section}>
                    <Text style={styles.label}>Doctor</Text>
                    <Text style={styles.value}>Dr. {appointment.doctorName}</Text>
                </View>
            )}

            {appointment.location && (
                <View style={styles.section}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.value}>{appointment.location}</Text>
                </View>
            )}

            {appointment.notes && (
                <View style={styles.section}>
                    <Text style={styles.label}>Notes</Text>
                    <Text style={styles.value}>{appointment.notes}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.label}>Reminder</Text>
                <Text style={styles.value}>
                    {appointment.reminderEnabled ? '1 hour before' : 'Disabled'}
                </Text>
            </View>

            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={handleEdit}>
                <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
                <Text style={styles.buttonText}>Delete</Text>
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
    section: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    dateTime: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#000',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    editButton: {
        backgroundColor: '#34C759',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
