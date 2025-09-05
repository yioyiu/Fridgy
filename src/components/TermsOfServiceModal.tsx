import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useI18n();
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.termsOfService')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>{t('terms.lastUpdated')}: {new Date().toLocaleDateString()}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. {t('terms.introduction')}</Text>
            <Text style={styles.text}>
              {t('terms.introductionText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. {t('terms.acceptance')}</Text>
            <Text style={styles.text}>
              {t('terms.acceptanceText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. {t('terms.description')}</Text>
            <Text style={styles.text}>
              {t('terms.descriptionText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. {t('terms.userAccounts')}</Text>
            <Text style={styles.text}>
              {t('terms.userAccountsText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. {t('terms.acceptableUse')}</Text>
            <Text style={styles.text}>
              {t('terms.acceptableUseText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. {t('terms.intellectualProperty')}</Text>
            <Text style={styles.text}>
              {t('terms.intellectualPropertyText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. {t('terms.privacy')}</Text>
            <Text style={styles.text}>
              {t('terms.privacyText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. {t('terms.termination')}</Text>
            <Text style={styles.text}>
              {t('terms.terminationText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. {t('terms.disclaimers')}</Text>
            <Text style={styles.text}>
              {t('terms.disclaimersText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. {t('terms.limitations')}</Text>
            <Text style={styles.text}>
              {t('terms.limitationsText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. {t('terms.governingLaw')}</Text>
            <Text style={styles.text}>
              {t('terms.governingLawText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>12. {t('terms.changes')}</Text>
            <Text style={styles.text}>
              {t('terms.changesText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>13. {t('terms.contact')}</Text>
            <Text style={styles.text}>
              {t('terms.contactText')}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('terms.footer')}
            </Text>
          </View>
        </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  footer: {
    marginTop: 32,
    marginBottom: 32,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    fontWeight: '500',
  },
});
