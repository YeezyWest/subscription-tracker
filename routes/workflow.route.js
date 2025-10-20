import { Router } from "express";
import { sendReminders } from "../controllers/wrokflow.controller.js";

const workflowRouter = Router();

// Upstash Workflow entrypoint
workflowRouter.post("/subscription/reminder", sendReminders);

export default workflowRouter;
