import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { doctorsDb } from '../../database/doctorsDb';
import { Doctor } from '../../database/schema';

export const DoctorListScreen = ({ navigation }: any) => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDoctors = async () => {
        try {
            const data = await doctorsDb.getAll();
            setDoctors(data);
        } catch (error) {
            console.error('Error loading doctors:', error);
            Alert.alert('Error', 'Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadDoctors();
        }, [])
    );

    const renderDoctor = ({ item }: { item: Doctor }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('AddDoctor', { doctorId: item.id })}
            >
                <View style={styles.headerRow}>
                    <Text style={styles.name}>Dr. {item.name}</Text>
                    {item.specialty && (
                        <View style={styles.specialtyBadge}>
                            <Text style={styles.specialtyText}>{item.specialty}</Text>
                        </View>
                    )}
                </View>

                {item.phone && (
                    <Text style={styles.detail}>📞 {item.phone}</Text>
                )}

                {item.email && (
                    <Text style={styles.detail}>✉️ {item.email}</Text>
                )}

                {item.address && (
                    <Text style={styles.detail}>📍 {item.address}</Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No doctors</Text>
            <Text style={styles.emptySubText}>Tap + to add a doctor</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={doctors}
                renderItem={renderDoctor}
                keyExtractor={(item) => item.id?.toString() || ''}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={!loading ? renderEmpty : null}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AddDoctor')}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
    },
    specialtyBadge: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    specialtyText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    detail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
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
