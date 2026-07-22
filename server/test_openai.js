require('dotenv').config({ path: '/Users/nagendrakumarsharma/Desktop/Ravi/server/.env' });
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function test() {
  try {
    console.log("Testing OpenAI with key:", process.env.OPENAI_API_KEY ? "Present" : "Missing");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello" }]
    });
    console.log("Success:", completion.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
