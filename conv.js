import 'dotenv/config';
import {Agent, run, tool} from '@openai/agents';
import {z} from 'zod';

let sharedHistory = [];

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

// this is the agent which will generate the SQL query as per user request and then execute it using the tool defined above
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

  // Store the message in shared history
  sharedHistory.push({role : 'user', content : query});

  // Yha par ab query nhi pass kr rhe , yha ab puri history pass kr rhe , 
  // taki agent ko pure context mile ki user ne pehle kya bola tha , aur ab kya bola hai
  const result = await run(sqlAgent, sharedHistory);
  
  sharedHistory = result.history; // Update shared history with the agent's response

  // console.log(result.history); 
  console.log(`Final Output : ${result.finalOutput}`);
}

// TURN 1
main('Hi My name is Atul').then(() => {
  // TURN 2 => this turn not have the context of first turn , as each turn is independent of each other currently 
  main('Get me all the users with my name')
})