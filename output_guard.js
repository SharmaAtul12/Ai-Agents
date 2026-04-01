import dotenv from 'dotenv/config';
import {Agent, run} from '@openai/agents';
import {z} from 'zod';


const sqlGuardrailAgent = new Agent({
  name : 'SQL Guardrail Agent',
  model : 'gpt-5-mini-2025-08-07',
  instructions: `
    Check if the SQL query is safe to execute. A safe SQL query should be read only and do not
    modify, delete or drop any table 
  `,
  outputType : z.object({
    reason : z.string().optional().describe('Reason if the query is not safe'),
    isSafe : z.boolean().describe('Whether the query is safe to execute')
  })
});

// Guardrail to check if the SQL query is safe to execute
const sqlGuardrail = {
  name : 'SQL Guardrail',
  execute : async ({agentOutput}) => {
    const result = await run(sqlGuardrailAgent, agentOutput.sqlQuery);
    return {
      outputInfo : result.finalOutput.reason,
      tripwireTriggered: !result.finalOutput.isSafe
    }
  }
}



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
  outputType : z.object({
    sqlQuery: z.string().optional().describe('SQL query')
  }),
  outputGuardrails: [sqlGuardrail]
});

async function main(query= '') {
  const result = await run(sqlAgent, query);
  console.log(`Query : ${result.finalOutput.sqlQuery}`);
}

main("Get me all the users from users table");