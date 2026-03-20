import 'dotenv/config';
import {Agent, run, MCPServerStreamableHttp} from '@openai/agents';
import {z} from 'zod';

// Creating MCP Server instance for GitMCP Documentation
const githubMcpServer = new MCPServerStreamableHttp({
  url: 'https://gitmcp.io/openai/codex',
  name: 'GitMCP Documentation Server',
})

export const agent = new Agent({
  name: 'MCP Assistant',
  model: 'gpt-5-mini-2025-08-07',
  instructions: 'You must always use the MCP tools to answer questions.',
  mcpServers: [githubMcpServer],
});

async function main(query: string) {
  try {
    await githubMcpServer.connect(); // Connect to the MCP server before running the agent
    const result = await run(agent, query);
    console.log('Agent response:', result.finalOutput);
  } finally {
    await githubMcpServer.close(); // Ensure the MCP server connection is closed after use
  }
}

main("What is this Repository about?");