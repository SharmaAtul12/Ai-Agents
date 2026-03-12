import {Agent, run, tool} from '@openai/agents';
import 'dotenv/config';
import {z} from 'zod';
import axios from 'axios';

// Defining the Structure for Output
const GetWeatherResultSchema = z.object({
  city : z.string().describe('name of the city'),
  degree_c: z.number().describe('temperature in degree celsius'),
  condition: z.string().optional().describe('condition of the weather') 
})

const getWeatherTool = tool({
  name: 'get_weather',
  description: 'returns the current weather information for a given city',
  parameters: z.object({
    city: z.string().describe('name of the city')
  }),
  execute : async function ({city}) {
    console.log(`⛏️ Tool Executing : get_weather with city : ${city}`);
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`
    const response = await axios.get(url, {responseType: 'text'});
    return `The Weather in ${city} is ${response.data}`;
  }
  
})

const agent = new Agent({
  name: "Weather Agent",
  model: "gpt-5-mini-2025-08-07",
  instructions: "You are a expert weather agent that helps user to tell weather report",
  tools: [getWeatherTool],
  outputType: GetWeatherResultSchema
})

async function main(query = '') {
  const result = await run(agent, query);
  console.log(`Result : `, result.finalOutput);
}

main("What is the weather in Delhi ?")