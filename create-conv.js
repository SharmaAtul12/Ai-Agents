import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

// Creating a conversation and Logging the conversation ID
client.conversations.create({}).then((e) => {
  console.log(`Conversation created with ID: ${e.id}`);
})