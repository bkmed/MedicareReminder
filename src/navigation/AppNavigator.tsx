import React, { useState, useMemo, createContext, useEffect } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HomeScreen } from '../screens/HomeScreen';
import { WebSidebar } from '../components/WebSidebar';
import { WebHeader } from '../components/WebHeader';
import { MedicationListScreen } from '../screens/medications/MedicationListScreen';
import { AddMedicationScreen } from '../screens/medications/AddMedicationScreen';
import { MedicationDetailsScreen } from '../screens/medications/MedicationDetailsScreen';
import { MedicationHistoryScreen } from '../screens/medications/MedicationHistoryScreen';
import { AppointmentListScreen } from '../screens/appointments/AppointmentListScreen';
import { AddAppointmentScreen } from '../screens/appointments/AddAppointmentScreen';
import { AppointmentDetailsScreen } from '../screens/appointments/AppointmentDetailsScreen';
import { PrescriptionListScreen } from '../screens/prescriptions/PrescriptionListScreen';
import { AddPrescriptionScreen } from '../screens/prescriptions/AddPrescriptionScreen';
import { PrescriptionDetailsScreen } from '../screens/prescriptions/PrescriptionDetailsScreen';
import { PrescriptionHistoryScreen } from '../screens/prescriptions/PrescriptionHistoryScreen';
import { DoctorListScreen } from '../screens/doctors/DoctorListScreen';
import { AddDoctorScreen } from '../screens/doctors/AddDoctorScreen';
import { DoctorDetailsScreen } from '../screens/doctors/DoctorDetailsScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';
import { GlobalSearchScreen } from '../screens/search/GlobalSearchScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { useNetworkStatus } from '../services/offlineService';

enableScreens();

// ======= Web Navigation Context (avec subScreen) =======
export const WebNavigationContext = createContext({
  activeTab: 'Home',
  subScreen: '',
  screenParams: {} as any,
  setActiveTab: (tab: string, subScreen?: string, params?: any) => {},
});

// ======= Stacks =======
const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

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
      <Stack.Screen
        name="MedicationHistory"
        component={MedicationHistoryScreen}
        options={{ title: t('history.medicationHistory') }}
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
      <Stack.Screen
        name="PrescriptionHistory"
        component={PrescriptionHistoryScreen}
        options={{ title: t('common.viewHistory') }}
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

const DrawerNavigator = () => {
  const { t } = useTranslation();
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="Main" component={TabNavigator} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
      <Drawer.Screen name="Prescriptions" component={PrescriptionsStack} />
      <Drawer.Screen name="Doctors" component={DoctorsStack} />
      <Drawer.Screen
        name="Search"
        component={GlobalSearchScreen}
        options={{ title: t('search.title') }}
      />
      <Drawer.Screen name="Profile" component={ProfileStack} />
    </Drawer.Navigator>
  );
};

// ======= Web Navigator avec subScreen =======
const WebNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  const [activeTab, setActiveTabRaw] = useState('Home');
  const [subScreen, setSubScreen] = useState('');
  const [screenParams, setScreenParams] = useState<any>({});

  const setActiveTab = (tab: string, screen?: string, params?: any) => {
    setActiveTabRaw(tab);
    setSubScreen(screen || '');
    setScreenParams(params || {});
  };

  const contextValue = useMemo(
    () => ({
      activeTab,
      subScreen,
      screenParams,
      setActiveTab,
    }),
    [activeTab, subScreen, screenParams],
  );

  const getActiveComponent = () => {
    const mockRoute = { params: screenParams };
    switch (activeTab) {
      case 'Home':
        return <HomeStack />;
      case 'Medications':
        if (subScreen === 'AddMedication')
          return <AddMedicationScreen route={mockRoute} />;
        if (subScreen === 'MedicationDetails')
          return <MedicationDetailsScreen route={mockRoute} />;
        if (subScreen === 'MedicationHistory')
          return <MedicationHistoryScreen route={mockRoute} />;
        return <MedicationsStack />;
      case 'Appointments':
        if (subScreen === 'AddAppointment')
          return <AddAppointmentScreen route={mockRoute} />;
        if (subScreen === 'AppointmentDetails')
          return <AppointmentDetailsScreen route={mockRoute} />;
        return <AppointmentsStack />;
      case 'Analytics':
        return <AnalyticsScreen />;
      case 'Prescriptions':
        if (subScreen === 'AddPrescription')
          return <AddPrescriptionScreen route={mockRoute} />;
        if (subScreen === 'PrescriptionDetails')
          return <PrescriptionDetailsScreen route={mockRoute} />;
        if (subScreen === 'PrescriptionHistory')
          return <PrescriptionHistoryScreen route={mockRoute} />;
        return <PrescriptionsStack />;
      case 'Doctors':
        if (subScreen === 'AddDoctor')
          return <AddDoctorScreen route={mockRoute} />;
        if (subScreen === 'DoctorDetails')
          return <DoctorDetailsScreen route={mockRoute} />;
        return <DoctorsStack />;
      case 'Search':
        return <GlobalSearchScreen />;
      case 'Profile':
        return <ProfileStack />;
      default:
        return <HomeStack />;
    }
  };

  const navItems = [
    ['Home', t('navigation.home')],
    ['Medications', t('navigation.medications')],
    ['Appointments', t('navigation.appointments')],
    ['Analytics', t('navigation.analytics')],
    ['Prescriptions', t('navigation.prescriptions')],
    ['Doctors', t('navigation.doctors')],
    ['Profile', t('navigation.profile')],
  ];

  return (
    <WebNavigationContext.Provider value={contextValue}>
      <View
        style={{
          flex: 1,
          flexDirection: isMobile ? 'column' : 'row',
          backgroundColor: theme.colors.background,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar (Desktop Only) */}
        {!isMobile && (
          <WebSidebar
            activeTab={activeTab}
            setActiveTab={tab => setActiveTab(tab)}
            navItems={navItems}
          />
        )}

        {/* Main Content Area */}
        <View
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Header (Handles Mobile Menu & Desktop Back Breadcrumbs) */}
          <WebHeader
            isMobile={isMobile}
            navItems={navItems}
            activeTab={activeTab}
            setActiveTab={tab => setActiveTab(tab)}
            subScreen={subScreen}
            onBack={() => setSubScreen('')}
          />

          {/* Screen Content */}
          <View style={{ flex: 1, overflow: 'scroll' }}>
            {/* Note: overflow: 'scroll' here ensures the content scrolls independently of the sidebar */}
            {getActiveComponent()}
          </View>
        </View>
      </View>
    </WebNavigationContext.Provider>
  );
};

// ======= Root Export =======
export const AppNavigator = () => {
  const linking: LinkingOptions<any> = {
    prefixes: [
      'http://localhost:8080',
      'medicarereminder://',
      'https://bkmed.github.io/MedicareReminder/',
    ],
    config: { screens: {} },
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer linking={linking}>
          <AppContent />
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { user, isLoading, signOut } = useAuth();
  const { isConnected } = useNetworkStatus();
  const { navigationRef }: any = useMemo(
    () => ({ navigationRef: React.createRef() }),
    [],
  );

  useEffect(() => {
    // Secure session: log out if disconnected
    if (user && isConnected === false) {
      console.log('Device disconnected, signing out for security...');
      signOut({
        navigate: (screen: string) => {
          /** handle redirect if needed */
        },
      });
    }
  }, [isConnected, user, signOut]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {!user ? (
        <AuthStack />
      ) : Platform.OS === 'web' ? (
        <WebNavigator />
      ) : (
        <DrawerNavigator />
      )}
    </>
  );
};

// ======= Web Styles =======
