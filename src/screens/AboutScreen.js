import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VaultContext } from '../context/VaultContext';
import { getPasswordsList } from '../services/passwordService';

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { state } = useContext(VaultContext);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const passwords = await getPasswordsList();
      const exportData = {
        app: "Sayan's Second Brain",
        version: "2.0.0",
        exportDate: new Date().toISOString(),
        vaultItems: state.items,
        passwords: passwords
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      
      await Share.share({
        message: jsonString,
        title: "Second_Brain_Export.json"
      });
    } catch (error) {
      Alert.alert("Export Failed", "Could not export vault data.");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#94A3B8" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>
      
      <View style={styles.content}>
        <Ionicons name="planet" size={80} color="#6366F1" style={styles.icon} />
        <Text style={styles.appName}>Sayan's Second Brain</Text>
        <Text style={styles.author}>AI-Powered Knowledge Vault</Text>
        
        <Text style={styles.description}>
          This app helps users store and organize notes, resources, and study materials in one secure place. Powered by Google Gemini AI for smart summaries, tagging, and contextual learning.
        </Text>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={isExporting}>
          {isExporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{marginRight: 8}} />
              <Text style={styles.exportBtnText}>Export Vault Data</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backBtn: { padding: 5, backgroundColor: '#151C2C', borderRadius: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  content: { alignItems: 'center', marginTop: 20, paddingHorizontal: 20 },
  icon: { marginBottom: 20 },
  appName: { fontSize: 24, fontWeight: '800', color: '#F8FAFC', textAlign: 'center', marginBottom: 10 },
  author: { fontSize: 16, color: '#10B981', fontWeight: '600', marginBottom: 30 },
  description: { fontSize: 15, color: '#94A3B8', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  exportBtn: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  }
});
