import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { Alert } from 'react-native';

/**
 * Finance Export Service
 * Handles generation of PDF, CSV, and Excel statements.
 */

const generateHTML = (transactions, summary, theme) => {
  const rows = transactions.map((t, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#FFFFFF' : '#F9F9FB'}">
      <td style="padding: 10px; border-bottom: 1px solid #EEE;">${i + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE;">${new Date(t.date).toLocaleDateString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE;">${t.merchant}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE;">${t.paymentMode || 'N/A'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE;">${t.account || 'Unknown'}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE; color: ${t.type === 'Expense' ? '#EF4444' : '#10B981'}; font-weight: bold;">
        ${t.type === 'Expense' ? `-₹${t.amount}` : `+₹${t.amount}`}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE;">${t.category}</td>
    </tr>
  `).join('');

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; color: #333; padding: 40px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid ${theme.colors.primary}; padding-bottom: 20px; margin-bottom: 30px; }
          .brand { font-size: 28px; font-weight: 900; color: ${theme.colors.primary}; }
          .title { font-size: 18px; font-weight: 700; color: #666; }
          .summary-grid { display: flex; gap: 20px; margin-bottom: 40px; }
          .summary-card { flex: 1; padding: 20px; border-radius: 12px; background: #F3F4F6; }
          .summary-label { font-size: 10px; text-transform: uppercase; color: #888; font-weight: 800; }
          .summary-value { font-size: 20px; font-weight: 900; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th { background: ${theme.colors.primary}; color: white; padding: 12px; text-align: left; text-transform: uppercase; letter-spacing: 1px; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #AAA; border-top: 1px solid #EEE; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">SaynIQ</div>
            <div class="title">Financial Statement</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #888;">
            Generated: ${new Date().toLocaleString()}<br/>
            Range: Detailed Ledger
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Total Income</div>
            <div class="summary-value" style="color: #10B981;">₹${summary.totalInc.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Expenses</div>
            <div class="summary-value" style="color: #EF4444;">₹${summary.totalExp.toLocaleString()}</div>
          </div>
          <div class="summary-card" style="background: ${theme.colors.primary}10;">
            <div class="summary-label">Net Balance</div>
            <div class="summary-value" style="color: ${theme.colors.primary};">₹${summary.balance.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Description</th>
              <th>Mode</th>
              <th>Account</th>
              <th>Amount</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer">
          This is an AI-generated statement from SaynIQ. Please verify all transactions independently.<br/>
          &copy; 2026 SaynIQ Productivity OS
        </div>
      </body>
    </html>
  `;
};

export const exportStatement = async (format, transactions, stats, theme) => {
  if (!transactions || transactions.length === 0) {
    Alert.alert('Export Failed', 'No transactions found for the selected period.');
    return;
  }

  const fileName = `SaynIQ_Statement_${new Date().getTime()}`;

  try {
    if (format === 'PDF') {
      const html = generateHTML(transactions, stats, theme);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } 
    else if (format === 'CSV') {
      const header = 'S.No,Date,Description,Mode,Account,Type,Amount,Category\n';
      const rows = transactions.map((t, i) => {
        return `${i + 1},${new Date(t.date).toLocaleDateString()},"${t.merchant.replace(/"/g, '""')}","${t.paymentMode}","${t.account}","${t.type}",${t.amount},"${t.category}"`;
      }).join('\n');
      
      const csvContent = "\ufeff" + header + rows; // Add UTF-8 BOM
      const path = `${FileSystem.documentDirectory}${fileName}.csv`;
      await FileSystem.writeAsStringAsync(path, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path);
    }
    else if (format === 'EXCEL') {
      const data = transactions.map((t, i) => ({
        'S.No': i + 1,
        'Date': new Date(t.date).toLocaleDateString(),
        'Description': t.merchant,
        'Mode': t.paymentMode,
        'Account': t.account,
        'Type': t.type,
        'Amount': t.amount,
        'Category': t.category
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      const path = `${FileSystem.documentDirectory}${fileName}.xlsx`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(path);
    }

    return true;
  } catch (error) {
    console.error('Export Error:', error);
    Alert.alert('Export Error', 'Failed to generate statement. Please try again.');
    return false;
  }
};
