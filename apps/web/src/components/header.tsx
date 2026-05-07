import { Link, NavLink, useNavigate } from 'react-router'
import { useState, useRef } from 'react'
import { cn } from '../lib/utils'
import { Heart, Menu, Search, Star, ChevronDown } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useAuth } from '../context/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Skeleton } from './ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet'
import { TripCalendarPopup } from './trip-calendar-popup'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './language-switcher'
import useSWR from 'swr'
import { fetcher } from '../lib/api-client'

interface SubLink {
  label: string
  to: string
  disabled?: boolean
}

interface MenuCategory {
  title: string
  links: SubLink[]
}

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, isLoading, isAdmin } = useAuth()
  const { t } = useTranslation()
  const [activeMenu, setActiveMenu] = useState<'destinations' | 'about' | null>(
    null,
  )
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (menu: 'destinations' | 'about') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveMenu(menu)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }

  const links = [
    { to: import.meta.env.VITE_MAIN_SITE_URL, label: t('header.nav.home') },
    {
      to: '/destination',
      label: t('header.nav.destination'),
      hasMegaMenu: true,
      menu: 'destinations' as const,
    },
    {
      to: '/about-us',
      label: t('header.nav.aboutUs'),
      hasMegaMenu: true,
      menu: 'about' as const,
    },
    {
      to: import.meta.env.VITE_MAIN_SITE_URL + '/deals',
      label: t('header.nav.deals'),
    },
    {
      to: import.meta.env.VITE_MAIN_SITE_URL + '/blog',
      label: t('header.nav.blog'),
    },
    {
      to: import.meta.env.VITE_MAIN_SITE_URL + '/help-center',
      label: t('header.nav.support'),
    },
  ]

  const { data: americasData } = useSWR<any>(
    '/menus/v1/menus/destinations-americas',
    fetcher,
  )
  const { data: asiaData } = useSWR<any>(
    '/menus/v1/menus/destinations-asia',
    fetcher,
  )
  const { data: africaData } = useSWR<any>(
    '/menus/v1/menus/destinations-africa',
    fetcher,
  )
  const { data: europeData } = useSWR<any>(
    '/menus/v1/menus/destinations-europe',
    fetcher,
  )

  const { data: whoWeAreData } = useSWR<any>(
    '/menus/v1/menus/about-who-we-are',
    fetcher,
  )
  const { data: howItWorksData } = useSWR<any>(
    '/menus/v1/menus/about-how-it-works',
    fetcher,
  )
  const { data: companyData } = useSWR<any>(
    '/menus/v1/menus/about-company',
    fetcher,
  )

  const transformWPItems = (items: any[]): SubLink[] => {
    return (items || []).map((item) => ({
      label: item.title,
      to: item.url,
    }))
  }

  console.log(transformWPItems(americasData?.items))

  const destinationsMenu: { categories: MenuCategory[]; featured: any } = {
    categories: [
      {
        title: t('header.megaMenu.destinations.americas'),
        links: americasData ? transformWPItems(americasData.items) : [],
      },
      {
        title: t('header.megaMenu.destinations.asia'),
        links: asiaData
          ? transformWPItems(asiaData.items)
          : [
              {
                label: t('header.megaMenu.destinations.comingSoon'),
                to: '#',
                disabled: true,
              },
            ],
      },
      {
        title: t('header.megaMenu.destinations.africa'),
        links: africaData
          ? transformWPItems(africaData.items)
          : [
              {
                label: t('header.megaMenu.destinations.comingSoon'),
                to: '#',
                disabled: true,
              },
            ],
      },
      {
        title: t('header.megaMenu.destinations.europe'),
        links: europeData
          ? transformWPItems(europeData.items)
          : [
              {
                label: t('header.megaMenu.destinations.comingSoon'),
                to: '#',
                disabled: true,
              },
            ],
      },
    ],
    featured: {
      title: t('header.megaMenu.destinations.featured.title'),
      description: t('header.megaMenu.destinations.featured.description'),
      rating: 5,
      cta: t('header.megaMenu.destinations.featured.cta'),
      image: '/images/trip-image.png',
    },
  }

  const aboutMenu: MenuCategory[] = [
    {
      title: t('header.megaMenu.about.whoWeAre.title'),
      links: whoWeAreData
        ? transformWPItems(whoWeAreData.items)
        : [
            {
              label: t('header.megaMenu.about.whoWeAre.packLeaders'),
              to: '/about-us/pack-leaders',
            },
            {
              label: t('header.megaMenu.about.whoWeAre.travelExperts'),
              to: '/about-us/travel-experts',
            },
            {
              label: t('header.megaMenu.about.whoWeAre.customerExperience'),
              to: '/about-us/experience',
            },
          ],
    },
    {
      title: t('header.megaMenu.about.howItWorks.title'),
      links: howItWorksData
        ? transformWPItems(howItWorksData.items)
        : [
            {
              label: t('header.megaMenu.about.howItWorks.howItWorks'),
              to: '/about-us/how-it-works',
            },
            {
              label: t('header.megaMenu.about.howItWorks.faqs'),
              to: '/about-us/faqs',
            },
            {
              label: t('header.megaMenu.about.howItWorks.soloTravel'),
              to: '/about-us/solo-travel',
            },
            {
              label: t('header.megaMenu.about.howItWorks.instalments'),
              to: '/about-us/instalments',
            },
          ],
    },
    {
      title: t('header.megaMenu.about.company.title'),
      links: companyData
        ? transformWPItems(companyData.items)
        : [
            {
              label: t('header.megaMenu.about.company.careers'),
              to: '/about-us/careers',
            },
            {
              label: t('header.megaMenu.about.company.partners'),
              to: '/about-us/partners',
            },
            {
              label: t('header.megaMenu.about.company.terms'),
              to: '/about-us/terms',
            },
            {
              label: t('header.megaMenu.about.company.guarantee'),
              to: '/about-us/guarantee',
            },
            {
              label: t('header.megaMenu.about.company.safety'),
              to: '/about-us/safety',
            },
            {
              label: t('header.megaMenu.about.company.privacy'),
              to: '/about-us/privacy',
            },
          ],
    },
  ]

  return (
    <header className="container h-auto lg:h-25 mx-auto my-auto py-5 relative z-50">
      <div className="flex flex-row items-center justify-between">
        <Link to="/">
          <img
            src="/images/logo.svg"
            alt="Logo"
            className="h-9 w-28 lg:h-12 lg:w-40.5 xl:h-16 xl:w-45.5"
            height={64}
            width={182}
          />
        </Link>
        {/* <div className="flex items-center gap-2 xl:gap-7"> */}
        <nav className="hidden lg:flex gap-5 text-sm xl:text-base font-medium leading-[100%] h-full items-center">
          {links.map((link) => {
            if (link.hasMegaMenu) {
              const isOpen = activeMenu === link.menu

              return (
                <div
                  key={link.to}
                  className="relative flex items-center h-full"
                  onMouseEnter={() => handleMouseEnter(link.menu)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className={cn(
                      'flex items-center font-tinos gap-1 cursor-pointer transition-colors duration-200 ease-linear hover:text-brand h-full',
                      isOpen ? 'text-brand' : 'text-primary',
                    )}
                  >
                    {link.label}
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </div>
                </div>
              )
            }

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    isActive ? 'text-brand' : 'text-primary',
                    'hover:text-brand transition-colors duration-200 ease-linear',
                  )
                }
                end
              >
                {link.label}
              </NavLink>
            )
          })}
        </nav>
        {/* <div className="hidden lg:flex items-center p-2.5 border rounded-sm h-9 w-32 xl:h-10 xl:w-44">
            <Search
              size={20}
              color="#D4D4D4"
            />
            <Input
              type="text"
              className="focus-visible:ring-0 ml-1 p-0 border-none focus-visible:border-none focus-within:border-none focus-within:ring-0 text-primary"
            />
          </div> */}
        <>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                {!isAuthenticated ? (
                  <div className="flex justify-center items-center gap-2">
                    <LanguageSwitcher />
                    <Button
                      type="button"
                      onClick={() => navigate('/signin')}
                      className="cursor-pointer h-9 xl:h-12 border hover:bg-brand hover:text-white bg-transparent text-brand border-brand py-2.5 px-5 xl:px-7 rounded-sm font-medium text-base leading-[120%]"
                    >
                      {t('common.login')}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => navigate('/signup')}
                      className="cursor-pointer h-9 xl:h-12 border-2 bg-brand hover:bg-brand/80 text-white border-brand py-2.5 px-5 xl:px-7 rounded-sm font-medium text-base leading-[120%]"
                    >
                      {t('common.signUp')}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 2xl:gap-5">
                    <LanguageSwitcher />
                    <TripCalendarPopup />
                    <Button
                      variant="link"
                      size="icon-xs"
                      className="px-0 py-0 m-0 size-6 xl:size-8 border-0 ring-0"
                    >
                      <img
                        src="/images/love-icon.svg"
                        className="size-6 xl:size-8"
                        alt="Heart"
                      />
                    </Button>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger>
                        <Avatar className="size-6 xl:size-9">
                          <AvatarImage
                            src={
                              user?.avatarUrl?.includes('googleusercontent.com')
                                ? user?.avatarUrl
                                : import.meta.env.VITE_API_URL + user?.avatarUrl
                            }
                            alt={user?.firstName}
                          />
                          <AvatarFallback className="bg-brand text-white text-sm 2xl:text-xl">
                            {user?.firstName.charAt(0).toUpperCase()}
                            {user?.lastName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="rounded-md w-40"
                        align="end"
                      >
                        <DropdownMenuGroup>
                          {isAdmin && (
                            <DropdownMenuItem
                              className="pt-2 pb-2 cursor-pointer hover:bg-brand"
                              onClick={() => navigate('/admin/users')}
                            >
                              <img
                                src="/images/profile.svg"
                                alt="admin"
                                className="size-6 xl:size-8"
                              />
                              <span className="text-sm xl:text-lg">
                                {t('common.dashboard')}
                              </span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="pt-2 pb-2 cursor-pointer hover:bg-brand"
                            onClick={() => navigate('/mytrips')}
                          >
                            <img
                              src="/images/map.svg"
                              alt="map"
                              className="size-6 xl:size-8"
                            />
                            <span className="text-sm xl:text-lg">
                              {t('header.myTrips')}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="pb-2 cursor-pointer"
                            onClick={() => navigate('/profile')}
                          >
                            <img
                              src="/images/profile.svg"
                              alt="profile"
                              className="size-5 xl:size-8"
                            />
                            <span className="text-sm xl:text-lg">
                              {t('common.profile')}
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="pb-2 cursor-pointer"
                            onClick={() => logout()}
                          >
                            <img
                              src="/images/logout.svg"
                              alt="logout"
                              className="size-5 xl:size-8"
                            />
                            <span className="text-sm xl:text-lg">
                              {t('common.logout')}
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              <div className="lg:hidden flex items-center gap-2.5">
                <LanguageSwitcher />
                <Button
                  variant="link"
                  size="icon-xs"
                  className="px-0 py-0 m-0 border-0 ring-0"
                >
                  <Search className="size-5" />
                </Button>
                <Button
                  variant="link"
                  size="icon-xs"
                  className="px-0 py-0 m-0 border-0 ring-0"
                >
                  <Heart className="size-5" />
                </Button>
                <Sheet>
                  <SheetTrigger className="px-0 py-0 m-0 border-0 ring-0">
                    <Menu className="size-5" />
                  </SheetTrigger>
                  <SheetContent className="overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>
                        <Link to="/">
                          <img
                            src="/images/logo.svg"
                            alt="Logo"
                            className="h-12 w-32"
                            height={64}
                            width={182}
                          />
                        </Link>
                      </SheetTitle>
                      <SheetDescription>
                        <span className="flex flex-col gap-3 mt-5 text-left text-primary">
                          {links.map((link) => {
                            if (link.hasMegaMenu) {
                              return (
                                <div
                                  key={link.to}
                                  className="space-y-2"
                                >
                                  <div className="font-bold text-primary flex items-center justify-between">
                                    {link.label}
                                  </div>
                                  <div className="pl-4 border-l-2 border-brand/20 flex flex-col gap-2">
                                    {link.menu === 'destinations'
                                      ? destinationsMenu.categories.map(
                                          (cat) => (
                                            <div key={cat.title}>
                                              <div className="text-xs font-bold text-muted-foreground uppercase mb-1">
                                                {cat.title}
                                              </div>
                                              <div className="flex flex-col gap-1">
                                                {cat.links.map((sub) => (
                                                  <Link
                                                    key={sub.label}
                                                    to={sub.to}
                                                    className={cn(
                                                      'text-sm',
                                                      sub.disabled
                                                        ? 'text-muted-foreground italic'
                                                        : 'text-primary hover:text-brand',
                                                    )}
                                                  >
                                                    {sub.label}
                                                  </Link>
                                                ))}
                                              </div>
                                            </div>
                                          ),
                                        )
                                      : aboutMenu.map((cat) => (
                                          <div key={cat.title}>
                                            <div className="text-xs font-bold text-muted-foreground uppercase mb-1">
                                              {cat.title}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                              {cat.links.map((sub) => (
                                                <Link
                                                  key={sub.label}
                                                  to={sub.to}
                                                  className="text-sm text-primary hover:text-brand"
                                                >
                                                  {sub.label}
                                                </Link>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                  </div>
                                </div>
                              )
                            }
                            return (
                              <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                  cn(
                                    isActive ? 'text-brand' : 'text-primary',
                                    'hover:text-brand transition-colors duration-200 ease-linear font-medium',
                                  )
                                }
                                end
                              >
                                {link.label}
                              </NavLink>
                            )
                          })}
                          {isAdmin && (
                            <NavLink
                              to="/admin/users"
                              className={({ isActive }) =>
                                cn(
                                  isActive ? 'text-brand' : 'text-primary',
                                  'hover:text-brand transition-colors duration-200 ease-linear',
                                )
                              }
                            >
                              <span className="text-sm xl:text-lg">
                                {t('header.adminDashboard')}
                              </span>
                            </NavLink>
                          )}
                          {isAuthenticated ? (
                            <div className="flex flex-col gap-3 pt-5 border-t">
                              <NavLink
                                to="/my-trips"
                                className={({ isActive }) =>
                                  cn(
                                    isActive ? 'text-brand' : 'text-primary',
                                    'hover:text-brand transition-colors duration-200 ease-linear',
                                  )
                                }
                              >
                                <span className="text-sm xl:text-lg font-medium">
                                  {t('header.myTrips')}
                                </span>
                              </NavLink>
                              <NavLink
                                to="/profile"
                                className={({ isActive }) =>
                                  cn(
                                    isActive ? 'text-brand' : 'text-primary',
                                    'hover:text-brand transition-colors duration-200 ease-linear',
                                  )
                                }
                              >
                                <span className="text-sm xl:text-lg font-medium">
                                  {t('common.profile')}
                                </span>
                              </NavLink>

                              <Button
                                variant="default"
                                className="w-full bg-brand rounded-md py-5 mt-4"
                                onClick={() => logout()}
                              >
                                <span className="text-sm xl:text-lg">
                                  {t('common.logout')}
                                </span>
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3 pt-5 border-t">
                              <Button
                                variant="default"
                                className="w-full border-brand text-brand bg-transparent rounded-md py-5"
                                onClick={() => navigate('/signin')}
                              >
                                <span className="text-sm xl:text-lg">
                                  {t('common.login')}
                                </span>
                              </Button>
                              <Button
                                variant="default"
                                className="w-full bg-brand rounded-md py-5"
                                onClick={() => navigate('/signup')}
                              >
                                <span className="text-sm xl:text-lg">
                                  {t('common.signUp')}
                                </span>
                              </Button>
                            </div>
                          )}
                        </span>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </>
        {/* </div> */}
      </div>

      {/* Full Width Mega Menus — always in DOM, animated via opacity + translateY */}

      {/* Destinations */}
      <div
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 w-screen bg-white overflow-hidden',
          'transition-all duration-200 ease-out',
          activeMenu === 'destinations'
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
        onMouseEnter={() => handleMouseEnter('destinations')}
        onMouseLeave={handleMouseLeave}
      >
        <div className="container mx-auto flex flex-col lg:flex-row min-h-[400px]">
          <div className="flex-1 grid grid-cols-2 xl:grid-cols-4 gap-8 p-10">
            {destinationsMenu.categories.map((category) => (
              <div
                key={category.title}
                className="space-y-4"
              >
                <h3 className="text-[23px] font-poppins font-semibold text-primary border-b pb-2">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.links.map((subLink) => (
                    <li key={subLink.label}>
                      {subLink.label === 'Coming Soon' ? (
                        <span
                          className={cn(
                            'text-xl transition-colors hover:text-brand flex items-center gap-2',
                            subLink.disabled
                              ? 'text-muted-foreground pointer-events-none italic'
                              : 'text-primary',
                          )}
                        >
                          {subLink.label}
                        </span>
                      ) : (
                        <Link
                          to={subLink.to}
                          className={cn(
                            'text-xl transition-colors hover:text-brand flex items-center gap-2',
                            subLink.disabled
                              ? 'text-muted-foreground pointer-events-none italic'
                              : 'text-primary',
                          )}
                        >
                          {subLink.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div
        className={cn(
          'absolute top-full left-1/2 -translate-x-1/2 w-screen bg-white p-10',
          'transition-all duration-200 ease-out',
          activeMenu === 'about'
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
        onMouseEnter={() => handleMouseEnter('about')}
        onMouseLeave={handleMouseLeave}
      >
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 min-h-[300px]">
          {aboutMenu.map((category) => (
            <div
              key={category.title}
              className="space-y-4"
            >
              <h3 className="text-[23px] font-poppins font-bold text-primary border-b pb-2">
                {category.title}
              </h3>
              <ul className="space-y-3">
                {category.links.map((subLink) => (
                  <li key={subLink.label}>
                    <Link
                      to={subLink.to}
                      className="text-xl text-primary transition-colors hover:text-brand flex items-center gap-2"
                    >
                      {subLink.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
