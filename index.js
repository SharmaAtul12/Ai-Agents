import 'dotenv/config'
import {Agent, run} from '@openai/agents';

// const helloAgent = new Agent({
//   name: 'Hello Agent',
//   model: 'gpt-5-mini-2025-08-07',
//   instructions: 'You are an agent that always says hello world with users name'
// })

// run(helloAgent, "Hey There , My name is Atul Sharma")
// .then((result) => {
//   console.log(result.finalOutput)
// })

// Instruction Can Also be Function 
const location = 'USA';

// Here the instruction is a function that checks the location and returns different instructions based on the location. If the location is India, it will return an instruction to say hello world in Hinglish, otherwise it will return a generic instruction to just talk to the user.
const helloAgentWithFunction = new Agent({
  name: 'Hello Agent With Function',
  model: 'gpt-5-mini-2025-08-07',
  instructions: function() {
    if(location === 'India') {
      return 'You are an agent that always says hello world with users name in Hinglish'
    } else {
      return 'Just talk to user'
    }
  }
}) 

run(helloAgentWithFunction, "Hey There , My name is Atul Sharma")
.then((result) => {
  console.log(result.finalOutput)
})