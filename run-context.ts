import 'dotenv/config';
import {Agent, run, tool, RunContext} from '@openai/agents'; 
import {z} from 'zod';


// -------------------------------------------------- 1st Way => Using Context Directly --------------------------------------------------

interface MyContext {
  userId: string;
  userName: string;
}

// This agent will receive a context object that follows the structure of MyContext
const customerSupportAgent = new Agent<MyContext>({
  name: 'Customer Support Agent',
  model: 'gpt-5-mini-2025-08-07',
  // We can Access the context in the instructions function to provide more relevant instructions to the agent
  instructions: ({context}) => {
    return `You're an expert customer support agent\n Context: ${JSON.stringify(context)}`;
  }
});

async function main(query: string, ctx : MyContext) {
  // Passing the context to the run function, which will be accessible in the agent's instructions and throughout its execution
  const result = await run(customerSupportAgent, query, {context: ctx,});
  console.log('Agent Result:', result.finalOutput);
}

main('Hey, what is my name', {
  userId: '1',
  userName: 'Atul',
});


// -------------------------------------------------- 2nd Way => Using Tools --------------------------------------------------

/*
interface MyContext {
  userId: string;
  userName: string;
}

const getUserInfoTool = tool({
  name: 'getUserInfo',
  description: 'Gets the User Info',
  parameters: z.object({}),
  execute: async (_, ctx?: RunContext<MyContext>) : Promise<string> => {
    return `UserID=${ctx?.context.userId}\nUserName=${ctx?.context.userName}`;
  }
})

const customerSupportAgent = new Agent<MyContext>({
  name: 'Customer Support Agent',
  model: 'gpt-5-mini-2025-08-07',
  tools: [getUserInfoTool],
  instructions: () => {
    return `You're an expert customer support agent`;
  }
});

async function main(query: string, ctx : MyContext) {
  const result = await run(customerSupportAgent, query, {context: ctx,});
  console.log('Agent Result:', result.finalOutput);
}

main('Hey, what is my name', {
  userId: '1',
  userName: 'Atul',
});
*/

// --------------------------------------------------- 3rd Way => Dependency Injection --------------------------------------------------

/*
interface MyContext {
  userId: string;
  userName: string;
  fetchUserInfoFromDB: () => Promise<string>
}

const getUserInfoTool = tool({
  name: 'getUserInfo',
  description: 'Gets the User Info',
  parameters: z.object({}),
  execute: async (_, ctx?: RunContext<MyContext>) : Promise<string | undefined> => {
    const result = await ctx?.context.fetchUserInfoFromDB();
    return result;
  }
})

const customerSupportAgent = new Agent<MyContext>({
  name: 'Customer Support Agent',
  model: 'gpt-5-mini-2025-08-07',
  tools: [getUserInfoTool],
  instructions: () => {
    return `You're an expert customer support agent`;
  }
});

async function main(query: string, ctx : MyContext) {
  const result = await run(customerSupportAgent, query, {context: ctx,});
  console.log('Agent Result:', result.finalOutput);
}

main('Hey, what is my name', {
  userId: '1',
  userName: 'Atul Sharma',
  // In this way, we can inject any dependencies (like database calls, API calls, etc.) into the agent's context, 
  // and the agent can use those dependencies in its tools or instructions without needing to know about the underlying implementation details.
  fetchUserInfoFromDB: async () => `UserID=1,UserName=Atul Sharma`
});

*/