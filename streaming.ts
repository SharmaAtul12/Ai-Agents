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


async function main(query: string) {
  const result = await run(agent, query, {stream: true});
  // This converts the result into an Async Iterable stream.
  const stream = result.toTextStream();
  
  for await (const val of stream) {
    console.log(val);
  }
}



// --------------------------------- Way 2: Using Node.js streams ---------------------------------

/*
async function main(query: string) {
  const result = await run(agent, query, {stream: true});
  // “Convert AI response into a Node.js stream and directly print it to terminal in real-time.”
  // So we don't need to use an async iterator, we can directly pipe the stream to process.stdout.
  result.toTextStream({compatibleWithNodeStreams: true}).pipe(process.stdout);
}
*/

// ------------- Way 3: Using JS Generator So that to send structured output  ---------------------------------

/*
async function* streamOutput(query: string) {
  const result = await run(agent, query, {stream: true});
  const stream = result.toTextStream();

  for await (const val of stream) {
    yield {isCompleted: false, value: val}; // Yielding structured output with a flag to indicate if the stream is completed or not.
  }

  yield {isCompleted: true, value: result.finalOutput}; // Once the stream is completed, we yield the final output with a flag to indicate completion.
}

async function main(query: string) {
  for await (const o of streamOutput(query)) {
    console.log(o);
  }
}
*/


main('Tell me a story of 100 words about a dragon and a princess.');