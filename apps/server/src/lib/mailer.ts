import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import { PasswordResetEmail } from './templates/PasswordResetEmail'
import React from 'react'

const port = parseInt(process.env.SMTP_PORT || '587')
// Port 465 is for implicit TLS (secure: true).
// Port 587 and others use STARTTLS (secure: false).
const isSecure = port === 465

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // If rejectUnauthorized is specifically set to true, use it, otherwise default to false for compatibility
    rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'true',
    // Often required for some SMTP servers to prevent the "subject" destructuring error
    servername: process.env.SMTP_HOST,
  },
})

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  resetLink: string,
) => {
  const emailHtml = await render(
    React.createElement(PasswordResetEmail, {
      userFirstName: firstName,
      resetPasswordLink: resetLink,
    }),
  )

  if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
    console.warn('SMTP credentials missing. Logging email content to console.')
    console.log(`
      To: ${email}
      Subject: Reset your password
      Link: ${resetLink}
    `)
    return
  }

  try {
    const info = await transporter.sendMail({
      from: `"Tu Tribu" <${process.env.SMTP_FROM || 'noreply@tutribu.com'}>`, // sender address
      to: email, // list of receivers
      subject: 'Reset your password', // Subject line
      html: emailHtml, // html body
    })
    return info
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}
