import { Resend } from "resend";

console.log("Has Resend key:", !!process.env.RESEND_API_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to, code) {
  const { data, error } = await resend.emails.send({
    from: "Syntax IDE <onboarding@resend.dev>",
    to,
    subject: "Your verification code",
    html: `
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:4px">${code}</h1>
      <p>It expires in 3 minutes.</p>
    `,
  });

  console.log("Resend data:", data);
  console.log("Resend error:", error);

  if (error) {
    throw new Error(error.message);
  }
}
