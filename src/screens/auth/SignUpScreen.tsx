import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Theme } from '../../theme';
import { isValidEmail, isValidPassword } from '../../utils/validation';

export const SignUpScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '' };

    if (!name) {
      newErrors.name = t('signUp.errorEmptyName');
      isValid = false;
    }

    if (!email) {
      newErrors.email = t('signUp.errorEmptyEmail');
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = t('signUp.errorInvalidEmail');
      isValid = false;
    }

    if (!password) {
      newErrors.password = t('signUp.errorEmptyPassword');
      isValid = false;
    } else if (!isValidPassword(password)) {
      newErrors.password = t('signUp.errorWeakPassword'); // Ensure translation key exists or use generic
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await authService.register(name, email, password);
      await signUp(user);
    } catch (error: any) {
      Alert.alert(
        t('signUp.errorTitle'),
        error.message || t('signUp.errorRegistrationFailed'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>{t('signUp.title')}</Text>
          <Text style={styles.subtitle}>{t('signUp.subtitle')}</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('signUp.nameLabel')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t('signUp.namePlaceholder')}
              placeholderTextColor={theme.colors.subText}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('signUp.emailLabel')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder={t('signUp.emailPlaceholder')}
              placeholderTextColor={theme.colors.subText}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('signUp.passwordLabel')}</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder={t('signUp.passwordPlaceholder')}
              placeholderTextColor={theme.colors.subText}
              secureTextEntry
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>{t('signUp.signUpButton')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('signUp.hasAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>{t('signUp.signIn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: theme.spacing.m,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.l,
      padding: theme.spacing.l,
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      ...theme.shadows.medium,
    },
    title: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.m,
    },
    label: {
      ...theme.textVariants.caption,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    input: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.spacing.s,
      padding: theme.spacing.m,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.m,
      borderRadius: theme.spacing.s,
      alignItems: 'center',
      marginTop: theme.spacing.m,
      marginBottom: theme.spacing.l,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      ...theme.textVariants.button,
      color: theme.colors.surface,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    footerText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
    },
    link: {
      ...theme.textVariants.body,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    errorText: {
      ...theme.textVariants.caption,
      color: theme.colors.error,
      marginTop: 4,
    },
  });
