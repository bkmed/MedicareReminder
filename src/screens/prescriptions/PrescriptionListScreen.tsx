import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { prescriptionsDb } from '../../database/prescriptionsDb';
import { Prescription } from '../../database/schema';

export const PrescriptionListScreen = ({ navigation }: any) => {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPrescriptions = async () => {
        try {
            const data = await prescriptionsDb.getAll();
            setPrescriptions(data);
        } catch (error) {
            console.error('Error loading prescriptions:', error);
            Alert.alert('Error', 'Failed to load prescriptions');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadPrescriptions();
        }, [])
    );

    const isExpiringSoon = (expiryDate: string) => {
        const expiry = new Date(expiryDate);
        const now = new Date();
        const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    };

    const renderPrescription = ({ item }: { item: Prescription }) => {
        const expiryWarning = item.expiryDate && isExpiringSoon(item.expiryDate);

        return (
            <TouchableOpacity
                style={[styles.card, expiryWarning && styles.cardWarning]}
                onPress={() => navigation.navigate('PrescriptionDetails', { prescriptionId: item.id })}
            >
                {item.photoUri && (
                    <Image source={{ uri: item.photoUri }} style={styles.thumbnail} />
                )}

                <View style={styles.details}>
                    <Text style={styles.medicationName}>{item.medicationName}</Text>

                    {item.doctorName && (
                        <Text style={styles.doctor}>Dr. {item.doctorName}</Text>
                    )}

                    <Text style={styles.date}>Issued: {new Date(item.issueDate).toLocaleDateString()}</Text>

                    {item.expiryDate && (
                        <Text style={[styles.expiry, expiryWarning && styles.expiryWarning]}>
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            {expiryWarning && ' ⚠️'}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No prescriptions</Text>
            <Text style={styles.emptySubText}>Tap + to add a prescription</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={prescriptions}
                renderItem={renderPrescription}
                keyExtractor={(item) => item.id?.toString() || ''}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmpty : null}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddPrescription')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    listContent: {
        padding: 16,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardWarning: {
        borderLeftWidth: 4,
        borderLeftColor: '#FF9500',
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#E0E0E0',
    },
    details: {
        flex: 1,
    },
    medicationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    doctor: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    date: {
        fontSize: 13,
        color: '#999',
        marginBottom: 2,
    },
    expiry: {
        fontSize: 13,
        color: '#999',
    },
    expiryWarning: {
        color: '#FF9500',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabText: {
        fontSize: 32,
        color: '#FFF',
        fontWeight: '300',
    },
});
