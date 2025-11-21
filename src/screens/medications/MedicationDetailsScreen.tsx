import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { medicationsDb } from '../../database/medicationsDb';
import { notificationService } from '../../services/notificationService';
import { Medication } from '../../database/schema';

export const MedicationDetailsScreen = ({ navigation, route }: any) => {
    const { medicationId } = route.params;
    const [medication, setMedication] = useState<Medication | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMedication();
    }, [medicationId]);

    const loadMedication = async () => {
        try {
            const med = await medicationsDb.getById(medicationId);
            setMedication(med);
        } catch (error) {
            Alert.alert('Error', 'Failed to load medication');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Medication',
            'Are you sure you want to delete this medication?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await medicationsDb.delete(medicationId);
                            await notificationService.cancelMedicationReminders(medicationId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete medication');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        navigation.navigate('AddMedication', { medicationId });
    };

    const handleViewHistory = () => {
        navigation.navigate('MedicationHistory', { medicationId });
    };

    if (loading || !medication) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const times = JSON.parse(medication.times) as string[];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.section}>
                <Text style={styles.name}>{medication.name}</Text>
                <Text style={styles.dosage}>{medication.dosage}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Frequency</Text>
                <Text style={styles.value}>{medication.frequency}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Reminder Times</Text>
                <View style={styles.timesContainer}>
                    {times.map((time, index) => (
                        <View key={index} style={styles.timeBadge}>
                            <Text style={styles.timeText}>{time}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Start Date</Text>
                <Text style={styles.value}>{medication.startDate}</Text>
            </View>

            {medication.endDate && (
                <View style={styles.section}>
                    <Text style={styles.label}>End Date</Text>
                    <Text style={styles.value}>{medication.endDate}</Text>
                </View>
            )}

            {medication.notes && (
                <View style={styles.section}>
                    <Text style={styles.label}>Notes</Text>
                    <Text style={styles.value}>{medication.notes}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.label}>Reminders</Text>
                <Text style={styles.value}>{medication.reminderEnabled ? 'Enabled' : 'Disabled'}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleViewHistory}>
                <Text style={styles.buttonText}>View History</Text>
            </TouchableOpacity>

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
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    dosage: {
        fontSize: 18,
        color: '#666',
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
    timesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    timeBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
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
