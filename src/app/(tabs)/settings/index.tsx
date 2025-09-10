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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { List, Divider, Button, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '@/utils/constants';
import { useI18n, SUPPORTED_LANGUAGES, type LanguageCode } from '@/utils/i18n';
import { useSettingsStore } from '@/store/settings/slice';
import { useIngredientsStore } from '@/store/ingredients/slice';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
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
  // 移除 onValueChange 的比较，因为函数引用可能会变化但功能相同
  return (
    prevProps.title === nextProps.title &&
    prevProps.subtitle === nextProps.subtitle &&
    prevProps.icon === nextProps.icon &&
    prevProps.value === nextProps.value
  );
});

// 创建独立的开关组件，避免相互影响
const EnableNotificationsSwitch = React.memo(() => {
  const { t } = useI18n();
  const value = useSettingsStore(state => state.notificationsEnabled);
  const setter = useSettingsStore(state => state.setNotificationsEnabled);
  
  return (
    <SwitchItem
      title={t('settings.enableNotifications')}
      subtitle={t('settings.notificationsSubtitle')}
      icon="bell"
      value={value}
      onValueChange={setter}
    />
  );
});

const DailyRemindersSwitch = React.memo(() => {
  const { t } = useI18n();
  const value = useSettingsStore(state => state.dailyReminders);
  const setter = useSettingsStore(state => state.setDailyReminders);
  
  return (
    <SwitchItem
      title={t('settings.dailyReminders')}
      subtitle={t('settings.dailyRemindersSubtitle')}
      icon="clock"
      value={value}
      onValueChange={setter}
    />
  );
});

const NearExpiryAlertsSwitch = React.memo(() => {
  const { t } = useI18n();
  const value = useSettingsStore(state => state.nearExpiryAlerts);
  const setter = useSettingsStore(state => state.setNearExpiryAlerts);
  
  return (
    <SwitchItem
      title={t('settings.nearExpiryAlerts')}
      subtitle={t('settings.nearExpiryAlertsSubtitle')}
      icon="alert-circle"
      value={value}
      onValueChange={setter}
    />
  );
});

const ExpiredAlertsSwitch = React.memo(() => {
  const { t } = useI18n();
  const value = useSettingsStore(state => state.expiredAlerts);
  const setter = useSettingsStore(state => state.setExpiredAlerts);
  
  return (
    <SwitchItem
      title={t('settings.expiredAlerts')}
      subtitle={t('settings.expiredAlertsSubtitle')}
      icon="close-circle"
      value={value}
      onValueChange={setter}
    />
  );
});

const AutoSuggestExpirySwitch = React.memo(() => {
  const { t } = useI18n();
  const value = useSettingsStore(state => state.autoSuggestExpiry);
  const setter = useSettingsStore(state => state.setAutoSuggestExpiry);
  
  return (
    <SwitchItem
      title={t('settings.autoSuggestExpiry')}
      subtitle={t('settings.autoSuggestExpirySubtitle')}
      icon="calendar"
      value={value}
      onValueChange={setter}
    />
  );
});

export default function SettingsScreen() {
  const { currentLanguage, setLanguage, t } = useI18n();
  const insets = useSafeAreaInsets();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [unitsModalVisible, setUnitsModalVisible] = useState(false);
  const [locationsModalVisible, setLocationsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const { ingredients, addIngredient } = useIngredientsStore();

  // 使用选择器来避免不必要的重新渲染
  const defaultNearExpiryDays = useSettingsStore(state => state.defaultNearExpiryDays);
  const dailyReminderTime = useSettingsStore(state => state.dailyReminderTime);
  
  const { 
    categories, 
    units, 
    locations, 
    addCategory, 
    removeCategory, 
    addUnit, 
    removeUnit, 
    addLocation, 
    removeLocation,
    setDefaultNearExpiryDays,
    setDailyReminderTime
  } = useSettingsStore();

  const [newCategory, setNewCategory] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitAbbr, setNewUnitAbbr] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());


  const handleSetDailyReminderTime = React.useCallback(async (time: { hour: number; minute: number }) => {
    console.log('Setting daily reminder time:', time);
    try {
      await setDailyReminderTime(time);
    } catch (error) {
      console.error('Failed to update daily reminder time:', error);
    }
  }, [setDailyReminderTime]);

  const handleTimePickerOpen = React.useCallback(() => {
    // 设置当前时间为当前设置的时间
    const currentTime = new Date();
    currentTime.setHours(dailyReminderTime.hour, dailyReminderTime.minute, 0, 0);
    setSelectedTime(currentTime);
    setTimePickerVisible(true);
  }, [dailyReminderTime]);

  const handleTimeChange = React.useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setTimePickerVisible(false);
    }
    
    if (selectedDate) {
      setSelectedTime(selectedDate);
      if (Platform.OS === 'ios') {
        // iOS上不立即关闭，让用户确认
      } else {
        // Android上立即保存
        handleSetDailyReminderTime({
          hour: selectedDate.getHours(),
          minute: selectedDate.getMinutes()
        });
      }
    }
  }, [handleSetDailyReminderTime]);

  const handleTimeConfirm = React.useCallback(() => {
    setTimePickerVisible(false);
    handleSetDailyReminderTime({
      hour: selectedTime.getHours(),
      minute: selectedTime.getMinutes()
    });
  }, [selectedTime, handleSetDailyReminderTime]);

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


  const handleDownloadTemplate = async () => {
    try {
      // 生成导入模板CSV内容
      const csvHeaders = [
        '名称',
        '分类',
        '数量',
        '单位',
        '存放日期',
        '过期日期',
        '位置',
        '备注'
      ].join(',');

      // 添加示例数据
      const exampleRows = [
        [
          '"苹果"',
          '"水果"',
          '5',
          '"个"',
          '"2024-01-01"',
          '"2024-01-15"',
          '"冰箱"',
          '"新鲜苹果"'
        ].join(','),
        [
          '"牛奶"',
          '"乳制品"',
          '1',
          '"升"',
          '"2024-01-02"',
          '"2024-01-10"',
          '"冰箱"',
          '""'
        ].join(','),
        [
          '"大米"',
          '"谷物"',
          '2',
          '"千克"',
          '"2024-01-01"',
          '"2025-01-01"',
          '"储物柜"',
          '"优质大米"'
        ].join(',')
      ];

      const csvContent = [csvHeaders, ...exampleRows].join('\n');

      // 生成文件名
      const fileName = 'pantry_import_template.csv';

      // 保存文件
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 显示成功消息
      Alert.alert(
        t('common.success'),
        `导入模板已下载：${fileName}\n\n请按照模板格式填写数据，然后使用导入功能。`,
        [{ text: t('common.ok') }]
      );

    } catch (error) {
      console.error('Template download error:', error);
      Alert.alert(
        t('common.error'),
        t('settings.templateDownloadError'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleImportData = async () => {
    try {
      // 选择文件
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      if (!file) {
        Alert.alert(t('common.error'), '无法读取选择的文件。', [{ text: t('common.ok') }]);
        return;
      }
      
      // 读取文件内容
      const fileContent = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 解析CSV
      const lines = fileContent.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        Alert.alert(
          t('common.error'),
          t('settings.invalidCSVFormat'),
          [{ text: t('common.ok') }]
        );
        return;
      }

      // 解析标题行
      const headers = lines[0]?.split(',').map(h => h.replace(/"/g, '').trim()) || [];
      const expectedHeaders = ['名称', '分类', '数量', '单位', '存放日期', '过期日期', '位置', '备注'];
      
      // 验证标题
      const isValidHeaders = expectedHeaders.every(header => headers.includes(header));
      if (!isValidHeaders) {
        Alert.alert(
          t('common.error'),
          `CSV文件标题不正确。\n\n期望的标题：${expectedHeaders.join(', ')}\n\n请下载模板文件查看正确格式。`,
          [{ text: t('common.ok') }]
        );
        return;
      }

      // 解析数据行
      const dataRows = lines.slice(1);
      const importedIngredients = [];
      const errors = [];

      for (let i = 0; i < dataRows.length; i++) {
        try {
          const row = dataRows[i];
          if (!row) {
            errors.push(`第${i + 2}行：空行`);
            continue;
          }
          
          const values = parseCSVRow(row);
          
          if (values.length !== expectedHeaders.length) {
            errors.push(`第${i + 2}行：列数不匹配`);
            continue;
          }

          // 创建食材对象
          const ingredient = {
            name: values[0] || '',
            category: values[1] || '其他',
            quantity: parseFloat(values[2] || '0') || 0,
            unit: values[3] || '个',
            purchase_date: values[4] || new Date().toISOString().split('T')[0]!,
            expiration_date: values[5] || new Date().toISOString().split('T')[0]!,
            location: values[6] || '储物柜',
            notes: values[7] || '',
            images: [], // 添加必需的images字段
          };

          // 验证必填字段
          if (!ingredient.name) {
            errors.push(`第${i + 2}行：名称为空`);
            continue;
          }

          if (ingredient.quantity <= 0) {
            errors.push(`第${i + 2}行：数量必须大于0`);
            continue;
          }

          importedIngredients.push(ingredient);
        } catch (error) {
          errors.push(`第${i + 2}行：数据格式错误`);
        }
      }

      // 显示导入结果
      if (errors.length > 0) {
        Alert.alert(
          t('settings.importCompletedWithErrors'),
          `成功导入：${importedIngredients.length}个食材\n错误：${errors.length}个\n\n错误详情：\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...' : ''}`,
          [{ text: t('common.ok') }]
        );
      } else {
        Alert.alert(
          t('common.success'),
          `成功导入${importedIngredients.length}个食材！`,
          [{ text: t('common.ok') }]
        );
      }

      // 添加导入的食材
      for (const ingredient of importedIngredients) {
        await addIngredient(ingredient);
      }

    } catch (error) {
      console.error('Import error:', error);
      Alert.alert(
        t('common.error'),
        t('settings.importDataError'),
        [{ text: t('common.ok') }]
      );
    }
  };

  // CSV行解析函数
  const parseCSVRow = (row: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleExportData = async () => {
    try {
      // 检查是否有数据可导出
      if (ingredients.length === 0) {
        Alert.alert(
          t('common.error'),
          '没有数据可导出。请先添加一些食材。',
          [{ text: t('common.ok') }]
        );
        return;
      }

      // 生成CSV内容
      const csvHeaders = [
        '名称',
        '分类',
        '数量',
        '单位',
        '存放日期',
        '过期日期',
        '位置',
        '状态',
        '备注',
        '创建时间',
        '更新时间'
      ].join(',');

      const csvRows = ingredients.map(ingredient => [
        `"${ingredient.name}"`,
        `"${ingredient.category}"`,
        ingredient.quantity,
        `"${ingredient.unit}"`,
        `"${ingredient.purchase_date}"`,
        `"${ingredient.expiration_date}"`,
        `"${ingredient.location}"`,
        `"${ingredient.status}"`,
        `"${ingredient.notes || ''}"`,
        `"${ingredient.created_at}"`,
        `"${ingredient.updated_at}"`
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      // 生成文件名
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `pantry_export_${timestamp}.csv`;

      // 保存文件
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 显示成功消息
      Alert.alert(
        t('common.success'),
        `数据已成功导出到：${fileName}\n\n文件已保存到应用目录，您可以通过文件管理器访问。`,
        [{ text: t('common.ok') }]
      );

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        t('common.error'),
        '导出数据时发生错误。请重试。',
        [{ text: t('common.ok') }]
      );
    }
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


  const dailyReminderTimeConfig = React.useMemo(() => ({
    title: t('settings.dailyReminderTime'),
    subtitle: `${dailyReminderTime.hour.toString().padStart(2, '0')}:${dailyReminderTime.minute.toString().padStart(2, '0')}`,
    icon: "clock-outline",
    onPress: handleTimePickerOpen
  }), [dailyReminderTime, handleTimePickerOpen]);

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
            <EnableNotificationsSwitch />
            <Divider />
            <DailyRemindersSwitch />
            <Divider />
            <SettingItem key="dailyReminderTime" {...dailyReminderTimeConfig} />
            <Divider />
            <NearExpiryAlertsSwitch />
            <View style={styles.dividerContainer}>
              <Divider />
            </View>
            <ExpiredAlertsSwitch />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
          <View style={styles.card}>
            <AutoSuggestExpirySwitch />
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
              title={t('settings.downloadTemplate')}
              subtitle={t('settings.downloadTemplateSubtitle')}
              icon="file-download"
              onPress={handleDownloadTemplate}
            />
            <Divider />
            <SettingItem
              title={t('settings.importData')}
              subtitle={t('settings.importDataSubtitle')}
              icon="upload"
              onPress={handleImportData}
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

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.legal')}</Text>
          <View style={styles.card}>
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

      {/* Time Picker Modal */}
      {timePickerVisible && (
        <Modal
          visible={timePickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={styles.timePickerOverlay}>
            <View style={styles.timePickerContainer}>
              <View style={styles.timePickerHeader}>
                <Text style={styles.timePickerTitle}>{t('settings.dailyReminderTime')}</Text>
                <TouchableOpacity onPress={() => setTimePickerVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={selectedTime}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.timePicker}
              />
              
              {Platform.OS === 'ios' && (
                <View style={styles.timePickerButtons}>
                  <TouchableOpacity 
                    style={styles.timePickerButton}
                    onPress={() => setTimePickerVisible(false)}
                  >
                    <Text style={styles.timePickerButtonText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.timePickerButton, styles.timePickerButtonPrimary]}
                    onPress={handleTimeConfirm}
                  >
                    <Text style={[styles.timePickerButtonText, styles.timePickerButtonTextPrimary]}>
                      {t('common.save')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
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
  // Time picker styles
  timePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '85%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  timePicker: {
    height: 200,
    marginVertical: 20,
  },
  timePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  timePickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  timePickerButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  timePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  timePickerButtonTextPrimary: {
    color: COLORS.surface,
  },
});
