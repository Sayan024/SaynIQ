import { Share, Platform, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { cloudService } from './cloudService';

/**
 * Encodes item data into a professional Reusable Universal Link.
 * Format: https://sayn-iq.vercel.app/share/<shareId>
 */
export const generateShareLink = async (item) => {
  try {
    // Save to "cloud" and get a short ID
    const shareId = await cloudService.saveSharedContent(item);
    
    // Return clean URL
    return `https://sayn-iq.vercel.app/share/${shareId}`;
  } catch (error) {
    console.error('Link Generation Error:', error);
    return null;
  }
};


/**
 * Opens the native share sheet with a clean, professional message.
 */
export const shareItem = async (item) => {
  const universalLink = await generateShareLink(item);
  
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
    await Share.share({
      message,
      url: universalLink,
      title: `Share ${item.title || 'Content'}`,
    });
  } catch (error) {
    Alert.alert("Share Error", error.message);
  }
};

