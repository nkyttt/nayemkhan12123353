export interface SendReceiptParams {
  accessToken: string;
  recipientEmail: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  items: Array<{ title: string; price: number; fileName: string; licenseKey?: string }>;
  downloadTokenUrl?: string;
}

export async function sendOrderReceiptViaGmail(params: SendReceiptParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { accessToken, recipientEmail, customerName, orderId, totalAmount, items } = params;

  if (!accessToken) {
    throw new Error("Gmail OAuth access token is required. Please sign in with Google.");
  }

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #2a3449;">
        <td style="padding: 12px 8px; color: #ffffff; font-weight: bold;">${item.title}</td>
        <td style="padding: 12px 8px; color: #00f0ff;">${item.fileName}</td>
        <td style="padding: 12px 8px; color: #a0aec0; font-family: monospace;">${item.licenseKey || "CXT-" + Math.random().toString(36).substring(2, 9).toUpperCase()}</td>
        <td style="padding: 12px 8px; color: #48bb78; text-align: right;">$${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>GameHub CXT Order Confirmation</title>
      </head>
      <body style="background-color: #090d16; color: #e2e8f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="background: linear-gradient(135deg, #00f0ff 0%, #7928ca 100%); padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 26px; text-transform: uppercase; letter-spacing: 2px;">⚡ GAMEHUB CXT</h1>
            <p style="margin: 6px 0 0 0; color: #f0fdfa; font-size: 14px;">Order & License Key Confirmation</p>
          </div>
          
          <div style="padding: 24px;">
            <p style="font-size: 16px; color: #ffffff; margin-top: 0;">Hello <strong>${customerName}</strong>,</p>
            <p style="color: #94a3b8; line-height: 1.6;">Thank you for your order! Your digital files and verified software licenses are ready for immediate deployment.</p>
            
            <div style="background-color: #0d111a; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #94a3b8;">Order ID:</span>
                <span style="color: #00f0ff; font-weight: bold; font-family: monospace;">#${orderId}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #94a3b8;">Date:</span>
                <span style="color: #ffffff;">${new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <h3 style="color: #00f0ff; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">Items & Access Keys</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
              <thead>
                <tr style="color: #64748b; text-align: left; border-bottom: 1px solid #1e293b;">
                  <th style="padding: 8px;">Product</th>
                  <th style="padding: 8px;">Package</th>
                  <th style="padding: 8px;">License Key</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #1f2937; text-align: right;">
              <span style="color: #94a3b8; font-size: 16px; margin-right: 12px;">Total Paid:</span>
              <span style="color: #38ef7d; font-size: 22px; font-weight: bold;">$${totalAmount.toFixed(2)} USD</span>
            </div>

            <div style="margin-top: 28px; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
                Need help with your downloads? Reply directly to this email or visit our Discord community.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  // UTF-8 to Base64URL encoding according to RFC 2822
  const subject = `⚡ Your GameHub CXT Order Confirmation (#${orderId.slice(0, 8)})`;
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${recipientEmail}`,
    `Subject: ${utf8Subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    emailHtml,
  ];

  const rawMessage = messageParts.join("\r\n");
  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail API HTTP error: ${response.status}`);
  }

  const result = await response.json();
  return { success: true, messageId: result.id };
}
