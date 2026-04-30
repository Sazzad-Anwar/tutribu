import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

export default function TripConfirmationEmail() {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3001/public'

  return (
    <Html>
      <Head>
        <style>
          {`
            @font-face {
              font-family: 'times';
              src: url('${baseUrl}/fonts/times.ttf') format('truetype');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
        `}
        </style>
      </Head>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: '#00b4f5', // Approximated cyan/blue from image
                dark: '#2d333a',
                grayText: '#54535A',
              },
              fontFamily: {
                tinos: ['times', 'sans-serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-brand p-5 font-sans text-dark">
          <Container className="min-w-full mx-auto">
            {/* Header Logo */}
            <Section className="text-center mb-5">
              <Img
                src={`${baseUrl}/logo1.png`}
                width="148"
                alt="Tu Tribu Viajera"
                className="mx-auto"
              />
            </Section>

            {/* Main Card 1 */}
            <Section className="p-5 w-full bg-white rounded-[24px]">
              <div className="h-[390px] w-[390px] mx-auto">
                <Img
                  src={`${baseUrl}/check-mark.png`}
                  width="390"
                  height="390"
                  alt="Checkmark"
                />
              </div>
              <div className="flex flex-col items-center">
                <Heading className="text-[36px] font-bold font-tinos">
                  Your Trip is Confirmed!
                </Heading>
                <Text className="text-xl font-normal">
                  Thank you for being with us your trip is being prepared.
                </Text>
              </div>
            </Section>
            <Section className="p-5 w-full bg-white rounded-[24px] mt-5 pt-10">
              <div className="flex flex-col items-center">
                <Heading className="text-2xl font-bold font-tinos text-center">
                  Thank you for booking with Tu Tribu Viajera! <br /> We’re
                  thrilled to be part of your next adventure.
                </Heading>
                <Text className="text-xl font-normal text-center">
                  If you have any questions about your trip, <br /> feel free to
                  contact us.
                </Text>
                <div className="flex justify-between gap-5">
                  <Text className="font-semibold text-xs underline">
                    example@tutribuviajera
                  </Text>
                  <Text className="font-semibold text-xs underline">
                    www.tutribuviajera.com
                  </Text>
                </div>
              </div>
            </Section>
            <Section className="mt-10 flex flex-col items-center space-y-5">
              <Text className="text-xs text-white text-center">
                Follow us for updates :
              </Text>
              <div className="flex items-center gap-5">
                <Link href="https://facebook.com">
                  <Img
                    src={`${baseUrl}/facebook.png`}
                    width="30"
                    height="30"
                  />
                </Link>
                <Link href="https://instagram.com">
                  <Img
                    src={`${baseUrl}/instagram.png`}
                    width="30"
                    height="30"
                  />
                </Link>
                <Link href="https://x.com">
                  <Img
                    src={`${baseUrl}/x.png`}
                    width="30"
                    height="30"
                  />
                </Link>
                <Link href="https://youtube.com">
                  <Img
                    src={`${baseUrl}/youtube.png`}
                    width="30"
                    height="30"
                  />
                </Link>
                <Link href="https://linkedin.com">
                  <Img
                    src={`${baseUrl}/linkedin.png`}
                    width="30"
                    height="30"
                  />
                </Link>
              </div>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
