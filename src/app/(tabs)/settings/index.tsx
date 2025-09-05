import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { List, Divider, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n, SUPPORTED_LANGUAGES, type LanguageCode } from '@/utils/i18n';
import { useSettingsStore } from '@/store/settings/slice';
import { useAuthStore } from '@/store/auth/slice';
import ProfileScreen from '@/components/auth/ProfileScreen';
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal';
import { TermsOfServiceModal } from '@/components/TermsOfServiceModal';
import { SupportModal } from '@/components/SupportModal';

// Language options
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

export default function SettingsScreen() {
  const { currentLanguage, setLanguage, t } = useI18n();
  const insets = useSafeAreaInsets();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [unitsModalVisible, setUnitsModalVisible] = useState(false);
  const [locationsModalVisible, setLocationsModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  const { 
    categories, 
    units, 
    locations, 
    notificationsEnabled,
    dailyReminders,
    nearExpiryAlerts,
    expiredAlerts,
    autoSuggestExpiry,
    defaultNearExpiryDays,
    addCategory, 
    removeCategory, 
    addUnit, 
    removeUnit, 
    addLocation, 
    removeLocation,
    setNotificationsEnabled,
    setDailyReminders,
    setNearExpiryAlerts,
    setExpiredAlerts,
    setAutoSuggestExpiry,
    setDefaultNearExpiryDays
  } = useSettingsStore();

  const [newCategory, setNewCategory] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitAbbr, setNewUnitAbbr] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // 使用useCallback包装所有setter函数，确保引用稳定
  const handleSetNotificationsEnabled = React.useCallback(async (value: boolean) => {
    console.log('Setting notifications:', value);
    try {
      await setNotificationsEnabled(value);
      // 可以在这里添加成功提示
    } catch (error) {
      console.error('Failed to update notifications:', error);
      Alert.alert(
        t('common.error'),
        '更新通知设置失败，请检查应用权限设置。',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { 
            text: '打开设置', 
            onPress: () => {
              // 可以添加打开系统设置的逻辑
              console.log('Open system settings');
            }
          }
        ]
      );
    }
  }, [setNotificationsEnabled, t]);

  const handleSetDailyReminders = React.useCallback(async (value: boolean) => {
    console.log('Setting daily reminders:', value);
    try {
      await setDailyReminders(value);
    } catch (error) {
      console.error('Failed to update daily reminders:', error);
    }
  }, [setDailyReminders]);

  const handleSetNearExpiryAlerts = React.useCallback(async (value: boolean) => {
    console.log('Setting near expiry alerts:', value);
    try {
      await setNearExpiryAlerts(value);
    } catch (error) {
      console.error('Failed to update near expiry alerts:', error);
    }
  }, [setNearExpiryAlerts]);

  const handleSetExpiredAlerts = React.useCallback(async (value: boolean) => {
    console.log('Setting expired alerts:', value);
    try {
      await setExpiredAlerts(value);
    } catch (error) {
      console.error('Failed to update expired alerts:', error);
    }
  }, [setExpiredAlerts]);

  const handleSetAutoSuggestExpiry = React.useCallback((value: boolean) => {
    console.log('Setting auto suggest expiry:', value);
    setAutoSuggestExpiry(value);
  }, [setAutoSuggestExpiry]);

  // Callback functions to prevent re-renders
  const handleAddCategory = React.useCallback(() => {
    if (!newCategory.trim()) return;
    addCategory(newCategory);
    setNewCategory('');
  }, [newCategory, addCategory]);

  const handleAddUnit = React.useCallback(() => {
    if (!newUnitName.trim() || !newUnitAbbr.trim()) return;
    addUnit(newUnitName, newUnitAbbr);
    setNewUnitName('');
    setNewUnitAbbr('');
  }, [newUnitName, newUnitAbbr, addUnit]);

  const handleAddLocation = React.useCallback(() => {
    if (!newLocation.trim()) return;
    addLocation(newLocation);
    setNewLocation('');
  }, [newLocation, addLocation]);

  useEffect(() => {
    // Initialize auth when component mounts
    initializeAuth();
  }, []);

  const handleExportData = () => {
    Alert.alert(
      t('settings.exportData'),
      'This will export all your ingredient data as a CSV file.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.save'), onPress: () => console.log('Export data') },
      ]
    );
  };

  

  const SettingItem = React.memo(({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    right 
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    right?: (props: { color: string; style?: any }) => React.ReactNode;
  }) => {
    const listItemProps: any = {
      title,
      description: subtitle,
      titleStyle: { color: COLORS.text, fontWeight: '600' },
      descriptionStyle: { color: COLORS.textSecondary },
      left: (props: any) => (
        <MaterialCommunityIcons 
          {...props} 
          name={icon as any} 
          size={24} 
          color={COLORS.textSecondary} 
        />
      ),
      style: styles.listItem,
    };

    if (right) {
      listItemProps.right = right;
    }

    if (onPress) {
      listItemProps.onPress = onPress;
    }

    return <List.Item {...listItemProps} />;
  });

  // 使用React.memo优化的SwitchItem组件，添加更严格的比较
  const SwitchItem = React.memo(({ 
    title, 
    subtitle, 
    icon, 
    value, 
    onValueChange 
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => {
    return (
      <View style={styles.switchItemContainer}>
        <View style={styles.switchItemLeft}>
          <MaterialCommunityIcons 
            name={icon as any} 
            size={24} 
            color={COLORS.textSecondary}
            style={styles.switchItemIcon}
          />
          <View style={styles.switchItemTextContainer}>
            <Text style={styles.switchItemTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.switchItemSubtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: COLORS.border, true: COLORS.primaryLight }}
          thumbColor={value ? COLORS.primary : COLORS.textDisabled}
        />
      </View>
    );
  }, (prevProps, nextProps) => {
    // 自定义比较函数，只有当实际需要的属性改变时才重新渲染
    return (
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.icon === nextProps.icon &&
      prevProps.value === nextProps.value &&
      prevProps.onValueChange === nextProps.onValueChange
    );
  });

  const LanguageSelector = React.memo(() => {
    const selectedLang = LANGUAGES.find(lang => lang.code === currentLanguage);
    
    const handlePress = React.useCallback(() => {
      setLanguageModalVisible(true);
    }, []);
    
    return (
      <List.Item
        title={t('settings.language')}
        description={selectedLang ? `${selectedLang.nativeName} (${selectedLang.name})` : t('settings.languageSubtitle')}
        titleStyle={{ color: COLORS.text, fontWeight: '600' }}
        descriptionStyle={{ color: COLORS.textSecondary }}
        left={(props) => (
          <MaterialCommunityIcons 
            {...props} 
            name="translate" 
            size={24} 
            color={COLORS.textSecondary} 
          />
        )}
        right={(props) => (
          <MaterialCommunityIcons 
            {...props} 
            name="chevron-right" 
            size={24} 
            color={COLORS.textSecondary} 
          />
        )}
        onPress={handlePress}
        style={styles.listItem}
      />
    );
  });

  // 为每个开关分别缓存配置，避免一个状态变化影响到其他开关
  const enableNotificationsConfig = React.useMemo(() => ({
    title: t('settings.enableNotifications'),
    subtitle: t('settings.notificationsSubtitle'),
    icon: "bell",
    value: notificationsEnabled,
    onValueChange: handleSetNotificationsEnabled
  }), [t, notificationsEnabled, handleSetNotificationsEnabled]);

  const dailyRemindersConfig = React.useMemo(() => ({
    title: t('settings.dailyReminders'),
    subtitle: t('settings.dailyRemindersSubtitle'),
    icon: "clock",
    value: dailyReminders,
    onValueChange: handleSetDailyReminders
  }), [t, dailyReminders, handleSetDailyReminders]);

  const nearExpiryAlertsConfig = React.useMemo(() => ({
    title: t('settings.nearExpiryAlerts'),
    subtitle: t('settings.nearExpiryAlertsSubtitle'),
    icon: "alert-circle",
    value: nearExpiryAlerts,
    onValueChange: handleSetNearExpiryAlerts
  }), [t, nearExpiryAlerts, handleSetNearExpiryAlerts]);

  const expiredAlertsConfig = React.useMemo(() => ({
    title: t('settings.expiredAlerts'),
    subtitle: t('settings.expiredAlertsSubtitle'),
    icon: "close-circle",
    value: expiredAlerts,
    onValueChange: handleSetExpiredAlerts
  }), [t, expiredAlerts, handleSetExpiredAlerts]);

  const autoSuggestExpiryConfig = React.useMemo(() => ({
    title: t('settings.autoSuggestExpiry'),
    subtitle: t('settings.autoSuggestExpirySubtitle'),
    icon: "calendar",
    value: autoSuggestExpiry,
    onValueChange: handleSetAutoSuggestExpiry
  }), [t, autoSuggestExpiry, handleSetAutoSuggestExpiry]);

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle1, COLORS.gradientMiddle2, COLORS.gradientMiddle3, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={{ height: insets.top }} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
          <Text style={styles.subtitle}>{t('settings.subtitle')}</Text>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
          <View style={styles.card}>
            <SwitchItem {...enableNotificationsConfig} />
            <Divider />
            <SwitchItem {...dailyRemindersConfig} />
            <Divider />
            <SwitchItem {...nearExpiryAlertsConfig} />
            <View style={styles.dividerContainer}>
              <Divider />
            </View>
            <SwitchItem {...expiredAlertsConfig} />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          <View style={styles.card}>
            <SwitchItem {...autoSuggestExpiryConfig} />
            <Divider />
            <SettingItem
              title={t('settings.defaultNearExpiryDays')}
              subtitle={`${defaultNearExpiryDays} days`}
              icon="calendar-clock"
              onPress={() => console.log('Change default near expiry days')}
            />
            <Divider />
            <SettingItem
              title={t('settings.categories')}
              subtitle={t('settings.categoriesSubtitle')}
              icon="tag"
              onPress={() => setCategoriesModalVisible(true)}
            />
            <Divider />
            <SettingItem
              title={t('settings.units')}
              subtitle={t('settings.unitsSubtitle')}
              icon="ruler"
              onPress={() => setUnitsModalVisible(true)}
            />
            <Divider />
            <SettingItem
              title={t('settings.locations')}
              subtitle={t('settings.locationsSubtitle')}
              icon="map-marker"
              onPress={() => setLocationsModalVisible(true)}
            />
            <Divider />
            <LanguageSelector />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.dataManagement')}</Text>
          <View style={styles.card}>
            <SettingItem
              title={t('settings.exportData')}
              subtitle={t('settings.exportDataSubtitle')}
              icon="download"
              onPress={handleExportData}
            />
            <Divider />
            <SettingItem
              title={t('settings.importData')}
              subtitle={t('settings.importDataSubtitle')}
              icon="upload"
              onPress={() => console.log('Import data')}
            />
            <Divider />
            <SettingItem
              title={t('settings.clearAllData')}
              subtitle={t('settings.clearAllDataSubtitle')}
              icon="delete"
              onPress={() => Alert.alert(t('settings.clearAllData'), 'This will remove all your ingredients.')}
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.card}>
            <SettingItem
              title={t('settings.profile')}
              subtitle={isAuthenticated ? (user?.displayName || user?.email || '已登录') : t('settings.profileSubtitle')}
              icon="account"
              onPress={() => setProfileModalVisible(true)}
              right={(props) => (
                <View style={styles.profileRight}>
                  {isAuthenticated && (
                    <MaterialCommunityIcons 
                      name="check-circle" 
                      size={16} 
                      color={COLORS.success} 
                      style={styles.loginIndicator}
                    />
                  )}
                  <MaterialCommunityIcons 
                    {...props} 
                    name="chevron-right" 
                    size={24} 
                    color={COLORS.textSecondary} 
                  />
                </View>
              )}
            />
            <Divider />
            <SettingItem
              title={t('settings.privacyPolicy')}
              subtitle={t('settings.privacyPolicySubtitle')}
              icon="shield"
              onPress={() => setPrivacyModalVisible(true)}
            />
            <Divider />
            <SettingItem
              title={t('settings.termsOfService')}
              subtitle={t('settings.termsOfServiceSubtitle')}
              icon="file-document"
              onPress={() => setTermsModalVisible(true)}
            />
            <Divider />
            
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
          <View style={styles.card}>
            <SettingItem
              title={t('settings.version')}
              subtitle="1.0.0"
              icon="information"
            />
            <Divider />
            <SettingItem
              title={t('settings.support')}
              subtitle={t('settings.supportSubtitle')}
              icon="help-circle"
              onPress={() => setSupportModalVisible(true)}
            />
            <Divider />
            <SettingItem
              title={t('settings.rateApp')}
              subtitle={t('settings.rateAppSubtitle')}
              icon="star"
              onPress={() => console.log('Rate app')}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('settings.footerText')}
          </Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      {languageModalVisible && (
        <View style={styles.languageModal}>
          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>{t('settings.language')}</Text>
              <TouchableOpacity 
                onPress={() => setLanguageModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
                          <ScrollView style={styles.languageList}>
                {LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageItem,
                      currentLanguage === language.code && styles.languageItemSelected
                    ]}
                    onPress={() => {
                      setLanguage(language.code as LanguageCode);
                      setLanguageModalVisible(false);
                      // Language change implemented
                      Alert.alert(
                        t('common.success'),
                        `${t('settings.language')} ${t('common.success')}: ${language.nativeName}`,
                        [{ text: 'OK' }]
                      );
                    }}
                  >
                    <View style={styles.languageItemContent}>
                      <Text style={[
                        styles.languageItemText,
                        currentLanguage === language.code && styles.languageItemTextSelected
                      ]}>
                        {language.nativeName}
                      </Text>
                      <Text style={[
                        styles.languageItemSubtext,
                        currentLanguage === language.code && styles.languageItemSubtextSelected
                      ]}>
                        {language.name}
                      </Text>
                    </View>
                    {currentLanguage === language.code && (
                      <MaterialCommunityIcons 
                        name="check" 
                        size={24} 
                        color={COLORS.primary} 
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
          </View>
        </View>
      )}

      {/* Categories Manager */}
      {categoriesModalVisible && (
        <View style={styles.languageModal}>
          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>{t('settings.categories')}</Text>
              <TouchableOpacity onPress={() => setCategoriesModalVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                mode="outlined"
                placeholder={t('forms.categoryPlaceholder')}
                value={newCategory}
                onChangeText={setNewCategory}
                style={{ marginBottom: 12 }}
              />
              <Button mode="contained" onPress={handleAddCategory}>{t('common.add') || 'Add'}</Button>
            </View>
            <ScrollView style={styles.languageList}>
              {categories.map(c => (
                <View key={c.id} style={styles.languageItem}>
                  <Text style={styles.languageItemText}>{c.name}</Text>
                  <TouchableOpacity onPress={() => removeCategory(c.id)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Units Manager */}
      {unitsModalVisible && (
        <View style={styles.languageModal}>
          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>{t('settings.units')}</Text>
              <TouchableOpacity onPress={() => setUnitsModalVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                mode="outlined"
                placeholder={t('settings.units') + ' name'}
                value={newUnitName}
                onChangeText={setNewUnitName}
                style={{ marginBottom: 8 }}
              />
              <TextInput
                mode="outlined"
                placeholder={t('forms.unitPlaceholder')}
                value={newUnitAbbr}
                onChangeText={setNewUnitAbbr}
                style={{ marginBottom: 12 }}
              />
              <Button mode="contained" onPress={handleAddUnit}>{t('common.add') || 'Add'}</Button>
            </View>
            <ScrollView style={styles.languageList}>
              {units.map(u => (
                <View key={u.id} style={styles.languageItem}>
                  <Text style={styles.languageItemText}>{u.name} ({u.abbreviation})</Text>
                  <TouchableOpacity onPress={() => removeUnit(u.id)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Locations Manager */}
      {locationsModalVisible && (
        <View style={styles.languageModal}>
          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>{t('settings.locations')}</Text>
              <TouchableOpacity onPress={() => setLocationsModalVisible(false)} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 16 }}>
              <TextInput
                mode="outlined"
                placeholder={t('settings.locations')}
                value={newLocation}
                onChangeText={setNewLocation}
                style={{ marginBottom: 12 }}
              />
              <Button mode="contained" onPress={handleAddLocation}>{t('common.add') || 'Add'}</Button>
            </View>
            <ScrollView style={styles.languageList}>
              {locations.map(l => (
                <View key={l.id} style={styles.languageItem}>
                  <Text style={styles.languageItemText}>{l.name}</Text>
                  <TouchableOpacity onPress={() => removeLocation(l.id)}>
                    <MaterialCommunityIcons name="delete" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <ProfileScreen onClose={() => setProfileModalVisible(false)} />
      </Modal>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
      />

      {/* Support Modal */}
      <SupportModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    opacity: 0.8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    paddingHorizontal: 20,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    borderRadius: 24,
    elevation: 4,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  listItem: {
    paddingVertical: 6,
  },
  // SwitchItem 样式
  switchItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 72,
  },
  switchItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  switchItemIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  switchItemTextContainer: {
    flex: 1,
  },
  switchItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  switchItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dividerContainer: {
    paddingHorizontal: 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Language selector styles
  languageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  languageModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 300,
    paddingBottom: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  languageItemSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  languageItemContent: {
    flex: 1,
  },
  languageItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  languageItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  languageItemSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  languageItemSubtextSelected: {
    color: COLORS.primary,
  },
  profileRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginIndicator: {
    marginRight: 4,
  },
});
