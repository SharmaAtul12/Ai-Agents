import 'dotenv/config';
import {Agent, InputGuardrailTripwireTriggered, run} from '@openai/agents';
import {z} from 'zod';

// Helper agent to check if the user query is a valid maths question or not , It will be used as an input guardrail for the main maths agent
const mathInputAgent = new Agent({
  name : 'Math query checker',
  model : 'gpt-5-mini-2025-08-07',
  instructions: `
    You are an input guardrail agent that checks if the user query is a maths question or not
    Rules : 
    - The question has to be a valid maths question that can be solved by a calculator or by hand
    - Reject any other kind of question even if related to maths 
  `,
  outputType : z.object({
    isValidMathsQuestion: z.boolean().describe('Indicates whether the user query is a valid maths question or not'),
    reason : z.string().optional().describe('reason to reject the query if it is not a valid maths question')
  })
})

// The input guardrail that uses the above agent to check the user query before reaching the main maths agent
const mathInputGuardrail = {
  name: 'Math Homework Guardrail',
  execute: async ({input}) => { // This Input is the user query , It first pass through the guardrail before reaching the agent 
    const result = await run(mathInputAgent, input);
    return {
      outputInfo : result.finalOutput.reason,
      tripwireTriggered: !result.finalOutput.isValidMathsQuestion
    }
  }
}

const mathsAgent = new Agent({
  name: 'Maths Agent',
  model: 'gpt-5-mini-2025-08-07',
  instructions: 'You are an expert maths ai agent',
  inputGuardrails: [mathInputGuardrail]
})

async function main(query = '') {
  try {
    const result = await run(mathsAgent, query);
    console.log(result.finalOutput);
  } catch (e) {
    if(e instanceof InputGuardrailTripwireTriggered) {
      console.log(`Invalid Input : Rejected Because ${e.message}`)
    } else {
      console.log("API Error")
    }
  }
}

main('what is const keyword in javascript?') // Invalid Maths Question;

