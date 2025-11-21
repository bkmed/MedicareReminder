import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { doctorsDb } from '../../database/doctorsDb';

export const AddDoctorScreen = ({ navigation, route }: any) => {
    const doctorId = route.params?.doctorId;
    const isEdit = !!doctorId;

    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            loadDoctor();
        }
    }, [doctorId]);

    const loadDoctor = async () => {
        try {
            const doctor = await doctorsDb.getById(doctorId);
            if (doctor) {
                setName(doctor.name);
                setSpecialty(doctor.specialty || '');
                setPhone(doctor.phone || '');
                setEmail(doctor.email || '');
                setAddress(doctor.address || '');
                setNotes(doctor.notes || '');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load doctor');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter doctor name');
            return;
        }

        setLoading(true);
        try {
            const doctorData = {
                name: name.trim(),
                specialty: specialty.trim() || undefined,
                phone: phone.trim() || undefined,
                email: email.trim() || undefined,
                address: address.trim() || undefined,
                notes: notes.trim() || undefined,
            };

            if (isEdit) {
                await doctorsDb.update(doctorId, doctorData);
            } else {
                await doctorsDb.add(doctorData);
            }

            navigation.goBack();
        } catch (error) {
            console.error('Error saving doctor:', error);
            Alert.alert('Error', 'Failed to save doctor');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Doctor',
            'Are you sure you want to delete this doctor?',
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
                            Alert.alert('Error', 'Failed to delete doctor');
                        }
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g., John Smith"
            />

            <Text style={styles.label}>Specialty</Text>
            <TextInput
                style={styles.input}
                value={specialty}
                onChangeText={setSpecialty}
                placeholder="e.g., Cardiology"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g., (555) 123-4567"
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="e.g., doctor@clinic.com"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="e.g., 123 Main St, City"
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
                <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Save'} Doctor</Text>
            </TouchableOpacity>

            {isEdit && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteButtonText}>Delete Doctor</Text>
                </TouchableOpacity>
            )}
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
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 32,
    },
    deleteButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
