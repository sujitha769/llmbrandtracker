import nodemailer from "nodemailer";

export default async function sendEmail(to, subject, message) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message
    });

    console.log("📧 Email sent successfully");
  } catch (error) {
    console.error("❌ Email sending error:", error.message);
  }
}
