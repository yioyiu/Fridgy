import React, { useState } from 'react';
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
  const { addIngredient, isAdding } = useIngredientsStore();
  const { t } = useI18n();
  const { categories, units, locations } = useSettingsStore();
  
  const [formData, setFormData] = useState<IngredientFormData>({
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStorageDatePicker, setShowStorageDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);

  const handleInputChange = (field: keyof IngredientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-set expiration date based on category
    if (field === 'category' && value) {
      const category = categories.find(cat => cat.name === value);
      if (category) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + category.default_shelf_life_days);
        const expirationDateString = expirationDate.toISOString().split('T')[0] || '';
        setFormData(prev => ({
          ...prev,
          expiration_date: expirationDateString
        }));
      }
    }
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
                  onPress={() => {}}
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
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = t('forms.name');
    if (!formData.category) newErrors.category = t('forms.category');
    if (!formData.unit) newErrors.unit = t('forms.unit');
    if (!formData.location) newErrors.location = t('forms.location');
    if (formData.quantity <= 0) newErrors.quantity = t('forms.quantity');

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

  const renderCategoryButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('forms.category')} *</Text>
      <View style={styles.buttonGrid}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              formData.category === category.name && styles.categoryButtonActive
            ]}
            onPress={() => handleInputChange('category', category.name)}
          >
            <Text style={[
              styles.categoryButtonText,
              formData.category === category.name && styles.categoryButtonTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
    </View>
  );

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
              {location.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
    </View>
  );

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
            {/* Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('forms.name')} *</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                error={!!errors.name}
                style={[styles.input, { color: COLORS.text }]}
                textColor={COLORS.text as any}
                mode="outlined"
                placeholder={t('forms.namePlaceholder')}
                placeholderTextColor={COLORS.textSecondary}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Category */}
            {renderCategoryButtons()}

            {/* Quantity and Unit */}
            <View style={styles.row}>
              <View style={[styles.section, styles.halfWidth]}>
                <Text style={styles.sectionTitle}>{t('forms.quantity')} *</Text>
                <TextInput
                  value={formData.quantity.toString()}
                  onChangeText={(text) => handleInputChange('quantity', parseFloat(text) || 0)}
                  error={!!errors.quantity}
                  style={[styles.input, { color: COLORS.text }]}
                  textColor={COLORS.text as any}
                  mode="outlined"
                  placeholder={t('forms.quantityPlaceholder')}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType="numeric"
                />
                {errors.quantity && <Text style={styles.errorText}>{errors.quantity}</Text>}
              </View>

              <View style={[styles.section, styles.halfWidth]}>
                <Text style={styles.sectionTitle}>{t('forms.unit')} *</Text>
                <View style={styles.unitDropdown}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit.id}
                      style={[
                        styles.unitButton,
                        formData.unit === unit.abbreviation && styles.unitButtonActive
                      ]}
                      onPress={() => handleInputChange('unit', unit.abbreviation)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        formData.unit === unit.abbreviation && styles.unitButtonTextActive
                      ]}>
                        {unit.abbreviation}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.unit && <Text style={styles.errorText}>{errors.unit}</Text>}
              </View>
            </View>

            {/* Location */}
            {renderLocationButtons()}

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
  categoryButton: {
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
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: COLORS.surface,
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
  unitDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: COLORS.surfaceVariant,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  unitButtonActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  unitButtonText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  unitButtonTextActive: {
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
});
