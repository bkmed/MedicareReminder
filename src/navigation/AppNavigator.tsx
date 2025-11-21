import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const MedicationsStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MedicationList" component={MedicationListScreen} options={{ title: 'Medications' }} />
            <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={{ title: 'Add Medication' }} />
            <Stack.Screen name="MedicationDetails" component={MedicationDetailsScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
    );
};

const AppointmentsStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Appointments' }} />
            <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} options={{ title: 'Add Appointment' }} />
            <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
    );
};

const PrescriptionsStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="PrescriptionList" component={PrescriptionListScreen} options={{ title: 'Prescriptions' }} />
            <Stack.Screen name="AddPrescription" component={AddPrescriptionScreen} options={{ title: 'Add Prescription' }} />
            <Stack.Screen name="PrescriptionDetails" component={PrescriptionDetailsScreen} options={{ title: 'Details' }} />
        </Stack.Navigator>
    );
};

const DoctorsStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="DoctorList" component={DoctorListScreen} options={{ title: 'Doctors' }} />
            <Stack.Screen name="AddDoctor" component={AddDoctorScreen} options={{ title: 'Add Doctor' }} />
            <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} options={{ title: 'Doctor Details' }} />
        </Stack.Navigator>
    );
};

const TabNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
            <Tab.Screen name="MedicationsTab" component={MedicationsStack} options={{ title: 'Medications' }} />
            <Tab.Screen name="AppointmentsTab" component={AppointmentsStack} options={{ title: 'Appointments' }} />
        </Tab.Navigator>
    );
};

// Web-friendly simple navigation without drawer (for web only)
const WebNavigator = () => {
    const [activeTab, setActiveTab] = useState('main');

    return (
        <View style={{ flex: 1 }}>
            {/* Simple navigation bar for web */}
            <View style={webStyles.navbar}>
                <Text style={webStyles.title}>Medicare Reminder</Text>
                <View style={webStyles.navButtons}>
                    <TouchableOpacity onPress={() => setActiveTab('main')} style={webStyles.navButton}>
                        <Text style={[webStyles.navButtonText, activeTab === 'main' && webStyles.activeNavButton]}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('medications')} style={webStyles.navButton}>
                        <Text style={[webStyles.navButtonText, activeTab === 'medications' && webStyles.activeNavButton]}>Medications</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('appointments')} style={webStyles.navButton}>
                        <Text style={[webStyles.navButtonText, activeTab === 'appointments' && webStyles.activeNavButton]}>Appointments</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('analytics')} style={webStyles.navButton}>
                        <Text style={[webStyles.navButtonText, activeTab === 'analytics' && webStyles.activeNavButton]}>Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('prescriptions')} style={webStyles.navButton}>
                        <Text style={[webStyles.navButtonText, activeTab === 'prescriptions' && webStyles.activeNavButton]}>Prescriptions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('doctors')} style={webStyles.navButton}>
                        <Text style={[webStyles.navButtonText, activeTab === 'doctors' && webStyles.activeNavButton]}>Doctors</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setActiveTab('profile')} style={webStyles.navButton}>
                        <Text style={[webStyles.navButtonText, activeTab === 'profile' && webStyles.activeNavButton]}>Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* Content area with proper positioning for FABs */}
            <View style={{ flex: 1, position: 'relative' as any }}>
                {activeTab === 'main' && <HomeScreen />}
                {activeTab === 'medications' && <MedicationsStack />}
                {activeTab === 'appointments' && <AppointmentsStack />}
                {activeTab === 'analytics' && <AnalyticsScreen />}
                {activeTab === 'prescriptions' && <PrescriptionsStack />}
                {activeTab === 'doctors' && <DoctorsStack />}
                {activeTab === 'profile' && <ProfileScreen />}
            </View>
        </View>
    );
};

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Main" component={TabNavigator} options={{ title: 'Medicare Reminder' }} />
            <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
            <Drawer.Screen name="Prescriptions" component={PrescriptionsStack} />
            <Drawer.Screen name="Doctors" component={DoctorsStack} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
    );
};

export const AppNavigator = () => {
    const linking: LinkingOptions<any> = {
        prefixes: ['http://localhost:8080', 'medicarereminder://'],
        config: {
            screens: {
                Root: {
                    path: '',
                    screens: {
                        Main: {
                            path: '',
                            screens: {
                                HomeTab: '',
                                MedicationsTab: {
                                    path: 'medications',
                                    screens: {
                                        MedicationList: '',
                                        AddMedication: 'add',
                                        MedicationDetails: ':medicationId',
                                    },
                                },
                                AppointmentsTab: {
                                    path: 'appointments',
                                    screens: {
                                        AppointmentList: '',
                                        AddAppointment: 'add',
                                        AppointmentDetails: ':appointmentId',
                                    },
                                },
                            },
                        },
                        Analytics: 'analytics',
                        Prescriptions: {
                            path: 'prescriptions',
                            screens: {
                                PrescriptionList: '',
                                AddPrescription: 'add',
                                PrescriptionDetails: ':prescriptionId',
                            },
                        },
                        Doctors: {
                            path: 'doctors',
                            screens: {
                                DoctorList: '',
                                AddDoctor: 'add',
                                DoctorDetails: ':doctorId',
                            },
                        },
                        Profile: 'profile',
                    },
                },
            },
        },
    };

    // Use simple web navigation for web platform
    if (Platform.OS === 'web') {
        return (
            <NavigationContainer
                linking={linking}
                fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>}
            >
                <WebNavigator />
            </NavigationContainer>
        );
    }

    //  Native navigation with drawer
    return (
        <NavigationContainer
            linking={linking}
            fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>}
        >
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1000,
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
