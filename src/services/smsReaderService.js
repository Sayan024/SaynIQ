import Sms from 'react-native-get-sms-android';
import { parseSmsTransaction } from './smsParserService';
import { Platform } from 'react-native';

/**
 * Enhanced SMS Reader for High-Performance Deep Scans
 */
export const scanTransactionsFromSms = async (limit = 10000, onProgress, cancelRef) => {
  if (Platform.OS !== 'android') {
    return simulateSmsScan(onProgress);
  }

  return new Promise((resolve, reject) => {
    // Expanded Banking & Fintech Keywords for broader Indian Bank support
    const filter = {
      box: 'inbox',
      maxCount: limit,
      read: 1, // Only read messages already seen by user for safety
      indexFrom: 0,
    };

    const keywords = [
      'credited', 'debited', 'spent', 'transaction', 'bank', 
      'vpa', 'upi', 'paytm', 'amazon pay', 'otp', 'a/c', 
      'balance', 'available', 'limit', 'withdrawal', 'purchase',
      'inward', 'outward', 'sent to', 'received from', 'txn'
    ];

    Sms.list(
      JSON.stringify(filter),
      (fail) => reject(new Error('Failed to access SMS inbox: ' + fail)),
      (count, smsList) => {
        const messages = JSON.parse(smsList);
        const transactions = [];
        
        for (let i = 0; i < messages.length; i++) {
          if (cancelRef && cancelRef.cancelled) break;

          const msg = messages[i];
          const body = msg.body.toLowerCase();

          // Performance Pre-Filter
          const isBanking = keywords.some(k => body.includes(k));
          
          if (isBanking) {
            const parsed = parseSmsTransaction(msg.body);
            if (parsed && !body.includes('otp')) { // Security: Skip OTPs
              transactions.push({
                ...parsed,
                raw: msg.body,
                date: new Date(msg.date).toISOString(),
                id: `sms-${msg._id}-${msg.date}`
              });
            }
          }

          if (onProgress && i % 50 === 0) {
            onProgress(i, messages.length);
          }
        }
        resolve(transactions);
      }
    );
  });
};

const simulateSmsScan = async (onProgress) => {
  const mockData = [
    { merchant: 'Amazon India', amount: 1299, type: 'Expense', bank: 'HDFC', date: new Date().toISOString() },
    { merchant: 'Swiggy Order', amount: 450, type: 'Expense', bank: 'SBI', date: new Date().toISOString() },
    { merchant: 'Salary Credit', amount: 85000, type: 'Income', bank: 'ICICI', date: new Date().toISOString() },
    { merchant: 'Zomato', amount: 320, type: 'Expense', bank: 'AXIS', date: new Date().toISOString() }
  ];

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 50));
    if (onProgress) onProgress(i, 20);
  }
  
  return mockData.map((d, i) => ({ ...d, id: `sim-${Date.now()}-${i}`, raw: `Mock SMS ${i}` }));
};
