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
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { prescriptionsDb } from '../../database/prescriptionsDb';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const AddPrescriptionScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const prescriptionId = route.params?.prescriptionId;
  const isEdit = !!prescriptionId;

  const [medicationName, setMedicationName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [expiryDate, setExpiryDate] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
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
      Alert.alert(t('common.error'), t('prescriptions.loadError'));
    }
  };

  useEffect(() => {
    if (route.params?.doctorName) {
      setDoctorName(route.params.doctorName);
    }
  }, [route.params?.doctorName]);

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            setPhotoUri(event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    Alert.alert(t('prescriptions.addPhoto'), t('prescriptions.chooseOption'), [
      {
        text: t('prescriptions.takePhoto'),
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets && response.assets[0].uri) {
              setPhotoUri(response.assets[0].uri);
            }
          });
        },
      },
      {
        text: t('prescriptions.chooseFromLibrary'),
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets && response.assets[0].uri) {
              setPhotoUri(response.assets[0].uri);
            }
          });
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    const newErrors: { [key: string]: string } = {};
    if (!medicationName.trim()) {
      newErrors.medicationName = t('common.required');
    }
    if (!issueDate.trim()) {
      newErrors.issueDate = t('common.required');
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
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
          expiryDate,
        );
      } else if (isEdit) {
        // If expiry date removed, cancel reminder
        await notificationService.cancelPrescriptionReminder(id);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving prescription:', error);
      Alert.alert(t('common.error'), t('prescriptions.saveError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>
                {t('prescriptions.photoButton')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>
          {t('prescriptions.medicationNameLabel')} *
        </Text>
        <TextInput
          style={[styles.input, errors.medicationName && styles.inputError]}
          value={medicationName}
          onChangeText={text => {
            setMedicationName(text);
            if (errors.medicationName) {
              setErrors({ ...errors, medicationName: '' });
            }
          }}
          placeholder={t('prescriptions.medicationPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />
        {errors.medicationName && (
          <Text style={styles.errorText}>{errors.medicationName}</Text>
        )}

        <Text style={styles.label}>{t('prescriptions.doctorNameLabel')}</Text>
        <TextInput
          style={styles.input}
          value={doctorName}
          onChangeText={setDoctorName}
          placeholder={t('prescriptions.doctorPlaceholder')}
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={styles.label}>{t('prescriptions.issueDateLabel')} *</Text>
        <TextInput
          style={[styles.input, errors.issueDate && styles.inputError]}
          value={issueDate}
          onChangeText={text => {
            setIssueDate(text);
            if (errors.issueDate) {
              setErrors({ ...errors, issueDate: '' });
            }
          }}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.subText}
        />
        {errors.issueDate && (
          <Text style={styles.errorText}>{errors.issueDate}</Text>
        )}

        <Text style={styles.label}>{t('prescriptions.expiryDateLabel')}</Text>
        <TextInput
          style={styles.input}
          value={expiryDate}
          onChangeText={setExpiryDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.colors.subText}
        />

        <Text style={styles.label}>{t('prescriptions.notesLabel')}</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('appointments.notesPlaceholder')}
          placeholderTextColor={theme.colors.subText}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {isEdit
              ? t('prescriptions.updateButton')
              : t('prescriptions.saveButton')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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
    inputError: {
      borderColor: theme.colors.error,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });
