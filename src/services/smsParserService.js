/**
 * Advanced Local SMS Parser Service
 * Extracts structured financial data from varied bank SMS formats.
 */

const TRANSACTION_PATTERNS = [
  // 1. ICICI / Structured Format (Example: ICICI Bank Acct XX530 debited for Rs 2300.00 on 09-May-26; DEEPAK KUMAR credited. UPI:612955893883.)
  {
    name: 'ICICI_UPI_DEBIT',
    regex: /(.*?)\s+Acct\s+(.*?)\s+(debited|credited)\s+for\s+(?:Rs|INR|Rs\.)\s*([\d,.]+)\s+on\s+([\d-a-z]+);\s+(.*?)\s+(?:credited|debited).*?UPI:(\d+)/i,
    map: (m) => ({
      bank: m[1].trim(),
      type: m[3].toLowerCase() === 'debited' ? 'Expense' : 'Income',
      amount: parseFloat(m[4].replace(/,/g, '')),
      date: m[5],
      merchant: m[6].trim(),
      upiRef: m[7],
      paymentMode: 'UPI',
      account: `ICICI ${m[2].trim()}`
    })
  },
  // 2. Standard Debit with Balance (Example: HDFC Bank: Rs 500 debited at Amazon on 10-May-26. Avl Bal: Rs 12000.00)
  {
    name: 'STANDARD_DEBIT_BAL',
    regex: /(.*?):\s+(?:Rs|INR|Rs\.)\s*([\d,.]+)\s+(?:debited|paid|spent)\s+(?:at|to)\s+(.*?)\s+on\s+([\d-a-z]+).*?(?:bal|balance|avl bal).*?(?:Rs|INR|Rs\.)\s*([\d,.]+)/i,
    map: (m, rawText) => ({
      bank: m[1].trim(),
      amount: parseFloat(m[2].replace(/,/g, '')),
      type: 'Expense',
      merchant: m[3].trim(),
      date: m[4],
      balance: parseFloat(m[5].replace(/,/g, '')),
      paymentMode: inferPaymentMode(rawText),
      account: m[1].trim()
    })
  },
  // 3. Simple Credit (Example: Your A/c XX123 is credited with Rs. 10000.00 on 09-May-26 from Salary.)
  {
    name: 'SIMPLE_CREDIT',
    regex: /(?:a\/c|acct)\s+(.*?)\s+is\s+credited\s+with\s+(?:Rs|INR|Rs\.)\s*([\d,.]+)\s+on\s+([\d-a-z]+)\s+(?:from|by)\s+(.*?)\./i,
    map: (m) => ({
      amount: parseFloat(m[2].replace(/,/g, '')),
      type: 'Income',
      date: m[3],
      merchant: m[4].trim(),
      bank: 'Unknown',
      paymentMode: 'Bank Transfer',
      account: m[1].trim()
    })
  },
  // 4. UPI Generic (Example: vpa deepak@okaxis debited by 500.00)
  {
    name: 'UPI_GENERIC',
    regex: /vpa\s+(.*?)\s+(debited|credited)\s+by\s+([\d,.]+)/i,
    map: (m) => ({
      merchant: m[1].trim(),
      type: m[2].toLowerCase() === 'debited' ? 'Expense' : 'Income',
      amount: parseFloat(m[3].replace(/,/g, '')),
      date: new Date().toISOString(),
      bank: 'UPI',
      paymentMode: 'UPI',
      account: 'UPI Wallet'
    })
  },
  // 5. Keyword Matcher (Fallback)
  {
    name: 'KEYWORD_FALLBACK',
    regex: /(debited|credited).*?(?:Rs|INR|Rs\.)\s*([\d,.]+)/i,
    map: (m, rawText) => ({
      type: m[1].toLowerCase() === 'debited' ? 'Expense' : 'Income',
      amount: parseFloat(m[2].replace(/,/g, '')),
      merchant: 'Transaction',
      date: new Date().toISOString(),
      paymentMode: inferPaymentMode(rawText),
      account: 'General Account'
    })
  }
];

export const parseSmsTransaction = (text) => {
  if (!text) return null;

  // Filter out non-financial messages early
  const keywords = ['debited', 'credited', 'upi', 'acct', 'balance', 'rs', 'inr'];
  const hasKeyword = keywords.some(k => text.toLowerCase().includes(k));
  if (!hasKeyword) return null;

  for (const pattern of TRANSACTION_PATTERNS) {
    const match = text.match(pattern.regex);
    if (match) {
      try {
        const data = pattern.map(match, text);
        return {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: data.type,
          amount: data.amount,
          balance: data.balance || null,
          category: inferCategory(data.merchant || ''),
          merchant: data.merchant || 'Unknown',
          bank: data.bank || inferBank(text),
          date: data.date || new Date().toISOString(),
          upiRef: data.upiRef || null,
          account: data.account || 'Unknown',
          paymentMode: data.paymentMode || 'Other',
          raw: text,
          parser: pattern.name
        };
      } catch (e) {
        console.warn(`Parser error for ${pattern.name}:`, e);
      }
    }
  }

  return null;
};

const inferCategory = (merchant) => {
  const m = merchant.toLowerCase();
  if (m.includes('swiggy') || m.includes('zomato') || m.includes('restaurant') || m.includes('food')) return 'Food';
  if (m.includes('amazon') || m.includes('flipkart') || m.includes('myntra') || m.includes('shopping')) return 'Shopping';
  if (m.includes('uber') || m.includes('ola') || m.includes('metro') || m.includes('petrol')) return 'Transport';
  if (m.includes('netflix') || m.includes('spotify') || m.includes('youtube') || m.includes('prime')) return 'Subscriptions';
  if (m.includes('bill') || m.includes('recharge') || m.includes('electricity') || m.includes('water')) return 'Bills';
  if (m.includes('salary') || m.includes('payroll') || m.includes('dividend')) return 'Salary';
  if (m.includes('recharge') || m.includes('jio') || m.includes('airtel')) return 'Recharge';
  if (m.includes('netflix') || m.includes('spotify') || m.includes('hotstar')) return 'Subscription';
  return 'Other';
};

const inferPaymentMode = (text) => {
  const t = text.toLowerCase();
  if (t.includes('upi')) return 'UPI';
  if (t.includes('card') || t.includes('visa') || t.includes('mastercard')) return 'Card';
  if (t.includes('cash')) return 'Cash';
  if (t.includes('net banking') || t.includes('transfer')) return 'Net Banking';
  if (t.includes('wallet') || t.includes('paytm')) return 'Wallet';
  return 'Other';
};

const inferBank = (text) => {
  const t = text.toLowerCase();
  if (t.includes('hdfc')) return 'HDFC Bank';
  if (t.includes('sbi')) return 'State Bank of India';
  if (t.includes('icici')) return 'ICICI Bank';
  if (t.includes('axis')) return 'Axis Bank';
  if (t.includes('kotak')) return 'Kotak Bank';
  if (t.includes('pnb')) return 'Punjab National Bank';
  if (t.includes('union')) return 'Union Bank';
  return 'Unknown Bank';
};
