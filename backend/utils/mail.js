import nodemailer from "nodemailer";

const getTransporter = () => {
  const fromEmail = process.env.EMAIL;
  const pass = process.env.PASS;

  if (!fromEmail || !pass) return null;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: fromEmail,
      pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  // Dev fallback: no credentials configured.
  if (!transporter) {
    console.log(`[DEV] EMAIL not configured. Would send to ${to}: ${subject}`);
    if (text) console.log(text);
    return;
  }

  const from = process.env.EMAIL;
  await transporter.sendMail({ from, to, subject, text, html });
};

export const sendOtpMail = async (email, otp) => {
  const subject = "Your Vingo OTP";
  const text = `Your OTP is: ${otp}. It will expire in 5 minutes.`;
  const html = `<p>Your OTP is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`;

  try {
    await sendMail({ to: email, subject, text, html });
  } catch (e) {
    console.error("Failed to send OTP email:", e);
    throw new Error("Failed to send OTP email");
  }
};

export const sendEmailVerificationOtpMail = async (email, otp) => {
  const subject = "Verify your Vingo email";
  const text = `Your email verification OTP is: ${otp}. It will expire in 5 minutes.`;
  const html = `<p>Your email verification OTP is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`;

  try {
    await sendMail({ to: email, subject, text, html });
  } catch (e) {
    console.error("Failed to send email verification OTP:", e);
    throw new Error("Failed to send email verification OTP");
  }
};

export const sendDeliveryOtpMail = async (email, otp) => {
  const subject = "Your Vingo Delivery OTP";
  const text = `Your delivery OTP is: ${otp}. It will expire in 5 minutes.`;
  const html = `<p>Your delivery OTP is: <b>${otp}</b></p><p>It will expire in 5 minutes.</p>`;

  try {
    await sendMail({ to: email, subject, text, html });
  } catch (e) {
    console.error("Failed to send delivery OTP email:", e);
    throw new Error("Failed to send delivery OTP email");
  }
};
