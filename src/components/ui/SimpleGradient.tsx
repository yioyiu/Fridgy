import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SimpleGradientProps {
    children: React.ReactNode;
    style?: any;
}

export const SimpleGradient: React.FC<SimpleGradientProps> = ({ children, style }) => {
    return (
        <LinearGradient
            colors={['#D4F367', '#C8F05A', '#BCED4D', '#B0EA40', '#A4E733']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
