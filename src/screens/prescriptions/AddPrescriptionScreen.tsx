import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { prescriptionsDb } from '../../database/prescriptionsDb';

export const AddPrescriptionScreen = ({ navigation, route }: any) => {
    const prescriptionId = route.params?.prescriptionId;
    const isEdit = !!prescriptionId;

    const [medicationName, setMedicationName] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [expiryDate, setExpiryDate] = useState('');
    const [photoUri, setPhotoUri] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            loadPrescription();
        }
    }, [prescriptionId]);

    const loadPrescription = async () => {
        try {
            const prescription = await prescriptionsDb.getById(prescriptionId);
            if (prescription) {
                setMedicationName(prescription.medicationName);
                setDoctorName(prescription.doctorName || '');
                setIssueDate(prescription.issueDate);
                setExpiryDate(prescription.expiryDate || '');
                setPhotoUri(prescription.photoUri || '');
                setNotes(prescription.notes || '');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load prescription');
        }
    };

    const handleTakePhoto = () => {
        Alert.alert('Add Photo', 'Choose an option', [
            {
                text: 'Take Photo',
                onPress: () => {
                    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) => {
                        if (response.assets && response.assets[0].uri) {
                            setPhotoUri(response.assets[0].uri);
                        }
                    });
                },
            },
            {
                text: 'Choose from Library',
                onPress: () => {
                    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
                        if (response.assets && response.assets[0].uri) {
                            setPhotoUri(response.assets[0].uri);
                        }
                    });
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleSave = async () => {
        if (!medicationName.trim()) {
            Alert.alert('Error', 'Please enter medication name');
            return;
        }

        setLoading(true);
        try {
            const prescriptionData = {
                medicationName: medicationName.trim(),
                doctorName: doctorName.trim() || undefined,
                issueDate,
                expiryDate: expiryDate || undefined,
                photoUri: photoUri || undefined,
                notes: notes.trim() || undefined,
            };

            if (isEdit) {
                await prescriptionsDb.update(prescriptionId, prescriptionData);
            } else {
                await prescriptionsDb.add(prescriptionData);
            }

            navigation.goBack();
        } catch (error) {
            console.error('Error saving prescription:', error);
            Alert.alert('Error', 'Failed to save prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Text style={styles.photoPlaceholderText}>📷 Add Photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <Text style={styles.label}>Medication Name *</Text>
            <TextInput
                style={styles.input}
                value={medicationName}
                onChangeText={setMedicationName}
                placeholder="e.g., Lisinopril"
            />

            <Text style={styles.label}>Doctor Name</Text>
            <TextInput
                style={styles.input}
                value={doctorName}
                onChangeText={setDoctorName}
                placeholder="e.g., Smith"
            />

            <Text style={styles.label}>Issue Date *</Text>
            <TextInput
                style={styles.input}
                value={issueDate}
                onChangeText={setIssueDate}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Expiry Date (Optional)</Text>
            <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
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

            <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
            >
                <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Save'} Prescription</Text>
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
    photoButton: {
        alignItems: 'center',
        marginBottom: 24,
    },
    photo: {
        width: 200,
        height: 200,
        borderRadius: 12,
    },
    photoPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 12,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#007AFF',
        borderStyle: 'dashed',
    },
    photoPlaceholderText: {
        fontSize: 16,
        color: '#007AFF',
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
