import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={styles.title}>About App</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <View style={styles.content}>
        <Ionicons name="book" size={80} color="#6366F1" style={styles.icon} />
        <Text style={styles.appName}>Sayan High Class Study Note Tracker</Text>
        <Text style={styles.author}>Built by: Sayan Banerjee</Text>
        
        <Text style={styles.description}>
          This app helps users store and organize notes, YouTube resources, websites, and study materials in one place. It is designed for efficient learning, quick access, and structured knowledge management.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backBtn: { padding: 5, backgroundColor: '#151C2C', borderRadius: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  content: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  icon: { marginBottom: 20 },
  appName: { fontSize: 24, fontWeight: '800', color: '#F8FAFC', textAlign: 'center', marginBottom: 10 },
  author: { fontSize: 16, color: '#10B981', fontWeight: '600', marginBottom: 30 },
  description: { fontSize: 16, color: '#94A3B8', textAlign: 'center', lineHeight: 24 }
});
