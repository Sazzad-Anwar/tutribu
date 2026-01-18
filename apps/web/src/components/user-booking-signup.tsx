import { zodResolver } from '@hookform/resolvers/zod'
import { SignUpSchema, type SignUpInput } from '@tutribu/types'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '../context/auth-context'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { DatePicker } from './ui/date-picker'
import dayjs from 'dayjs'
import { useState } from 'react'
import { CircleAlert, Eye, EyeOff, Star } from 'lucide-react'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'

export default function UserBookingSignup() {
  const { user } = useAuth()
  console.log({ user })
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth || '',
      country: user?.country || '',
      address: user?.address || '',
      zipCode: user?.zipCode || '',
      city: user?.city || '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = (data: SignUpInput) => {
    console.log(data)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-7">
      <div className="col-span-1 order-2 lg:order-1 lg:col-span-3 xl:col-span-2">
        <h2 className="text-3xl lg:text-4xl xl:text-[54px] font-bold font-tinos mb-8">
          Personal information
        </h2>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="first_name"
                  >
                    First Name (Official, as in passport)
                  </FieldLabel>
                  <Input
                    id="first_name"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="First name"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-3 lg:py-2 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="last_name"
                  >
                    Last Name (Official, as in passport)
                  </FieldLabel>
                  <Input
                    id="last_name"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Last name"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-3 lg:py-2 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="dateOfBirth"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="date_of_birth"
                  >
                    Date of birth (Official, as in passport)
                  </FieldLabel>
                  <DatePicker
                    value={
                      field.value ? dayjs(field.value).toDate() : undefined
                    }
                    onChange={(date) =>
                      field.onChange(dayjs(date).format('YYYY-MM-DD'))
                    }
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="country"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="country"
                  >
                    Country
                  </FieldLabel>
                  <Input
                    id="country"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Country"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0 col-span-1 md:col-span-2">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="address"
                  >
                    Address
                  </FieldLabel>
                  <Input
                    id="address"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Address"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="zipCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="zip_code"
                  >
                    Zip/Post Code
                  </FieldLabel>
                  <Input
                    id="zip_code"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Zip/Post Code"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="city"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="city"
                  >
                    City
                  </FieldLabel>
                  <Input
                    id="city"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="City"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup className="my-16 space-y-5">
            <h2 className="text-3xl lg:text-4xl xl:text-[54px] font-bold font-tinos">
              Account information
            </h2>
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="phone_number"
                  >
                    Phone Number
                  </FieldLabel>
                  <Input
                    id="phone_number"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Phone Number"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field className="mb-0">
                  <FieldLabel
                    className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                    htmlFor="email"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    type="text"
                    aria-invalid={fieldState.invalid}
                    placeholder="Email"
                    autoComplete="off"
                    className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                    {...field}
                    value={field.value || ''}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="mb-0">
                    <FieldLabel
                      className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                      htmlFor="password"
                    >
                      Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={fieldState.invalid}
                        placeholder="Password"
                        autoComplete="off"
                        className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="size-6" />
                        ) : (
                          <Eye className="size-6" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field className="mb-0">
                    <FieldLabel
                      className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                      htmlFor="confirm_password"
                    >
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPassword ? 'text' : 'password'}
                        aria-invalid={fieldState.invalid}
                        placeholder="Confirm Password"
                        autoComplete="off"
                        className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-4 lg:py-3 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                        {...field}
                        value={field.value || ''}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="size-6" />
                        ) : (
                          <Eye className="size-6" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className=" lg:my-12 xl:my-24 space-y-6">
              <h2 className="text-3xl lg:text-4xl xl:text-[54px] font-bold font-tinos mb-2.5">
                Who is checking in?
              </h2>
              <div className="space-y-6">
                <RadioGroup defaultValue="i-am-the-main-guest">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="size-5 xl:size-6 rounded-sm data-checked:bg-brand data-checked:border-brand"
                      value="i-am-the-main-guest"
                      id="i-am-the-main-guest"
                    />
                    <Label
                      htmlFor="i-am-the-main-guest"
                      className="text-base xl:text-xl font-normal leading-[120%]"
                    >
                      I am the main guest
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="size-5 xl:size-6 rounded-sm data-checked:bg-brand data-checked:border-brand"
                      value="i-am-booking-for-someone-else"
                      id="i-am-booking-for-someone-else"
                    />
                    <Label
                      htmlFor="i-am-booking-for-someone-else"
                      className="text-base xl:text-xl font-normal leading-[120%]"
                    >
                      I am booking for someone else
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-5">
              <h2 className="text-3xl lg:text-4xl xl:text-[54px] font-bold font-tinos mb-2.5">
                Special Requests
              </h2>
              <p className="lg:text-base xl:text-xl font-normal">
                Got a special request? We can’t promise, but the property will
                try their best! You’ll also be able to add requests after
                booking.
              </p>
            </div>

            <Field className="mb-0 space-y-5">
              <FieldLabel
                className="text-md lg:text-sm xl:text-lg leading-[100%] font-normal"
                htmlFor="requests"
              >
                Please write your requests. (optional)
              </FieldLabel>
              <Textarea
                id="requests"
                autoComplete="off"
                className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-6 py-5 text-sm xl:text-lg h-28 lg:h-48 placeholder:text-black/30 w-full"
              />
            </Field>
            <Button
              type="submit"
              className="bg-brand py-6 w-full md:w-52 text-white rounded-[5px] px-14 text-lg"
            >
              Continue
            </Button>
          </FieldGroup>
        </form>
      </div>
      <div className=" lg:col-span-2 order-1 lg:order-2 xl:col-span-1">
        <h2 className="hidden lg:block text-2xl lg:text-4xl xl:text-[54px] font-bold font-tinos mb-2.5">
          Price Summary
        </h2>
        <div className="lg:p-5 rounded-[20px] lg:border border-[#0000001A]">
          <div className="hidden lg:flex justify-between items-center mb-2.5">
            <p className="lg:text-lg xl:text-xl font-normal">Package Details</p>
            <div className="rounded-full flex items-center border border-brand gap-2 px-3 py-1">
              <p className="lg:text-xs xl:text-sm text-brand font-normal">
                Guaranteed{' '}
              </p>
              <CircleAlert className="text-brand lg:size-3 xl:size-4" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold font-tinos mb-3.5">
            Ultimate Argentina
          </h1>
          <div className="flex items-center gap-1">
            <p className="text-base lg:text-lg xl:text-xl font-normal leading-[100%]">
              546 reviews
            </p>
            <img
              src="/images/owl-eye.svg"
              className="w-6 h-4 lg:w-4 xl:w-6 lg:h-3 xl:h-4"
              alt="eyes"
            />
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className="size-4 lg:size-3 xl:size-4 fill-[#FF8800] stroke-[#FF8800]"
              />
            ))}
          </div>
          <div className="py-4 flex items-center gap-8">
            <p className="lg:text-lg xl:text-xl font-normal">Includes: </p>
            <div className="flex items-center gap-2.5">
              <img
                src="/images/building.svg"
                className="lg:size-5 xl:size-6"
                alt="building"
              />
              <img
                src="/images/train.svg"
                className="lg:size-5 xl:size-6"
                alt="train"
              />
              <img
                src="/images/food.svg"
                className="lg:size-5 xl:size-6"
                alt="food"
              />
              <img
                src="/images/plane.svg"
                className="lg:size-5 xl:size-6"
                alt="plane"
              />
            </div>
          </div>
          <p className="lg:text-lg xl:text-xl font-normal pb-4">
            Sultry Buenos Aires. Vibrant Rio. The roaring majesty of Iguazú
            Falls. Embark on a whirlwind journey filled with rhythm, flavor, and
            unforgettable icons of South America. Are you in?
          </p>
          <p className="lg:text-lg xl:text-xl font-normal pb-4">
            8 Days from 08 Nov to 16 Nov
          </p>
          <p className="lg:text-lg xl:text-xl font-medium pb-2.5">
            Package includes
          </p>
          <ul className="list-none">
            <li className="py-2 px-2.5 flex items-center gap-1.5">
              <img
                src="/images/bed.svg"
                alt="bed"
                className="lg:size-5 xl:size-6"
              />
              <p className="lg:text-lg xl:text-xl font-normal">
                Handpicked 4-star stays
              </p>
            </li>
            <li className="py-2 px-2.5 flex items-center gap-1.5">
              <img
                src="/images/skateboarding.svg"
                alt="skateboarding"
                className="lg:size-5 xl:size-6"
              />
              <p className="lg:text-lg xl:text-xl font-normal">
                All activities from the itinerary
              </p>
            </li>
            <li className="py-2 px-2.5 flex items-center gap-1.5">
              <img
                src="/images/map1.svg"
                alt="map1"
                className="lg:size-5 xl:size-6"
              />
              <p className="lg:text-lg xl:text-xl font-normal">
                Expert Pack Leader
              </p>
            </li>
            <li className="py-2 px-2.5 flex items-center gap-1.5">
              <img
                src="/images/bus.svg"
                alt="bus"
                className="lg:size-5 xl:size-6"
              />
              <p className="lg:text-lg xl:text-xl font-normal">
                Seamless travel
              </p>
            </li>
            <li className="py-2 px-2.5 flex items-center gap-1.5">
              <img
                src="/images/glass.svg"
                alt="glass"
                className="lg:size-5 xl:size-6"
              />
              <p className="lg:text-lg xl:text-xl font-normal">Meals covered</p>
            </li>
            <li className="py-2 px-2.5 flex items-center gap-1.5">
              <img
                src="/images/user-fav.svg"
                alt="user-fav"
                className="lg:size-5 xl:size-6"
              />
              <p className="lg:text-lg xl:text-xl font-normal">
                For travelers in their 30s & 40s
              </p>
            </li>
          </ul>
          <p className="lg:text-lg xl:text-xl font-normal pt-1">
            Arrival transfer included
          </p>
          <p className="lg:text-lg xl:text-xl font-normal pt-1">
            ATOL protected
          </p>
        </div>

        <div className="hidden p-5 rounded-[20px] border border-[#0000001A] lg:flex justify-between items-center mt-10">
          <p className="lg:text-2xl xl:text-4xl font-tinos font-bold">Total</p>
          <p className="lg:text-2xl xl:text-4xl font-tinos font-bold">$1,200</p>
        </div>
      </div>
    </div>
  )
}
