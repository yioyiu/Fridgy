import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { aiManager, CookingAdviceResult } from '@/services/ai/aiManager';
import { useI18n } from '@/utils/i18n';

interface CookingAdviceModalProps {
  visible: boolean;
  ingredients: string[];
  onClose: () => void;
}

export const CookingAdviceModal: React.FC<CookingAdviceModalProps> = ({
  visible,
  ingredients,
  onClose,
}) => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [adviceResult, setAdviceResult] = useState<CookingAdviceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scaleValue] = useState(new Animated.Value(0));
  const [contentHeight, setContentHeight] = useState<number>(300); // 动态高度

  useEffect(() => {
    if (visible && ingredients.length > 0) {
      setIsLoading(true);
      setAdviceResult(null);
      setError(null);
      getCookingAdvice();
      
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
  }, [visible, ingredients]);

  const getCookingAdvice = async () => {
    try {
      const result = await aiManager.getCookingAdvice(ingredients);
      if (result) {
        setAdviceResult(result);
        // 根据内容长度动态调整高度
        const adviceLength = result.advice.length;
        if (adviceLength > 800) {
          setContentHeight(500); // 长内容
        } else if (adviceLength > 400) {
          setContentHeight(400); // 中等内容
        } else {
          setContentHeight(320); // 短内容
        }
      } else {
        setError('无法获取烹饪建议，请稍后重试');
      }
    } catch (err) {
      setError('分析过程中出现错误');
      console.error('AI cooking advice error:', err);
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
            AI正在为您的食材生成烹饪建议...
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
          <TouchableOpacity style={styles.retryButton} onPress={getCookingAdvice}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (adviceResult) {
      return (
        <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.headerSection}>
            <MaterialCommunityIcons 
              name="chef-hat" 
              size={48} 
              color={COLORS.primary} 
            />
            <Text style={styles.resultTitle}>AI烹饪建议</Text>
            <View style={styles.sourceContainer}>
              <MaterialCommunityIcons 
                name="source-branch" 
                size={16} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.sourceText}>数据来源：{adviceResult.source}</Text>
            </View>
          </View>

          <View style={styles.ingredientsSection}>
            <Text style={styles.sectionTitle}>即将过期的食材</Text>
            <View style={styles.ingredientsList}>
              {adviceResult.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientTag}>
                  <MaterialCommunityIcons 
                    name="food-apple" 
                    size={16} 
                    color={COLORS.nearExpiry} 
                  />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.adviceSection}>
            <Text style={styles.sectionTitle}>烹饪建议</Text>
            <View style={styles.adviceContent}>
              <Text style={styles.adviceText}>{adviceResult.advice}</Text>
            </View>
          </View>

          <View style={styles.tipContainer}>
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.tipText}>
              建议根据实际情况和个人口味适当调整烹饪方法
            </Text>
          </View>
        </ScrollView>
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
              transform: [{ scale: scaleValue }],
              minHeight: Math.max(contentHeight, 300), // 使用动态高度
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI烹饪助手</Text>
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
    marginHorizontal: 20,
    maxHeight: '85%', // 增加最大高度限制
    minHeight: 300, // 保持最小高度
    maxWidth: 450, // 增加最大宽度
    width: '92%', // 稍微增加宽度
    alignSelf: 'center', // 确保居中
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flexShrink: 1, // 允许内容收缩
    minHeight: 200, // 确保有最小高度，防止加载时显示异常
  },
  loadingContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240, // 稍微增加最小高度
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  errorContainer: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 240, // 稍微增加最小高度
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontWeight: '600',
    fontSize: 16,
  },
  resultContainer: {
    flexGrow: 1, // 使用flexGrow而不flex，允许根据内容自适应
    maxHeight: '100%', // 限制最大高度
  },
  headerSection: {
    paddingVertical: 20, // 减少垂直内边距
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
    textAlign: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  sourceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  ingredientsSection: {
    paddingVertical: 14, // 减少垂直内边距
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.nearExpiry + '20',
    borderWidth: 1,
    borderColor: COLORS.nearExpiry,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ingredientText: {
    fontSize: 14,
    color: COLORS.nearExpiry,
    fontWeight: '500',
    marginLeft: 4,
  },
  adviceSection: {
    paddingVertical: 14, // 减少垂直内边距
    paddingHorizontal: 20,
  },
  adviceContent: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  adviceText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'left', // 确保左对齐
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16, // 减少底部内边距
    paddingTop: 6, // 减少顶部内边距
  },
  tipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 6,
    flex: 1,
    fontStyle: 'italic',
  },
});