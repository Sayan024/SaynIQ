import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

/**
 * Exports transaction data to a CSV file.
 * @param {Array} transactions 
 */
export const exportTransactionsToCSV = async (transactions) => {
  if (!transactions || transactions.length === 0) {
    Alert.alert('Export Failed', 'No transactions to export.');
    return;
  }

  const header = 'S.No,Date,Description,Type,Amount,Category,Bank\n';
  const rows = transactions.map((t, index) => {
    const date = new Date(t.date).toLocaleDateString();
    const merchant = t.merchant.replace(/,/g, ''); // Remove commas to avoid CSV break
    const amount = t.amount;
    const type = t.type;
    const category = t.category;
    const bank = t.bank;
    return `${index + 1},${date},${merchant},${type},${amount},${category},${bank}`;
  }).join('\n');

  const csvContent = header + rows;
  const fileName = `SaynIQ_Finance_${new Date().getTime()}.csv`;
  const fileUri = FileSystem.documentDirectory + fileName;

  try {
    await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
    
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (isSharingAvailable) {
      await Sharing.shareAsync(fileUri);
      Alert.alert('Success', 'Statement exported successfully!');
    } else {
      Alert.alert('Success', `File saved to: ${fileUri}`);
    }
  } catch (error) {
    console.error('CSV Export Error:', error);
    Alert.alert('Error', 'Failed to export statement.');
  }
};
