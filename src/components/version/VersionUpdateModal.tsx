import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Linking,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useI18n } from '@/utils/i18n';
import { VersionInfo } from '@/services/version/versionChecker';

interface VersionUpdateModalProps {
    visible: boolean;
    versionInfo: VersionInfo | null;
    onUpdate: () => void;
    onDismiss: () => void;
    isForceUpdate?: boolean;
}

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
    visible,
    versionInfo,
    onUpdate,
    onDismiss,
    isForceUpdate = false,
}) => {
    const { t } = useI18n();

    const handleUpdate = async () => {
        if (!versionInfo) return;

        try {
            const canOpen = await Linking.canOpenURL(versionInfo.updateUrl);
            if (canOpen) {
                await Linking.openURL(versionInfo.updateUrl);
                onUpdate();
            } else {
                Alert.alert(
                    t('settings.versionUpdate.cannotOpenStore'),
                    t('settings.versionUpdate.manualUpdateMessage')
                );
            }
        } catch (error) {
            console.error('Failed to open store:', error);
            Alert.alert(
                t('settings.versionUpdate.updateFailed'),
                t('settings.versionUpdate.manualUpdateMessage')
            );
        }
    };

    if (!visible || !versionInfo) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={isForceUpdate ? undefined : onDismiss}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="update"
                            size={24}
                            color="#10B981"
                        />
                        <Text style={styles.title}>
                            {isForceUpdate ? t('settings.versionUpdate.forceUpdateTitle') : t('settings.versionUpdate.updateTitle')}
                        </Text>
                    </View>

                    <ScrollView style={styles.content}>
                        <View style={styles.versionInfo}>
                            <Text style={styles.currentVersion}>
                                {t('settings.versionUpdate.currentVersion')}: {versionInfo.currentVersion}
                            </Text>
                            <Text style={styles.latestVersion}>
                                {t('settings.versionUpdate.latestVersion')}: {versionInfo.latestVersion}
                            </Text>
                        </View>

                        {versionInfo.releaseNotes && (
                            <View style={styles.releaseNotes}>
                                <Text style={styles.releaseNotesTitle}>
                                    {t('settings.versionUpdate.releaseNotes')}
                                </Text>
                                <Text style={styles.releaseNotesText}>
                                    {versionInfo.releaseNotes}
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.actions}>
                        {!isForceUpdate && (
                            <TouchableOpacity
                                style={[styles.button, styles.dismissButton]}
                                onPress={onDismiss}
                            >
                                <Text style={styles.dismissButtonText}>
                                    {t('settings.versionUpdate.later')}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, styles.updateButton]}
                            onPress={handleUpdate}
                        >
                            <Text style={styles.updateButtonText}>
                                {t('settings.versionUpdate.updateNow')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginLeft: 12,
    },
    content: {
        padding: 20,
    },
    versionInfo: {
        marginBottom: 20,
    },
    currentVersion: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    latestVersion: {
        fontSize: 16,
        fontWeight: '600',
        color: '#10B981',
    },
    releaseNotes: {
        marginTop: 16,
    },
    releaseNotesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    releaseNotesText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    dismissButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    dismissButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '500',
    },
    updateButton: {
        backgroundColor: '#10B981',
    },
    updateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
