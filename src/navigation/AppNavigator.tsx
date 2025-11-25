import React, { useState, useMemo, createContext } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { MedicationListScreen } from '../screens/medications/MedicationListScreen';
import { AddMedicationScreen } from '../screens/medications/AddMedicationScreen';
import { MedicationDetailsScreen } from '../screens/medications/MedicationDetailsScreen';
import { AppointmentListScreen } from '../screens/appointments/AppointmentListScreen';
import { AddAppointmentScreen } from '../screens/appointments/AddAppointmentScreen';
import { AppointmentDetailsScreen } from '../screens/appointments/AppointmentDetailsScreen';
import { PrescriptionListScreen } from '../screens/prescriptions/PrescriptionListScreen';
import { AddPrescriptionScreen } from '../screens/prescriptions/AddPrescriptionScreen';
import { PrescriptionDetailsScreen } from '../screens/prescriptions/PrescriptionDetailsScreen';
import { DoctorListScreen } from '../screens/doctors/DoctorListScreen';
import { AddDoctorScreen } from '../screens/doctors/AddDoctorScreen';
import { DoctorDetailsScreen } from '../screens/doctors/DoctorDetailsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

enableScreens();

// ======= Web Navigation Context (avec subScreen) =======
export const WebNavigationContext = createContext({
  activeTab: 'Home',
  subScreen: '',
  setActiveTab: (tab: string, subScreen?: string) => {},
});

// ======= Stacks =======
const Stack = createNativeStackNavigator();

const MedicationsStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MedicationList"
        component={MedicationListScreen}
        options={{ title: t('navigation.medications') }}
      />
      <Stack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={{ title: t('medications.add') }}
      />
      <Stack.Screen
        name="MedicationDetails"
        component={MedicationDetailsScreen}
        options={{ title: t('medications.details') }}
      />
    </Stack.Navigator>
  );
};

const AppointmentsStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AppointmentList"
        component={AppointmentListScreen}
        options={{ title: t('navigation.appointments') }}
      />
      <Stack.Screen
        name="AddAppointment"
        component={AddAppointmentScreen}
        options={{ title: t('appointments.add') }}
      />
      <Stack.Screen
        name="AppointmentDetails"
        component={AppointmentDetailsScreen}
        options={{ title: t('appointments.details') }}
      />
    </Stack.Navigator>
  );
};

const PrescriptionsStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PrescriptionList"
        component={PrescriptionListScreen}
        options={{ title: t('navigation.prescriptions') }}
      />
      <Stack.Screen
        name="AddPrescription"
        component={AddPrescriptionScreen}
        options={{ title: t('prescriptions.add') }}
      />
      <Stack.Screen
        name="PrescriptionDetails"
        component={PrescriptionDetailsScreen}
        options={{ title: t('prescriptions.details') }}
      />
    </Stack.Navigator>
  );
};

const DoctorsStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DoctorList"
        component={DoctorListScreen}
        options={{ title: t('navigation.doctors') }}
      />
      <Stack.Screen
        name="AddDoctor"
        component={AddDoctorScreen}
        options={{ title: t('doctors.add') }}
      />
      <Stack.Screen
        name="DoctorDetails"
        component={DoctorDetailsScreen}
        options={{ title: t('doctors.details') }}
      />
    </Stack.Navigator>
  );
};

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);

// ======= Tabs (Mobile) =======
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeStack} />
    <Tab.Screen name="MedicationsTab" component={MedicationsStack} />
    <Tab.Screen name="AppointmentsTab" component={AppointmentsStack} />
  </Tab.Navigator>
);

// ======= Drawer (Mobile) =======
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => (
  <Drawer.Navigator screenOptions={{ headerShown: false }}>
    <Drawer.Screen name="Main" component={TabNavigator} />
    <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
    <Drawer.Screen name="Prescriptions" component={PrescriptionsStack} />
    <Drawer.Screen name="Doctors" component={DoctorsStack} />
    <Drawer.Screen name="Profile" component={ProfileStack} />
  </Drawer.Navigator>
);

// ======= Web Navigator avec subScreen =======
const WebNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Home');
  const [subScreen, setSubScreen] = useState('');

  const contextValue = useMemo(
    () => ({
      activeTab,
      subScreen,
      setActiveTab: (tab: string, screen?: string) => {
        setActiveTab(tab);
        setSubScreen(screen || '');
      },
    }),
    [activeTab, subScreen],
  );

  const getActiveComponent = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeStack />;
      case 'Medications':
        if (subScreen === 'AddMedication') return <AddMedicationScreen />;
        if (subScreen === 'MedicationDetails')
          return <MedicationDetailsScreen />;
        return <MedicationsStack />;
      case 'Appointments':
        if (subScreen === 'AddAppointment') return <AddAppointmentScreen />;
        if (subScreen === 'AppointmentDetails')
          return <AppointmentDetailsScreen />;
        return <AppointmentsStack />;
      case 'Analytics':
        return <AnalyticsScreen />;
      case 'Prescriptions':
        return <PrescriptionsStack />;
      case 'Doctors':
        return <DoctorsStack />;
      case 'Profile':
        return <ProfileStack />;
      default:
        return <HomeStack />;
    }
  };

  return (
    <WebNavigationContext.Provider value={contextValue}>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Navbar */}
        <View
          style={[
            webStyles.navbar,
            {
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
              borderBottomWidth: 1,
            },
          ]}
        >
          <Text style={[webStyles.title, { color: theme.colors.text }]}>
            {t('home.appName')}
          </Text>
          <View style={webStyles.navButtons}>
            {[
              ['Home', t('navigation.home')],
              ['Medications', t('navigation.medications')],
              ['Appointments', t('navigation.appointments')],
              ['Analytics', t('navigation.analytics')],
              ['Prescriptions', t('navigation.prescriptions')],
              ['Doctors', t('navigation.doctors')],
              ['Profile', t('navigation.profile')],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key as string}
                onPress={() => setActiveTab(key as string)}
                style={webStyles.navButton}
              >
                <Text
                  style={[
                    webStyles.navButtonText,
                    {
                      color:
                        activeTab === key
                          ? theme.colors.primary
                          : theme.colors.subText,
                    },
                    activeTab === key && webStyles.activeNavButton,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>{getActiveComponent()}</View>
      </View>
    </WebNavigationContext.Provider>
  );
};

// ======= Root Export =======
export const AppNavigator = () => {
  const linking: LinkingOptions<any> = {
    prefixes: ['http://localhost:8080', 'medicarereminder://'],
    config: { screens: {} },
  };

  return (
    <NavigationContainer linking={linking}>
      {Platform.OS === 'web' ? <WebNavigator /> : <DrawerNavigator />}
    </NavigationContainer>
  );
};

// ======= Web Styles =======
const webStyles = StyleSheet.create({
  navbar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginRight: 40 },
  navButtons: { flexDirection: 'row', gap: 20 },
  navButton: { paddingVertical: 8, paddingHorizontal: 16 },
  navButtonText: { fontSize: 16 },
  activeNavButton: { fontWeight: '600' },
});
