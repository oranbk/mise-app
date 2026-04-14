import axios from 'axios';

const GEMINI_API_KEY = "AIzaSyDNVMKk40EfipjZ9lHHP3kzeq1M4_TFo9A";
const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "gemini-2.0-flash";

// Parse a recipe from text
export const parseRecipe = async (text) => {
  try {
    const prompt = `You are a recipe parser. Extract and structure the following recipe into a clean JSON format.
    
Return ONLY valid JSON with this exact structure:
{
  "title": "Recipe name",
  "description": "Brief description",
  "servings": "4 people",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "language": "detected language code (en/he/fr/de/es)",
  "ingredients": [
    { "amount": "2", "unit": "cups", "item": "flour" }
  ],
  "steps": [
    { "number": 1, "instruction": "Step description" }
  ],
  "tips": ["optional tip 1"]
}

Recipe text:
${text}`;

    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      }
    );

    const jsonText = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw error;
  }
};

// Parse a recipe from an image (base64)
export const parseRecipeFromImage = async (base64Image, mimeType = 'image/jpeg') => {
  try {
    const prompt = `You are a recipe parser. Look at this image and extract the recipe. 
Return ONLY valid JSON with this exact structure:
{
  "title": "Recipe name",
  "description": "Brief description",
  "servings": "4 people",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "language": "detected language code (en/he/fr/de/es)",
  "ingredients": [
    { "amount": "2", "unit": "cups", "item": "flour" }
  ],
  "steps": [
    { "number": 1, "instruction": "Step description" }
  ],
  "tips": []
}`;

    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Image } }
          ]
        }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      }
    );

    const jsonText = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error parsing recipe from image:', error);
    throw error;
  }
};

// Parse recipe from URL
export const parseRecipeFromUrl = async (url) => {
  try {
    const prompt = `Please fetch and extract the recipe from this URL: ${url}
    
Return ONLY valid JSON with this structure:
{
  "title": "Recipe name",
  "description": "Brief description",
  "servings": "4 people",
  "prepTime": "15 minutes",
  "cookTime": "30 minutes",
  "language": "detected language code (en/he/fr/de/es)",
  "ingredients": [
    { "amount": "2", "unit": "cups", "item": "flour" }
  ],
  "steps": [
    { "number": 1, "instruction": "Step description" }
  ],
  "tips": []
}`;

    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      }
    );

    const jsonText = response.data.candidates[0].content.parts[0].text;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Error parsing recipe from URL:', error);
    throw error;
  }
};

// Chat with recipe context
export const chatWithRecipe = async (recipe, conversationHistory, userMessage) => {
  try {
    const systemContext = `You are a helpful cooking assistant. The user is currently following this recipe:

Title: ${recipe.title}
Ingredients: ${recipe.ingredients.map(i => `${i.amount} ${i.unit} ${i.item}`).join(', ')}
Steps: ${recipe.steps.map(s => `${s.number}. ${s.instruction}`).join('\n')}

Be conversational, helpful, and concise. The user is cooking so keep answers short and practical.
Always respond in the same language the user is speaking.
Current step context: Step ${conversationHistory.currentStep || 1}`;

    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: systemContext + "\n\nUser: " + userMessage }] }],
        generationConfig: { temperature: 0.7 }
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error chatting:', error);
    throw error;
  }
};
