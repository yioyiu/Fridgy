import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    ScrollView,
    Image,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
    onComplete: () => void;
}

interface OnboardingPage {
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
    features: string[];
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const { t } = useI18n();
    const [currentPage, setCurrentPage] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const pages: OnboardingPage[] = [
        {
            id: 1,
            title: t('onboarding.aiAnalysis.title'),
            description: t('onboarding.aiAnalysis.description'),
            icon: 'robot',
            color: '#FF6B6B',
            features: [
                t('onboarding.aiAnalysis.feature1'),
                t('onboarding.aiAnalysis.feature2'),
                t('onboarding.aiAnalysis.feature3'),
            ],
        },
        {
            id: 2,
            title: t('onboarding.smartInput.title'),
            description: t('onboarding.smartInput.description'),
            icon: 'auto-fix',
            color: '#4ECDC4',
            features: [
                t('onboarding.smartInput.feature1'),
                t('onboarding.smartInput.feature2'),
                t('onboarding.smartInput.feature3'),
            ],
        },
        {
            id: 3,
            title: t('onboarding.visualManagement.title'),
            description: t('onboarding.visualManagement.description'),
            icon: 'view-grid',
            color: '#45B7D1',
            features: [
                t('onboarding.visualManagement.feature1'),
                t('onboarding.visualManagement.feature2'),
                t('onboarding.visualManagement.feature3'),
            ],
        },
        {
            id: 4,
            title: t('onboarding.dataAnalysis.title'),
            description: t('onboarding.dataAnalysis.description'),
            icon: 'chart-line',
            color: '#96CEB4',
            features: [
                t('onboarding.dataAnalysis.feature1'),
                t('onboarding.dataAnalysis.feature2'),
                t('onboarding.dataAnalysis.feature3'),
            ],
        },
        {
            id: 5,
            title: t('onboarding.expiryHandling.title'),
            description: t('onboarding.expiryHandling.description'),
            icon: 'clock-alert',
            color: '#FFEAA7',
            features: [
                t('onboarding.expiryHandling.feature1'),
                t('onboarding.expiryHandling.feature2'),
                t('onboarding.expiryHandling.feature3'),
            ],
        },
        {
            id: 6,
            title: t('onboarding.batchImport.title'),
            description: t('onboarding.batchImport.description'),
            icon: 'upload-multiple',
            color: '#DDA0DD',
            features: [
                t('onboarding.batchImport.feature1'),
                t('onboarding.batchImport.feature2'),
                t('onboarding.batchImport.feature3'),
            ],
        },
    ];

    const handleNext = () => {
        if (currentPage < pages.length - 1) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            scrollViewRef.current?.scrollTo({
                x: nextPage * width,
                animated: true,
            });
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const handlePageChange = (event: any) => {
        const page = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentPage(page);
    };

    const renderPage = (page: OnboardingPage, index: number) => (
        <View key={page.id} style={styles.page}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: page.color }]}>
                    <MaterialCommunityIcons
                        name={page.icon as any}
                        size={80}
                        color="white"
                    />
                </View>

                <Text style={styles.title}>{page.title}</Text>
                <Text style={styles.description}>{page.description}</Text>

                <View style={styles.featuresContainer}>
                    {page.features.map((feature, featureIndex) => (
                        <View key={featureIndex} style={styles.featureItem}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={20}
                                color={page.color}
                                style={styles.featureIcon}
                            />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            {/* Skip Button */}
            <View style={styles.skipContainer}>
                <Button
                    mode="text"
                    onPress={handleSkip}
                    style={styles.skipButton}
                    labelStyle={styles.skipText}
                >
                    {t('onboarding.skip')}
                </Button>
            </View>

            {/* Pages */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handlePageChange}
                style={styles.scrollView}
            >
                {pages.map((page, index) => renderPage(page, index))}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomContainer}>
                {/* Page Indicators */}
                <View style={styles.indicatorContainer}>
                    {pages.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.indicator,
                                {
                                    backgroundColor: index === currentPage ? COLORS.primary : COLORS.border,
                                    width: index === currentPage ? 24 : 8,
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    {currentPage < pages.length - 1 ? (
                        <Button
                            mode="contained"
                            onPress={handleNext}
                            style={styles.nextButton}
                            labelStyle={styles.buttonText}
                            icon="arrow-right"
                        >
                            {t('onboarding.next')}
                        </Button>
                    ) : (
                        <Button
                            mode="contained"
                            onPress={handleNext}
                            style={styles.getStartedButton}
                            labelStyle={styles.buttonText}
                            icon="rocket-launch"
                        >
                            {t('onboarding.getStarted')}
                        </Button>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    skipContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
    },
    skipButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    skipText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    page: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    content: {
        alignItems: 'center',
        maxWidth: 320,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 34,
    },
    description: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    featuresContainer: {
        width: '100%',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    featureIcon: {
        marginRight: 12,
    },
    featureText: {
        flex: 1,
        fontSize: 15,
        color: COLORS.text,
        lineHeight: 22,
    },
    bottomContainer: {
        paddingHorizontal: 40,
        paddingBottom: 40,
        paddingTop: 20,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    indicator: {
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    buttonContainer: {
        width: '100%',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    getStartedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
