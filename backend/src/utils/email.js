import nodemailer from "nodemailer";

let transporter;

// create the transporter
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

export async function sendVerificationEmail(to, code) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your verification code",
    html: `
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:4px">${code}</h1>
      <p>It expires in 3 minutes.</p>
    `,
  });
}
