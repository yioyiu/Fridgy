import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { TextInput, Button, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { useAuthStore } from '@/store/auth/slice';
import AuthModal from './AuthModal';

interface ProfileScreenProps {
  onClose?: () => void;
}

export default function ProfileScreen({ onClose }: ProfileScreenProps) {
  const { t } = useI18n();
  const {
    isAuthenticated,
    user,
    isLoading,
    isSyncing,
    lastSyncAt,
    syncError,
    updateProfile,
    signOut,
    setShowAuthModal,
    showAuthModal,
    syncToCloud,
    syncFromCloud,
  } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('错误', '昵称不能为空');
      return;
    }

    try {
      const updateData: any = {
        displayName: displayName.trim(),
      };
      
      if (email.trim()) {
        updateData.email = email.trim();
      }
      
      if (phone.trim()) {
        updateData.phone = phone.trim();
      }
      
      await updateProfile(updateData);
      
      Alert.alert('成功', '个人资料已更新');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('错误', error.message);
    }
  };

  const handleCancel = () => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
    setIsEditing(false);
  };

  const handleSignOut = () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？本地数据将保留。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              Alert.alert('成功', '已退出登录');
            } catch (error: any) {
              Alert.alert('错误', error.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '删除账户',
      '此操作无法撤销，您所有的数据将被永久删除，是否继续？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: 调用后端/存储删除逻辑；当前先执行退出登录作为占位
              await signOut();
              Alert.alert('成功', '账户已删除（示例：当前执行退出登录）');
              if (onClose) onClose();
            } catch (error: any) {
              Alert.alert('错误', error.message);
            }
          },
        },
      ]
    );
  };

  const handleSync = async (type: 'upload' | 'download') => {
    try {
      if (type === 'upload') {
        await syncToCloud();
        Alert.alert('成功', '数据已同步到云端');
      } else {
        await syncFromCloud();
        Alert.alert('成功', '数据已从云端同步');
      }
    } catch (error: any) {
      Alert.alert('同步失败', error.message);
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return '从未同步';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  const renderGuestView = () => (
    <View style={styles.guestContainer}>
      <MaterialCommunityIcons
        name="account-circle-outline"
        size={80}
        color={COLORS.textSecondary}
        style={styles.guestIcon}
      />
      <Text style={styles.guestTitle}>未登录</Text>
      <Text style={styles.guestSubtitle}>
        登录账号以同步您的食材数据{'\n'}在多设备间无缝使用
      </Text>
      
      <Button
        mode="contained"
        onPress={() => setShowAuthModal(true)}
        style={styles.loginButton}
        contentStyle={styles.loginButtonContent}
      >
        登录 / 注册
      </Button>

      <View style={styles.guestFeatures}>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="cloud-sync" size={20} color={COLORS.primary} />
          <Text style={styles.featureText}>云端同步</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="backup-restore" size={20} color={COLORS.primary} />
          <Text style={styles.featureText}>数据备份</Text>
        </View>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="devices" size={20} color={COLORS.primary} />
          <Text style={styles.featureText}>多设备同步</Text>
        </View>
      </View>
    </View>
  );

  const renderUserView = () => (
    <ScrollView style={styles.userContainer} contentContainerStyle={styles.userContent}>
      {/* User Info Card */}
      <View style={styles.card}>
        <View style={styles.avatarSection}>
          <Avatar.Text
            size={80}
            label={user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || '未设置昵称'}</Text>
            <Text style={styles.userEmail}>{user?.email || '未绑定邮箱'}</Text>
            <Text style={styles.userDate}>
              注册时间：{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '未知'}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Edit Profile Section */}
        <View style={styles.editSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>个人资料</Text>
            {!isEditing && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                <MaterialCommunityIcons name="pencil" size={20} color={COLORS.primary} />
                <Text style={styles.editButtonText}>编辑</Text>
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                mode="outlined"
                label="昵称"
                value={displayName}
                onChangeText={setDisplayName}
                style={styles.input}
                disabled={isLoading}
              />
              <TextInput
                mode="outlined"
                label="邮箱"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                style={styles.input}
                disabled={isLoading}
              />
              <TextInput
                mode="outlined"
                label="手机号"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                style={styles.input}
                disabled={isLoading}
              />
              
              <View style={styles.editActions}>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.cancelButton}
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.saveButton}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  保存
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>昵称</Text>
                <Text style={styles.infoValue}>{user?.displayName || '未设置'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>邮箱</Text>
                <Text style={styles.infoValue}>{user?.email || '未绑定'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>手机号</Text>
                <Text style={styles.infoValue}>{user?.phone || '未绑定'}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Sync Status Card */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>数据同步</Text>
          <View style={styles.syncStatus}>
            {isSyncing && (
              <MaterialCommunityIcons name="sync" size={16} color={COLORS.primary} />
            )}
            <Text style={[styles.syncStatusText, syncError && styles.syncErrorText]}>
              {isSyncing ? '同步中...' : syncError ? '同步失败' : '已同步'}
            </Text>
          </View>
        </View>

        <Text style={styles.lastSyncText}>
          上次同步：{formatLastSync(lastSyncAt)}
        </Text>

        {syncError && (
          <Text style={styles.syncErrorMessage}>{syncError}</Text>
        )}

        <View style={styles.syncActions}>
          <Button
            mode="outlined"
            onPress={() => handleSync('download')}
            disabled={isSyncing}
            style={styles.syncButton}
            icon="cloud-download"
          >
            从云端同步
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleSync('upload')}
            disabled={isSyncing}
            style={styles.syncButton}
            icon="cloud-upload"
          >
            同步到云端
          </Button>
        </View>
      </View>

      {/* Account Actions */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>账户操作</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
          <Text style={styles.actionText}>退出登录</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount}>
          <MaterialCommunityIcons name="account-remove" size={24} color={COLORS.error} />
          <Text style={styles.actionText}>删除账户</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>个人资料</Text>
      </View>

      {isAuthenticated ? renderUserView() : renderGuestView()}

      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    top: 50,
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Guest view styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  guestIcon: {
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  loginButton: {
    marginBottom: 32,
    minWidth: 200,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  guestFeatures: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },

  // User view styles
  userContainer: {
    flex: 1,
  },
  userContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  divider: {
    marginVertical: 20,
  },
  editSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  editForm: {
    gap: 12,
  },
  input: {
    backgroundColor: COLORS.background,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  profileInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncStatusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  syncErrorText: {
    color: COLORS.error,
  },
  lastSyncText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  syncErrorMessage: {
    fontSize: 14,
    color: COLORS.error,
    marginBottom: 12,
  },
  syncActions: {
    flexDirection: 'row',
    gap: 12,
  },
  syncButton: {
    flex: 1,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '500',
  },
});