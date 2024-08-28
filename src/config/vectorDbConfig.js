import { Index } from "@upstash/vector";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Initialize Upstash Vector client
const index = new Index({
  url: import.meta.env.VITE_UPSTASH_VECTOR_URL,
  token: import.meta.env.VITE_UPSTASH_VECTOR_TOKEN,
});

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize Google Generative AI embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  modelName: "embedding-001",
  apiKey: apiKey,
});

// Text splitter for chunking
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// Function to generate embeddings using LangChain
async function generateEmbedding(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    throw new Error("Invalid input for embedding generation");
  }
  try {
    const [embedding] = await embeddings.embedDocuments([text]);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

// Function to query the vector database
export async function queryDocument(query) {
  try {
    console.log("Generating embedding for query:", query);
    const queryEmbedding = await generateEmbedding(query);
    console.log("Query embedding generated, length:", queryEmbedding.length);

    console.log("Querying vector database with parameters:", {
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    const results = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    console.log("Raw results from vector database:", JSON.stringify(results, null, 2));

    if (Array.isArray(results)) {
      const relevantChunks = results.map(result => result.metadata?.text || '').filter(Boolean);
      console.log("Relevant chunks found:", relevantChunks.length);
      return relevantChunks;
    } else if (typeof results === 'object' && results !== null) {
      const metadata = results.matches?.map(match => match.metadata?.text || '').filter(Boolean);
      if (metadata && metadata.length > 0) {
        console.log("Relevant chunks found:", metadata.length);
        return metadata;
      }
    }

    console.warn("No relevant chunks found in results");
    return [];
  } catch (error) {
    console.error("Error querying document:", error);
    console.error("Error details:", error.message, error.stack);
    return [];
  }
}

// Function to store document in vector database
export async function storeDocument(documentId, content) {
  try {
    console.log(`Splitting document ${documentId} into chunks...`);
    const chunks = await textSplitter.splitText(content);
    console.log(`Document split into ${chunks.length} chunks`);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Generating embedding for chunk ${i + 1}/${chunks.length}`);
      const embedding = await generateEmbedding(chunk);
      
      console.log(`Storing chunk ${i + 1}/${chunks.length} in vector database`);
      await index.upsert({
        id: `${documentId}_${i}`,
        vector: embedding,
        metadata: { text: chunk, documentId: documentId, chunkIndex: i },
      });
    }
    console.log(`Document ${documentId} successfully stored in vector database`);
  } catch (error) {
    console.error("Error storing document:", error);
    throw error;
  }
}