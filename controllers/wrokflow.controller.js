import dayjs from "dayjs";
import { createRequire } from "module";
import Subscription from "../models/subscription.model.js";
import { sendRemindersEmail } from "../utils/send-email.js";

const require = createRequire(import.meta.url);

const { serve } = require("@upstash/workflow/express");

const REMINDERS = [7, 5, 2, 1];
export const sendReminders = serve(async (context) => {
  const payload = context.requestPayload || {};
  const subscriptionId =
    payload.subscriptionId ??
    payload.id ??
    payload?.subscription?.id ??
    (typeof payload.subscriptionId === "object" &&
      payload.subscriptionId?.$oid) ??
    undefined;
  if (!subscriptionId) {
    console.warn("Workflow: missing subscriptionId in request payload");
    return;
  }
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);
  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`
    );
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `reminder-${daysBefore}`,
        reminderDate,
        subscriptionId
      );
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription
      );
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  const find = () =>
    Subscription.findById(subscriptionId).populate({
      path: "user",
      select: "name email",
    });

  // When requests aren't authenticated by Upstash, context.upstashClient is undefined.
  // Fall back to direct DB calls to support local testing.
  if (context?.upstashClient?.run) {
    return await context.upstashClient.run("get subscription", () => find());
  }
  console.warn("Workflow: Upstash client unavailable, running direct DB query");
  return await find();
};

const sleepUntilReminder = async (context, label, date, subscriptionId) => {
  console.log(
    `Sleeping until ${label} for subscription ${subscriptionId} on ${date.format(
      "YYYY-MM-DD"
    )}`
  );
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`);
    await sendRemindersEmail({
      to: subscription?.user?.email,
      type: label,
      subscription,
    });
  });
};
