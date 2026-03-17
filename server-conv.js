import 'dotenv/config';
import {Agent, run, tool} from '@openai/agents';
import {z} from 'zod';


const executeSQL = tool({
  name : 'execute_sql',
  description: 'This Execute the SQL Query',
  parameters : z.object({
    sql : z.string().describe('the sql query')
  }),
  execute : async function ({sql}) {
    console.log(`[SQL] : Execute ${sql}`);
    return 'done';
  }
})


const sqlAgent = new Agent({
  name : 'SQL ExpertAgent',
  model : 'gpt-5-mini-2025-08-07',
  instructions: `
    You are an SQL Agent that is specialized in generating SQL queries as per user request.
    Postgres Schema :
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE comments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  tools: [executeSQL]
});

async function main(query= '') {
  const result = await run(sqlAgent, query , {
    conversationId : 'conv_69b989982c1c81938e0792f17610bec407487a87bf297eaf'
  });

  console.log(`Final Output : ${result.finalOutput}`);
}

// TURN 1
main('Write a query to get all users with my name');