import { Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';

export interface RatingResult {
    success: boolean;
    error?: string;
}

class AppRatingService {
    private static instance: AppRatingService;

    static getInstance(): AppRatingService {
        if (!AppRatingService.instance) {
            AppRatingService.instance = new AppRatingService();
        }
        return AppRatingService.instance;
    }

    /**
     * 获取应用商店评分链接
     */
    private getRatingUrl(): string {
        if (Platform.OS === 'ios') {
            // iOS App Store评分链接
            return `https://apps.apple.com/app/id6752112552?action=write-review`;
        } else {
            // Google Play Store评分链接
            return `https://play.google.com/store/apps/details?id=com.fridgy.app&showAllReviews=true`;
        }
    }

    /**
     * 获取应用商店链接（不直接跳转到评分页面）
     */
    private getStoreUrl(): string {
        if (Platform.OS === 'ios') {
            return 'https://apps.apple.com/app/6752112552';
        } else {
            return 'https://play.google.com/store/apps/details?id=com.fridgy.app';
        }
    }

    /**
     * 跳转到应用商店进行评分
     */
    async rateApp(): Promise<RatingResult> {
        try {
            const ratingUrl = this.getRatingUrl();
            console.log('Opening rating URL:', ratingUrl);

            const canOpen = await Linking.canOpenURL(ratingUrl);
            if (!canOpen) {
                // 如果无法打开评分链接，尝试打开应用商店主页
                return await this.openStore();
            }

            await Linking.openURL(ratingUrl);
            return { success: true };
        } catch (error) {
            console.error('Failed to open rating URL:', error);

            // 如果评分链接失败，尝试打开应用商店主页
            try {
                return await this.openStore();
            } catch (storeError) {
                console.error('Failed to open store URL:', storeError);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : '无法打开应用商店'
                };
            }
        }
    }

    /**
     * 打开应用商店主页
     */
    async openStore(): Promise<RatingResult> {
        try {
            const storeUrl = this.getStoreUrl();
            console.log('Opening store URL:', storeUrl);

            const canOpen = await Linking.canOpenURL(storeUrl);
            if (!canOpen) {
                return {
                    success: false,
                    error: '无法打开应用商店链接'
                };
            }

            await Linking.openURL(storeUrl);
            return { success: true };
        } catch (error) {
            console.error('Failed to open store URL:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '无法打开应用商店'
            };
        }
    }

    /**
     * 显示评分提示对话框
     */
    showRatingDialog(
        onRate: () => void,
        onLater: () => void,
        onNever: () => void,
        t?: (key: string) => string
    ): void {
        const title = t ? t('rating.dialogTitle') : '评价应用';
        const message = t ? t('rating.dialogMessage') : '如果您喜欢 Fridgy，请花一点时间在应用商店为我们评分。您的支持对我们很重要！';
        const laterText = t ? t('rating.later') : '稍后评价';
        const neverText = t ? t('rating.never') : '不再提醒';
        const rateText = t ? t('rating.rateNow') : '立即评价';

        Alert.alert(
            title,
            message,
            [
                {
                    text: laterText,
                    style: 'cancel',
                    onPress: onLater,
                },
                {
                    text: neverText,
                    style: 'destructive',
                    onPress: onNever,
                },
                {
                    text: rateText,
                    onPress: onRate,
                },
            ],
            { cancelable: true }
        );
    }

    /**
     * 显示评分成功提示
     */
    showRatingSuccessMessage(t?: (key: string) => string): void {
        const title = t ? t('rating.thankYou') : '感谢评价！';
        const message = t ? t('rating.thankYouMessage') : '感谢您为 Fridgy 评分！您的反馈对我们非常重要。';
        const buttonText = t ? t('rating.youreWelcome') : '不客气';

        Alert.alert(
            title,
            message,
            [{ text: buttonText }]
        );
    }

    /**
     * 显示评分失败提示
     */
    showRatingErrorMessage(error?: string, t?: (key: string) => string): void {
        const title = t ? t('rating.errorTitle') : '无法打开应用商店';
        const message = error || (t ? t('rating.errorMessage') : '无法打开应用商店进行评分。请手动前往应用商店搜索 "Fridgy" 进行评分。');
        const cancelText = t ? t('common.cancel') : '取消';
        const manualText = t ? t('rating.manualOpen') : '手动前往';

        Alert.alert(
            title,
            message,
            [
                { text: cancelText },
                {
                    text: manualText,
                    onPress: () => this.openStore()
                }
            ]
        );
    }
}

export const appRatingService = AppRatingService.getInstance();
