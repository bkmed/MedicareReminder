import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/authService';
import { Theme } from '../../theme';

export const ProfileScreen = ({ navigation }: any) => {
    const { theme, isDark, toggleTheme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleLogout = async () => {
        try {
            await authService.logout();
            // Navigation will be handled by AppNavigator state change
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Settings</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>Dark Mode</Text>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={theme.colors.surface}
                    />
                </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.l,
        ...theme.shadows.small,
    },
    sectionTitle: {
        ...theme.textVariants.subheader,
        marginBottom: theme.spacing.m,
        color: theme.colors.text,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.s,
    },
    label: {
        ...theme.textVariants.body,
        color: theme.colors.text,
    },
    logoutButton: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.error,
    },
    logoutText: {
        ...theme.textVariants.button,
        color: theme.colors.error,
    },
});
