import { Link, NavLink, useNavigate } from 'react-router'

import { cn } from '../lib/utils'
import { Heart, Menu, Search } from 'lucide-react'
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

export default function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const links = [
    { to: '/', label: 'Home' },
    { to: '/destination', label: 'Destination' },
    { to: '/about-us', label: 'About Us' },
    { to: '/deals', label: 'Deals' },
    { to: '/blog', label: 'Blog' },
    { to: '/support', label: 'Support' },
  ]

  return (
    <header className="container h-auto lg:h-[100px] mx-auto my-auto py-5">
      <div className="flex flex-row items-center justify-between">
        <Link to="/">
          <img
            src="/images/logo.svg"
            alt="Logo"
            className="h-9 w-28 lg:h-12 lg:w-[162px] xl:h-16 xl:w-[182px]"
            height={64}
            width={182}
          />
        </Link>
        <div className="flex items-center justify-end gap-2 xl:gap-7">
          <nav className="hidden lg:flex gap-5 text-sm xl:text-lg 2xl:text-xl font-medium leading-[100%]">
            {links.map(({ to, label }) => {
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      isActive ? 'text-brand' : 'text-primary',
                      'hover:text-brand transition-colors duration-200 ease-linear',
                    )
                  }
                  end
                >
                  {label}
                </NavLink>
              )
            })}
          </nav>
          <div className="hidden lg:flex items-center p-2.5 border rounded-sm h-9 w-32 xl:h-10 xl:w-44">
            <Search
              size={20}
              color="#D4D4D4"
            />
            <Input
              type="text"
              className="focus-visible:ring-0 ml-1 p-0 border-none focus-visible:border-none focus-within:border-none focus-within:ring-0"
            />
          </div>
          <>
            {isLoading ? (
              <>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <div className="hidden lg:block">
                  {!isAuthenticated ? (
                    <>
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => navigate('/signin')}
                          className="cursor-pointer h-9 xl:h-12 border hover:bg-brand hover:text-white bg-transparent text-brand border-brand py-2.5 px-5 xl:px-7 rounded-sm font-medium text-base leading-[120%]"
                        >
                          Login
                        </Button>
                        <Button
                          type="button"
                          onClick={() => navigate('/signup')}
                          className="cursor-pointer h-9 xl:h-12 border-2 bg-brand hover:bg-brand/80 text-white border-brand py-2.5 px-5 xl:px-7 rounded-sm font-medium text-base leading-[120%]"
                        >
                          Sign Up
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 2xl:gap-5">
                      <Button
                        variant="link"
                        size="icon-xs"
                        className="px-0 py-0 m-0 size-6 xl:size-8 border-0 ring-0"
                      >
                        <img
                          src="/images/calendar-icon.svg"
                          className="size-6 xl:size-8"
                          alt="Calendar"
                        />
                      </Button>
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
                                user?.avatarUrl?.includes(
                                  'googleusercontent.com',
                                )
                                  ? user?.avatarUrl
                                  : import.meta.env.VITE_API_URL +
                                    user?.avatarUrl
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
                                My trips
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
                                Profile
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
                              <span className="text-sm xl:text-lg">Logout</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>

                <div className="lg:hidden flex items-center gap-2.5">
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
                    <SheetContent>
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
                          <span className="flex flex-col gap-3 mt-5">
                            {links.map(({ to, label }) => {
                              return (
                                <NavLink
                                  key={to}
                                  to={to}
                                  className={({ isActive }) =>
                                    cn(
                                      isActive ? 'text-brand' : 'text-primary',
                                      'hover:text-brand transition-colors duration-200 ease-linear',
                                    )
                                  }
                                  end
                                >
                                  {label}
                                </NavLink>
                              )
                            })}
                            {isAuthenticated ? (
                              <>
                                <NavLink
                                  to="/my-trips"
                                  className={({ isActive }) =>
                                    cn(
                                      isActive ? 'text-brand' : 'text-primary',
                                      'hover:text-brand transition-colors duration-200 ease-linear',
                                    )
                                  }
                                >
                                  <span className="text-sm xl:text-lg">
                                    My trips
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
                                  <span className="text-sm xl:text-lg">
                                    Profile
                                  </span>
                                </NavLink>

                                <Button
                                  variant="default"
                                  className="w-auto bg-brand rounded-md py-5 absolute bottom-5 left-5 right-5"
                                  onClick={() => logout()}
                                >
                                  <span className="text-sm xl:text-lg">
                                    Logout
                                  </span>
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="default"
                                  className="w-auto border-brand text-brand bg-transparent rounded-md py-5 absolute bottom-20 left-5 right-5"
                                  onClick={() => navigate('/signin')}
                                >
                                  <span className="text-sm xl:text-lg">
                                    Login
                                  </span>
                                </Button>
                                <Button
                                  variant="default"
                                  className="w-auto bg-brand rounded-md py-5 absolute bottom-5 left-5 right-5"
                                  onClick={() => navigate('/signup')}
                                >
                                  <span className="text-sm xl:text-lg">
                                    Sign Up
                                  </span>
                                </Button>
                              </>
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
        </div>
      </div>
    </header>
  )
}
