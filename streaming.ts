import 'dotenv/config';
import {Agent, run, tool, RunContext} from '@openai/agents'; 
import {z} from 'zod';


const agent = new Agent({
  name: 'Storyteller',
  model : 'gpt-5-mini-2025-08-07',
  instructions:
    'You are a storyteller. You will be given a topic and you will tell a story about it.',
});

// --------------------------------- Way 1: Using async iterators ---------------------------------

/*
async function main(query: string) {
  const result = await run(agent, query, {stream: true});
  const stream = result.toTextStream();
  
  for await (const val of stream) {
    console.log(val);
  }
}
*/

// --------------------------------- Way 2: Using Node.js streams ---------------------------------

/*
async function main(query: string) {
  const result = await run(agent, query, {stream: true});
  result.toTextStream({compatibleWithNodeStreams: true}).pipe(process.stdout);
}
*/

// --------------------------------- Way 3: Using JS Generator  ---------------------------------

async function* streamOutput(query: string) {
  const result = await run(agent, query, {stream: true});
  const stream = result.toTextStream();

  for await (const val of stream) {
    yield {isCompleted: false, value: val};
  }

  yield {isCompleted: true, value: result.finalOutput};
}

async function main(query: string) {
  for await (const o of streamOutput(query)) {
    console.log(o);
  }
}


main('Tell me a story of 100 words about a dragon and a princess.');