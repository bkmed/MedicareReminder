import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { prescriptionsDb } from '../../database/prescriptionsDb';
import { Prescription } from '../../database/schema';

export const PrescriptionDetailsScreen = ({ navigation, route }: any) => {
    const { prescriptionId } = route.params;
    const [prescription, setPrescription] = useState<Prescription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPrescription();
    }, [prescriptionId]);

    const loadPrescription = async () => {
        try {
            const presc = await prescriptionsDb.getById(prescriptionId);
            setPrescription(presc);
        } catch (error) {
            Alert.alert('Error', 'Failed to load prescription');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Prescription',
            'Are you sure you want to delete this prescription?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await prescriptionsDb.delete(prescriptionId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete prescription');
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = () => {
        navigation.navigate('AddPrescription', { prescriptionId });
    };

    if (loading || !prescription) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {prescription.photoUri && (
                <Image source={{ uri: prescription.photoUri }} style={styles.photo} />
            )}

            <View style={styles.section}>
                <Text style={styles.medicationName}>{prescription.medicationName}</Text>
            </View>

            {prescription.doctorName && (
                <View style={styles.section}>
                    <Text style={styles.label}>Doctor</Text>
                    <Text style={styles.value}>Dr. {prescription.doctorName}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.label}>Issue Date</Text>
                <Text style={styles.value}>{new Date(prescription.issueDate).toLocaleDateString()}</Text>
            </View>

            {prescription.expiryDate && (
                <View style={styles.section}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <Text style={styles.value}>{new Date(prescription.expiryDate).toLocaleDateString()}</Text>
                </View>
            )}

            {prescription.notes && (
                <View style={styles.section}>
                    <Text style={styles.label}>Notes</Text>
                    <Text style={styles.value}>{prescription.notes}</Text>
                </View>
            )}

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
    photo: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: 16,
    },
    section: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    medicationName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
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
