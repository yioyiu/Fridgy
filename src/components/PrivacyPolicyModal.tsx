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

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
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
          <Text style={styles.title}>{t('settings.privacyPolicy')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lastUpdated}>{t('privacy.lastUpdated')}: {new Date().toLocaleDateString()}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. {t('privacy.introduction')}</Text>
            <Text style={styles.text}>
              {t('privacy.introductionText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. {t('privacy.informationWeCollect')}</Text>
            <Text style={styles.subsectionTitle}>2.1 {t('privacy.personalInformation')}</Text>
            <Text style={styles.text}>
              {t('privacy.personalInfoText')}
            </Text>
            
            <Text style={styles.subsectionTitle}>2.2 {t('privacy.ingredientData')}</Text>
            <Text style={styles.text}>
              {t('privacy.ingredientDataText')}
            </Text>
            
            <Text style={styles.subsectionTitle}>2.3 {t('privacy.usageData')}</Text>
            <Text style={styles.text}>
              {t('privacy.usageDataText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. {t('privacy.howWeUse')}</Text>
            <Text style={styles.text}>
              {t('privacy.howWeUseText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. {t('privacy.dataStorage')}</Text>
            <Text style={styles.subsectionTitle}>4.1 {t('privacy.localStorage')}</Text>
            <Text style={styles.text}>
              {t('privacy.localStorageText')}
            </Text>
            
            <Text style={styles.subsectionTitle}>4.2 {t('privacy.cloudStorage')}</Text>
            <Text style={styles.text}>
              {t('privacy.cloudStorageText')}
            </Text>
            
            <Text style={styles.subsectionTitle}>4.3 {t('privacy.securityMeasures')}</Text>
            <Text style={styles.text}>
              {t('privacy.securityMeasuresText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. {t('privacy.dataSharing')}</Text>
            <Text style={styles.text}>
              {t('privacy.dataSharingText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. {t('privacy.yourRights')}</Text>
            <Text style={styles.text}>
              {t('privacy.yourRightsText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. {t('privacy.dataRetention')}</Text>
            <Text style={styles.text}>
              {t('privacy.dataRetentionText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. {t('privacy.childrenPrivacy')}</Text>
            <Text style={styles.text}>
              {t('privacy.childrenPrivacyText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. {t('privacy.internationalTransfers')}</Text>
            <Text style={styles.text}>
              {t('privacy.internationalTransfersText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. {t('privacy.policyChanges')}</Text>
            <Text style={styles.text}>
              {t('privacy.policyChangesText')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. {t('privacy.contactInfo')}</Text>
            <Text style={styles.text}>
              {t('privacy.contactInfoText')}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {t('privacy.footer')}
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
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 20,
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
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  footer: {
    marginTop: 32,
    marginBottom: 40,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
