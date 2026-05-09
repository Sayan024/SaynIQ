import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EmptyState({ iconName = "folder-open-outline", title = "Nothing here yet", subtitle = "Your items will appear here." }) {
  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={80} color="#1E293B" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  title: {
    color: '#64748B',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
  },
  subtitle: {
    color: '#475569',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  }
});
