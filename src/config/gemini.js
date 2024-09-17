// import { GoogleGenerativeAI } from "@google/generative-ai";

// const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
// if (!apiKey) {
//   throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables");
// }

// const genAI = new GoogleGenerativeAI(apiKey);
// const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
// });

// const generationConfig = {
//   temperature: 1,
//   topP: 0.95,
//   topK: 64,
//   maxOutputTokens: 100,
// };

// async function run(prompt) {
//   console.log("Processing prompt with Gemini:", prompt);
//   try {
//     const result = await model.generateContent(prompt, generationConfig);
//     const response = await result.response;
//     const text = response.text();
//     console.log("Gemini API response:", text);
//     return text;
//   } catch (error) {
//     console.error("Error processing prompt with Gemini:", error);
//     throw error;
//   }
// }

// export default run;