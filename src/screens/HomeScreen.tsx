import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { medicationsDb } from '../database/medicationsDb';
import { appointmentsDb } from '../database/appointmentsDb';
import { prescriptionsDb } from '../database/prescriptionsDb';

export const HomeScreen = () => {
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const [summary, setSummary] = useState({
        medications: 0,
        upcomingAppointments: 0,
        expiringPrescriptions: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        try {
            const [meds, appts, prescriptions] = await Promise.all([
                medicationsDb.getAll(),
                appointmentsDb.getUpcoming(),
                prescriptionsDb.getExpiringSoon(),
            ]);

            setSummary({
                medications: meds.length,
                upcomingAppointments: appts.length,
                expiringPrescriptions: prescriptions.length,
            });
        } catch (error) {
            console.error('Error loading summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>Welcome to</Text>
                <Text style={styles.appName}>Medicare Reminder</Text>
                <Text style={styles.subtitle}>Your Health Management Assistant</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <TouchableOpacity
                    style={[styles.statCard, styles.statCardBlue]}
                    onPress={() => navigation.navigate('Main', { screen: 'MedicationsTab' })}
                >
                    <Text style={styles.statNumber}>{summary.medications}</Text>
                    <Text style={styles.statLabel}>Active Medications</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.statCard, styles.statCardGreen]}
                    onPress={() => navigation.navigate('Main', { screen: 'AppointmentsTab' })}
                >
                    <Text style={styles.statNumber}>{summary.upcomingAppointments}</Text>
                    <Text style={styles.statLabel}>Upcoming Appointments</Text>
                </TouchableOpacity>
            </View>

            {/* Alerts */}
            {summary.expiringPrescriptions > 0 && (
                <View style={styles.alertCard}>
                    <Text style={styles.alertIcon}>⚠️</Text>
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Prescription Alert</Text>
                        <Text style={styles.alertMessage}>
                            {summary.expiringPrescriptions} prescription{summary.expiringPrescriptions > 1 ? 's' : ''} expiring soon
                        </Text>
                    </View>
                </View>
            )}

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Main', { screen: 'MedicationsTab', params: { screen: 'AddMedication' } })}
            >
                <Text style={styles.actionIcon}>💊</Text>
                <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Add Medication</Text>
                    <Text style={styles.actionSubtitle}>Track a new medication</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Main', { screen: 'AppointmentsTab', params: { screen: 'AddAppointment' } })}
            >
                <Text style={styles.actionIcon}>📅</Text>
                <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Schedule Appointment</Text>
                    <Text style={styles.actionSubtitle}>Book a doctor visit</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Analytics')}
            >
                <Text style={styles.actionIcon}>📊</Text>
                <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>View Analytics</Text>
                    <Text style={styles.actionSubtitle}>See your health insights</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            {/* Tips Section */}
            <View style={styles.tipCard}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                    Tip: Enable notifications to never miss your medication reminders!
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    greeting: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#999',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statCardBlue: {
        backgroundColor: '#007AFF',
    },
    statCardGreen: {
        backgroundColor: '#34C759',
    },
    statNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: '#FFF',
        textAlign: 'center',
        opacity: 0.9,
    },
    alertCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF3CD',
        borderLeftWidth: 4,
        borderLeftColor: '#FF9500',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    alertIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    alertMessage: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    actionIcon: {
        fontSize: 28,
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    actionArrow: {
        fontSize: 24,
        color: '#007AFF',
    },
    tipCard: {
        flexDirection: 'row',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center',
    },
    tipIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#1976D2',
        lineHeight: 20,
    },
});
