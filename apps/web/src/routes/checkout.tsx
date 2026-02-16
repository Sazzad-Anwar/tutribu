import Header from '../components/header'
import qs from 'qs'
import PriceSummary from '../components/price-summary'
import CheckoutForm from '../components/checkout-form'
import { Progress } from '../components/ui/progress'
import { useState, useEffect } from 'react'
import { Checkbox } from '../components/ui/checkbox'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/auth-context'
import { bookingClient } from '../lib/booking-client'
import type { CreateBookingInput } from '@tutribu/types'
import { toast } from 'sonner'

const DEPOSIT_TYPES = {
  MINIMUM: 'LOWEST_DEPOSIT',
  FULL: 'ONE_TIME',
  THREE_MONTHS: 'THREE_MONTH',
  SIX_MONTHS: 'SIX_MONTH',
}

export default function Checkout() {
  const [totalAmount, setTotalAmount] = useState(1200)
  const [promoCode, setPromoCode] = useState('')
  const { user } = useAuth()
  const query = qs.parse(location.search, { ignoreQueryPrefix: true })
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [isMounted, setIsMounted] = useState(false)
  const [formData, setFormData] = useState({
    isOwnRoom: false,
    joinWhatsAppGroup: false,
    discount: 0,
    depositAmount: 0,
    depositType: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    nameOnCard: '',
    cvv: '',
  })

  useEffect(() => {
    setIsMounted(true)
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleApplyPromoCode = async (code: string) => {
    try {
      const discountAmount = totalAmount * 0.15
      const data = { success: true, discount: discountAmount }
      setTotalAmount((prev) => prev - discountAmount)
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          discount: data.discount,
        }))
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
        depositType: DEPOSIT_TYPES.THREE_MONTHS,
      }))
    }
  }

  const handleSixMonthsPaymentPlan = (isChecked: boolean) => {
    if (isChecked) {
      setFormData((prev) => ({
        ...prev,
        depositAmount: totalAmount / 6,
        depositType: DEPOSIT_TYPES.SIX_MONTHS,
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
    try {
      const data: CreateBookingInput = {
        userInfoId: user!.id,
        specialRequest: query.specialRequest as string,
        promotionalCode: promoCode,
        status: 'PENDING',
        paymentPlan: formData.depositType as CreateBookingInput['paymentPlan'],
        totalAmount: totalAmount,
        groupId: 'safsdfsdd',
        checkingType:
          query.bookingFor as string as CreateBookingInput['checkingType'],
        cardDetails: {
          number: formData.cardNumber.split(' ').join(''),
          exp_month: Number(formData.expiryMonth),
          exp_year: Number(formData.expiryYear),
          cvc: formData.cvv,
        },
      }
      await bookingClient.create(data)
      toast.success('Booking created successfully', {
        description: 'You will be notified when your booking is confirmed',
      })
    } catch (error) {
      console.log(error)
      toast.error(error instanceof Error ? error.message : 'Failed to book')
    }
  }

  const progress = (timeLeft / (15 * 60)) * 100
  return (
    <main>
      <Header />
      <section className="h-[200px] px-5 md:px-0 overflow-hidden md:h-[300px] lg:h-[400px] w-full">
        <img
          className="h-full w-full object-cover rounded-[10px] md:rounded-none  object-center"
          src="/images/checkout-banner.svg"
          alt="banner-image"
        />
      </section>
      <section className="container mx-auto py-6 lg:py-10">
        <span className="text-sm block max-w-fit lg:text-md xl:text-lg font-normal bg-brand text-white p-2.5 rounded-[10px] mb-6">
          <span>Step 2 of 2</span>
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-7 lg:gap-10">
          <div className="col-span-1 order-2 lg:order-1 lg:col-span-3 xl:col-span-2">
            <h1 className="font-bold text-[54px] font-tinos">
              Select your options
            </h1>
            <div className="mt-7.5 space-y-5">
              <p className="text-xl">
                Your place on this trip will be reserved for{' '}
                {isMounted ? formatTime(timeLeft) : '15:00'} mins
              </p>
              <div className="w-full h-4 relative rounded-full overflow-hidden bg-[#0000001A]">
                <div
                  className="h-full bg-brand absolute inset-0 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-2xl font-medium">Extras</p>
              <p className="text-xl">
                Select any extras you would like to add to your trip
              </p>

              <label className="flex justify-between items-center">
                <span className="flex items-center gap-2.5">
                  <Checkbox
                    checked={formData.isOwnRoom}
                    onCheckedChange={(value) =>
                      yourOwnRoom(Boolean(value), 456)
                    }
                    className="fill-brand size-7.5 rounded-[5px]"
                  />
                  <span className="text-xl">Your own room</span>
                </span>
                <span className="text-2xl">$456</span>
              </label>

              <div className="border rounded-[10px] p-7.5 flex justify-between items-center">
                <div className="space-y-7.5">
                  <h1 className="font-bold text-[32px] font-tinos">
                    Join your trip’s WhatsApp group
                  </h1>
                  <p className="text-xl">
                    We set up WhatsApp groups before your trip to help everybody
                    get to know each other. We’ll introduce the pack leader, who
                    will use it to communicate updates with your group whilst on
                    tour.
                  </p>
                  <p className="text-xl">
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
                    <span className="text-xl">Yes, Sure</span>
                  </label>
                </div>
                <img
                  src="/images/join-whatsapp-group.svg"
                  alt="join-whatsapp-group"
                />
              </div>

              <div className="space-y-5">
                <h1 className="text-[52px] font-bold font-tinos">Promo Code</h1>
                <div className="flex justify-between items-end gap-7.5">
                  <div className="w-4/5">
                    <p className="text-sm mb-2.5">Enter Code...</p>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="h-15 py-0 w-full uppercase border-[#0000001A] rounded-[10px]"
                    />
                  </div>
                  <Button
                    disabled={!promoCode || formData.discount > 0}
                    onClick={() => handleApplyPromoCode(promoCode)}
                    className="h-15 disabled:opacity-50 disabled:cursor-not-allowed bg-brand text-xl rounded-sm w-1/5"
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
                  <h1 className="text-2xl">Book your place with a deposit</h1>
                  <p className="text-xl">Deposit Amount (minimum 300)</p>
                  <p className="h-14 flex items-center text-2xl px-5 my-2.5 py-0 w-[150px] bg-[#000000]/10  rounded-[5px]">
                    $300
                  </p>
                  <p className="text-xl font-normal">
                    Secure your place on the trip with a deposit today and the
                    remaining £3,880 will be taken automatically on 12th Jul
                    2026. We’ll send you a reminder before this happens.
                  </p>
                </div>
              </div>
              <label className="border rounded-[10px] p-5 flex items-start gap-7.5">
                <Checkbox
                  checked={formData.depositType === DEPOSIT_TYPES.THREE_MONTHS}
                  onCheckedChange={handleThreeMonthsPaymentPlan}
                  className="fill-brand size-7.5 rounded-[5px]"
                />
                <p className="text-2xl font-normal">
                  Set up 3 month payment plan
                </p>
              </label>
              <label className="border rounded-[10px] p-5 flex items-start gap-7.5">
                <Checkbox
                  checked={formData.depositType === DEPOSIT_TYPES.SIX_MONTHS}
                  onCheckedChange={handleSixMonthsPaymentPlan}
                  className="fill-brand size-7.5 rounded-[5px]"
                />
                <p className="text-2xl font-normal">
                  Set up 6 month payment plan
                </p>
              </label>
              <label className="border rounded-[10px] p-5 flex items-start gap-7.5">
                <Checkbox
                  checked={formData.depositType === DEPOSIT_TYPES.FULL}
                  onCheckedChange={handleFullPayment}
                  className="fill-brand size-7.5 rounded-[5px]"
                />
                <div className="flex justify-between items-center w-full">
                  <p className="text-2xl font-normal">Pay full balance now</p>
                  <p className="text-2xl font-normal">${totalAmount}</p>
                </div>
              </label>

              <div className="mt-15">
                <h1 className="text-[54px] mb-10 font-bold font-tinos">
                  Enter card details
                </h1>
                <div className="space-y-2.5">
                  <p className="text-xl">Card Number</p>
                  <Input
                    id="card-number"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9 ]*"
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    value={formData.cardNumber}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9]/.test(e.key) &&
                        ![
                          'Backspace',
                          'Delete',
                          'Tab',
                          'ArrowLeft',
                          'ArrowRight',
                        ].includes(e.key)
                      ) {
                        e.preventDefault()
                      }
                    }}
                    onChange={(e) => {
                      const input = e.target
                      const cursorPos = input.selectionStart ?? 0
                      const raw = input.value.replace(/\D/g, '').slice(0, 16)
                      const groups = raw.match(/\d{1,4}/g)
                      const formatted = groups ? groups.join(' ') : ''

                      // Calculate new cursor position
                      const rawBeforeCursor = input.value
                        .slice(0, cursorPos)
                        .replace(/\D/g, '')
                      let newCursor = 0
                      let digits = 0
                      for (
                        let i = 0;
                        i < formatted.length && digits < rawBeforeCursor.length;
                        i++
                      ) {
                        if (formatted[i] !== ' ') digits++
                        newCursor = i + 1
                      }

                      setFormData((prev) => ({
                        ...prev,
                        cardNumber: formatted,
                      }))

                      requestAnimationFrame(() => {
                        input.setSelectionRange(newCursor, newCursor)
                      })
                    }}
                    className="h-15 py-0 w-full border-[#0000001A] rounded-[10px] font-mono"
                  />
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
                  <p className="text-lg">
                    We accept debit and credit cards types.
                  </p>
                </div>
                <div className="mt-8">
                  <p className="text-xl">Expiry Date</p>
                  <p className="text-base text-[#00000080]">Example 10/26</p>
                  <div className="flex items-end gap-2.5 mt-3.5">
                    <div className="space-y-2.5">
                      <label
                        htmlFor="month"
                        className="block"
                      >
                        Month
                      </label>
                      <Input
                        id="month"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={2}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]/.test(e.key) &&
                            ![
                              'Backspace',
                              'Delete',
                              'Tab',
                              'ArrowLeft',
                              'ArrowRight',
                            ].includes(e.key)
                          ) {
                            e.preventDefault()
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          const num = parseInt(val, 10)
                          if (val === '') {
                            e.target.value = ''
                          } else if (num > 12) {
                            e.target.value = '12'
                          } else if (num < 1 && val.length >= 2) {
                            e.target.value = '1'
                          } else {
                            e.target.value = val
                          }
                          setFormData((prev) => ({
                            ...prev,
                            expiryMonth: e.target.value,
                          }))
                        }}
                        className="h-15 py-0 w-25 border-[#0000001A] rounded-[10px]"
                      />
                    </div>
                    <div className="h-15 flex justify-center items-center">
                      <p>/</p>
                    </div>
                    <div className="space-y-2.5">
                      <label
                        htmlFor="year"
                        className="block"
                      >
                        Year
                      </label>
                      <Input
                        id="year"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        onKeyDown={(e) => {
                          if (
                            !/[0-9]/.test(e.key) &&
                            ![
                              'Backspace',
                              'Delete',
                              'Tab',
                              'ArrowLeft',
                              'ArrowRight',
                            ].includes(e.key)
                          ) {
                            e.preventDefault()
                          }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '')
                          const num = parseInt(val, 10)
                          const currentYear = new Date().getFullYear()
                          if (val === '') {
                            e.target.value = ''
                          } else if (num > 2100) {
                            e.target.value = '2100'
                          } else if (val.length === 4 && num < currentYear) {
                            e.target.value = String(currentYear)
                          } else {
                            e.target.value = val
                          }
                          setFormData((prev) => ({
                            ...prev,
                            expiryYear: e.target.value,
                          }))
                        }}
                        className="h-15 w-25 py-0 border-[#0000001A] rounded-[10px]"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-13 space-y-2.5">
                  <label
                    htmlFor="card-name"
                    className="text-xl block"
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
                    className="h-15 py-0 w-full uppercase border-[#0000001A] rounded-[10px]"
                  />
                </div>
                <div className="mt-5 space-y-2.5">
                  <label
                    htmlFor="cvv"
                    className="text-lg font-normal"
                  >
                    Security Code
                  </label>
                  <p className="text-lg text-[#00000080]">
                    The last 3 digits on the back of the card.
                  </p>
                  <div className="flex items-center gap-7.5">
                    <Input
                      value={formData.cvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        setFormData((prev) => ({
                          ...prev,
                          cvv: val,
                        }))
                      }}
                      id="cvv"
                      className="h-15 w-[228px] py-0 border-[#0000001A] rounded-[10px]"
                    />
                    <img
                      src="/images/cvv.png"
                      alt="cvv"
                      className="w-15 h-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => hanldeSubmit()}
                  type="button"
                  className="bg-brand mt-12.5 py-6 w-full disabled:bg-brand/30 md:w-52 text-white rounded-[5px] px-14 text-lg"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
          <PriceSummary totalPrice={totalAmount} />
        </div>
      </section>
    </main>
  )
}
