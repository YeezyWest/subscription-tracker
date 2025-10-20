// Generates a styled HTML email for subscription reminders and notifications
// Returns an object with both html and text variants for Nodemailer

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (date) => {
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "TBD";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "TBD";
  }
};

const formatPrice = (amount) => {
  if (amount === undefined || amount === null || amount === "") return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `$${amount}`;
  }
};

export const generateEmailTemplate = ({
  userName = "there",
  subscriptionName = "Your subscription",
  renewalDate,
  planName = "",
  price,
  PaymentMethod = "",
  accountSettingsLink = "#",
  supportLink = "#",
  daysLeft,
} = {}) => {
  const formattedDate = formatDate(renewalDate);
  const formattedPrice = formatPrice(price);
  const safeUser = escapeHtml(userName);
  const safeSub = escapeHtml(subscriptionName);
  const safePlan = escapeHtml(planName);
  const safeMethod = escapeHtml(PaymentMethod);
  const safeAccountLink = escapeHtml(accountSettingsLink);
  const safeSupportLink = escapeHtml(supportLink);
  const safeDaysLeft = daysLeft ?? "";

  const subject = `${safeSub} renews on ${formattedDate}`;

  const text = [
    `Hi ${safeUser},`,
    `\n`,
    `${safeSub} is scheduled to renew on ${formattedDate}.`,
    safePlan ? `Plan: ${safePlan}` : undefined,
    `Price: ${formattedPrice}`,
    safeMethod ? `Payment Method: ${safeMethod}` : undefined,
    safeDaysLeft !== "" ? `Days until renewal: ${safeDaysLeft}` : undefined,
    `\n`,
    `Manage your subscription: ${accountSettingsLink}`,
    `Need help? Contact support: ${supportLink}`,
    `\n`,
    `Thanks,`,
    `Subscription Tracker`,
  ]
    .filter(Boolean)
    .join("\n");

  // Inline-styled, mobile-friendly layout using tables for broad email client support
  const html = `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${escapeHtml(subject)}</title>
      <style>
        /* Fallback styles for clients that support <style> */
        @media (prefers-color-scheme: dark) {
          .email-body { background-color: #0b0f19 !important; }
          .card { background-color: #111827 !important; color: #e5e7eb !important; }
          .muted { color: #9ca3af !important; }
          .btn { background-color: #6366f1 !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#f4f5f7;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="email-body" style="background:#f4f5f7;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
              <tr>
                <td style="text-align:center;padding:8px 0;">
                  <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#6b7280;">Subscription Tracker</div>
                </td>
              </tr>
              <tr>
                <td class="card" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.08);overflow:hidden;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding:24px 24px 8px 24px;">
                        <h1 style="margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:20px;line-height:28px;color:#111827;">Hi ${safeUser},</h1>
                        <p style="margin:12px 0 0 0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#374151;">
                          <strong>${safeSub}</strong> is scheduled to renew on <strong>${formattedDate}</strong>.
                          ${
                            safeDaysLeft !== ""
                              ? `That’s in <strong>${escapeHtml(
                                  safeDaysLeft
                                )}</strong> day${
                                  safeDaysLeft === 1 ? "" : "s"
                                }.`
                              : ""
                          }
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 24px 16px 24px;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                          <tr>
                            <td style="padding:16px 16px;">
                              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                ${
                                  safePlan
                                    ? `
                                <tr>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;width:35%;">Plan</td>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#111827;">${safePlan}</td>
                                </tr>`
                                    : ""
                                }
                                <tr>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;width:35%;">Price</td>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#111827;">${formattedPrice}</td>
                                </tr>
                                ${
                                  safeMethod
                                    ? `
                                <tr>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;width:35%;">Payment Method</td>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#111827;">${safeMethod}</td>
                                </tr>`
                                    : ""
                                }
                                <tr>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#6b7280;width:35%;">Renewal Date</td>
                                  <td style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#111827;">${formattedDate}</td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:8px 24px 24px 24px;text-align:center;">
                        <a href="${safeAccountLink}" class="btn" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;padding:12px 18px;border-radius:8px;">
                          Manage Subscription
                        </a>
                        <div class="muted" style="margin-top:12px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#6b7280;">
                          Need help? <a href="${safeSupportLink}" style="color:#4f46e5;text-decoration:none;">Contact support</a>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="text-align:center;padding:16px 0;">
                  <div class="muted" style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;color:#9ca3af;">
                    You’re receiving this email because you opted in to subscription reminders.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  return { subject, html, text };
};

export const sendRemindersEmail = [
  {
    label: "7 days before reminder",
    daysLeft: 7,
    build: (ctx) => generateEmailTemplate({ ...ctx, daysLeft: 7 }),
  },
  {
    label: "5 days before reminder",
    daysLeft: 5,
    build: (ctx) => generateEmailTemplate({ ...ctx, daysLeft: 5 }),
  },
  {
    label: "2 days before reminder",
    daysLeft: 2,
    build: (ctx) => generateEmailTemplate({ ...ctx, daysLeft: 2 }),
  },
  {
    label: "1 day before reminder",
    daysLeft: 1,
    build: (ctx) => generateEmailTemplate({ ...ctx, daysLeft: 1 }),
  },
];
