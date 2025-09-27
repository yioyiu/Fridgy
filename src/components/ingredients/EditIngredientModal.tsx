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
import { Ingredient, IngredientFormData } from '@/utils/types/ingredient';
import { COLORS } from '@/utils/constants';
import { useSettingsStore } from '@/store/settings/slice';
import { useIngredientsStore } from '@/store/ingredients/slice';
import { useI18n } from '@/utils/i18n';

export interface EditIngredientModalProps {
  visible: boolean;
  ingredient: Ingredient | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  visible,
  ingredient,
  onClose,
  onSuccess,
}) => {
  const { updateIngredient, isUpdating } = useIngredientsStore();
  const { locations } = useSettingsStore();
  const { t } = useI18n();



  // Helper function to get location name (no translation needed for custom locations)
  const getLocationName = (locationName: string) => {
    return locationName;
  };

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

  // Initialize form data when ingredient changes
  useEffect(() => {
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        category: ingredient.category,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        purchase_date: ingredient.purchase_date,
        expiration_date: ingredient.expiration_date,
        location: ingredient.location,
        images: ingredient.images || [],
        notes: ingredient.notes || '',
      });
      setErrors({});
    }
  }, [ingredient]);

  const handleInputChange = (field: keyof IngredientFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

    const parseISODate = (iso: string): Date => {
      if (!iso) return new Date();
      // Safely parse YYYY-MM-DD to avoid platform-specific parsing issues
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        return new Date(y, mo, d, 12, 0, 0);
      }
      const fallback = new Date(iso);
      return isNaN(fallback.getTime()) ? new Date() : fallback;
    };

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
                      {field === 'purchase_date' ? t('forms.purchaseDate') : t('forms.expiryDate')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (field === 'purchase_date') setShowStorageDatePicker(false);
                        else setShowExpirationDatePicker(false);
                      }}
                      style={styles.datePickerDoneButton}
                    >
                      <Text style={styles.datePickerDoneText}>{t('common.confirm')}</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={parseISODate(currentDate)}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => handleDateChange(field, event, date)}
                    style={styles.datePicker}
                    // iOS 14+ forces compact by default; this enforces wheel style
                    {...({ preferredDatePickerStyle: 'wheels' } as any)}
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
              value={parseISODate(currentDate)}
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
    if (!ingredient) return;

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('forms.name') + ' ' + t('common.error');
    }
    if (!formData.location) {
      newErrors.location = t('forms.location') + ' ' + t('common.error');
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = t('forms.quantity') + ' must be greater than 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await updateIngredient(ingredient.id, formData);
      if (result) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to update ingredient. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset form to original ingredient data
    if (ingredient) {
      setFormData({
        name: ingredient.name,
        category: ingredient.category,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        purchase_date: ingredient.purchase_date,
        expiration_date: ingredient.expiration_date,
        location: ingredient.location,
        images: ingredient.images || [],
        notes: ingredient.notes || '',
      });
    }
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

  if (!ingredient) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('common.edit')} {t('dashboard.title')}</Text>
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



            {/* Location */}
            {renderLocationButtons()}

            {/* Dates */}
            <View style={styles.row}>
              <View style={[styles.section, styles.halfWidth]}>
                <Text style={styles.sectionTitle}>{t('forms.purchaseDate')}</Text>
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
            disabled={isUpdating}
          >
            {t('common.cancel')}
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isUpdating}
            disabled={isUpdating}
            style={styles.submitButton}
          >
            {t('common.save')}
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
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
    gap: 8,
  },
  locationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  locationButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  locationButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  locationButtonTextActive: {
    color: COLORS.surface,
  },
  dateButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
