import { PermissionsAndroid, Platform } from 'react-native';
import { parseSmsTransaction } from './smsParserService';

/**
 * SMS Reader Service
 * Handles permissions and fetching of device SMS messages.
 */

// Note: Requires react-native-get-sms-android to be installed for real device reading.
let SmsAndroid;
try {
  SmsAndroid = require('react-native-get-sms-android').default;
} catch (e) {
  SmsAndroid = null;
}

export const requestSmsPermission = async () => {
  if (Platform.OS === 'ios') return false;
  
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      {
        title: "SMS Permission",
        message: "SaynIQ needs access to your SMS to automatically track expenses locally.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

export const scanTransactionsFromSms = async (limit = 100) => {
  if (!SmsAndroid) {
    console.warn("react-native-get-sms-android not found. Using mock data for simulation.");
    return simulateSmsScan();
  }

  return new Promise((resolve, reject) => {
    const filter = {
      box: 'inbox',
      maxCount: limit,
    };

    SmsAndroid.list(
      JSON.stringify(filter),
      (fail) => {
        console.error("Failed to list SMS:", fail);
        reject(fail);
      },
      (count, smsList) => {
        const messages = JSON.parse(smsList);
        const transactions = messages
          .map(msg => parseSmsTransaction(msg.body))
          .filter(Boolean);
        resolve(transactions);
      }
    );
  });
};

/**
 * Simulates a scan for testing purposes in Expo Go or non-native environments.
 */
const simulateSmsScan = async () => {
  const mockMessages = [
    "ICICI Bank Acct XX530 debited for Rs 2300.00 on 09-May-26; DEEPAK KUMAR credited. UPI:612955893883.",
    "HDFC Bank: Rs 500 debited at Amazon on 10-May-26. Avl Bal: Rs 12000.00",
    "Your A/c XX123 is credited with Rs. 10000.00 on 09-May-26 from Salary.",
    "vpa deepak@okaxis debited by 150.00",
    "OTP for login is 123456. Do not share.",
    "Hey, how are you doing today?",
  ];

  await new Promise(r => setTimeout(r, 1500)); // Simulate delay

  return mockMessages
    .map(body => parseSmsTransaction(body))
    .filter(Boolean);
};
