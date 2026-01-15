import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
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
import { setMedications } from '../../store/redux/slices/medicationSlice';
import { medicationsDb } from '../../database/medicationsDb';
import { Medication } from '../../database/schema';
import { MedicationCard } from '../../components/MedicationCard';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

export const MedicationListScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useDispatch();
  const medications = useSelector((state: RootState) => state.medications.medications);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const WebNavigationContext = Platform.OS === 'web'
    ? require('../../navigation/AppNavigator').WebNavigationContext
    : null;

  const { setActiveTab } = WebNavigationContext
    ? (useContext(WebNavigationContext) as any)
    : { setActiveTab: null };

  const loadMedications = async () => {
    try {
      // Si le store est vide, on tente de charger depuis la DB locale (migration/initial load)
      if (medications.length === 0) {
        const data = await medicationsDb.getAll();
        if (data.length > 0) {
          dispatch(setMedications(data));
        }
      }
    } catch (error) {
      console.error('Error loading medications:', error);
      showNotification({
        title: t('common.error'),
        message: t('medications.loadError'),
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [medications.length]),
  );

  const filteredMedications = useMemo(() => {
    const medsToFilter = medications;
    if (!searchQuery) return medsToFilter;
    const lowerQuery = searchQuery.toLowerCase();
    return medsToFilter
      .filter(
        med =>
          med.name.toLowerCase().includes(lowerQuery) ||
          med.dosage.toLowerCase().includes(lowerQuery),
      )
      .sort((a, b) => {
        // Sort by urgency first
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        // Then by name
        return a.name.localeCompare(b.name);
      });
  }, [medications, searchQuery]);

  const handleMedicationPress = (medication: Medication) => {
    if (Platform.OS === 'web' && setActiveTab) {
      setActiveTab('Medications', 'MedicationDetails', { medicationId: Number(medication.id) });
    } else {
      navigation.navigate('MedicationDetails', { medicationId: medication.id });
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{t('medications.empty')}</Text>
      <Text style={styles.emptySubText}>{t('medications.emptySubtitle')}</Text>
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
        data={filteredMedications}
        renderItem={({ item }) => (
          <MedicationCard
            medication={item}
            onPress={() => handleMedicationPress(item)}
          />
        )}
        keyExtractor={item => item.id?.toString() || ''}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading ? renderEmpty : null}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          if (Platform.OS === 'web' && setActiveTab) {
            setActiveTab('Medications', 'AddMedication');
          } else {
            navigation.navigate('AddMedication');
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
    },
  });
