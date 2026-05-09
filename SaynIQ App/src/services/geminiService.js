import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

const FAST_MODELS = [
  'gemini-2.0-flash',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash'
];

const executeFastFallback = async (prompt, modelIndex = 0) => {
  const currentModelName = FAST_MODELS[modelIndex];

  try {
    const model = genAI.getGenerativeModel({ model: currentModelName });
    return await model.generateContent(prompt);
  } catch (error) {
    const isOverloaded = error.message.includes('503') || error.message.includes('429');
    const isNotFound = error.message.includes('404');

    if ((isOverloaded || isNotFound) && modelIndex < FAST_MODELS.length - 1) {
      console.warn(`[${currentModelName}] unavailable. Instant fallback to [${FAST_MODELS[modelIndex + 1]}]`);
      return executeFastFallback(prompt, modelIndex + 1);
    }

    throw error;
  }
};

export const generateSummary = async (content) => {
  if (!ENV.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Please check your .env file.");
  }

  try {
    const prompt = `Summarize this study material into concise revision notes with bullet points.
    
    Content:
    ${content}
    `;

    const result = await executeFastFallback(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Summary Error:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
};

export const generateSmartTags = async (content) => {
  if (!ENV.GEMINI_API_KEY) return [];

  try {
    const prompt = `Based on the following content, generate a JSON array of up to 5 relevant technical or study tags. Return ONLY a valid JSON array of strings (e.g., ["React Native", "AI", "Mobile"]).
    
    Content:
    ${content}
    `;

    const result = await executeFastFallback(prompt);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    console.error("AI Tagging Error:", error);
    return [];
  }
};

export const generateAutoTitle = async (content) => {
  if (!ENV.GEMINI_API_KEY) return "Untitled Document";

  try {
    const prompt = `Generate a very short, professional, and catchy title (max 5 words) that accurately captures the main topic of the following content. If it's code, name the technology or function. Return ONLY the title text without any quotes or punctuation.
    
    Content:
    ${content}
    `;

    const result = await executeFastFallback(prompt);
    return result.response.text().replace(/["']/g, "").trim();
  } catch (error) {
    console.error("AI Title Error:", error);
    return "Untitled Note";
  }
};

/**
 * Generate an intelligent summary for a Link/Video based on its URL and Metadata.
 */
export const generateLinkSummary = async (url, customTitle) => {
  if (!ENV.GEMINI_API_KEY) return "AI Summary unavailable.";

  const isVideo = url.includes('youtube.com') || url.includes('youtu.be');
  const typeText = isVideo ? 'YouTube Video' : 'Website/Article';
  const titleText = customTitle ? `Title: ${customTitle}` : '';

  const prompt = `
You are a highly intelligent study assistant. Your user saved a ${typeText} to their knowledge vault.
URL: ${url}
${titleText}

Since you cannot browse the live internet directly, please use the URL structure, domain name, and any provided title to infer what this resource is about. Draw upon your vast knowledge base to generate a comprehensive, highly-structured study summary for this topic.

Format your response exactly as follows (use Markdown):
**Quick Summary**
(2-3 sentences summarizing the inferred topic)

**Key Concepts**
- (Bullet point 1)
- (Bullet point 2)

**Learning Points**
- (What the user will likely learn from this)

**Action Items**
- (Suggested next steps or practice exercises)
`;

  try {
    const result = await executeFastFallback(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Link Summary Gen Failed:", error);
    return "Summary generation failed. The AI might need more context about this link to generate a summary.";
  }
};

/**
 * Basic Keyword/Tag-based Retrieval System.
 */
const retrieveRelevantNotes = (query, items, topK = 5) => {
  if (!query || !items || items.length === 0) return [];
  
  const queryTokens = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scoredItems = items.map(item => {
    let score = 0;
    const searchableText = [
      item.title || '',
      item.text || '',
      item.summary || '',
      item.category || '',
      ...(item.tags || [])
    ].join(' ').toLowerCase();

    queryTokens.forEach(token => {
      const matches = searchableText.split(token).length - 1;
      score += matches;
    });

    const recencyBonus = item.createdAt ? new Date(item.createdAt).getTime() / 10000000000 : 0;
    return { ...item, _relevanceScore: score + recencyBonus };
  });

  const sorted = scoredItems.sort((a, b) => b._relevanceScore - a._relevanceScore);
  const relevant = sorted.filter(item => item._relevanceScore > 0).slice(0, topK);
  
  if (relevant.length === 0 && sorted.length > 0) {
    return sorted.slice(0, 3);
  }
  
  return relevant;
};

export const chatWithNotes = async (question, contextItems) => {
  if (!ENV.GEMINI_API_KEY) throw new Error("API key missing");

  try {
    const relevantItems = retrieveRelevantNotes(question, contextItems);
    
    const contextText = relevantItems.map(item => {
      let text = `[ID: ${item.id}] [Category: ${item.category || 'N/A'}] [Title: ${item.title || 'Untitled'}]\n`;
      if (item.type === 'note') text += `Content: ${item.text}\n`;
      if (item.type === 'link') text += `URL: ${item.url}\n`;
      if (item.summary) text += `AI Summary: ${item.summary}\n`;
      return text;
    }).join("\n---\n");

    const prompt = `You are a premium AI Study Assistant.
Your primary job is to answer the user's question using the CONTEXT provided below, which contains their personal saved notes, links, and study materials.
    
If the answer can be found in the CONTEXT, base your response heavily on it and reference their notes.
If the answer is NOT in the CONTEXT, use your general knowledge, but politely mention that you didn't find specific details in their saved notes.
Format your answer beautifully using Markdown (bolding, lists, code blocks if needed).

--- USER'S SAVED NOTES CONTEXT ---
${contextText || "No relevant notes found."}
----------------------------------

User's Question:
${question}
`;

    const result = await executeFastFallback(prompt);
    return result.response.text();
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw new Error("Failed to get response from AI.");
  }
};