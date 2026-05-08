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
 * Basic Keyword/Tag-based Retrieval System.
 * Scores notes based on how many words from the query appear in the note's text, title, or tags.
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
      // Very basic substring match count
      const matches = searchableText.split(token).length - 1;
      score += matches;
    });

    // Add slight bias to recent items
    const recencyBonus = item.createdAt ? new Date(item.createdAt).getTime() / 10000000000 : 0;
    
    return { ...item, _relevanceScore: score + recencyBonus };
  });

  // Sort by score descending and filter out zero-score items (unless we have very few items)
  const sorted = scoredItems.sort((a, b) => b._relevanceScore - a._relevanceScore);
  const relevant = sorted.filter(item => item._relevanceScore > 0).slice(0, topK);
  
  // Fallback to latest 3 items if no relevance found but user has items
  if (relevant.length === 0 && sorted.length > 0) {
    return sorted.slice(0, 3);
  }
  
  return relevant;
};

export const chatWithNotes = async (question, contextItems) => {
  if (!ENV.GEMINI_API_KEY) throw new Error("API key missing");

  try {
    // 1. Retrieve only relevant notes to stay within context limits and improve focus
    const relevantItems = retrieveRelevantNotes(question, contextItems);
    
    // 2. Format context
    const contextText = relevantItems.map(item => {
      let text = `[ID: ${item.id}] [Category: ${item.category || 'N/A'}] [Title: ${item.title || 'Untitled'}]\n`;
      if (item.type === 'note') text += `Content: ${item.text}\n`;
      if (item.type === 'link') text += `URL: ${item.url}\n`;
      if (item.summary) text += `AI Summary: ${item.summary}\n`;
      return text;
    }).join("\n---\n");

    // 3. System Prompt Engineering
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