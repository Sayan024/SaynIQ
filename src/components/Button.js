import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { THEME } from '../styles/theme';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  icon
}) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const containerStyle = [
    styles.button,
    isPrimary && styles.primaryButton,
    isSecondary && styles.secondaryButton,
    isOutline && styles.outlineButton,
    style
  ];

  const titleStyle = [
    styles.text,
    isPrimary && styles.primaryText,
    isSecondary && styles.secondaryText,
    isOutline && styles.outlineText,
    textStyle
  ];

  return (
    <TouchableOpacity 
      style={containerStyle} 
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.contentContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={titleStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME.borderRadius.xl,
    paddingVertical: 18,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // Primary (Lime background, dark text)
  primaryButton: {
    backgroundColor: THEME.colors.primary,
  },
  primaryText: {
    color: THEME.colors.textDark,
  },
  // Secondary (Soft Purple background, white text)
  secondaryButton: {
    backgroundColor: THEME.colors.cardSecondary,
  },
  secondaryText: {
    color: THEME.colors.textPrimary,
  },
  // Outline (Transparent with border)
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: THEME.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  outlineText: {
    color: THEME.colors.textPrimary,
  },
});
