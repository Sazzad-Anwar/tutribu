import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import Footer from '../components/footer'
import Header from '../components/header'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '../context/auth-context'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '../components/ui/field'
import { Input } from '../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { DatePicker } from '../components/ui/date-picker'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { authClient } from '../lib/auth-client'
import { bookingClient } from '../lib/booking-client'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Spinner } from '../components/ui/spinner'
import useSWR from 'swr'
import { Trash2 } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function ProfileInner() {
  const { user, checkAuth, logout } = useAuth()
  console.log(user)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const stripe = useStripe()
  const elements = useElements()
  const [isSavingCard, setIsSavingCard] = useState(false)
  const [isDeletingCardId, setIsDeletingCardId] = useState<string | null>(null)
  const [nameOnCard, setNameOnCard] = useState('')

  const { data: savedCards = [], mutate } = useSWR('savedCardsProfile', () =>
    bookingClient.getSavedPaymentMethods(),
  )

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      address: user?.address,
      gender: user?.gender,
      dateOfBirth: user?.dateOfBirth,
    },
  })

  const onSubmit = async (data: any) => {
    try {
      await authClient.updateProfile({
        ...data,
        id: user?.id,
      })
      toast.success('Profile updated successfully')
    } catch (error) {
      console.log(error)
      toast.error('Failed to update profile')
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete your account? This action is irreversible and all your data will be lost.',
      )
    ) {
      return
    }

    try {
      setIsDeletingAccount(true)
      await authClient.deleteAccount()
      toast.success('Account deleted successfully')
      await logout()
      navigate('/')
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete account')
      setIsDeletingAccount(false)
    }
  }

  return (
    <>
      <Header />
      <section className="pt-8 pb-12 xl:pt-24 xl:pb-17.5 px-4 xl:px-0">
        <div className="container mx-auto space-y-9">
          <div className="space-y-3 lg:space-y-6">
            <p className="font-semibold text-base md:text-2xl">Profile</p>
            <div className="flex items-center gap-8 md:gap-12.5">
              <Avatar className="size-19 md:size-50">
                <AvatarImage
                  src={
                    user?.avatarUrl?.includes('googleusercontent.com')
                      ? user.avatarUrl
                      : import.meta.env.VITE_API_URL + user?.avatarUrl
                  }
                />
                <AvatarFallback className="text-base md:text-4xl">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex lg:flex-row flex-col gap-3 lg:gap-12.5">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      setIsUploadingAvatar(true)
                      await authClient.uploadAvatar(file)
                      await checkAuth()
                      toast.success('Avatar uploaded successfully')
                    } catch (error) {
                      toast.error('Failed to upload avatar')
                    } finally {
                      setIsUploadingAvatar(false)
                      e.target.value = ''
                    }
                  }}
                />
                <Button
                  variant="outline"
                  disabled={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-6 md:py-4 md:px-9 rounded-[12px] h-12 md:h-19 text-[#3B6BF6] border-[#3B6BF6] text-base md:text-2xl border-2 hover:bg-[#3B6BF6] font-normal hover:text-white"
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Upload new picture'}
                </Button>
                <Button
                  variant="ghost"
                  disabled={isDeletingAvatar || !user?.avatarUrl}
                  onClick={async () => {
                    try {
                      setIsDeletingAvatar(true)
                      await authClient.deleteAvatar()
                      await checkAuth()
                      toast.success('Avatar removed successfully')
                    } catch (error) {
                      toast.error('Failed to remove avatar')
                    } finally {
                      setIsDeletingAvatar(false)
                    }
                  }}
                  className="py-4 px-9 rounded-[12px] h-12 md:h-19 bg-[#F8F8F8] text-base md:text-2xl font-normal"
                >
                  {isDeletingAvatar ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex justify-between">
              <p className="font-semibold text-base md:text-2xl">
                Personal Information
              </p>
              <Button
                type="submit"
                variant="outline"
                className="border-[#D7D7D7] py-px md:py-2.5 px-5 rounded-[9px] md:rounded-[15px] font-normal text-xs md:text-xl text-[#473D3E] gap-2.5 h-8 md:h-13"
              >
                <img
                  src="/images/edit-icon.png"
                  alt="edit"
                  className="size-3 md:size-6"
                />
                Edit
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-7.5">
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="firstName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="first-name"
                        className="text-[#7A7A7A] text-xs md:text-xl font-medium"
                      >
                        First Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="first-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="First Name"
                        autoComplete="off"
                        className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-3 lg:py-2 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="lastName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="last-name"
                        className="text-[#7A7A7A] text-xs md:text-xl font-medium"
                      >
                        Last Name
                      </FieldLabel>
                      <Input
                        {...field}
                        id="last-name"
                        aria-invalid={fieldState.invalid}
                        placeholder="Last Name"
                        autoComplete="off"
                        className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-3 lg:py-2 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="gender"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="gender"
                        className="text-[#7A7A7A] text-xs md:text-xl font-medium"
                      >
                        Gender
                      </FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <SelectTrigger
                          id="gender"
                          className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-3 lg:py-2 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg data-placeholder:text-black/30 w-full lg:data-placeholder:text-sm xl:data-placeholder:text-lg"
                        >
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent className="rounded-[10px] border-[#0000001A]">
                          <SelectItem
                            value="Male"
                            className="text-sm xl:text-lg py-2"
                          >
                            Male
                          </SelectItem>
                          <SelectItem
                            value="Female"
                            className="text-sm xl:text-lg py-2"
                          >
                            Female
                          </SelectItem>
                          <SelectItem
                            value="Others"
                            className="text-sm xl:text-lg py-2"
                          >
                            Others
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup>
                <Controller
                  name="dateOfBirth"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="mb-0">
                      <FieldLabel
                        htmlFor="date_of_birth"
                        className="text-[#7A7A7A] text-xs md:text-xl font-medium"
                      >
                        Date of birth
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
              </FieldGroup>
            </div>
            <div className="flex justify-between mt-6 md:mt-12 mb-3">
              <p className="font-semibold text-base md:text-2xl">
                Contact Personal
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-7.5">
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="phoneNumber"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="phone-number"
                        className="text-[#7A7A7A] text-xs md:text-xl font-medium"
                      >
                        Phone Number
                      </FieldLabel>
                      <Input
                        {...field}
                        id="phone-number"
                        aria-invalid={fieldState.invalid}
                        placeholder="Phone Number"
                        autoComplete="off"
                        className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-3 lg:py-2 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel
                        htmlFor="email"
                        className="text-[#7A7A7A] text-xs md:text-xl font-medium"
                      >
                        Email
                      </FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        aria-invalid={fieldState.invalid}
                        placeholder="Phone Number"
                        autoComplete="off"
                        className="border focus-visible:border-[#0000001A] rounded-[10px] border-[#0000001A] px-3 py-2 lg:px-3 lg:py-2 xl:px-6 xl:py-5 h-12 xl:h-14 text-sm xl:text-lg placeholder:text-black/30 w-full lg:placeholder:text-sm xl:placeholder:text-lg"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
          </form>
          <div className="mt-15">
            <div className="flex justify-between mt-10 md:mt-12 mb-3">
              <p className="font-semibold text-base md:text-2xl">Add Cards</p>
            </div>
            <div className="max-w-xl">
              <div className="space-y-2.5">
                <p className="text-base xl:text-xl">Card Number</p>
                <div className="h-15 flex items-center w-full border border-[#0000001A] rounded-[10px] px-4 bg-white">
                  <CardNumberElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          fontFamily: 'ui-monospace, monospace',
                          color: '#000',
                          '::placeholder': { color: '#aaa' },
                        },
                      },
                    }}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-5">
                  <img
                    src="/images/visa.png"
                    alt="visa"
                    className="h-10 w-15"
                  />
                  <img
                    src="/images/master-card.png"
                    alt="mastercard"
                    className="h-10 w-15"
                  />
                  <img
                    src="/images/paypal.png"
                    alt="american-express"
                    className="h-10 w-15"
                  />
                </div>
                <p className="text-base xl:text-lg">
                  We accept debit and credit cards types.
                </p>
              </div>
              <div className="mt-8">
                <p className="text-base xl:text-xl">Expiry Date</p>
                <div className="h-15 flex items-center w-50 border border-[#0000001A] rounded-[10px] px-4 mt-3.5 bg-white">
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#000',
                          '::placeholder': { color: '#aaa' },
                        },
                      },
                    }}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="mt-13 space-y-2.5">
                <label
                  htmlFor="card-name"
                  className="text-base xl:text-xl block"
                >
                  Name on card
                </label>
                <Input
                  value={nameOnCard}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z ]/g, '')
                    setNameOnCard(val)
                  }}
                  id="card-name"
                  className="h-15 py-0 w-full uppercase border-[#0000001A] rounded-[10px] bg-white"
                />
              </div>
              <div className="mt-5 space-y-2.5">
                <label
                  htmlFor="cvv"
                  className="text-base xl:text-xl font-normal"
                >
                  Security Code
                </label>
                <p className="text-base xl:text-xl text-[#00000080]">
                  The last 3 digits on the back of the card.
                </p>
                <div className="flex items-center gap-7.5">
                  <div className="h-15 flex items-center w-[228px] border border-[#0000001A] rounded-[10px] px-4 bg-white">
                    <CardCvcElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#000',
                            '::placeholder': { color: '#aaa' },
                          },
                        },
                      }}
                      className="w-full"
                    />
                  </div>
                  <img
                    src="/images/cvv.png"
                    alt="cvv"
                    className="w-15 h-10"
                  />
                </div>
              </div>

              <Button
                disabled={isSavingCard}
                onClick={async () => {
                  setIsSavingCard(true)

                  if (!stripe || !elements) {
                    toast.error('Payment system is loading, please wait...')
                    setIsSavingCard(false)
                    return
                  }

                  const cardNumberElement =
                    elements.getElement(CardNumberElement)
                  if (!cardNumberElement) {
                    toast.error('Card details are required')
                    setIsSavingCard(false)
                    return
                  }

                  const { error: stripeError, paymentMethod } =
                    await stripe.createPaymentMethod({
                      type: 'card',
                      card: cardNumberElement,
                      billing_details: {
                        name: nameOnCard || undefined,
                      },
                    })

                  if (stripeError || !paymentMethod) {
                    toast.error(
                      stripeError?.message || 'Failed to process card',
                    )
                    setIsSavingCard(false)
                    return
                  }

                  try {
                    await bookingClient.savePaymentMethod(paymentMethod.id)
                    toast.success('Card saved successfully!')
                    mutate()
                    // Clear the inputs
                    cardNumberElement.clear()
                    elements.getElement(CardExpiryElement)?.clear()
                    elements.getElement(CardCvcElement)?.clear()
                    setNameOnCard('')
                  } catch (error) {
                    toast.error('Failed to save card to your profile')
                    console.error(error)
                  } finally {
                    setIsSavingCard(false)
                  }
                }}
                type="button"
                className="bg-brand mt-12.5 py-6 w-full disabled:bg-brand/30 md:w-52 text-white rounded-[5px] px-14 text-lg"
              >
                {isSavingCard ? (
                  <>
                    <Spinner
                      className="mx-3"
                      data-icon="inline-start"
                    />{' '}
                    Saving...
                  </>
                ) : (
                  'Save Card'
                )}
              </Button>
            </div>
          </div>
          <div className="mt-20">
            <div className="flex justify-between mt-12 mb-3">
              <p className="font-semibold text-base md:text-2xl">Saved Cards</p>
            </div>
            {savedCards.length === 0 ? (
              <p className="text-gray-500">No saved cards found.</p>
            ) : (
              <div className="space-y-4 max-w-sm">
                {savedCards.map((card: any) => (
                  <div
                    key={card.id}
                    className="flex items-center justify-start gap-5 md:justify-between"
                  >
                    <p className="text-sm md:text-lg xl:text-2xl font-semibold w-32 md:w-48">
                      **********{card.last4}
                    </p>
                    <p className="text-sm md:text-lg xl:text-xl text-[#000000]">
                      {card.exp_month.toString().padStart(2, '0')}/
                      {card.exp_year.toString().slice(-2)}
                    </p>
                    <button
                      disabled={isDeletingCardId === card.id}
                      onClick={async () => {
                        try {
                          setIsDeletingCardId(card.id)
                          await bookingClient.deletePaymentMethod(card.id)
                          mutate()
                          toast.success('Card removed successfully')
                        } catch (err) {
                          toast.error('Failed to remove card')
                        } finally {
                          setIsDeletingCardId(null)
                        }
                      }}
                      className="text-[#000000] disabled:opacity-50 transition-colors"
                      title="Remove card"
                    >
                      {isDeletingCardId === card.id ? (
                        <Spinner className="size-6" />
                      ) : (
                        <Trash2
                          strokeWidth={1.5}
                          className="size-6"
                        />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-8 md:mt-20">
            <Button
              variant="destructive"
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
              className="px-6 md:px-8 py-3 md:py-4.2 text-sm md:text-xl font-semibold h-14 md:h-17 rounded-[5px] w-full md:w-auto"
            >
              {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default function Profile() {
  return (
    <Elements stripe={stripePromise}>
      <ProfileInner />
    </Elements>
  )
}
