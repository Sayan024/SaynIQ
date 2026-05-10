import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

/**
 * Finance Export Service
 * Handles generation of CSV statements.
 */

export const exportStatement = async (format, transactions, stats, theme) => {
  if (!transactions || transactions.length === 0) {
    Alert.alert('Export Failed', 'No transactions found for the selected period.');
    return;
  }

  const fileName = `SaynIQ_Statement_${new Date().getTime()}`;

  try {
    if (format === 'CSV') {
      const header = 'S.No,Date,Description,Mode,Account,Type,Amount,Category\n';
      const rows = transactions.map((t, i) => {
        return `${i + 1},${new Date(t.date).toLocaleDateString()},"${t.merchant.replace(/"/g, '""')}","${t.paymentMode || 'N/A'}","${t.account || 'N/A'}","${t.type}",${t.amount},"${t.category}"`;
      }).join('\n');
      
      const csvContent = "\ufeff" + header + rows; // Add UTF-8 BOM
      const path = `${FileSystem.documentDirectory}${fileName}.csv`;
      await FileSystem.writeAsStringAsync(path, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path);
      return true;
    } else {
      Alert.alert('Unsupported Format', 'Only CSV export is supported in this version.');
      return false;
    }
  } catch (error) {
    console.error('Export Error:', error);
    Alert.alert('Export Error', 'Failed to generate statement. Please try again.');
    return false;
  }
};
