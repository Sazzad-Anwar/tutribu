import Header from '../components/header'
import qs from 'qs'
import PriceSummary from '../components/price-summary'
import { useState, useEffect } from 'react'
import { Checkbox } from '../components/ui/checkbox'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/auth-context'
import { bookingClient } from '../lib/booking-client'
import type { CreateBookingInput } from '@tutribu/types'
import { toast } from 'sonner'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import Footer from '../components/footer'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Spinner } from '../components/ui/spinner'
import useSWR from 'swr'
import { apiClient } from '../lib/api-client'
import { Skeleton } from '../components/ui/skeleton'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const DEPOSIT_TYPES = {
  MINIMUM: 'LOWEST_DEPOSIT',
  FULL: 'ONE_TIME',
  THREE_MONTH: 'THREE_MONTH',
  SIX_MONTH: 'SIX_MONTH',
}

function CheckoutInner() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const groupItem = searchParams.get('group_item')
  const { data, isLoading: isTripLoading } = useSWR(`/wp/v2/trips/?slug=${id}`)
  const trip = data?.[0]
  const group =
    !isTripLoading && groupItem
      ? trip?.meta?.group_item?.[groupItem]
      : undefined
  const [imageLoaded, setImageLoaded] = useState(false)
  const [totalAmount, setTotalAmount] = useState(Number(group?.price))
  const [promoCode, setPromoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const query = qs.parse(location.search, { ignoreQueryPrefix: true })
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [isMounted, setIsMounted] = useState(false)
  const [savedCards, setSavedCards] = useState<any[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>('new')
  const [formData, setFormData] = useState({
    isOwnRoom: false,
    joinWhatsAppGroup: false,
    discount: 0,
    depositAmount: 0,
    depositType: '',
    nameOnCard: '',
  })
  const stripe = useStripe()
  const elements = useElements()
  const { data: imageData, isLoading: isLoadingImage } = useSWR(
    trip?.featured_media ? `/wp/v2/media/${trip?.featured_media}` : null,
  )
  const { data: discountId, isLoading: isLoadingDiscountId } = useSWR(
    trip?.id ? `/jet-rel/9/parents/${trip?.id}` : null,
  )
  const { data: discountDetails } = useSWR(
    !isLoadingDiscountId && discountId?.[0]?.parent_object_id
      ? `/wp/v2/discounts/${discountId?.[0]?.parent_object_id}`
      : null,
  )

  const updateGroupItem = async () => {
    try {
      await apiClient.patch(`/wp/v2/trips/${trip?.id}`, {
        meta: {
          group_item: {
            ...trip?.meta?.group_item,
            [groupItem as string]: {
              ...group,
              seats: group?.seats + 1,
            },
          },
        },
      })
      toast.success(
        'Your booking is cancelled and your seat is now available for others',
      )
    } catch (error) {
      console.log(error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update group item',
      )
    }
  }

  useEffect(() => {
    if (discountDetails?.meta?.coupon) {
      setFormData((prev) => ({
        ...prev,
        discount: discountDetails?.meta?.discount,
      }))
    }
  }, [discountDetails])

  useEffect(() => {
    if (group?.price) {
      setTotalAmount(Number(group?.price))
    }
  }, [group])

  useEffect(() => {
    setIsMounted(true)
    if (timeLeft <= 0 && groupItem) {
      updateGroupItem()
      navigate(`/${id}?group_item=${groupItem}`)
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    const fetchSavedCards = async () => {
      try {
        const cards = await bookingClient.getSavedPaymentMethods()
        setSavedCards(cards)
        if (cards.length > 0) {
          setSelectedPaymentMethod(cards[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch saved cards', error)
      }
    }

    if (user) {
      fetchSavedCards()
    }
  }, [user])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleApplyPromoCode = async (code: string) => {
    try {
      if (code === discountDetails?.meta?.coupon) {
        const discountAmount =
          totalAmount -
          Number(discountDetails?.meta?.discount_amount_fixed_minus)
        const data = { success: true, discount: discountAmount }
        setTotalAmount(discountAmount)
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            discount: data.discount,
          }))
        }
      } else {
        toast.warning('Sorry the coupon code is expired or wrong!!')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handle300Diposit = (isChecked: boolean) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        depositAmount: 300,
        depositType: DEPOSIT_TYPES.MINIMUM,
      }))
    }
  }
  const yourOwnRoom = (isChecked: boolean, amount: number) => {
    if (isChecked) {
      setTotalAmount((prev) => prev + amount)
      setFormData((prev) => ({
        ...prev,
        isOwnRoom: true,
      }))
    } else {
      setTotalAmount((prev) => prev - amount)
      setFormData((prev) => ({
        ...prev,
        isOwnRoom: false,
      }))
    }
  }

  const handleThreeMonthsPaymentPlan = (isChecked: boolean) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        depositAmount: totalAmount / 3,
        depositType: DEPOSIT_TYPES.THREE_MONTH,
      }))
    }
  }

  const handleSixMonthsPaymentPlan = (isChecked: boolean) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        depositAmount: totalAmount / 6,
        depositType: DEPOSIT_TYPES.SIX_MONTH,
      }))
    }
  }

  const handleFullPayment = (isChecked: boolean) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        depositAmount: totalAmount,
        depositType: DEPOSIT_TYPES.FULL,
      }))
    }
  }

  const handleJoinInWhatsappGroup = (isChecked: boolean) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        joinWhatsAppGroup: true,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        joinWhatsAppGroup: false,
      }))
    }
  }

  const hanldeSubmit = async () => {
    setIsLoading(true)
    let paymentMethodIdToUse = ''

    if (selectedPaymentMethod === 'new') {
      if (!stripe || !elements) {
        toast.error('Payment system is loading, please wait...')
        setIsLoading(false)
        return
      }

      const cardNumberElement = elements.getElement(CardNumberElement)
      if (!cardNumberElement) {
        toast.error('Card details are required')
        setIsLoading(false)
        return
      }

      // Tokenize card details via Stripe.js (PCI-compliant)
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: 'card',
          card: cardNumberElement,
          billing_details: {
            name: formData.nameOnCard || undefined,
          },
        })

      if (stripeError || !paymentMethod) {
        toast.error(stripeError?.message || 'Failed to process card')
        setIsLoading(false)
        return
      }
      paymentMethodIdToUse = paymentMethod.id
    } else {
      paymentMethodIdToUse = selectedPaymentMethod
    }

    try {
      const data: CreateBookingInput = {
        userInfoId: user!.id,
        specialRequest: query.specialRequest as string,
        usedDiscountLink: discountDetails?.link,
        tripId: trip?.id,
        bookingStatus: 'PENDING',
        paymentStatus: 'PENDING',
        paymentPlan: formData.depositType as CreateBookingInput['paymentPlan'],
        totalAmount: totalAmount,
        groupId: groupItem || '',
        checkingType:
          query.bookingFor as string as CreateBookingInput['checkingType'],
        paymentMethodId: paymentMethodIdToUse,
      }
      await bookingClient.create(data)
      toast.success('Booking created successfully', {
        description: 'You will be notified when your booking is confirmed',
      })
      navigate('/mytrips')
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      toast.error(error instanceof Error ? error.message : 'Failed to book')
      setIsLoading(false)
    }
  }

  const progress = (timeLeft / (15 * 60)) * 100
  return (
    <main>
      <Header />
      <section className="h-[200px] px-5 md:px-0 relative overflow-hidden md:h-[300px] lg:h-[400px] w-full">
        {(isLoadingImage || !imageLoaded) && (
          <Skeleton className="absolute inset-0 h-full w-full rounded-[10px] md:rounded-none" />
        )}
        {imageData?.media_details?.sizes?.full?.source_url && (
          <img
            className={`h-full w-full object-cover rounded-[10px] md:rounded-none object-center transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            src={imageData.media_details.sizes.full.source_url}
            alt={trip?.title?.rendered}
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </section>
      <section className="container mx-auto py-6 lg:py-10">
        <span className="text-sm block max-w-fit lg:text-md xl:text-lg font-normal bg-brand text-white p-2.5 rounded-[10px] mb-6">
          <span>Step 2 of 2</span>
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-7 lg:gap-10">
          <div className="col-span-1 order-2 lg:order-1 lg:col-span-3 xl:col-span-2">
            <h1 className="font-bold text-[32px] xl:text-[54px] font-tinos">
              Select your options
            </h1>
            <div className="mt-5 lg:mt-7.5 space-y-5">
              <p className="text-base xl:text-xl">
                Your place on this trip will be reserved for{' '}
                {isMounted ? formatTime(timeLeft) : '15:00'} mins
              </p>
              <div className="w-full h-4 relative rounded-full overflow-hidden bg-[#0000001A]">
                <div
                  className="h-full bg-brand absolute inset-0 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xl xl:text-2xl font-medium">Extras</p>
              <p className="text-base xl:text-xl">
                Select any extras you would like to add to your trip
              </p>
              {group?.room_options?.['Private rooms'] && (
                <label className="flex justify-between items-center">
                  <span className="flex items-center gap-2.5">
                    <Checkbox
                      checked={formData.isOwnRoom}
                      onCheckedChange={(value) =>
                        yourOwnRoom(
                          Boolean(value),
                          Number(group?.private_rooms_price),
                        )
                      }
                      className="fill-brand size-7.5 rounded-[5px]"
                    />
                    <span className="text-xl">Your own room</span>
                  </span>
                  <span className="text-2xl">
                    ${group?.private_rooms_price}
                  </span>
                </label>
              )}

              <div className="border rounded-[10px] p-7.5 flex flex-col xl:flex-row justify-between items-center">
                <div className="space-y-7.5 order-2 xl:order-0">
                  <h1 className="font-bold text-[32px] xl:text-[54px] font-tinos">
                    Join your trip’s WhatsApp group
                  </h1>
                  <p className="text-base xl:text-xl">
                    We set up WhatsApp groups before your trip to help everybody
                    get to know each other. We’ll introduce the pack leader, who
                    will use it to communicate updates with your group whilst on
                    tour.
                  </p>
                  <p className="text-base xl:text-xl">
                    (Please be aware your number will be visible to all other
                    members of your trip)
                  </p>
                  <label className="flex items-center gap-2.5">
                    <Checkbox
                      checked={formData.joinWhatsAppGroup}
                      onCheckedChange={(value) =>
                        handleJoinInWhatsappGroup(Boolean(value))
                      }
                      className="fill-brand size-7.5 rounded-[5px]"
                    />
                    <span className="text-base xl:text-xl">Yes, Sure</span>
                  </label>
                </div>
                <img
                  src="/images/join-whatsapp-group.svg"
                  alt="join-whatsapp-group"
                  className="order-1 xl:order-0"
                />
              </div>

              <div className="space-y-5">
                <h1 className="text-[32px] xl:text-[52px] font-bold font-tinos">
                  Promo Code
                </h1>
                <div className="flex md:flex-row flex-col justify-between items-end gap-2.5 md:gap-3 xl:gap-7.5">
                  <div className="w-full md:w-4/5">
                    <p className="text-lg md:text-xl mb-2.5">Enter Code...</p>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="h-15 py-0 w-full uppercase border-[#0000001A] rounded-[10px]"
                    />
                  </div>
                  <Button
                    disabled={!promoCode || formData.discount > 0}
                    onClick={() => handleApplyPromoCode(promoCode)}
                    className="h-15 disabled:opacity-50 disabled:cursor-not-allowed bg-brand text-base md:text-xl rounded-sm w-full md:w-1/5 xl:w-1/5"
                  >
                    {formData.discount > 0 ? 'Applied' : 'Apply Code'}
                  </Button>
                </div>
              </div>

              <div className="border rounded-[10px] p-5 flex items-start gap-7.5">
                <Checkbox
                  checked={formData.depositType === DEPOSIT_TYPES.MINIMUM}
                  onCheckedChange={handle300Diposit}
                  className="fill-brand size-7.5 rounded-[5px]"
                />
                <div>
                  <h1 className=" text-xl xl:text-2xl">
                    Book your place with a deposit
                  </h1>
                  <p className="text-base xl:text-xl">
                    Deposit Amount (minimum 300)
                  </p>
                  <p className="h-14 flex items-center text-xl xl:text-2xl px-5 my-2.5 py-0 w-[150px] bg-[#000000]/10  rounded-[5px]">
                    $300
                  </p>
                  <p className="text-base xl:text-xl">
                    Secure your place on the trip with a deposit today and the
                    remaining £3,880 will be taken automatically on 12th Jul
                    2026. We’ll send you a reminder before this happens.
                  </p>
                </div>
              </div>
              <label className="border rounded-[10px] p-5 flex items-center xl:items-start gap-5 xl:gap-7.5">
                <Checkbox
                  checked={formData.depositType === DEPOSIT_TYPES.THREE_MONTH}
                  onCheckedChange={handleThreeMonthsPaymentPlan}
                  className="fill-brand size-7.5 rounded-[5px]"
                />
                <p className="text-base xl:text-xl font-normal">
                  Set up 3 month payment plan
                </p>
              </label>
              <label className="border rounded-[10px] p-5 flex items-center xl:items-start gap-5 xl:gap-7.5">
                <Checkbox
                  checked={formData.depositType === DEPOSIT_TYPES.SIX_MONTH}
                  onCheckedChange={handleSixMonthsPaymentPlan}
                  className="fill-brand size-7.5 rounded-[5px]"
                />
                <p className="text-base xl:text-xl font-normal">
                  Set up 6 month payment plan
                </p>
              </label>
              <label className="border rounded-[10px] p-5 flex items-center xl:items-start gap-5 xl:gap-7.5">
                <Checkbox
                  checked={formData.depositType === DEPOSIT_TYPES.FULL}
                  onCheckedChange={handleFullPayment}
                  className="fill-brand size-7.5 rounded-[5px]"
                />
                <div className="flex justify-between items-center w-full">
                  <p className="text-base xl:text-xl font-normal">
                    Pay full balance now
                  </p>
                  <p className="text-base xl:text-xl font-normal">
                    ${totalAmount}
                  </p>
                </div>
              </label>

              <div className="mt-15">
                <h1 className="text-[32px] xl:text-[54px] mb-6.5 xl:mb-10 font-bold font-tinos">
                  Payment Method
                </h1>

                {savedCards.length > 0 && (
                  <div className="mb-10 space-y-4">
                    <p className="text-xl font-medium mb-4">Saved Cards</p>
                    {savedCards.map((card) => (
                      <label
                        key={card.id}
                        className={`border rounded-[10px] p-5 flex items-center gap-5 cursor-pointer ${
                          selectedPaymentMethod === card.id
                            ? 'border-brand bg-brand/5'
                            : 'border-[#0000001A]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={card.id}
                          checked={selectedPaymentMethod === card.id}
                          onChange={(e) =>
                            setSelectedPaymentMethod(e.target.value)
                          }
                          className="size-5 accent-brand cursor-pointer"
                        />
                        <div className="flex items-center gap-4">
                          <p className="text-lg xl:text-xl font-medium">
                            **** **** **** {card.last4}
                          </p>
                          <p className="text-base text-gray-500">
                            Expires {card.exp_month}/{card.exp_year}
                          </p>
                        </div>
                      </label>
                    ))}

                    <label
                      className={`border rounded-[10px] p-5 flex items-center gap-5 cursor-pointer ${
                        selectedPaymentMethod === 'new'
                          ? 'border-brand bg-brand/5'
                          : 'border-[#0000001A]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="new"
                        checked={selectedPaymentMethod === 'new'}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                        className="size-5 accent-brand cursor-pointer"
                      />
                      <span className="text-lg xl:text-xl font-medium">
                        Use a new card
                      </span>
                    </label>
                  </div>
                )}

                {selectedPaymentMethod === 'new' && (
                  <>
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
                      <p className="text-"></p>
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
                        value={formData.nameOnCard}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^A-Za-z ]/g, '')
                          setFormData((prev) => ({
                            ...prev,
                            nameOnCard: val,
                          }))
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
                  </>
                )}

                <Button
                  disabled={isLoading}
                  onClick={() => hanldeSubmit()}
                  type="button"
                  className="bg-brand mt-12.5 py-6 w-full disabled:bg-brand/30 md:w-52 text-white rounded-[5px] px-14 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        className="mx-3"
                        data-icon="inline-start"
                      />{' '}
                      Confirming...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </div>
          </div>
          <PriceSummary totalPrice={totalAmount} />
        </div>
      </section>
      <Footer />
    </main>
  )
}

// Wrapper that provides the Stripe Elements context
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutInner />
    </Elements>
  )
}
