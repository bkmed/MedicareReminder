import React, { useState, useMemo, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store/redux/store';
import { useTheme } from '../../context/ThemeContext';
import { Theme } from '../../theme';
import { SearchInput } from '../../components/SearchInput';

export const GlobalSearchScreen = ({ navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [searchQuery, setSearchQuery] = useState('');

    const medications = useSelector((state: RootState) => state.medications.medications);
    const appointments = useSelector((state: RootState) => state.appointments.appointments);
    const doctors = useSelector((state: RootState) => state.doctors.doctors);
    const prescriptions = useSelector((state: RootState) => state.prescriptions.prescriptions);

    const WebNavigationContext = Platform.OS === 'web'
        ? require('../../navigation/AppNavigator').WebNavigationContext
        : null;

    const { setActiveTab } = WebNavigationContext
        ? (useContext(WebNavigationContext) as any)
        : { setActiveTab: null };

    const results = useMemo(() => {
        if (!searchQuery.trim()) return { medications: [], appointments: [], doctors: [], prescriptions: [] };

        const query = searchQuery.toLowerCase();

        return {
            medications: medications.filter(m =>
                m.name.toLowerCase().includes(query) ||
                m.dosage.toLowerCase().includes(query)
            ),
            appointments: appointments.filter(a =>
                a.title.toLowerCase().includes(query) ||
                (a.doctorName && a.doctorName.toLowerCase().includes(query))
            ),
            doctors: doctors.filter(d =>
                d.name.toLowerCase().includes(query) ||
                (d.specialty && t(`specialties.${d.specialty}`).toLowerCase().includes(query))
            ),
            prescriptions: prescriptions.filter(p =>
                p.medicationName.toLowerCase().includes(query) ||
                (p.doctorName && p.doctorName.toLowerCase().includes(query))
            )
        };
    }, [searchQuery, medications, appointments, doctors, prescriptions, t]);

    const totalResults = results.medications.length + results.appointments.length + results.doctors.length + results.prescriptions.length;

    const navigateToDetail = (type: string, item: any) => {
        if (Platform.OS === 'web' && setActiveTab) {
            const tabMap: any = {
                medication: 'Medications',
                appointment: 'Appointments',
                doctor: 'Doctors',
                prescription: 'Prescriptions'
            };
            const screenMap: any = {
                medication: 'MedicationDetails',
                appointment: 'AppointmentDetails',
                doctor: 'DoctorDetails',
                prescription: 'PrescriptionDetails'
            };
            const idMap: any = {
                medication: 'medicationId',
                appointment: 'appointmentId',
                doctor: 'doctorId',
                prescription: 'prescriptionId'
            };
            setActiveTab(tabMap[type], screenMap[type], { [idMap[type]]: Number(item.id) });
        } else {
            const screenMap: any = {
                medication: 'MedicationDetails',
                appointment: 'AppointmentDetails',
                doctor: 'DoctorDetails',
                prescription: 'PrescriptionDetails'
            };
            const idMap: any = {
                medication: 'medicationId',
                appointment: 'appointmentId',
                doctor: 'doctorId',
                prescription: 'prescriptionId'
            };
            navigation.navigate(screenMap[type], { [idMap[type]]: item.id });
        }
    };

    const renderSection = (title: string, items: any[], type: string) => {
        if (items.length === 0) return null;
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {items.map(item => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.resultItem}
                        onPress={() => navigateToDetail(type, item)}
                    >
                        <Text style={styles.resultName}>{item.name || item.title || item.medicationName}</Text>
                        <Text style={styles.resultType}>{t(`search.${type}`)}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <SearchInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder={t('search.placeholder')}
                />
            </View>

            <ScrollView style={styles.resultsContainer}>
                {searchQuery.trim() === '' ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('search.startTyping')}</Text>
                    </View>
                ) : totalResults === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>{t('search.noResults')}</Text>
                    </View>
                ) : (
                    <>
                        {renderSection(t('medications.title'), results.medications, 'medication')}
                        {renderSection(t('appointments.title'), results.appointments, 'appointment')}
                        {renderSection(t('doctors.title'), results.doctors, 'doctor')}
                        {renderSection(t('prescriptions.title'), results.prescriptions, 'prescription')}
                    </>
                )}
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
        searchContainer: {
            padding: theme.spacing.m,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        resultsContainer: {
            flex: 1,
        },
        section: {
            marginBottom: theme.spacing.l,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.primary,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            textTransform: 'uppercase',
        },
        resultItem: {
            backgroundColor: theme.colors.surface,
            padding: theme.spacing.m,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        resultName: {
            fontSize: 16,
            color: theme.colors.text,
            flex: 1,
        },
        resultType: {
            fontSize: 12,
            color: theme.colors.subText,
            marginLeft: theme.spacing.s,
        },
        emptyContainer: {
            flex: 1,
            padding: theme.spacing.xl,
            alignItems: 'center',
            justifyContent: 'center',
        },
        emptyText: {
            fontSize: 16,
            color: theme.colors.subText,
            textAlign: 'center',
        },
    });
