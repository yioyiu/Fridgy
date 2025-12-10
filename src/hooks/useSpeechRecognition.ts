import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { useI18n } from '@/utils/i18n';
import { PermissionManager } from '@/services/permissions';
import { EnvironmentHelper } from '@/utils/helpers/environment';

export interface UseSpeechRecognitionReturn {
    isRecording: boolean;
    isProcessing: boolean;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    lastResult: string | null;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastResult, setLastResult] = useState<string | null>(null);
    const { currentLanguage } = useI18n();
    const recognitionRef = useRef<any>(null);
    const voiceModuleRef = useRef<any>(null);

    // 语言代码映射
    const getLanguageCode = (language: string): string => {
        const languageMap: Record<string, string> = {
            'zh': 'zh-CN',
            'en': 'en-US',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'it': 'it-IT',
            'pt': 'pt-BR',
            'ru': 'ru-RU',
            'ar': 'ar-SA',
            'hi': 'hi-IN',
        };
        return languageMap[language] || 'en-US';
    };

    useEffect(() => {
        // 检查浏览器是否支持Web Speech API
        if (Platform.OS === 'web' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.maxAlternatives = 1;

                recognitionRef.current.onstart = () => {
                    setIsRecording(true);
                    setIsProcessing(true);
                };

                recognitionRef.current.onresult = (event: any) => {
                    const result = event.results[0][0].transcript;
                    setLastResult(result);
                    setIsRecording(false);
                    setIsProcessing(false);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('语音识别错误:', event.error);
                    setIsRecording(false);
                    setIsProcessing(false);

                    let errorMessage = '语音识别失败';
                    switch (event.error) {
                        case 'no-speech':
                            errorMessage = '未检测到语音，请重试';
                            break;
                        case 'audio-capture':
                            errorMessage = '无法访问麦克风，请检查权限';
                            break;
                        case 'not-allowed':
                            errorMessage = '麦克风权限被拒绝，请在浏览器设置中允许麦克风访问';
                            break;
                        case 'network':
                            errorMessage = '网络错误，请检查网络连接';
                            break;
                        default:
                            errorMessage = `语音识别失败: ${event.error}`;
                    }

                    Alert.alert('语音识别失败', errorMessage);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                    setIsProcessing(false);
                };
            }
        }

        // 原生平台：按需加载并注册 @react-native-voice/voice 事件（避开 Expo Go）
        const setupNativeVoice = async () => {
            if (Platform.OS === 'web') return;
            if (EnvironmentHelper.isExpoGo()) {
                // 在 Expo Go 中不加载原生语音模块
                return;
            }
            try {
                const voice = await import('@react-native-voice/voice');
                voiceModuleRef.current = voice.default || voice;

                voiceModuleRef.current.onSpeechStart = () => {
                    setIsRecording(true);
                    setIsProcessing(true);
                };

                voiceModuleRef.current.onSpeechResults = (event: any) => {
                    const results = event.value || [];
                    const text = results[0] || '';
                    if (text) {
                        setLastResult(text);
                    }
                    setIsRecording(false);
                    setIsProcessing(false);
                };

                voiceModuleRef.current.onSpeechError = (event: any) => {
                    const message = event?.error?.message || '语音识别失败';
                    console.error('语音识别错误:', message);
                    setIsRecording(false);
                    setIsProcessing(false);
                    Alert.alert('语音识别失败', message);
                };

                voiceModuleRef.current.onSpeechEnd = () => {
                    setIsRecording(false);
                    setIsProcessing(false);
                };
            } catch (e) {
                console.warn('Failed to load @react-native-voice/voice. Speech features disabled.', e);
            }
        };

        setupNativeVoice();

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (Platform.OS !== 'web' && voiceModuleRef.current) {
                try { voiceModuleRef.current.destroy?.(); } catch { }
                try { voiceModuleRef.current.removeAllListeners?.(); } catch { }
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            // 首次使用时请求语音权限
            const speechPermission = await PermissionManager.checkSpeechPermission();
            if (!speechPermission.granted) {
                if (speechPermission.canAskAgain) {
                    // 显示权限说明并请求权限
                    PermissionManager.showPermissionExplanation(
                        'speech',
                        async () => {
                            const permissionResult = await PermissionManager.requestSpeechPermission();
                            if (permissionResult.granted) {
                                // 权限获得后继续录音
                                await startRecording();
                            } else {
                                PermissionManager.showPermissionSettingsGuide('speech');
                            }
                        },
                        () => {
                            console.log('Speech permission denied by user');
                        }
                    );
                    return;
                } else {
                    // 权限被永久拒绝，引导用户去设置
                    PermissionManager.showPermissionSettingsGuide('speech');
                    return;
                }
            }

            if (Platform.OS === 'web') {
                if (!recognitionRef.current) {
                    Alert.alert(
                        '语音识别不支持',
                        '您的浏览器不支持语音识别功能。请使用Chrome、Safari或Edge浏览器。',
                        [{ text: '确定' }]
                    );
                    return;
                }

                setLastResult(null);
                const languageCode = getLanguageCode(currentLanguage);
                recognitionRef.current.lang = languageCode;
                recognitionRef.current.start();
            } else {
                // 原生端调用语音识别
                if (EnvironmentHelper.isExpoGo()) {
                    Alert.alert(
                        'Expo Go 不支持语音识别',
                        '请使用开发构建或生产构建以启用语音识别功能。'
                    );
                    return;
                }
                setLastResult(null);
                const languageCode = getLanguageCode(currentLanguage);
                setIsRecording(true);
                setIsProcessing(true);
                try {
                    if (!voiceModuleRef.current) {
                        // 极端情况下尚未加载完成，再尝试加载一次
                        const voice = await import('@react-native-voice/voice');
                        voiceModuleRef.current = voice.default || voice;
                    }
                    await voiceModuleRef.current.start(languageCode);
                } catch (e: any) {
                    console.error('启动语音识别失败:', e?.message || e);
                    setIsRecording(false);
                    setIsProcessing(false);
                    Alert.alert('录音失败', '无法启动语音识别');
                }
            }
        } catch (error) {
            console.error('录音启动失败:', error);
            setIsRecording(false);
            setIsProcessing(false);
            Alert.alert('录音失败', '无法启动录音功能');
        }
    };

    const stopRecording = async () => {
        try {
            if (Platform.OS === 'web' && recognitionRef.current) {
                recognitionRef.current.stop();
            } else {
                if (EnvironmentHelper.isExpoGo()) {
                    setIsRecording(false);
                    setIsProcessing(false);
                    return;
                }
                try {
                    await voiceModuleRef.current?.stop?.();
                } catch (e) {
                    // 如果 stop 失败，尝试取消
                    try {
                        await voiceModuleRef.current?.cancel?.();
                    } catch (_) { }
                } finally {
                    setIsRecording(false);
                    setIsProcessing(false);
                }
            }
        } catch (error) {
            console.error('录音停止失败:', error);
            setIsRecording(false);
            setIsProcessing(false);
            Alert.alert('录音失败', '无法停止录音');
        }
    };

    return {
        isRecording,
        isProcessing,
        startRecording,
        stopRecording,
        lastResult,
    };
};
