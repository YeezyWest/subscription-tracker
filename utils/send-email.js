import transporter from "../config/nodemailer.js";
import { NODEMAILER_EMAIL } from "../config/env.js";
import {
  sendRemindersEmail as emailTemplates,
} from "./email-template.js";

export const sendRemindersEmail = async ({ to, type, subscription }) => {
  if (!to || !type || !subscription) {
    const error = new Error("missing required parameters");
    error.statusCode = 400;
    throw error;
  }

  const template = emailTemplates.find((t) => t.label === type);

  if (!template) {
    const error = new Error("invalid template type");
    error.statusCode = 400;
    throw error;
  }

  const mailInfo = template.build({
    userName: subscription?.user?.name ?? "there",
    subscriptionName: subscription?.name ?? "Subscription",
    renewalDate: subscription?.renewalDate,
    planName: subscription?.name
      ? `${subscription.frequency[0].toUpperCase()}${subscription.frequency.slice(
          1
        )}`
      : "",
    price: `${subscription?.currency} ${subscription?.price} (${subscription?.frequency})`,
    PaymentMethod: subscription?.paymentMethod,
    accountSettingsLink: "#",
    supportLink: "#",
    daysLeft: template?.daysLeft,
  });

  const message = template.generateBody(mailInfo);
  const subject = template.generateSubject(mailInfo);

  const mailOptions = {
    from: NODEMAILER_EMAIL,
    to: to,
    subject: subject,
    html: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }
    console.log("Email sent:", info.response);
  });
};
