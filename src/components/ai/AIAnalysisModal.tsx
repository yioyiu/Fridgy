import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { aiManager, StorageAnalysisResult } from '@/services/ai/aiManager';
import { useI18n } from '@/utils/i18n';

interface AIAnalysisModalProps {
  visible: boolean;
  itemName: string;
  onClose: () => void;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  visible,
  itemName,
  onClose,
}) => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StorageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      setAnalysisResult(null);
      setError(null);
      analyzeItem();
      
      // 弹窗动画
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [visible, itemName]);

  const analyzeItem = async () => {
    try {
      const result = await aiManager.analyzeStorageTime(itemName);
      if (result) {
        setAnalysisResult(result);
      } else {
        setError(t('ai.analysisError'));
      }
    } catch (err) {
      setError(t('ai.processingError'));
      console.error('AI analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    Animated.spring(scaleValue, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      onClose();
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
          <Text style={styles.loadingSubtext}>
            {t('ai.analyzing')} "{itemName}" {t('ai.storageAnalysis')}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={48} 
            color={COLORS.error} 
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={analyzeItem}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (analysisResult) {
      return (
        <View style={styles.resultContainer}>
          <MaterialCommunityIcons 
            name="brain" 
            size={48} 
            color={COLORS.primary} 
          />
          <Text style={styles.resultTitle}>{t('ai.analysisResult')}</Text>
          <View style={styles.sourceContainer}>
            <MaterialCommunityIcons 
              name="source-branch" 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.sourceText}>{t('ai.dataSource')}：{analysisResult.source}</Text>
          </View>
          <View style={styles.resultContent}>
            <Text style={styles.resultText}>
              <Text style={styles.itemNameText}>"{analysisResult.item}"</Text>
              <Text> {t('ai.storageTime')} </Text>
              <Text style={styles.durationText}>"{analysisResult.duration}"</Text>
            </Text>
            <Text style={styles.resultText}>
              <Text>{t('ai.storageMethod')}：</Text>
              <Text style={styles.methodText}>{analysisResult.storageMethod}</Text>
            </Text>
          </View>
          <View style={styles.tipContainer}>
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.tipText}>{t('ai.recommendation')}</Text>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }]
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI {t('ai.storageTitle')}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons 
                name="close" 
                size={24} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            {renderContent()}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    minHeight: 120,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.textLight,
    fontWeight: '500',
  },
  resultContainer: {
    alignItems: 'center',
    gap: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultContent: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: COLORS.text,
  },
  itemNameText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  durationText: {
    fontWeight: '600',
    color: COLORS.success,
  },
  methodText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    textAlign: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
});