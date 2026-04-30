import { Elysia, t } from 'elysia'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import OTPEmail from './templates/otp'
import nodemailer from 'nodemailer'

// Configure your nodemailer transporter here, typically passing SMTP URL from ENV
// We're stubbing it here with generic placeholders following ElysiaJS docs
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: Number(process.env.SMTP_PORT) || 465,
  auth: {
    user: process.env.SMTP_USER || 'user',
    pass: process.env.SMTP_PASS || 'pass',
  },
})

export const emailPlugin = new Elysia({ prefix: '/email' }).post(
  '/otp',
  async ({ body }) => {
    // Generate random 6 character OTP
    const otp = ~~(Math.random() * (900_000 - 1)) + 100_000

    // Render the React Email template to an HTML string
    const html = renderToStaticMarkup(<OTPEmail otp={otp} />)

    // Send using nodemailer
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'support@tutribu.com',
      to: body.email,
      subject: 'Verify your email address',
      html,
    })

    return { success: true, message: 'OTP email sent successfully' }
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
