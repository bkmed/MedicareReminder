import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { appointmentsDb } from '../../database/appointmentsDb';
import { notificationService } from '../../services/notificationService';
import { calendarService } from '../../services/calendarService';
import { permissionsService } from '../../services/permissions';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';

export const AddAppointmentScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const appointmentId = route.params?.appointmentId;
  const isEdit = !!appointmentId;

  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadAppointment();
    }
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      const appt = await appointmentsDb.getById(appointmentId);
      if (appt) {
        setTitle(appt.title);
        setDoctorName(appt.doctorName || '');
        setLocation(appt.location || '');

        const dateTime = new Date(appt.dateTime);
        setDate(dateTime.toISOString().split('T')[0]);
        setTime(dateTime.toTimeString().substring(0, 5));

        setNotes(appt.notes || '');
        setReminderEnabled(appt.reminderEnabled);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('appointments.loadError'));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('appointments.fillRequired'));
      return;
    }

    setLoading(true);
    try {
      const dateTime = `${date}T${time}:00.000Z`;

      const appointmentData = {
        title: title.trim(),
        doctorName: doctorName.trim() || undefined,
        location: location.trim() || undefined,
        dateTime,
        notes: notes.trim() || undefined,
        reminderEnabled,
      };

      let id: number;
      if (isEdit) {
        await appointmentsDb.update(appointmentId, appointmentData);
        id = appointmentId;
        // Cancel old reminder
        await notificationService.cancelAppointmentReminder(appointmentId);
      } else {
        id = await appointmentsDb.add(appointmentData);
      }

      // Schedule new reminder
      if (reminderEnabled) {
        await notificationService.scheduleAppointmentReminder(
          id,
          title,
          dateTime,
        );
      }

      // Offer to add to calendar after successful save
      Alert.alert(
        t('common.success'),
        t('appointments.addToCalendar'),
        [
          {
            text: t('common.no'),
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          {
            text: t('common.yes'),
            onPress: async () => {
              await handleAddToCalendar();
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving appointment:', error);
      Alert.alert(t('common.error'), t('appointments.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCalendar = async () => {
    try {
      // Check permission first
      const permission = await permissionsService.checkCalendarPermission();

      if (permission !== 'granted') {
        Alert.alert(
          t('common.error'),
          t('appointments.calendarPermissionRequired'),
          [
            { text: t('common.ok') }
          ]
        );
        return;
      }

      const success = await calendarService.addToCalendar({
        id: appointmentId?.toString(),
        title,
        date,
        time,
        location,
        reason: doctorName,
        notes,
        enableReminder: reminderEnabled,
      });

      if (success) {
        Alert.alert(t('common.success'), t('appointments.addedToCalendar'));
      } else {
        Alert.alert(t('common.error'), t('appointments.calendarError'));
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert(t('common.error'), t('appointments.calendarError'));
    }
  };

  return (
    <ScrollView
      testID="addappointment"
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.label}>{t('appointments.appointmentTitle')} *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t('appointments.titlePlaceholder')}
        placeholderTextColor={theme.colors.subText}
      />

      <Text style={styles.label}>{t('appointments.doctor')}</Text>
      <TextInput
        style={styles.input}
        value={doctorName}
        onChangeText={setDoctorName}
        placeholder={t('appointments.doctorPlaceholder')}
        placeholderTextColor={theme.colors.subText}
      />

      <Text style={styles.label}>{t('appointments.location')}</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder={t('appointments.locationPlaceholder')}
        placeholderTextColor={theme.colors.subText}
      />

      <Text style={styles.label}>{t('appointments.date')} *</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.colors.subText}
      />

      <Text style={styles.label}>{t('appointments.time')} *</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="HH:MM"
        placeholderTextColor={theme.colors.subText}
      />

      <Text style={styles.label}>{t('appointments.notes')}</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder={t('appointments.notesPlaceholder')}
        placeholderTextColor={theme.colors.subText}
        multiline
        numberOfLines={4}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>{t('appointments.enableReminder')}</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{
            false: theme.colors.border,
            true: theme.colors.primary,
          }}
          thumbColor={theme.colors.surface}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {isEdit ? t('appointments.update') : t('appointments.save')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.m,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.xl,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
  });
