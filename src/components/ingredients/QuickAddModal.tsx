import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { IngredientFormData } from '@/utils/types/ingredient';
import { COLORS } from '@/utils/constants';
import { useSettingsStore } from '@/store/settings/slice';
import { useIngredientsStore } from '@/store/ingredients/slice';
import { useI18n } from '@/utils/i18n';
import { aiManager, LocationStorageAnalysisResult } from '@/services/ai/aiManager';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

export interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { addIngredient, isAdding, ingredients } = useIngredientsStore();
  const { t, currentLanguage } = useI18n();
  const { locations, autoSuggestExpiry } = useSettingsStore();

  // Helper function to get location name (no translation needed for custom locations)
  const getLocationName = (locationName: string) => {
    return locationName;
  };

  const [formData, setFormData] = useState<IngredientFormData>({
    name: '',
    category: '', // Keep for compatibility but not used
    quantity: 1,
    unit: '', // Keep for compatibility but not used
    purchase_date: new Date().toISOString().split('T')[0] || '',
    expiration_date: '', // Will be set by AI suggestion or user input
    location: '',
    images: [],
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStorageDatePicker, setShowStorageDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<LocationStorageAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 使用语音识别Hook
  const { isRecording, isProcessing, startRecording, stopRecording, lastResult } = useSpeechRecognition();

  // 处理语音识别结果
  React.useEffect(() => {
    if (lastResult) {
      handleInputChange('name', lastResult);
    }
  }, [lastResult]);

  // Get frequently used ingredients based on recent additions
  const getFrequentIngredients = () => {
    const ingredientCounts: Record<string, { count: number; lastUsed: string; defaultUnit: string; defaultLocation: string }> = {};

    // Count occurrences of each ingredient name
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      if (ingredientCounts[name]) {
        ingredientCounts[name].count++;
        // Keep the most recent usage date
        if (new Date(ingredient.created_at) > new Date(ingredientCounts[name].lastUsed)) {
          ingredientCounts[name].lastUsed = ingredient.created_at;
          ingredientCounts[name].defaultUnit = ingredient.unit;
          ingredientCounts[name].defaultLocation = ingredient.location;
        }
      } else {
        ingredientCounts[name] = {
          count: 1,
          lastUsed: ingredient.created_at,
          defaultUnit: ingredient.unit,
          defaultLocation: ingredient.location
        };
      }
    });

    // Sort by count and recency, return top 6
    return Object.entries(ingredientCounts)
      .filter(([_, data]) => data.count >= 2) // Only show ingredients used at least twice
      .sort((a, b) => {
        // Sort by count first, then by recency
        if (b[1].count !== a[1].count) {
          return b[1].count - a[1].count;
        }
        return new Date(b[1].lastUsed).getTime() - new Date(a[1].lastUsed).getTime();
      })
      .slice(0, 6)
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        count: data.count,
        defaultUnit: data.defaultUnit,
        defaultLocation: data.defaultLocation
      }));
  };

  const frequentIngredients = getFrequentIngredients();

  // 当自动建议功能被关闭时，清除AI建议状态
  useEffect(() => {
    if (!autoSuggestExpiry) {
      setAiSuggestion(null);
      setIsAnalyzing(false);
    }
  }, [autoSuggestExpiry]);

  const handleInputChange = (field: keyof IngredientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }


    // Trigger AI analysis when both name and location are filled and auto-suggest is enabled
    if (autoSuggestExpiry && (field === 'name' || field === 'location') && formData.name.trim() && value) {
      const name = field === 'name' ? value : formData.name;
      const location = field === 'location' ? value : formData.location;

      if (name.trim() && location) {
        analyzeStorageTime(name.trim(), location);
      }
    }
  };

  const analyzeStorageTime = async (itemName: string, location: string) => {
    if (!itemName.trim() || !location) return;

    setIsAnalyzing(true);
    setAiSuggestion(null);

    try {
      const result = await aiManager.analyzeLocationStorageTime(itemName, location);
      if (result) {
        setAiSuggestion(result);
      }
    } catch (error) {
      console.error('AI分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + aiSuggestion.suggestedDays);
      const expirationDateString = expirationDate.toISOString().split('T')[0] || '';

      setFormData(prev => ({
        ...prev,
        expiration_date: expirationDateString
      }));

      setAiSuggestion(null); // Hide suggestion after applying
    }
  };

  const fillFormWithFrequentIngredient = (ingredient: { name: string; defaultLocation: string }) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // Default 7 days
    const expirationDateString = expirationDate.toISOString().split('T')[0] || '';

    setFormData(prev => ({
      ...prev,
      name: ingredient.name,
      location: ingredient.defaultLocation,
      quantity: 1,
      purchase_date: new Date().toISOString().split('T')[0] || '',
      expiration_date: expirationDateString,
    }));

    // Clear any existing errors
    setErrors({});
  };

  const handleDateChange = (field: 'purchase_date' | 'expiration_date', event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStorageDatePicker(false);
      setShowExpirationDatePicker(false);

      // Handle Android date selection
      if (event.type === 'set' && selectedDate) {
        const dateString = selectedDate.toISOString().split('T')[0] || '';
        setFormData(prev => ({
          ...prev,
          [field]: dateString
        }));
      }
    } else {
      // iOS - just update the date, keep picker open
      if (selectedDate) {
        const dateString = selectedDate.toISOString().split('T')[0] || '';
        setFormData(prev => ({
          ...prev,
          [field]: dateString
        }));
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      // Format date as YYYY-MM-DD for better display
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return '';
    }
  };

  const renderDatePicker = (field: 'purchase_date' | 'expiration_date', show: boolean, onShow: () => void) => {
    const currentDate = formData[field] || new Date().toISOString().split('T')[0] || '';

    if (Platform.OS === 'ios') {
      return (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={onShow}
          >
            <Text style={styles.dateButtonText}>
              {formatDate(currentDate)}
            </Text>
          </TouchableOpacity>

          {show && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={show}
              onRequestClose={() => {
                if (field === 'purchase_date') setShowStorageDatePicker(false);
                else setShowExpirationDatePicker(false);
              }}
            >
              <TouchableOpacity
                style={styles.datePickerModal}
                activeOpacity={1}
                onPress={() => {
                  if (field === 'purchase_date') setShowStorageDatePicker(false);
                  else setShowExpirationDatePicker(false);
                }}
              >
                <TouchableOpacity
                  style={styles.datePickerContainer}
                  activeOpacity={1}
                  onPress={() => { }}
                >
                  <View style={styles.datePickerHeader}>
                    <Text style={styles.datePickerTitle}>
                      {field === 'purchase_date' ? 'Select Storage Date' : 'Select Expiration Date'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (field === 'purchase_date') setShowStorageDatePicker(false);
                        else setShowExpirationDatePicker(false);
                      }}
                      style={styles.datePickerDoneButton}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={new Date(currentDate)}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => handleDateChange(field, event, date)}
                    style={styles.datePicker}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            </Modal>
          )}
        </>
      );
    } else {
      // Android
      return (
        <>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={onShow}
          >
            <Text style={styles.dateButtonText}>
              {formatDate(currentDate)}
            </Text>
          </TouchableOpacity>

          {show && (
            <DateTimePicker
              value={new Date(currentDate)}
              mode="date"
              display="default"
              onChange={(event, date) => handleDateChange(field, event, date)}
            />
          )}
        </>
      );
    }
  };

  const handleSubmit = async () => {
    // Validation - Only name and location are required
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = t('forms.name');
    if (!formData.location) newErrors.location = t('forms.location');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await addIngredient(formData);
      if (result) {
        // Reset form
        setFormData({
          name: '',
          category: '',
          quantity: 1,
          unit: '',
          purchase_date: new Date().toISOString().split('T')[0] || '',
          expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
          location: '',
          images: [],
          notes: '',
        });
        setErrors({});
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 1,
      unit: '',
      purchase_date: new Date().toISOString().split('T')[0] || '',
      expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      location: '',
      images: [],
      notes: '',
    });
    setErrors({});
    onClose();
  };



  const renderLocationButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('forms.location')} *</Text>
      <View style={styles.buttonGrid}>
        {locations.map((location) => (
          <TouchableOpacity
            key={location.id}
            style={[
              styles.locationButton,
              formData.location === location.name && styles.locationButtonActive
            ]}
            onPress={() => handleInputChange('location', location.name)}
          >
            <Text style={[
              styles.locationButtonText,
              formData.location === location.name && styles.locationButtonTextActive
            ]}>
              {getLocationName(location.name)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
    </View>
  );

  const renderAiSuggestion = () => {
    // 如果自动建议功能被关闭，不显示AI建议
    if (!autoSuggestExpiry) {
      return null;
    }

    if (isAnalyzing) {
      return (
        <View style={styles.aiSuggestionCard}>
          <View style={styles.aiSuggestionHeader}>
            <Text style={styles.aiSuggestionTitle}>🤖 AI分析中...</Text>
          </View>
          <Text style={styles.aiSuggestionText}>正在分析存储期限...</Text>
        </View>
      );
    }

    if (aiSuggestion) {
      return (
        <View style={styles.aiSuggestionCard}>
          <View style={styles.aiSuggestionHeader}>
            <Text style={styles.aiSuggestionTitle}>🤖 AI建议</Text>
            <TouchableOpacity onPress={() => setAiSuggestion(null)} style={styles.aiCloseButton}>
              <Text style={styles.aiCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aiSuggestionText}>
            建议存储期限：{aiSuggestion.suggestedDays}天
          </Text>
          <Text style={styles.aiSuggestionReason}>{aiSuggestion.reason}</Text>
          <TouchableOpacity style={styles.applySuggestionButton} onPress={applyAiSuggestion}>
            <Text style={styles.applySuggestionButtonText}>采用建议</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const renderFrequentIngredients = () => {
    // For testing: show some default frequent ingredients if none exist
    const displayIngredients = frequentIngredients.length > 0 ? frequentIngredients : [
      { name: '牛奶', count: 3, defaultUnit: 'L', defaultLocation: 'Fridge' },
      { name: '鸡蛋', count: 2, defaultUnit: 'pc', defaultLocation: 'Fridge' },
      { name: '面包', count: 2, defaultUnit: 'pc', defaultLocation: 'Pantry' },
    ];

    if (displayIngredients.length === 0) return null;

    return (
      <View style={styles.frequentIngredientsSection}>
        <Text style={styles.frequentIngredientsTitle}>常用食材</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.frequentIngredientsScroll}
          contentContainerStyle={styles.frequentIngredientsContainer}
        >
          {displayIngredients.map((ingredient, index) => (
            <TouchableOpacity
              key={index}
              style={styles.frequentIngredientCard}
              onPress={() => fillFormWithFrequentIngredient(ingredient)}
            >
              <Text style={styles.frequentIngredientName}>{ingredient.name}</Text>
              <Text style={styles.frequentIngredientDetails}>
                {getLocationName(ingredient.defaultLocation)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('dashboard.addIngredient')}</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Frequent Ingredients */}
            {renderFrequentIngredients()}

            {/* Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('forms.name')} *</Text>
              <View style={styles.nameInputContainer}>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  error={!!errors.name}
                  style={[styles.input, styles.nameInput, { color: COLORS.text }]}
                  textColor={COLORS.text as any}
                  mode="outlined"
                  placeholder={t('forms.namePlaceholder')}
                  placeholderTextColor={COLORS.textSecondary}
                />
                <TouchableOpacity
                  style={[styles.voiceButton, isRecording && styles.voiceButtonRecording]}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={
                      isProcessing ? "loading" :
                        isRecording ? "microphone" : "microphone-outline"
                    }
                    size={20}
                    color={isRecording || isProcessing ? "#FFFFFF" : COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Location */}
            {renderLocationButtons()}

            {/* AI Storage Suggestion */}
            {renderAiSuggestion()}

            {/* Dates */}
            <View style={styles.row}>
              <View style={[styles.section, styles.halfWidth]}>
                <Text style={styles.sectionTitle}>{t('forms.purchaseDate') || 'Storage Date'}</Text>
                {renderDatePicker('purchase_date', showStorageDatePicker, () => setShowStorageDatePicker(true))}
              </View>

              <View style={[styles.section, styles.halfWidth]}>
                <Text style={styles.sectionTitle}>{t('forms.expiryDate')}</Text>
                {renderDatePicker('expiration_date', showExpirationDatePicker, () => setShowExpirationDatePicker(true))}
              </View>
            </View>



            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('forms.notes')}</Text>
              <TextInput
                value={formData.notes}
                onChangeText={(text) => handleInputChange('notes', text)}
                style={[styles.input, { color: COLORS.text }]}
                textColor={COLORS.text as any}
                mode="outlined"
                placeholder={t('forms.notesPlaceholder')}
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            disabled={isAdding}
          >
            {t('common.cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isAdding}
            disabled={isAdding}
            style={styles.submitButton}
          >
            {t('dashboard.addIngredient')}
          </Button>
        </View>
      </View>

    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundGreen,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  closeText: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 28,
    padding: 24,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 16,
    borderWidth: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  locationButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 0,
    backgroundColor: COLORS.surfaceVariant,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  locationButtonActive: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  locationButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  locationButtonTextActive: {
    color: COLORS.surface,
  },
  dateButton: {
    backgroundColor: COLORS.surfaceVariant,
    borderWidth: 0,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dateButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    width: '90%',
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  datePickerDoneButton: {
    padding: 8,
  },
  datePickerDoneText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  datePicker: {
    width: '100%',
    alignSelf: 'center',
  },
  aiSuggestionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  aiSuggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSuggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  aiCloseButton: {
    padding: 4,
  },
  aiCloseButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  aiSuggestionText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  aiSuggestionReason: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  applySuggestionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  applySuggestionButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  frequentIngredientsSection: {
    marginBottom: 12,
  },
  frequentIngredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginHorizontal: 24,
  },
  frequentIngredientsScroll: {
    marginHorizontal: 24,
  },
  frequentIngredientsContainer: {
    paddingRight: 24,
  },
  frequentIngredientCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    width: 80,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  frequentIngredientName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  frequentIngredientDetails: {
    fontSize: 9,
    color: COLORS.textSecondary,
    lineHeight: 11,
    textAlign: 'center',
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  voiceButtonRecording: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
    transform: [{ scale: 1.1 }],
  },
});
