import React, { useState, createContext } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
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

// Web navigation context - allows setting active tab and initial screen
export const WebNavigationContext = createContext({
  setActiveTab: (tab: string, initialScreen?: string) => { },
  activeTab: 'main',
  initialScreen: undefined as string | undefined,
});

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// ----------- Stacks -----------
const MedicationsStack = () => {
  const { t } = useTranslation();
  const webNav =
    Platform.OS === 'web' ? React.useContext(WebNavigationContext) : null;
  const initialRouteName = webNav?.initialScreen || 'MedicationList';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
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
  const webNav =
    Platform.OS === 'web' ? React.useContext(WebNavigationContext) : null;
  const initialRouteName = webNav?.initialScreen || 'AppointmentList';

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
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

const ProfileStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('navigation.profile') }}
      />
    </Stack.Navigator>
  );
};

export const HomeStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('navigation.home') }}
      />
    </Stack.Navigator>
  );
};

// ----------- Tabs for Native -----------
const TabNavigator = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeTab" component={HomeScreen} />
    <Tab.Screen name="MedicationsTab" component={MedicationsStack} />
    <Tab.Screen name="AppointmentsTab" component={AppointmentsStack} />
  </Tab.Navigator>
);

// ----------- Web Navigation -----------
const WebNavigator = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('main');
  const [initialScreen, setInitialScreen] = useState<string | undefined>(
    undefined,
  );

  const handleSetActiveTab = (tab: string, screen?: string) => {
    setActiveTab(tab);
    setInitialScreen(screen);
    // Clear initialScreen after a short delay to allow navigation
    if (screen) {
      setTimeout(() => setInitialScreen(undefined), 100);
    }
  };

  return (
    <WebNavigationContext.Provider
      value={{ setActiveTab: handleSetActiveTab, activeTab, initialScreen }}
    >
      <View>
        <View style={webStyles.navbar}>
          <Text style={webStyles.title}>{t('home.appName')}</Text>
          <View style={webStyles.navButtons}>
            {[
              ['main', t('navigation.home')],
              ['medications', t('navigation.medications')],
              ['appointments', t('navigation.appointments')],
              ['analytics', t('navigation.analytics')],
              ['prescriptions', t('navigation.prescriptions')],
              ['doctors', t('navigation.doctors')],
              ['profile', t('navigation.profile')],
            ].map(([key, label]) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleSetActiveTab(key)}
                style={webStyles.navButton}
              >
                <Text
                  style={[
                    webStyles.navButtonText,
                    activeTab === key && webStyles.activeNavButton,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flex: 1, position: 'relative' }}>
          {activeTab === 'main' && <HomeScreen />}
          {activeTab === 'medications' && <MedicationsStack />}
          {activeTab === 'appointments' && <AppointmentsStack />}
          {activeTab === 'analytics' && <AnalyticsScreen />}
          {activeTab === 'prescriptions' && <PrescriptionsStack />}
          {activeTab === 'doctors' && <DoctorsStack />}
          {activeTab === 'profile' && <ProfileScreen />}
        </View>
      </View>
    </WebNavigationContext.Provider>
  );
};

// -------- Drawer for Native --------
const DrawerNavigator = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Main" component={TabNavigator} />
    <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
    <Drawer.Screen name="Prescriptions" component={PrescriptionsStack} />
    <Drawer.Screen name="Doctors" component={DoctorsStack} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
  </Drawer.Navigator>
);

// -------- Root Export --------
export const AppNavigator = () => {
  const linking: LinkingOptions<any> = {
    prefixes: ['http://localhost:8080', 'medicarereminder://'],
    config: {
      screens: {
        Root: {
          screens: {
            Main: {
              screens: {
                HomeTab: '',
              },
            },
          },
        },
      },
    },
  };

  if (Platform.OS === 'web') {
    return (
      <NavigationContainer linking={linking}>
        <WebNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const webStyles = StyleSheet.create({
  navbar: {
    height: 60,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 40,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  navButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.8,
  },
  activeNavButton: {
    opacity: 1,
    fontWeight: '600',
  },
});
