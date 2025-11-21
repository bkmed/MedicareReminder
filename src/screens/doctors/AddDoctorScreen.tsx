import React, { useState, useEffect, useMemo } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const AddDoctorScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
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
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Specialty</Text>
            <TextInput
                style={styles.input}
                value={specialty}
                onChangeText={setSpecialty}
                placeholder="e.g., Cardiology"
                placeholderTextColor={theme.colors.subText}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g., (555) 123-4567"
                placeholderTextColor={theme.colors.subText}
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="e.g., doctor@clinic.com"
                placeholderTextColor={theme.colors.subText}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="e.g., 123 Main St, City"
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

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.m,
    },
    label: {
        ...theme.textVariants.caption,
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
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
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
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        ...theme.textVariants.button,
        color: theme.colors.surface,
    },
    deleteButton: {
        backgroundColor: theme.colors.error,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.s,
        alignItems: 'center',
        marginTop: theme.spacing.m,
        marginBottom: theme.spacing.xl,
    },
    deleteButtonText: {
        ...theme.textVariants.button,
        color: theme.colors.surface,
    },
});
