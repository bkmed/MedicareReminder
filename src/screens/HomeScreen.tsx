import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { medicationsDb } from '../database/medicationsDb';
import { appointmentsDb } from '../database/appointmentsDb';
import { prescriptionsDb } from '../database/prescriptionsDb';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [summary, setSummary] = useState({
    medications: 0,
    upcomingAppointments: 0,
    expiringPrescriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const [meds, appts, prescriptions] = await Promise.all([
        medicationsDb.getAll(),
        appointmentsDb.getUpcoming(),
        prescriptionsDb.getExpiringSoon(),
      ]);

      setSummary({
        medications: meds.length,
        upcomingAppointments: appts.length,
        expiringPrescriptions: prescriptions.length,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const { setActiveTab } =
    Platform.OS === 'web'
      ? useContext(require('../navigation/AppNavigator').WebNavigationContext)
      : { setActiveTab: () => {} };

  const navigateToMedications = () => {
    if (Platform.OS === 'web') {
      setActiveTab('medications');
    } else {
      navigation.navigate('Main', { screen: 'MedicationsTab' });
    }
  };

  const navigateToAppointments = () => {
    if (Platform.OS === 'web') {
      setActiveTab('appointments');
    } else {
      navigation.navigate('Main', { screen: 'AppointmentsTab' });
    }
  };

  const navigateToAddMedication = () => {
    if (Platform.OS === 'web') {
      setActiveTab('medications', 'AddMedication');
    } else {
      navigation.navigate('Main', {
        screen: 'MedicationsTab',
        params: { screen: 'AddMedication' },
      });
    }
  };

  const navigateToAddAppointment = () => {
    if (Platform.OS === 'web') {
      setActiveTab('appointments', 'AddAppointment');
    } else {
      navigation.navigate('Main', {
        screen: 'AppointmentsTab',
        params: { screen: 'AddAppointment' },
      });
    }
  };

  const navigateToAnalytics = () => {
    if (Platform.OS === 'web') {
      setActiveTab('analytics');
    } else {
      navigation.navigate('Analytics');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('home.greeting')}</Text>
        <Text style={styles.appName}>{t('home.appName')}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[styles.statCard, styles.statCardBlue]}
          onPress={navigateToMedications}
        >
          <Text style={styles.statNumber}>{summary.medications}</Text>
          <Text style={styles.statLabel}>{t('home.activeMedications')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, styles.statCardGreen]}
          onPress={navigateToAppointments}
        >
          <Text style={styles.statNumber}>{summary.upcomingAppointments}</Text>
          <Text style={styles.statLabel}>{t('home.upcomingAppointments')}</Text>
        </TouchableOpacity>
      </View>

      {/* Alerts */}
      {summary.expiringPrescriptions > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{t('home.prescriptionAlert')}</Text>
            <Text style={styles.alertMessage}>
              {t('home.prescriptionsExpiring', {
                count: summary.expiringPrescriptions,
              })}
            </Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={navigateToAddMedication}
      >
        <Text style={styles.actionIcon}>💊</Text>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{t('home.addMedication')}</Text>
          <Text style={styles.actionSubtitle}>
            {t('home.addMedicationSubtitle')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={navigateToAddAppointment}
      >
        <Text style={styles.actionIcon}>📅</Text>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>
            {t('home.scheduleAppointment')}
          </Text>
          <Text style={styles.actionSubtitle}>
            {t('home.scheduleAppointmentSubtitle')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={navigateToAnalytics}
      >
        <Text style={styles.actionIcon}>📊</Text>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{t('home.viewAnalytics')}</Text>
          <Text style={styles.actionSubtitle}>
            {t('home.viewAnalyticsSubtitle')}
          </Text>
        </View>
        <Text style={styles.actionArrow}>›</Text>
      </TouchableOpacity>

      {/* Tips Section */}
      <View style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{t('home.tip')}</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.m,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      marginBottom: 30,
      alignItems: 'center',
    },
    greeting: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    appName: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    statCardBlue: {
      backgroundColor: theme.colors.primary,
    },
    statCardGreen: {
      backgroundColor: theme.colors.success,
    },
    statNumber: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: '#FFF',
      textAlign: 'center',
      opacity: 0.9,
    },
    alertCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.warningBackground,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.warning,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      alignItems: 'center',
    },
    alertIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    alertContent: {
      flex: 1,
    },
    alertTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 2,
    },
    alertMessage: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
      marginTop: 10,
    },
    actionButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginBottom: theme.spacing.m,
      alignItems: 'center',
      ...theme.shadows.small,
    },
    actionIcon: {
      fontSize: 28,
      marginRight: theme.spacing.m,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: 2,
    },
    actionSubtitle: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    actionArrow: {
      fontSize: 24,
      color: theme.colors.primary,
    },
    tipCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primaryBackground,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.m,
      marginTop: theme.spacing.m,
      alignItems: 'center',
    },
    tipIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    tipText: {
      flex: 1,
      ...theme.textVariants.body,
      color: theme.colors.primary,
      lineHeight: 20,
    },
  });
