import { Link } from 'react-router'
import { Separator } from './ui/separator'

export default function Footer() {
  const links = [
    {
      title: 'Services',
      links: [
        { title: 'Terms & Condition', link: '/terms-and-conditions' },
        { title: 'Help & Support', link: '/help-and-support' },
        { title: 'Manage My Booking', link: '/manage-my-booking' },
        { title: 'Travel Insurance', link: '/travel-insurance' },
        { title: 'Cancellation Policy', link: '/cancellation-policy' },
        { title: 'Gift Cards', link: '/gift-cards' },
        { title: 'Contact Us', link: '/contact-us' },
      ],
    },
    {
      title: 'Company',
      links: [
        { title: 'Careers', link: '/careers' },
        { title: 'Press & Media', link: '/press-and-media' },
        { title: 'Blog & Travel Tips', link: '/blog' },
        { title: 'Sustainability', link: '/sustainability' },
        { title: 'Partnerships', link: '/partnerships' },
        { title: 'Affiliates', link: '/affiliates' },
      ],
    },
    {
      title: 'Quick links',
      links: [
        { title: 'Destinations', link: '/destinations' },
        { title: 'Popular Trips', link: '/trips' },
        { title: 'Flights', link: '/flights' },
        { title: 'Hotels', link: '/hotels' },
        { title: 'Car Rentals', link: '/car-rentals' },
        { title: 'Group Tours', link: '/group-tours' },
        { title: 'Special Offers', link: '/special-offers' },
      ],
    },
    {
      title: 'Community',
      links: [
        { title: 'Traveler Reviews', link: '/reviews' },
        { title: 'Refer a Friend', link: '/refer-a-friend' },
        { title: 'Loyalty Program', link: '/loyalty-program' },
        { title: 'Travel Stories', link: '/stories' },
        { title: 'Photo Gallery', link: '/gallery' },
        { title: 'Newsletter Signup', link: '/newsletter' },
        { title: 'Join Our Tribe', link: '/join-our-tribe' },
      ],
    },
    {
      title: 'FAQs',
      links: [
        { title: 'How to Book a Trip', link: '/how-to-book' },
        { title: 'Payment Options', link: '/payment-options' },
        { title: 'Refund & Cancellation', link: '/refund-and-cancellation' },
        { title: 'Travel Safety', link: '/travel-safety' },
        { title: 'Account Settings', link: '/account-settings' },
        { title: 'Loyalty Program', link: '/loyalty-program' },
        { title: 'Customer Support', link: '/customer-support' },
      ],
    },
  ]
  return (
    <footer>
      <section className="container h-auto mx-auto my-auto pt-12">
        <Link
          to="/"
          className="mb-5"
        >
          <img
            src="/images/logo.svg"
            alt="Logo"
            className="h-9 w-28 lg:h-12 lg:w-[162px] xl:h-16 xl:w-[182px]"
            height={64}
            width={182}
          />
        </Link>
        <p className="text-lg">
          Discover the world with Tu Tribu Viajera — your trusted platform for
          booking unforgettable trips, flights, hotels, and experiences. Travel
          made easy, inspiring, and full of adventure.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mt-12">
          {links.map((link, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold text-[#54535A] mb-6">
                {link.title}
              </h3>
              <ul className="space-y-2">
                {link.links.map((subLink, index) => (
                  <li key={index}>
                    <Link
                      to={subLink.link}
                      className="text-[#8F8E96] md:text-sm xl:text-lg"
                    >
                      {subLink.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-20 flex items-center justify-between">
          <div>
            <p className="text-base mb-2">We accept</p>
            <div className="gap-2 flex items-center">
              <img
                src="/images/visa-icon.svg"
                className="w-14 h-10"
                alt="visa-card"
              />
              <img
                src="/images/master-card-icon.svg"
                className="w-14 h-10"
                alt="master-card"
              />
              <img
                src="/images/paypal-icon.svg"
                className="w-14 h-10"
                alt="paypal-card"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <img
              src="/images/facebook-icon.svg"
              className="w-10 h-10 xl:w-13 xl:h-13 rounded-full"
              alt="facebook-icon"
            />
            <img
              src="/images/instagram-icon.svg"
              className="w-10 h-10 xl:w-13 xl:h-13 rounded-full"
              alt="instagram-icon"
            />
            <img
              src="/images/x-icon.svg"
              className="w-10 h-10 xl:w-13 xl:h-13 rounded-full"
              alt="x-icon"
            />
            <img
              src="/images/youtube-icon.svg"
              className="w-10 h-10 xl:w-13 xl:h-13 rounded-full"
              alt="youtube-icon"
            />
            <img
              src="/images/linkedIn-icon.svg"
              className="w-10 h-10 xl:w-13 xl:h-13 rounded-full"
              alt="linkedin-icon"
            />
            <img
              src="/images/tiktok-icon.svg"
              className="w-10 h-10 xl:w-13 xl:h-13 rounded-full"
              alt="tiktok-icon"
            />
          </div>
        </div>
      </section>
      <Separator className="mt-6 mb-2.5 bg-[#E0E0E0] w-full" />
      <p className=" text-sm lg:text-lg leading-[100%] text-[#69666C] text-center pb-4">
        © 2025 Tu Tribu Viajera. All rights reserved. | Privacy Policy | Terms &
        Conditions
      </p>
    </footer>
  )
}
