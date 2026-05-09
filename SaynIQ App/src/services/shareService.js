import { Share, Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';

// Simple Base64 Polyfill for React Native environments where btoa/atob might be missing
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const btoaPolyfill = (input = '') => {
  let str = input;
  let output = '';
  for (let block = 0, charCode, i = 0, map = chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3 / 4);
    if (charCode > 255) throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    block = block << 8 | charCode;
  }
  return output;
};

const atobPolyfill = (input = '') => {
  let str = input.replace(/=+$/, '');
  let output = '';
  if (str.length % 4 == 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  for (let bc = 0, bs = 0, buffer, i = 0;
    buffer = str.charAt(i++);
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
    buffer = chars.indexOf(buffer);
  }
  return output;
};

const _btoa = typeof btoa !== 'undefined' ? btoa : btoaPolyfill;
export const _atob = typeof atob !== 'undefined' ? atob : atobPolyfill;

/**
 * Encodes item data into a professional Universal Link.
 * Format: https://sayn-iq.vercel.app/share?data=<base64_json>
 */
export const generateShareLink = (item) => {
  try {
    const shareData = {
      type: item.type,
      title: item.title,
      category: item.category,
      text: item.text,
      url: item.url,
      noteType: item.noteType,
      tags: item.tags || [],
      alertType: item.alertType,
    };

    const jsonStr = JSON.stringify(shareData);
    const base64Data = _btoa(unescape(encodeURIComponent(jsonStr)));
    
    // We use the Universal Link domain as the primary sharing URL
    return `https://sayn-iq.vercel.app/share?data=${base64Data}`;
  } catch (error) {
    console.error('Link Generation Error:', error);
    return null;
  }
};


/**
 * Opens the native share sheet with a clean, professional message.
 */
export const shareItem = async (item) => {
  const universalLink = generateShareLink(item);
  if (!universalLink) {
    Alert.alert("Error", "Could not generate share link.");
    return;
  }

  const websiteUrl = "https://sayn-iq.vercel.app";
  const previewText = item.type === 'note' 
    ? (item.text?.substring(0, 80) + (item.text?.length > 80 ? '...' : '')) 
    : item.url;

  const message = 
    `Sayan shared a ${item.type === 'link' ? 'link' : 'note'} with you on SaynIQ\n\n` +
    `Title:\n"${item.title || 'Untitled'}"\n\n` +
    `Preview:\n"${previewText}"\n\n` +
    `🔗 Open in SaynIQ: ${universalLink}\n\n` +
    `📥 Download App: ${websiteUrl}`;

  try {
    const result = await Share.share({
      message,
      url: universalLink,
      title: `Share ${item.title || 'Content'}`,
    });
  } catch (error) {
    Alert.alert("Share Error", error.message);
  }
};

