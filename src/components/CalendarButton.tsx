import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

// Lazy load web component to avoid issues on native
let AddToCalendarButton: any;
if (Platform.OS === 'web') {
  try {
    AddToCalendarButton = require('add-to-calendar-button-react').AddToCalendarButton;
  } catch (error) {
    console.warn('add-to-calendar-button-react not available:', error);
  }
}

// Native services
let calendarService: any;
let permissionsService: any;
if (Platform.OS !== 'web') {
  calendarService = require('../services/calendarService').calendarService;
  permissionsService = require('../services/permissions').permissionsService;
}

interface CalendarButtonProps {
  title: string;
  date: string;
  time: string;
  location?: string;
  notes?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

export const CalendarButton: React.FC<CalendarButtonProps> = ({
  title,
  date,
  time,
  location,
  notes,
  onSuccess,
  onError,
}) => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (Platform.OS === 'web' && AddToCalendarButton) {
    // Calculate end time (default 1 hour)
    const [hours, minutes] = time.split(':').map(Number);
    const endDateObj = new Date();
    endDateObj.setHours(hours + 1);
    endDateObj.setMinutes(minutes);
    const endTime = `${endDateObj
      .getHours()
      .toString()
      .padStart(2, '0')}:${endDateObj.getMinutes().toString().padStart(2, '0')}`;

    return (
      <View style={styles.webContainer}>
        <AddToCalendarButton
          name={title}
          options={['Apple', 'Google', 'Outlook.com', 'Yahoo', 'iCal']}
          location={location}
          startDate={date}
          endDate={date}
          startTime={time}
          endTime={endTime}
          timeZone="currentBrowser"
          description={notes}
          language={i18n.language.split('-')[0] as any}
          buttonStyle="custom"
          customCss={`
                      --btn-background: ${theme.colors.secondary};
                      --btn-text: #FFFFFF;
                      --font: 'System', sans-serif;
                      --btn-shadow: none;
                      --btn-border: none;
                      --btn-radius: 8px;
                      --btn-padding: 12px 20px;
                      --btn-font-weight: 600;
                      --btn-font-size: 16px;
                  `}
          label={t('appointments.addToCalendar')}
        />
      </View>
    );
  }

  const handlePress = async () => {
    try {
      const permission = await permissionsService.checkCalendarPermission();

      if (permission !== 'granted') {
        Alert.alert(
          t('common.error'),
          t('appointments.calendarPermissionRequired'),
          [{ text: t('common.ok') }],
        );
        return;
      }

      const success = await calendarService.addToCalendar({
        title,
        date,
        time,
        location,
        notes,
        enableReminder: true,
      });

      if (success) {
        Alert.alert(t('common.success'), t('appointments.addedToCalendar'));
        onSuccess?.();
      } else {
        Alert.alert(t('common.error'), t('appointments.calendarError'));
        onError?.();
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert(t('common.error'), t('appointments.calendarError'));
      onError?.();
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{t('appointments.addToCalendar')}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      backgroundColor: theme.colors.secondary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    text: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    webContainer: {
      marginTop: 10,
      alignItems: 'center',
      width: '100%',
    },
  });
