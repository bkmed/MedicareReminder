import React, { useState, useEffect, useMemo } from 'react';
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
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const AddPrescriptionScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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

            let id = prescriptionId;

            if (isEdit) {
                await prescriptionsDb.update(prescriptionId, prescriptionData);
            } else {
                id = await prescriptionsDb.add(prescriptionData);
            }

            // Schedule reminder if expiry date is set
            if (expiryDate) {
                await notificationService.schedulePrescriptionExpiryReminder(
                    id,
                    prescriptionData.medicationName,
                    expiryDate
                );
            } else if (isEdit) {
                // If expiry date removed, cancel reminder
                await notificationService.cancelPrescriptionReminder(id);
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

            <Text style={styles.label}>Issue Date *</Text>
            <TextInput
                style={styles.input}
                value={issueDate}
                onChangeText={setIssueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Expiry Date (Optional)</Text>
            <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD"
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

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.m,
    },
    photoButton: {
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    photo: {
        width: 200,
        height: 200,
        borderRadius: theme.spacing.m,
    },
    photoPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
    },
    photoPlaceholderText: {
        ...theme.textVariants.body,
        color: theme.colors.primary,
    },
    label: {
        ...theme.textVariants.body,
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
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.text,
    },
    notesInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.s,
        alignItems: 'center',
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xl,
        ...theme.shadows.small,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        ...theme.textVariants.button,
        color: theme.colors.surface,
    },
});
