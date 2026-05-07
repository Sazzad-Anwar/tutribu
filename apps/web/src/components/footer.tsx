import { Link } from "react-router";
import { Separator } from "./ui/separator";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  const links = [
    {
      title: t("footer.sections.services.title"),
      links: [
        {
          title: t("footer.sections.services.termsCondition"),
          link: "/terms-and-conditions",
        },
        {
          title: t("footer.sections.services.helpSupport"),
          link: "/help-and-support",
        },
        {
          title: t("footer.sections.services.manageMyBooking"),
          link: "/manage-my-booking",
        },
        {
          title: t("footer.sections.services.travelInsurance"),
          link: "/travel-insurance",
        },
        {
          title: t("footer.sections.services.cancellationPolicy"),
          link: "/cancellation-policy",
        },
        { title: t("footer.sections.services.giftCards"), link: "/gift-cards" },
        { title: t("footer.sections.services.contactUs"), link: "/contact-us" },
      ],
    },
    {
      title: t("footer.sections.company.title"),
      links: [
        { title: t("footer.sections.company.careers"), link: "/careers" },
        {
          title: t("footer.sections.company.pressMedia"),
          link: "/press-and-media",
        },
        { title: t("footer.sections.company.blogTravelTips"), link: "/blog" },
        {
          title: t("footer.sections.company.sustainability"),
          link: "/sustainability",
        },
        {
          title: t("footer.sections.company.partnerships"),
          link: "/partnerships",
        },
        { title: t("footer.sections.company.affiliates"), link: "/affiliates" },
      ],
    },
    {
      title: t("footer.sections.quickLinks.title"),
      links: [
        {
          title: t("footer.sections.quickLinks.destinations"),
          link: "/destinations",
        },
        { title: t("footer.sections.quickLinks.popularTrips"), link: "/trips" },
        { title: t("footer.sections.quickLinks.flights"), link: "/flights" },
        { title: t("footer.sections.quickLinks.hotels"), link: "/hotels" },
        {
          title: t("footer.sections.quickLinks.carRentals"),
          link: "/car-rentals",
        },
        {
          title: t("footer.sections.quickLinks.groupTours"),
          link: "/group-tours",
        },
        {
          title: t("footer.sections.quickLinks.specialOffers"),
          link: "/special-offers",
        },
      ],
    },
    {
      title: t("footer.sections.community.title"),
      links: [
        {
          title: t("footer.sections.community.travelerReviews"),
          link: "/reviews",
        },
        {
          title: t("footer.sections.community.referAFriend"),
          link: "/refer-a-friend",
        },
        {
          title: t("footer.sections.community.loyaltyProgram"),
          link: "/loyalty-program",
        },
        {
          title: t("footer.sections.community.travelStories"),
          link: "/stories",
        },
        {
          title: t("footer.sections.community.photoGallery"),
          link: "/gallery",
        },
        {
          title: t("footer.sections.community.newsletterSignup"),
          link: "/newsletter",
        },
        {
          title: t("footer.sections.community.joinOurTribe"),
          link: "/join-our-tribe",
        },
      ],
    },
    {
      title: t("footer.sections.faqs.title"),
      links: [
        { title: t("footer.sections.faqs.howToBook"), link: "/how-to-book" },
        {
          title: t("footer.sections.faqs.paymentOptions"),
          link: "/payment-options",
        },
        {
          title: t("footer.sections.faqs.refundCancellation"),
          link: "/refund-and-cancellation",
        },
        {
          title: t("footer.sections.faqs.travelSafety"),
          link: "/travel-safety",
        },
        {
          title: t("footer.sections.faqs.accountSettings"),
          link: "/account-settings",
        },
        {
          title: t("footer.sections.faqs.loyaltyProgram"),
          link: "/loyalty-program",
        },
        {
          title: t("footer.sections.faqs.customerSupport"),
          link: "/customer-support",
        },
      ],
    },
  ];

  return (
    <footer>
      <section className="container h-auto mx-auto my-auto pt-12">
        <Link to="/" className="mb-5">
          <img
            src="/images/logo.svg"
            alt="Logo"
            className="h-9 w-28 lg:h-12 lg:w-40.5 xl:h-16 xl:w-45.5"
            height={64}
            width={182}
          />
        </Link>
        <p className="text-lg">{t("footer.tagline")}</p>
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
        <div className="mt-20 flex flex-col gap-6.5 md:flex-row items-center justify-between">
          <div>
            <p className="text-base text-center md:text-left mb-2">
              {t("footer.weAccept")}
            </p>
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
      <p className="text-center px-16 pb-5 md:px-0 text-sm lg:text-lg leading-6.25 md:leading-[100%] text-[#69666C] md:pb-4">
        {t("footer.copyright")}
      </p>
    </footer>
  );
}
