import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import { useI18n } from '@/utils/i18n';
import { PermissionManager } from '@/services/permissions';

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

                    Alert.alert(
                        '语音识别成功',
                        `识别结果: ${result}`,
                        [{ text: '确定' }]
                    );
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

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
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
                // 移动端使用模拟功能
                Alert.alert(
                    '语音识别提示',
                    '在移动端，语音识别功能需要开发构建版本才能正常工作。\n\n当前为演示模式，请手动输入食材名称。',
                    [
                        {
                            text: '模拟识别',
                            onPress: () => {
                                setTimeout(() => {
                                    const mockResults: Record<string, string[]> = {
                                        'zh': ['苹果', '香蕉', '橙子', '葡萄', '草莓'],
                                        'en': ['apple', 'banana', 'orange', 'grape', 'strawberry'],
                                        'es': ['manzana', 'plátano', 'naranja', 'uva', 'fresa'],
                                        'fr': ['pomme', 'banane', 'orange', 'raisin', 'fraise'],
                                    };

                                    const results = mockResults[currentLanguage] || mockResults['en'];
                                    if (results && results.length > 0) {
                                        const randomResult = results[Math.floor(Math.random() * results.length)];
                                        if (randomResult) {
                                            setLastResult(randomResult);
                                        }

                                        Alert.alert(
                                            '模拟识别成功',
                                            `识别结果: ${randomResult}`,
                                            [{ text: '确定' }]
                                        );
                                    }
                                    setIsRecording(false);
                                    setIsProcessing(false);
                                }, 2000);
                            }
                        },
                        {
                            text: '取消',
                            onPress: () => {
                                setIsRecording(false);
                                setIsProcessing(false);
                            }
                        }
                    ]
                );
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
                setIsRecording(false);
                setIsProcessing(false);
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
