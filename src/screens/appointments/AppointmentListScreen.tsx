import React, { useState, useCallback, useMemo, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useNotification } from '../../context/NotificationContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/redux/store';
import { setAppointments } from '../../store/redux/slices/appointmentSlice';
import { appointmentsDb } from '../../database/appointmentsDb';
import { Appointment } from '../../database/schema';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

export const AppointmentListScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const appointments = useSelector((state: RootState) => state.appointments.appointments);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const WebNavigationContext =
    Platform.OS === 'web'
      ? require('../../navigation/AppNavigator').WebNavigationContext
      : null;

  const { setActiveTab } = WebNavigationContext
    ? (useContext(WebNavigationContext) as any)
    : { setActiveTab: null };

  const loadAppointments = async () => {
    try {
      if (appointments.length === 0) {
        const data = await appointmentsDb.getAll();
        if (data.length > 0) {
          dispatch(setAppointments(data));
        }
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      showNotification({
        title: t('common.error'),
        message: t('appointments.loadError'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [appointments.length]),
  );

  const filteredAppointments = useMemo(() => {
    const apptsToFilter = appointments;
    if (!searchQuery) return apptsToFilter;
    const lowerQuery = searchQuery.toLowerCase();
    return apptsToFilter.filter(
      appt =>
        appt.title.toLowerCase().includes(lowerQuery) ||
        (appt.doctorName && appt.doctorName.toLowerCase().includes(lowerQuery)),
    );
  }, [appointments, searchQuery]);

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    return { dateStr, timeStr };
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const { dateStr, timeStr } = formatDateTime(item.dateTime);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (Platform.OS === 'web' && setActiveTab) {
            setActiveTab('Appointments', 'AppointmentDetails', {
              appointmentId: Number(item.id),
            });
          } else {
            navigation.navigate('AppointmentDetails', {
              appointmentId: item.id,
            });
          }
        }}
      >
        <View style={styles.dateColumn}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>

        <View style={styles.detailsColumn}>
          <Text style={styles.title}>{item.title}</Text>
          {item.doctorName && (
            <Text style={styles.doctor}>Dr. {item.doctorName}</Text>
          )}
          {item.location && (
            <Text style={styles.location}>📍 {item.location}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('appointments.noAppointments')}</Text>
      <Text style={styles.emptySubText}>{t('appointments.addFirst')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
        />
      </View>
      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (Platform.OS === 'web' && setActiveTab) {
            setActiveTab('Appointments', 'AddAppointment');
          } else {
            navigation.navigate('AddAppointment');
          }
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    listContent: {
      padding: theme.spacing.m,
      flexGrow: 1,
      paddingBottom: 80,
      width: '100%',
      maxWidth: 800,
      alignSelf: 'center',
    },
    searchContainer: {
      padding: theme.spacing.m,
      paddingBottom: 0,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      flexDirection: 'row',
      ...theme.shadows.small,
    },
    dateColumn: {
      width: 80,
      marginRight: theme.spacing.m,
      alignItems: 'center',
      justifyContent: 'center',
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
    },
    dateText: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timeText: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontWeight: 'bold',
      marginTop: 4,
    },
    detailsColumn: {
      flex: 1,
    },
    title: {
      ...theme.textVariants.subheader,
      marginBottom: 4,
      color: theme.colors.text,
    },
    doctor: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      marginBottom: 4,
    },
    location: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      ...theme.textVariants.subheader,
      color: theme.colors.subText,
      marginBottom: theme.spacing.s,
    },
    emptySubText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    fab: {
      position: 'absolute' as any,
      right: theme.spacing.l,
      bottom: theme.spacing.l,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
      zIndex: 999,
      elevation: 10,
    } as any,
    fabText: {
      fontSize: 32,
      color: theme.colors.surface,
      fontWeight: '300',
      marginTop: -2,
    },
  });
