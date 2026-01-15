import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

interface WebSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  navItems: string[][];
}

export const WebSidebar = ({
  activeTab,
  setActiveTab,
  navItems,
}: WebSidebarProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: theme.colors.surface,
          borderRightColor: theme.colors.border,
        },
      ]}
    >
      {/* Brand / Logo */}
      <TouchableOpacity
        style={styles.sidebarBrand}
        onPress={() => setActiveTab('Home')}
      >
        <Image
          source={require('../../public/logo.png')}
          style={styles.sidebarLogo}
          resizeMode="contain"
        />
        <Text style={[styles.sidebarTitle, { color: theme.colors.text }]}>
          {t('home.appName')}
        </Text>
      </TouchableOpacity>

      {/* Navigation Items */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {navItems.map(([key, label]) => {
          const isActive = activeTab === key;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={[
                styles.sidebarNavItem,
                isActive && {
                  backgroundColor: theme.colors.primary + '15', // 15 = hex opacity (~8%)
                  borderRightWidth: 3,
                  borderRightColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.sidebarNavText,
                  {
                    color: isActive
                      ? theme.colors.primary
                      : theme.colors.subText,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer / Copyright (Optional) */}
      <View style={styles.sidebarFooter}>
        <Text style={[styles.footerText, { color: theme.colors.subText }]}>
          v1.0.0
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    paddingVertical: 24,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    // Web-like shadow for the sidebar itself
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 2,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  sidebarLogo: {
    width: 36,
    height: 36,
    marginRight: 12,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 4,
    cursor: 'pointer' as any, // Only works on web, ignored on native
  },
  sidebarNavText: {
    fontSize: 16,
  },
  sidebarFooter: {
    paddingHorizontal: 24,
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
  },
});
