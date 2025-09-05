import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { useAuthStore } from '@/store/auth/slice';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AuthModal({ visible, onClose }: AuthModalProps) {
  const { t } = useI18n();
  const {
    authMode,
    isLoading,
    signIn,
    signUp,
    resetPassword,
    setAuthMode,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (!visible) {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDisplayName('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [visible, authMode]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('错误', '请输入邮箱地址');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('错误', '请输入有效的邮箱地址');
      return;
    }

    if (authMode === 'forgot-password') {
      try {
        await resetPassword(email.trim());
        Alert.alert('成功', '重置密码邮件已发送，请检查您的邮箱');
        setAuthMode('login');
      } catch (error: any) {
        Alert.alert('错误', error.message);
      }
      return;
    }

    if (!password) {
      Alert.alert('错误', '请输入密码');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('错误', '密码至少需要6个字符');
      return;
    }

    if (authMode === 'register') {
      if (!displayName.trim()) {
        Alert.alert('错误', '请输入昵称');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('错误', '两次输入的密码不一致');
        return;
      }

      try {
        await signUp(email.trim(), password, displayName.trim());
        Alert.alert('注册成功', '欢迎使用 Fridgy！');
        onClose();
      } catch (error: any) {
        Alert.alert('注册失败', error.message);
      }
    } else {
      try {
        await signIn(email.trim(), password);
        Alert.alert('登录成功', '欢迎回来！');
        onClose();
      } catch (error: any) {
        Alert.alert('登录失败', error.message);
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <Text style={styles.title}>
        {authMode === 'login' && '登录账号'}
        {authMode === 'register' && '注册账号'}
        {authMode === 'forgot-password' && '重置密码'}
      </Text>
      <Text style={styles.subtitle}>
        {authMode === 'login' && '登录以同步您的食材数据'}
        {authMode === 'register' && '创建账号以备份和同步数据'}
        {authMode === 'forgot-password' && '输入邮箱地址以重置密码'}
      </Text>
    </View>
  );

  const renderForm = () => (
    <View style={styles.form}>
      <TextInput
        mode="outlined"
        label="邮箱地址"
        placeholder="请输入邮箱地址"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={styles.input}
        disabled={isLoading}
        left={<TextInput.Icon icon="email" />}
      />

      {authMode === 'register' && (
        <TextInput
          mode="outlined"
          label="昵称"
          placeholder="请输入昵称"
          value={displayName}
          onChangeText={setDisplayName}
          autoComplete="name"
          style={styles.input}
          disabled={isLoading}
          left={<TextInput.Icon icon="account" />}
        />
      )}

      {authMode !== 'forgot-password' && (
        <>
          <TextInput
            mode="outlined"
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            style={styles.input}
            disabled={isLoading}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          {authMode === 'register' && (
            <TextInput
              mode="outlined"
              label="确认密码"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoComplete="password"
              style={styles.input}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
          )}
        </>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
        style={styles.submitButton}
        contentStyle={styles.submitButtonContent}
      >
        {authMode === 'login' && '登录'}
        {authMode === 'register' && '注册'}
        {authMode === 'forgot-password' && '发送重置邮件'}
      </Button>

      {authMode === 'login' && (
        <TouchableOpacity
          onPress={() => setAuthMode('forgot-password')}
          style={styles.forgotPasswordButton}
          disabled={isLoading}
        >
          <Text style={styles.forgotPasswordText}>忘记密码？</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {authMode === 'login' && (
        <View style={styles.switchMode}>
          <Text style={styles.switchModeText}>还没有账号？</Text>
          <TouchableOpacity
            onPress={() => setAuthMode('register')}
            disabled={isLoading}
          >
            <Text style={styles.switchModeLink}>立即注册</Text>
          </TouchableOpacity>
        </View>
      )}

      {authMode === 'register' && (
        <View style={styles.switchMode}>
          <Text style={styles.switchModeText}>已有账号？</Text>
          <TouchableOpacity
            onPress={() => setAuthMode('login')}
            disabled={isLoading}
          >
            <Text style={styles.switchModeLink}>立即登录</Text>
          </TouchableOpacity>
        </View>
      )}

      {authMode === 'forgot-password' && (
        <View style={styles.switchMode}>
          <Text style={styles.switchModeText}>想起密码了？</Text>
          <TouchableOpacity
            onPress={() => setAuthMode('login')}
            disabled={isLoading}
          >
            <Text style={styles.switchModeLink}>返回登录</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderHeader()}
            
            <View style={styles.card}>
              {renderForm()}
              {renderActions()}
            </View>

            {renderFooter()}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  actions: {
    gap: 12,
  },
  submitButton: {
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    padding: 8,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchMode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchModeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  switchModeLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});