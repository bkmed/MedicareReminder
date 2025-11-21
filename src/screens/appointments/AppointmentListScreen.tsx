import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { appointmentsDb } from '../../database/appointmentsDb';
import { Appointment } from '../../database/schema';

export const AppointmentListScreen = ({ navigation }: any) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadAppointments = async () => {
        try {
            const data = await appointmentsDb.getUpcoming();
            setAppointments(data);
        } catch (error) {
            console.error('Error loading appointments:', error);
            Alert.alert('Error', 'Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadAppointments();
        }, [])
    );

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
        const timeStr = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
        return { dateStr, timeStr };
    };

    const renderAppointment = ({ item }: { item: Appointment }) => {
        const { dateStr, timeStr } = formatDateTime(item.dateTime);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
            >
                <View style={styles.dateColumn}>
                    <Text style={styles.dateText}>{dateStr}</Text>
                    <Text style={styles.timeText}>{timeStr}</Text>
                </View>

                <View style={styles.detailsColumn}>
                    <Text style={styles.title}>{item.title}</Text>
                    {item.doctorName && (
                        <Text style={styles.doctor}>Dr. {item.doctorName}</Text>
                    )}
                    {item.location && (
                        <Text style={styles.location}>📍 {item.location}</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <Text style={styles.emptySubText}>Tap + to schedule an appointment</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={appointments}
                renderItem={renderAppointment}
                keyExtractor={(item) => item.id?.toString() || ''}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmpty : null}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddAppointment')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dateColumn: {
        width: 80,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
    },
    dateText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    timeText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
        marginTop: 4,
    },
    detailsColumn: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    doctor: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    location: {
        fontSize: 13,
        color: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#FFF',
        fontWeight: '300',
    },
});
