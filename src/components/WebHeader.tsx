import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

interface WebHeaderProps {
  isMobile: boolean;
  navItems: string[][];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subScreen?: string;
  onBack?: () => void;
}

export const WebHeader = ({
  isMobile,
  navItems,
  activeTab,
  setActiveTab,
  subScreen,
  onBack,
}: WebHeaderProps) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // If not mobile, we can render a minimal header or nothing if sidebar is sufficient.
  // But let's keep it for mobile first logic or breedcrumb.

  // Helper to get title
  const getTitle = () => {
    if (subScreen) {
      // Logic to get legible title from subScreen name
      const key = `navigation.${subScreen.toLowerCase().replace('screen', '')}`;
      return t(key, subScreen.replace(/([A-Z])/g, ' $1').trim()); // Fallback to spaced CamelCase
    }
    if (!navItems) return activeTab || '';
    const navItem = navItems.find(item => item && item[0] === activeTab);
    return navItem ? navItem[1] : activeTab;
  };

  const title = getTitle();

  if (!isMobile) {
    return (
      <View
        style={[
          styles.desktopHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          {subScreen ? (
            <TouchableOpacity
              onPress={onBack}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text
                style={{
                  fontSize: 18,
                  color: theme.colors.primary,
                  fontWeight: '600',
                  marginRight: 16,
                }}
              >
                ←
              </Text>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {title}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
          )}
        </View>
        {/* Can add more desktop header items here like Profile dropdown */}
      </View>
    );
  }

  // Mobile Header
  return (
    <>
      <View
        style={[
          styles.mobileNavbar,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.leftContainer}>
          {subScreen ? (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text
                style={[styles.backButtonText, { color: theme.colors.text }]}
              >
                ←
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.brandContainer}
              onPress={() => setActiveTab('Home')}
            >
              <Image
                source={require('../../public/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {t('home.appName')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.hamburgerButton}
          onPress={() => setIsMenuOpen(true)}
        >
          <Text style={[styles.hamburgerText, { color: theme.colors.text }]}>
            ☰
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <Modal
          transparent
          animationType="fade"
          visible={isMenuOpen}
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
            <View style={styles.mobileMenuOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.mobileMenu,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <View style={styles.mobileMenuHeader}>
                    <Text
                      style={[
                        styles.mobileMenuTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      {t('home.appName')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setIsMenuOpen(false)}
                      style={styles.closeButton}
                    >
                      <Text
                        style={[
                          styles.closeButtonText,
                          { color: theme.colors.text },
                        ]}
                      >
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.divider} />

                  {navItems.map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => {
                        setActiveTab(key);
                        setIsMenuOpen(false);
                      }}
                      style={[
                        styles.mobileMenuItem,
                        activeTab === key && {
                          backgroundColor: theme.colors.primary + '10',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.mobileMenuItemText,
                          {
                            color:
                              activeTab === key
                                ? theme.colors.primary
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  desktopHeader: {
    height: 70,
    borderBottomWidth: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    width: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mobileNavbar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  hamburgerButton: {
    padding: 8,
  },
  hamburgerText: {
    fontSize: 24,
  },
  mobileMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  mobileMenu: {
    width: '80%',
    maxWidth: 300,
    height: '100%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mobileMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mobileMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginBottom: 10,
  },
  mobileMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  mobileMenuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
