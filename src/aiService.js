const { OpenAI } = require("openai");

require("dotenv").config();

let openai = null;
const apiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI API if the api is set
if (apikey && apikey !== 'not_set') {
  openai = new OpenAI({ apiKey });
} else {
  console.warn("OPENAI_API_KEY is not set. AI features are disabled.");
}

// Function to send a message to ChatGPT
const askChatGPT = async (message) => {
  if (!openai) {
    return {
      error: "AI features is currently disabled because the API key is missing.",
    };
  }
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [{ role: "user", content: message }],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.response ? error.response.data : error.message);
    return `Error: ${error.message}`;
  }
};


module.exports = { askChatGPT };
