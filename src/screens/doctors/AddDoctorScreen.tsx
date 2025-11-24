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
import { useTranslation } from 'react-i18next';
import { doctorsDb } from '../../database/doctorsDb';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const AddDoctorScreen = ({ navigation, route }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
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
            Alert.alert(t('common.error'), t('doctors.loadError'));
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('doctors.fillRequired'));
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
            Alert.alert(t('common.error'), t('doctors.saveError'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t('doctors.deleteConfirmTitle'),
            t('doctors.deleteConfirmMessage'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await doctorsDb.delete(doctorId);
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('doctors.deleteError'));
                        }
                    },
                },
            ]
        );
    };

    return (
        <View testID='testadddoctor' style={{ flex: 1 }}>
            <ScrollView testID='adddoctor' style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.label}>{t('doctors.name')} *</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('doctors.namePlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                />

                <Text style={styles.label}>{t('doctors.specialty')}</Text>
                <TextInput
                    style={styles.input}
                    value={specialty}
                    onChangeText={setSpecialty}
                    placeholder={t('doctors.specialtyPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                />

                <Text style={styles.label}>{t('doctors.phone')}</Text>
                <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder={t('doctors.phonePlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                    keyboardType="phone-pad"
                />

                <Text style={styles.label}>{t('doctors.email')}</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('doctors.emailPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>{t('doctors.address')}</Text>
                <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder={t('doctors.addressPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                />

                <Text style={styles.label}>{t('appointments.notes')}</Text>
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder={t('doctors.notesPlaceholder')}
                    placeholderTextColor={theme.colors.subText}
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text style={styles.saveButtonText}>{isEdit ? t('doctors.updateButton') : t('doctors.saveButton')}</Text>
                </TouchableOpacity>

                {isEdit && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>{t('doctors.deleteButton')}</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
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
