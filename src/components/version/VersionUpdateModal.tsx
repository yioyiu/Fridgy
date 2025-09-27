import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { COLORS } from '@/utils/constants';
import { VersionInfo } from '@/services/version/versionChecker';
import { versionChecker } from '@/services/version/versionChecker';

interface VersionUpdateModalProps {
    visible: boolean;
    versionInfo: VersionInfo;
    onDismiss: () => void;
    onUpdate: () => void;
}

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
    visible,
    versionInfo,
    onDismiss,
    onUpdate,
}) => {
    const handleUpdate = async () => {
        try {
            await versionChecker.openAppStore(versionInfo.updateUrl);
            onUpdate();
        } catch (error) {
            Alert.alert(
                '更新失败',
                '无法打开应用商店，请手动前往应用商店更新应用。',
                [{ text: '确定' }]
            );
        }
    };

    const handleLater = () => {
        if (versionInfo.isForceUpdate) {
            Alert.alert(
                '强制更新',
                '此版本包含重要更新，必须更新后才能继续使用。',
                [{ text: '立即更新', onPress: handleUpdate }]
            );
        } else {
            onDismiss();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={versionInfo.isForceUpdate ? undefined : onDismiss}
        >
            <View style={styles.overlay}>
                <Card style={styles.modal}>
                    <Card.Content style={styles.content}>
                        <View style={styles.header}>
                            <Title style={styles.title}>
                                {versionInfo.isForceUpdate ? '强制更新' : '发现新版本'}
                            </Title>
                            <Text style={styles.versionText}>
                                当前版本: {versionInfo.currentVersion} → 最新版本: {versionInfo.latestVersion}
                            </Text>
                        </View>

                        <Divider style={styles.divider} />

                        {versionInfo.releaseNotes && (
                            <View style={styles.releaseNotesContainer}>
                                <Text style={styles.releaseNotesTitle}>更新内容:</Text>
                                <ScrollView style={styles.releaseNotesScroll}>
                                    <Text style={styles.releaseNotesText}>
                                        {versionInfo.releaseNotes}
                                    </Text>
                                </ScrollView>
                            </View>
                        )}

                        <View style={styles.buttonContainer}>
                            {!versionInfo.isForceUpdate && (
                                <Button
                                    mode="outlined"
                                    onPress={handleLater}
                                    style={[styles.button, styles.laterButton]}
                                    labelStyle={styles.laterButtonText}
                                >
                                    {t('common.cancel')}
                                </Button>
                            )}

                            <Button
                                mode="contained"
                                onPress={handleUpdate}
                                style={[styles.button, styles.updateButton]}
                                labelStyle={styles.updateButtonText}
                            >
                                {t('common.confirm')}
                            </Button>
                        </View>

                        {versionInfo.isForceUpdate && (
                            <Text style={styles.forceUpdateNote}>
                                {t('settings.forceUpdateNote')}
                            </Text>
                        )}
                    </Card.Content>
                </Card>
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
    modal: {
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        borderRadius: 12,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    content: {
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    versionText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    divider: {
        marginVertical: 16,
        backgroundColor: COLORS.border,
    },
    releaseNotesContainer: {
        marginBottom: 20,
    },
    releaseNotesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 8,
    },
    releaseNotesScroll: {
        maxHeight: 150,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: 8,
        padding: 12,
    },
    releaseNotesText: {
        fontSize: 14,
        lineHeight: 20,
        color: COLORS.textSecondary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    button: {
        flex: 1,
        borderRadius: 8,
    },
    laterButton: {
        borderColor: COLORS.border,
    },
    laterButtonText: {
        color: COLORS.textSecondary,
    },
    updateButton: {
        backgroundColor: COLORS.primary,
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    forceUpdateNote: {
        fontSize: 12,
        color: COLORS.error,
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
});
