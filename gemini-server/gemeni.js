require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Generative AI client with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Function to extract keywords using Google Generative AI
async function extractKeywords(question, answer) {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt
    const prompt = `You are an AI specialized in extracting keywords. Based on the following question and answer, extract only the relevant keywords from only answer:
    
    Question: ${question}
    Answer: ${answer}
    
    Provide only the main keywords relevant to the question.`;

    // Generate content using the model
    const result = await model.generateContent(prompt);

    // Debugging the response structure
    console.log("API Response:", JSON.stringify(result, null, 2));

    // Extract text from candidates array
    const responseText = result.response?.candidates?.[0]?.content || ""; // Access the first candidate's content
    if (responseText) {
      return responseText;
    }

    throw new Error("No content found in the API candidates.");
  } catch (error) {
    console.error("Error extracting keywords:", error.message);
    return null;
  }
}

// Example Usage
(async () => {
  const question = "How is your mood today?";
  const answer = "many things happened today, i am happy also depressed also";

  const keywords = await extractKeywords(question, answer);
  console.log("Extracted Keywords:", keywords);
})();
