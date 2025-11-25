import React, { useState, useEffect, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { LoadingScreen } from '../../components/LoadingScreen';

export const PrescriptionDetailsScreen = ({ navigation, route }: any) => {
  const { prescriptionId } = route.params;
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      ],
    );
  };

  const handleEdit = () => {
    navigation.navigate('AddPrescription', { prescriptionId });
  };

  if (loading || !prescription) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {prescription.photoUri && (
          <Image source={{ uri: prescription.photoUri }} style={styles.photo} />
        )}

        <View style={styles.section}>
          <Text style={styles.medicationName}>
            {prescription.medicationName}
          </Text>
        </View>

        {prescription.doctorName && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('prescriptions.doctorNameLabel')}
            </Text>
            <Text style={styles.value}>
              {t('prescriptions.doctor')} {prescription.doctorName}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>{t('prescriptions.issueDateLabel')}</Text>
          <Text style={styles.value}>
            {new Date(prescription.issueDate).toLocaleDateString()}
          </Text>
        </View>

        {prescription.expiryDate && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('prescriptions.expiryDateLabel')}
            </Text>
            <Text style={styles.value}>
              {new Date(prescription.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {prescription.notes && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('prescriptions.notesLabel')}</Text>
            <Text style={styles.value}>{prescription.notes}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
        >
          <Text style={styles.buttonText}>{t('common.edit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
    },
    photo: {
      width: '100%',
      height: 300,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      backgroundColor: theme.colors.border,
    },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      ...theme.shadows.small,
    },
    medicationName: {
      ...theme.textVariants.header,
      color: theme.colors.text,
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
