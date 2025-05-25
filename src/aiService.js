const { OpenAI } = require("openai");

require("dotenv").config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let openai = null;

// Initialize OpenAI API if the api is set
if (OPENAI_API_KEY && OPENAI_API_KEY !== 'not_set') {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
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

    return {
      response: completion.choices[0].message.content,
    }
  } catch (error) {
    console.error("OpenAI API Error:", error.response ? error.response.data : error.message);
    return { error: `OpenAI API Error: ${error.message}` }
  }
};


module.exports = { askChatGPT };
