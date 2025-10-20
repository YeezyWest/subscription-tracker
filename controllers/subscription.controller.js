import { workflowClient } from "../config/upstash.js";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    });

    let workflowRunId = null;
    try {
      const base = SERVER_URL || `${req.protocol}://${req.get("host")}`;
      const triggerResult = await workflowClient.trigger({
        url: `${base}/api/v1/workflows/subscription/reminder`,
        body: {
          subscriptionId: subscription._id.toString(),
        },
        headers: {
          "Content-Type": "application/json",
        },
        retries: 3,
      });
      workflowRunId =
        triggerResult?.workflowRunId ||
        triggerResult?.id ||
        triggerResult?.data?.workflowRunId ||
        null;
    } catch (workflowError) {
      console.warn(
        "Workflow trigger failed:",
        workflowError?.message || workflowError
      );
    }

    res.status(201).json({
      message: "Subscription created successfully",
      subscription,
      workflowRunId,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    //check if user is the same as the one in the token
    if (req.user._id.toString() !== req.params.id) {
      const error = new Error("You are not the owner of this account");
      error.statusCode = 401;
      throw error;
    }

    const subscriptions = await Subscription.find({ user: req.params.id });
    res.status(200).json({
      message: "Subscriptions retrieved successfully",
      subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find();
    res.status(200).json({
      message: "Subscriptions retrieved successfully",
      subscriptions,
    });
  } catch (error) {
    next(error);
  }
};
