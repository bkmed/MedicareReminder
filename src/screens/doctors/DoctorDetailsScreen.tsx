import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { doctorsDb } from '../../database/doctorsDb';
import { appointmentsDb } from '../../database/appointmentsDb';
import { Doctor, Appointment } from '../../database/schema';
import { theme } from '../../theme';

export const DoctorDetailsScreen = ({ navigation, route }: any) => {
    const { doctorId } = route.params;
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const doctorData = await doctorsDb.getById(doctorId);
            const appointmentsData = await appointmentsDb.getByDoctorId(doctorId);

            if (doctorData) {
                setDoctor(doctorData);
            } else {
                Alert.alert('Error', 'Doctor not found');
                navigation.goBack();
            }

            setAppointments(appointmentsData);
        } catch (error) {
            console.error('Error loading doctor details:', error);
            Alert.alert('Error', 'Failed to load details');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [doctorId])
    );

    const handleEdit = () => {
        navigation.navigate('AddDoctor', { doctorId });
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Doctor',
            'Are you sure you want to delete this doctor? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await doctorsDb.delete(doctorId);
                            navigation.goBack();
                        } catch (error) {
                            console.error('Error deleting doctor:', error);
                            Alert.alert('Error', 'Failed to delete doctor');
                        }
                    },
                },
            ]
        );
    };

    const renderAppointment = ({ item }: { item: Appointment }) => (
        <View style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
                <Text style={styles.appointmentTitle}>{item.title}</Text>
                <Text style={styles.appointmentDate}>
                    {new Date(item.dateTime).toLocaleDateString()} {new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
            {item.location && <Text style={styles.appointmentDetail}>📍 {item.location}</Text>}
            {item.notes && <Text style={styles.appointmentDetail}>📝 {item.notes}</Text>}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!doctor) return null;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.name}>Dr. {doctor.name}</Text>
                            {doctor.specialty && (
                                <Text style={styles.specialty}>{doctor.specialty}</Text>
                            )}
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                                <Text style={styles.actionText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, styles.deleteButton]}>
                                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailsSection}>
                        {doctor.phone && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Phone</Text>
                                <Text style={styles.detailValue}>{doctor.phone}</Text>
                            </View>
                        )}
                        {doctor.email && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Email</Text>
                                <Text style={styles.detailValue}>{doctor.email}</Text>
                            </View>
                        )}
                        {doctor.address && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Address</Text>
                                <Text style={styles.detailValue}>{doctor.address}</Text>
                            </View>
                        )}
                        {doctor.notes && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Notes</Text>
                                <Text style={styles.detailValue}>{doctor.notes}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Appointments</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('AddAppointment', { doctorId: doctor.id, doctorName: doctor.name })}
                        style={styles.addButton}
                    >
                        <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                </View>

                {appointments.length > 0 ? (
                    appointments.map(item => (
                        <View key={item.id} style={styles.appointmentWrapper}>
                            {renderAppointment({ item })}
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No appointments scheduled</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: theme.spacing.m,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.m,
        padding: theme.spacing.m,
        ...theme.shadows.medium,
        marginBottom: theme.spacing.l,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.m,
    },
    name: {
        ...theme.textVariants.header,
        fontSize: 24,
        marginBottom: theme.spacing.xs,
    },
    specialty: {
        ...theme.textVariants.subheader,
        color: theme.colors.primary,
        fontSize: 18,
    },
    actions: {
        flexDirection: 'row',
        gap: theme.spacing.s,
    },
    actionButton: {
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.spacing.s,
        backgroundColor: theme.colors.background,
    },
    deleteButton: {
        backgroundColor: '#FFF0F0',
    },
    actionText: {
        ...theme.textVariants.body,
        fontSize: 14,
        color: theme.colors.primary,
    },
    deleteText: {
        color: theme.colors.error,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginVertical: theme.spacing.m,
    },
    detailsSection: {
        gap: theme.spacing.m,
    },
    detailRow: {
        gap: theme.spacing.xs,
    },
    detailLabel: {
        ...theme.textVariants.caption,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    detailValue: {
        ...theme.textVariants.body,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    sectionTitle: {
        ...theme.textVariants.subheader,
    },
    addButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.spacing.l,
    },
    addButtonText: {
        ...theme.textVariants.button,
        fontSize: 14,
    },
    appointmentWrapper: {
        marginBottom: theme.spacing.m,
    },
    appointmentCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.s,
        padding: theme.spacing.m,
        ...theme.shadows.small,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.secondary,
    },
    appointmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    appointmentTitle: {
        ...theme.textVariants.body,
        fontWeight: '600',
    },
    appointmentDate: {
        ...theme.textVariants.caption,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    appointmentDetail: {
        ...theme.textVariants.caption,
        marginTop: theme.spacing.xs,
    },
    emptyState: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: theme.spacing.m,
    },
    emptyText: {
        ...theme.textVariants.body,
        color: theme.colors.subText,
    },
});
