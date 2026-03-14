import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";
import fs from "node:fs/promises";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

// Refund Agent and its tool

const processRefund = tool({
  name: "process_refund",
  description: `This tool processes the refund for a customer `,
  parameters: z.object({
    customerId: z.string().describe("id of the customer"),
    reason: z.string().describe("reason for  refund"),
  }),
  execute: async function ({ customerId, reason }) {
    await fs.appendFile(
      "./refunds.txt",
      `Refund Processed for Customer : ${customerId} with reason : ${reason}\n`,
      "utf-8",
    );
    return { refundIssued: true };
  },
});

const refundAgent = new Agent({
  name: "Refund Agent",
  model: "gpt-5-mini-2025-08-07",
  modelSettings: {
    toolChoice: "required",
  },
  instructions: `
  You are a refund specialist.
  For every refund/cancellation/billing-dispute request, you MUST use process_refund.

  Rules:
  1) If both customerId and reason are present, call process_refund immediately.
  2) If customerId or reason is missing, ask only for the missing field(s), then call process_refund.
  3) Never say "refund processed" unless process_refund has executed successfully.
  4) After the tool call succeeds, confirm the refund with customerId and reason.
  5) Do not ask for account email, invoice number, or payment method when customerId and reason are already provided.
`,
  tools: [processRefund],
});

// Sales Agent and its tool

const fetchAvailablePlans = tool({
  name: "fetch_available_plans",
  description: "Fetches the available plans for internet",
  parameters: z.object({}),
  execute: async function () {
    return [
      { plan_id: "1", price_inr: 399, speed: "30MB/s" },
      { plan_id: "2", price_inr: 599, speed: "100MB/s" },
      { plan_id: "3", price_inr: 999, speed: "250MB/s" },
    ];
  },
});

const salesAgent = new Agent({
  name: "Sales Agent",
  model: "gpt-5-mini-2025-08-07",
  instructions: `
  You are a broadband sales agent.
  When the user asks about internet plans, pricing, or speeds,
  you MUST call the fetch_available_plans tool to retrieve the plans.
  Explain the plans clearly to the user after retrieving them. If the user has any questions about refunds or cancellations, use refund_expert tool.
  `,
  tools: [
    fetchAvailablePlans,
    refundAgent.asTool({
      toolName: "refund_expert",
      toolDescription: "Handles refund questions and request",
    }),
  ],
});

// Reception Agent

const receptionAgent = new Agent({
  name: "Reception Agent",
  model: "gpt-5-mini-2025-08-07",
  handoffDescription:
    "Front-desk router agent that transfers users to specialist agents.",
  instructions: `
  ${RECOMMENDED_PROMPT_PREFIX}
    You are a front-desk router for an internet company.
    If the request is about internet plans, speeds, pricing, or new connections,
    handoff to the Sales Agent.
    If the request is about refunds, cancellations, or billing disputes,
    handoff to the Refund Agent.
    Do not answer detailed questions yourself. Let the specialist agent respond.
  `,
  handoffs: [salesAgent, refundAgent],
});

async function main(query = '') {
  const result = await run(receptionAgent, query);
  console.log(`Result : `, result.finalOutput);
}

main(
  `I want a refund. customerId is cust_234 and reason is slow internet speed.`,
);
