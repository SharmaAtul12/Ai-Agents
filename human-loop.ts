import 'dotenv/config';
import {Agent, run, tool} from '@openai/agents';
import {z} from 'zod';
import axios from 'axios';
import { Resend } from 'resend';
import readline from 'node:readline/promises';

const resend = new Resend(process.env.RESEND_API_KEY);

// Tool for getting the weather information of a city, it doesn't need approval before executing the tool
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

// Tool for sending email to the user with the weather information, it needs approval before executing the tool
const sendEmailTool = tool({
  name: 'send_email',
  description: 'send the email to the user with the weather information',
  parameters: z.object({
    to : z.string().describe('email address of the user'),
    subject : z.string().describe('subject of the email'),
    html : z.string().describe('html body of the email')
  }),
  needsApproval: true,
  execute : async function ({to, subject, html}) {
    console.log("⛏️ Tool Execution : Email Sending ")
    const res = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: subject,
      html: html
    })
    console.log("Email Response : ", res)
  }
})

const agent = new Agent({
  name: 'weather_agent',
  model: 'gpt-5-mini-2025-08-07',
  instructions: `You're a expert agent in getting weather info and sending it using email to the user`,
  tools: [getWeatherTool, sendEmailTool]
})

// Function to ask user for permission to execute a tool when an interruption occurs
async function askForUserPermission(ques: string) {
   const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`${ques} (y/n): `);
  const normalizedAnswer = answer.toLowerCase();
  rl.close();
  return normalizedAnswer === 'y' || normalizedAnswer === 'yes'; // Return true for 'y' or 'yes', false otherwise
}

async function main(query: string) {
  let result = await run(agent, query);
  let hasInterruptions = result.interruptions.length > 0;
  while(hasInterruptions) {
    const currentState = result.state;
    for(const interrupt of result.interruptions) {
      if(interrupt.type === 'tool_approval_item') {
        const isAllowed = await askForUserPermission(`Agent ${interrupt.agent.name} Is Asking for Calling the tool ${interrupt.name} with args ${interrupt.arguments}`);
        if(isAllowed) {
          currentState.approve(interrupt)
        } else {
          currentState.reject(interrupt)
        }
        result = await run(agent, currentState);
        hasInterruptions = result.interruptions?.length > 0;
      }
    }
  }
}

main('What is the weather in Delhi ? and send me an email on atulsharmap06@gmail.com with the weather information');