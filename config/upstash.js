import { Client as WorkflowClient } from "@upstash/workflow";
import { QSTASH_URL, QSTASH_TOKEN } from "./env.js";

export const workflowClient = new WorkflowClient({
  baseUrl: QSTASH_URL || "https://qstash.upstash.io",
  token: QSTASH_TOKEN,
});
