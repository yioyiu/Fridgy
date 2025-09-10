import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useI18n();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);


  const handleBugReport = () => {
    const email = t('support.contactEmailAddress');
    const subject = encodeURIComponent('Bug Report');
    const body = encodeURIComponent('Please describe the bug you encountered:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n\nDevice info:\n- OS: \n- App version: ');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open email client');
      }
    });
  };

  const handleFeatureRequest = () => {
    const email = t('support.contactEmailAddress');
    const subject = encodeURIComponent('Feature Request');
    const body = encodeURIComponent('Please describe the feature you would like to see:\n\nFeature description:\n\nWhy would this be useful:\n\nAdditional notes:');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open email client');
      }
    });
  };

  const handleFeedback = () => {
    const email = t('support.contactEmailAddress');
    const subject = encodeURIComponent('General Feedback');
    const body = encodeURIComponent('Please share your thoughts and suggestions:');
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open email client');
      }
    });
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    { q: t('support.faqQ1'), a: t('support.faqA1') },
    { q: t('support.faqQ2'), a: t('support.faqA2') },
    { q: t('support.faqQ3'), a: t('support.faqA3') },
    { q: t('support.faqQ4'), a: t('support.faqA4') },
    { q: t('support.faqQ5'), a: t('support.faqA5') },
  ];

  const troubleshootingItems = [
    { issue: t('support.issue1'), solution: t('support.solution1') },
    { issue: t('support.issue2'), solution: t('support.solution2') },
    { issue: t('support.issue3'), solution: t('support.solution3') },
    { issue: t('support.issue4'), solution: t('support.solution4') },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.support')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support.faq')}</Text>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={styles.faqQuestionText}>{item.q}</Text>
                  <MaterialCommunityIcons
                    name={expandedFaq === index ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{item.a}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support.contactUs')}</Text>
            
            <TouchableOpacity style={styles.contactItem} onPress={handleBugReport}>
              <MaterialCommunityIcons name="bug" size={24} color={COLORS.error} />
              <View style={styles.contactItemContent}>
                <Text style={styles.contactItemTitle}>{t('support.reportBug')}</Text>
                <Text style={styles.contactItemSubtitle}>{t('support.reportBugText')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleFeatureRequest}>
              <MaterialCommunityIcons name="lightbulb" size={24} color={COLORS.warning} />
              <View style={styles.contactItemContent}>
                <Text style={styles.contactItemTitle}>{t('support.featureRequest')}</Text>
                <Text style={styles.contactItemSubtitle}>{t('support.featureRequestText')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactItem} onPress={handleFeedback}>
              <MaterialCommunityIcons name="message-text" size={24} color={COLORS.success} />
              <View style={styles.contactItemContent}>
                <Text style={styles.contactItemTitle}>{t('support.feedback')}</Text>
                <Text style={styles.contactItemSubtitle}>{t('support.feedbackText')}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.responseTime}>
              <MaterialCommunityIcons name="clock" size={16} color={COLORS.textSecondary} />
              <Text style={styles.responseTimeText}>{t('support.responseTime')}</Text>
            </View>
          </View>

          {/* Troubleshooting Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support.troubleshooting')}</Text>
            <Text style={styles.sectionSubtitle}>{t('support.troubleshootingText')}</Text>
            
            {troubleshootingItems.map((item, index) => (
              <View key={index} style={styles.troubleshootingItem}>
                <View style={styles.troubleshootingHeader}>
                  <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.error} />
                  <Text style={styles.troubleshootingIssue}>{item.issue}</Text>
                </View>
                <View style={styles.troubleshootingSolution}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
                  <Text style={styles.troubleshootingSolutionText}>{item.solution}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Resources Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('support.resources')}</Text>
            
            <View style={styles.resourceItem}>
              <MaterialCommunityIcons name="book-open" size={24} color={COLORS.primary} />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{t('support.userGuide')}</Text>
                <Text style={styles.resourceSubtitle}>{t('support.userGuideText')}</Text>
              </View>
            </View>

            <View style={styles.resourceItem}>
              <MaterialCommunityIcons name="play-circle" size={24} color={COLORS.primary} />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{t('support.videoTutorials')}</Text>
                <Text style={styles.resourceSubtitle}>{t('support.videoTutorialsText')}</Text>
              </View>
            </View>

            <View style={styles.resourceItem}>
              <MaterialCommunityIcons name="account-group" size={24} color={COLORS.primary} />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{t('support.community')}</Text>
                <Text style={styles.resourceSubtitle}>{t('support.communityText')}</Text>
              </View>
            </View>
          </View>

          {/* Thank You Section */}
          <View style={styles.thankYouSection}>
            <MaterialCommunityIcons name="heart" size={32} color={COLORS.primary} />
            <Text style={styles.thankYouTitle}>{t('support.thankYou')}</Text>
            <Text style={styles.thankYouText}>{t('support.thankYouText')}</Text>
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  faqAnswerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  contactItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  contactItemSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  contactItemEmail: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  responseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
  responseTimeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  troubleshootingItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  troubleshootingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  troubleshootingIssue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  troubleshootingSolution: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  troubleshootingSolutionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  resourceContent: {
    flex: 1,
    marginLeft: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  thankYouSection: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
    marginBottom: 32,
  },
  thankYouTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  thankYouText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
