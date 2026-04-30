import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'


interface PasswordResetEmailProps {
  userFirstName?: string
  resetPasswordLink?: string
}

export const PasswordResetEmail = ({
  userFirstName,
  resetPasswordLink,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Tu Tribu password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://tutribu.com/images/logo.png" // Replace with actual absolute URL if available
          width="170"
          height="50"
          alt="Tu Tribu"
          style={logo}
        />
        <Heading style={heading}>Reset your password</Heading>
        <Text style={paragraph}>Hi {userFirstName},</Text>
        <Text style={paragraph}>
          Someone requested a password reset for your Tu Tribu account. If this
          was you, you can set a new password here:
        </Text>
        <Section style={buttonContainer}>
          <Button
            style={button}
            href={resetPasswordLink}
          >
            Reset password
          </Button>
        </Section>
        <Text style={paragraph}>
          If you don't want to change your password or didn't request this, just
          ignore and delete this message.
        </Text>
        <Text style={paragraph}>
          To keep your account secure, please don't forward this email to
          anyone. The link will expire in 5 minutes.
        </Text>
        <Hr style={hr} />
        <Link
          href="https://tutribu.com"
          style={reportLink}
        >
          Tu Tribu Viajera
        </Link>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logo = {
  margin: '0 auto',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
  textAlign: 'center' as const,
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
  padding: '0 40px',
}

const buttonContainer = {
  padding: '27px 0 27px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#3B6BF6', // Brand color
  borderRadius: '5px',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '200px',
  padding: '14px 7px',
  margin: '0 auto',
}

const reportLink = {
  fontSize: '14px',
  color: '#b4becc',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
}

const hr = {
  borderColor: '#dfe1e4',
  margin: '42px 0 26px',
}
