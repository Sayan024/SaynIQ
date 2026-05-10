/**
 * Advanced SMS Parser for Indian Banking Formats
 */

const BANKS = [
  'ICICI', 'HDFC', 'SBI', 'AXIS', 'KOTAK', 'PNB', 'UNION', 'AIRTEL', 
  'PAYTM', 'BOB', 'IDFC', 'YESBANK', 'CANARA', 'INDUSIND', 'IDBI', 'HSBC', 'SCB'
];

export const parseSmsTransaction = (text) => {
  if (!text) return null;
  const cleanText = text.replace(/\n/g, ' ').toUpperCase();
  
  // Basic financial intent check: Does it contain an amount-like pattern or transaction keywords?
  const hasAmount = /(?:RS|INR|₹|AMT|AMOUNT)\.?\s*[\d,]+/i.test(cleanText);
  const hasKeywords = /DEBITED|CREDITED|SPENT|PAID|RECEIVED|SUCCESSFUL|TRANSFER|UPI|MANDATE/i.test(cleanText);
  
  if (!hasAmount && !hasKeywords) return null;

  let result = {
    raw: text,
    amount: 0,
    type: 'Expense',
    merchant: 'Unknown',
    category: 'Other',
    date: new Date().toISOString(),
    bank: 'Unknown Bank',
    account: 'N/A',
    upiRef: 'N/A',
    isMandate: false,
    confidence: 10 // Base confidence for having financial keywords
  };

  // 1. Amount Extraction
  const amountRegex = /(?:RS|INR|₹|AMT|AMOUNT)\.?\s*([\d,]+(?:\.\d{2})?)/i;
  const amountMatch = cleanText.match(amountRegex);
  if (amountMatch) {
    result.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    result.confidence += 40;
  }

  // 2. Type Detection
  if (cleanText.includes('DEBITED') || cleanText.includes('SPENT') || cleanText.includes('PAID') || cleanText.includes('SENT')) {
    result.type = 'Expense';
    result.confidence += 20;
  } else if (cleanText.includes('CREDITED') || cleanText.includes('RECEIVED') || cleanText.includes('DEPOSITED')) {
    result.type = 'Income';
    result.confidence += 20;
  }

  // 3. Bank Identification
  for (const bank of BANKS) {
    if (cleanText.includes(bank)) {
      result.bank = bank + ' BANK';
      result.confidence += 15;
      break;
    }
  }

  // 4. Account/VPA
  const acctRegex = /(?:AC|ACCT|ACCOUNT|A\/C|VPA)\s*(?:XX|.*?)(\d{3,4}|[A-Z0-9.]+@\w+)/i;
  const acctMatch = cleanText.match(acctRegex);
  if (acctMatch) {
    result.account = acctMatch[1].includes('@') ? acctMatch[1] : `XX${acctMatch[1]}`;
    result.confidence += 10;
  }

  // 5. Merchant Extraction (Looking for "TO", "TOWARDS", "INFO", "AT")
  const merchantRegex = /(?:TO|TOWARDS|INFO[:\-]|AT|BY|DEPOSITED BY|TO VPA)\s+([A-Z0-9\s*]+?)(?=\s+(ON|FOR|DATE|AT|REF|UPI|RRNO|A\/C|ACCT|BANK|BALANCE|AVL))/i;
  const merchantMatch = cleanText.match(merchantRegex);
  
  if (merchantMatch && merchantMatch[1]) {
    result.merchant = merchantMatch[1].trim().replace(/\s+/g, ' ');
    result.confidence += 15;
  }

  // 6. UPI Reference
  const upiRegex = /(?:UPI|REF|RRNO|REF NO)[:\s-]*(\d{10,12})/i;
  const upiMatch = cleanText.match(upiRegex);
  if (upiMatch) {
    result.upiRef = upiMatch[1];
    result.confidence += 5;
  }

  // Threshold for sync: We want to be reasonably sure it's a transaction
  return result.confidence >= 40 ? result : null;
};
