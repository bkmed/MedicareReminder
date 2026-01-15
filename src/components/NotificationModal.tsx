import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Theme } from '../theme';
import { useTranslation } from 'react-i18next';

export type NotificationType = 'success' | 'error' | 'info' | 'confirm';

interface NotificationButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface NotificationModalProps {
  visible: boolean;
  title?: string;
  message: string;
  type?: NotificationType;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  buttons?: NotificationButton[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  buttons,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme, type);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'confirm':
        return '❓';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getIcon()}</Text>
          </View>

          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {buttons ? (
              buttons.map((btn, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    btn.style === 'cancel'
                      ? styles.cancelButton
                      : btn.style === 'destructive'
                      ? styles.destructiveButton
                      : styles.confirmButton,
                  ]}
                  onPress={() => {
                    btn.onPress();
                    onConfirm(); // Close the modal
                  }}
                >
                  <Text
                    style={[
                      styles.confirmButtonText,
                      btn.style === 'cancel' && styles.cancelButtonText,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <>
                {(type === 'confirm' || cancelText) && (
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={onCancel}
                  >
                    <Text style={styles.cancelButtonText}>
                      {cancelText || t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                >
                  <Text style={styles.confirmButtonText}>
                    {confirmText ||
                      (type === 'confirm'
                        ? t('common.confirm')
                        : t('common.ok'))}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: Theme, type: NotificationType) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.l,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.m,
      padding: theme.spacing.l,
      width: '100%',
      maxWidth: 400,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
    icon: {
      fontSize: 30,
    },
    title: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      textAlign: 'center',
    },
    message: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      textAlign: 'center',
      marginBottom: theme.spacing.l,
    },
    buttonContainer: {
      flexDirection: 'row',
      width: '100%',
      gap: theme.spacing.m,
    },
    button: {
      flex: 1,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    destructiveButton: {
      backgroundColor: theme.colors.error,
    },
    confirmButton: {
      backgroundColor:
        type === 'error' ? theme.colors.error : theme.colors.primary,
    },
    cancelButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.text,
    },
    confirmButtonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
  });
