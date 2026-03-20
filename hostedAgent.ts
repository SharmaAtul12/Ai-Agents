import 'dotenv/config';
import {Agent, run, hostedMcpTool} from '@openai/agents';
import {z} from 'zod';

export const agent = new Agent({
  name: 'MCP Assistant',
  model: 'gpt-5-mini-2025-08-07',
  instructions: 'You must always use the MCP tools to answer questions.',
  tools: [
    hostedMcpTool({
      serverLabel: 'gitmcp',
      serverUrl: 'https://gitmcp.io/openai/codex', // MCP ka url aayega yahan pp 
    }),
  ],
});

async function main(query: string) {
  const result = await run(agent, query);
  console.log('Agent response:', result.finalOutput);
}

main("What is this Repository about?");