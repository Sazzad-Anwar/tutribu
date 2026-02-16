import { zodResolver } from '@hookform/resolvers/zod'
import {
  BookingSignUpSchema,
  SignUpSchema,
  type SignUpInput,
  type BookingSignUpInput,
  type UserInfo,
} from '@tutribu/types'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '../context/auth-context'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'
import { Input } from './ui/input'
import { DatePicker } from './ui/date-picker'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { CircleAlert, Eye, EyeOff, LoaderCircle, Star } from 'lucide-react'
import { Label } from './ui/label'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { axios } from '../lib/utils'
import { authClient } from '../lib/auth-client'
import { useNavigate } from 'react-router'
import qs from 'qs'
import PriceSummary from './price-summary'

export default function UserBookingSignup() {
  const navigate = useNavigate()
  const { user, checkAuth, isAuthenticated } = useAuth()
  const [formType] = useState<'signup' | 'booking'>(
    isAuthenticated ? 'booking' : 'signup',
  )
  const [specialRequest, setSpecialRequest] = useState('')
  const [bookingFor, setBookingFor] = useState<'SELF' | 'GUEST'>('SELF')
  const resolverSchema = isAuthenticated ? BookingSignUpSchema : SignUpSchema
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<SignUpInput | BookingSignUpInput>({
    resolver: zodResolver(resolverSchema),
    defaultValues: {
      email: isAuthenticated && bookingFor === 'SELF' ? user?.email : '',
      firstName:
        isAuthenticated && bookingFor === 'SELF' ? user?.firstName : '',
      lastName: isAuthenticated && bookingFor === 'SELF' ? user?.lastName : '',
      phoneNumber:
        isAuthenticated && bookingFor === 'SELF' ? user?.phoneNumber : '',
      dateOfBirth:
        isAuthenticated && bookingFor === 'SELF' ? user?.dateOfBirth : '',
      country: isAuthenticated && bookingFor === 'SELF' ? user?.country : '',
      address: isAuthenticated && bookingFor === 'SELF' ? user?.address : '',
      zipCode: user?.zipCode || '',
      city: user?.city || '',
      ...(!isAuthenticated && { password: '', confirmPassword: '' }),
    },
  })

  console.log(form.formState.errors)

  useEffect(() => {
    if (isAuthenticated && bookingFor === 'SELF') {
      form.setValue('email', user?.email || '')
      form.setValue('firstName', user?.firstName || '')
      form.setValue('lastName', user?.lastName || '')
      form.setValue('phoneNumber', user?.phoneNumber || '')
      form.setValue('dateOfBirth', user?.dateOfBirth || '')
      form.setValue('country', user?.country || '')
      form.setValue('address', user?.address || '')
      form.setValue('zipCode', user?.zipCode || '')
      form.setValue('city', user?.city || '')
    } else {
      form.setValue('firstName', '')
      form.setValue('lastName', '')
      form.setValue('phoneNumber', '')
      form.setValue('dateOfBirth', '')
      form.setValue('country', '')
      form.setValue('address', '')
      form.setValue('zipCode', '')
      form.setValue('city', '')
    }
  }, [isAuthenticated, bookingFor])

  const onSubmit = async (data: SignUpInput | BookingSignUpInput) => {
    try {
      if (!isAuthenticated) {
        await authClient.signUp(data as SignUpInput)
        await checkAuth()
        form.reset()
        toast.success('Signed up successfully')
      }
      authClient.updateProfile({
        id: user!.id,
        firstName: form.getValues('firstName'),
        lastName: form.getValues('lastName'),
        phoneNumber: form.getValues('phoneNumber'),
        dateOfBirth: dayjs(form.getValues('dateOfBirth')).toISOString(),
        country: form.getValues('country'),
        address: form.getValues('address'),
        zipCode: form.getValues('zipCode'),
        city: form.getValues('city'),
        userType: bookingFor as 'GUEST' | 'SELF',
      })
      navigate({
        pathname: '/checkout',
        search: qs.stringify({
          bookingFor,
          specialRequest,
        }),
      })
    } catch (error) {
      console.log(error)
      toast.error(error instanceof Error ? error.message : 'Failed to sign up')
    }
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
            {!isAuthenticated ? (
              <>
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
              </>
            ) : null}

            <div className=" lg:my-12 xl:my-24 space-y-6">
              <h2 className="text-3xl lg:text-4xl xl:text-[54px] font-bold font-tinos mb-2.5">
                Who is checking in?
              </h2>
              <div className="space-y-6">
                <RadioGroup
                  onValueChange={(value) =>
                    setBookingFor(value as 'SELF' | 'GUEST')
                  }
                  value={bookingFor || 'SELF'}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="size-5 xl:size-6 rounded-sm data-checked:bg-brand data-checked:border-brand"
                      value="SELF"
                      id="SELF"
                    />
                    <Label
                      htmlFor="SELF"
                      className="text-base xl:text-xl font-normal leading-[120%]"
                    >
                      I am the main guest
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      className="size-5 xl:size-6 rounded-sm data-checked:bg-brand data-checked:border-brand"
                      value="GUEST"
                      id="GUEST"
                    />
                    <Label
                      htmlFor="GUEST"
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
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                id="requests"
                autoComplete="off"
                className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-6 py-5 text-sm xl:text-lg h-28 lg:h-48 placeholder:text-black/30 w-full"
              />
            </Field>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-brand py-6 w-full disabled:bg-brand/30 md:w-52 text-white rounded-[5px] px-14 text-lg"
            >
              {form.formState.isSubmitting && (
                <LoaderCircle className="animate-spin" />
              )}{' '}
              Continue
            </Button>
          </FieldGroup>
        </form>
      </div>
      <PriceSummary totalPrice={1200} />
    </div>
  )
}
