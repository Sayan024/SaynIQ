import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { VaultContext } from '../context/VaultContext';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  icon
}) {
  const { state } = useContext(VaultContext);
  const theme = state.theme;

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const containerStyle = [
    styles.button,
    isPrimary && { backgroundColor: theme.colors.primary },
    isSecondary && { backgroundColor: theme.colors.cardSecondary },
    isOutline && { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.colors.border, shadowOpacity: 0, elevation: 0 },
    style
  ];

  const titleStyle = [
    styles.text,
    isPrimary && { color: theme.colors.textDark },
    isSecondary && { color: theme.colors.textPrimary },
    isOutline && { color: theme.colors.textPrimary },
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
    borderRadius: 24,
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
  }
});

