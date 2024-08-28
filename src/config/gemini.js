import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 100,
};

// We don't need to check if the query is HR-related anymore,
// as the backend will handle all queries.

async function queryBackend(question) {
  console.log('Querying backend with question:', question);
  try {
    const response = await fetch('http://localhost:5000/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: question }),
    });
    console.log('Response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Received data:', data);
    return data.response;
  } catch (error) {
    console.error("Error querying backend:", error);
    throw error;
  }
}

async function run(prompt) {
  console.log("Processing prompt:", prompt);
  try {
    // Check if the prompt is related to HR policy
    const hrKeywords = ['hr', 'policy', 'employee', 'leave', 'vacation', 'benefits', 'salary', 'payroll'];
    const isHRRelated = hrKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

    if (isHRRelated) {
      // Query the backend only for HR-related questions
      console.log("HR-related question detected. Querying backend.");
      const backendResponse = await queryBackend(prompt);
      
      if (backendResponse && backendResponse !== "I don't have enough information to answer that question.") {
        console.log("Using backend response:", backendResponse);
        return backendResponse;
      }
    }
    
    // For non-HR questions or if backend doesn't have a specific answer, use Gemini API
    console.log("Using Gemini API");
    const result = await model.generateContent(prompt, generationConfig);
    const response = await result.response;
    const text = response.text();
    console.log("Gemini API response:", text);
    return text;
  } catch (error) {
    console.error("Error processing prompt:", error);
    throw error;
  }
}

export default run;