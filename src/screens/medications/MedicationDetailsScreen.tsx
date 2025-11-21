import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const MedicationDetailsScreen = ({ navigation, route }: any) => {
    const { medicationId } = route.params;
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
                <Text style={{ color: theme.colors.text }}>Loading...</Text>
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

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.m,
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        ...theme.shadows.small,
    },
    name: {
        ...theme.textVariants.header,
        color: theme.colors.text,
        marginBottom: 4,
    },
    dosage: {
        ...theme.textVariants.subheader,
        color: theme.colors.subText,
        fontWeight: '600',
    },
    label: {
        ...theme.textVariants.caption,
        color: theme.colors.subText,
        marginBottom: 4,
    },
    value: {
        ...theme.textVariants.body,
        color: theme.colors.text,
    },
    timesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    timeBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeText: {
        ...theme.textVariants.caption,
        color: theme.colors.surface,
        fontWeight: '600',
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.s,
        alignItems: 'center',
        marginTop: theme.spacing.m,
    },
    editButton: {
        backgroundColor: theme.colors.secondary,
    },
    deleteButton: {
        backgroundColor: theme.colors.error,
    },
    buttonText: {
        ...theme.textVariants.button,
        color: theme.colors.surface,
    },
});
