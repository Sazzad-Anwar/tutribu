import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

import { Calendar, CalendarDayButton } from './ui/calendar'
import useSWR from 'swr'
import { bookingClient } from '../lib/booking-client'
import { apiClient } from '../lib/api-client'
import { type Booking } from '@tutribu/types'
import dayjs from 'dayjs'

export function TripCalendarPopup() {
  const { data: bookings } = useSWR<Booking[]>('bookings', bookingClient.list)
  const [tripDates, setTripDates] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchTrips = async () => {
      if (!bookings) return

      const counts: Record<string, number> = {}

      await Promise.all(
        bookings.map(async (item) => {
          if (item.bookingStatus === 'CANCELLED') return
          try {
            const { data } = await apiClient.get(`/wp/v2/trips/${item.tripId}`)
            const group = data?.meta?.group_item?.[item.groupId]
            if (group?.arriving_date) {
              const dateStr = dayjs(group.arriving_date).format('YYYY-MM-DD')
              counts[dateStr] = (counts[dateStr] || 0) + 1
            }
          } catch (err) {
            console.error('Failed to fetch trip for calendar', err)
          }
        }),
      )

      setTripDates(counts)
    }

    fetchTrips()
  }, [bookings])

  console.log(tripDates)

  return (
    <Popover>
      <PopoverTrigger className="px-0 py-0 m-0 size-6 xl:size-8 border-0 ring-0 bg-transparent cursor-pointer focus:outline-none focus:ring-0">
        <img
          src="/images/calendar-icon.svg"
          className="size-6 xl:size-8"
          alt="Calendar"
        />
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 rounded-xl overflow-hidden shadow-lg border-border"
        align="end"
      >
        <Calendar
          mode="multiple"
          selected={Object.keys(tripDates).map((d) => dayjs(d).toDate())}
          className="p-4 sm:p-5 [--cell-size:2.5rem] sm:[--cell-size:3rem]"
          components={{
            DayButton: (props) => {
              const { day, ...rest } = props
              const dateStr = dayjs(day.date).format('YYYY-MM-DD')
              const count = tripDates[dateStr] || 0

              return (
                <CalendarDayButton
                  day={day}
                  {...rest}
                >
                  <div className="relative flex flex-col items-center justify-center w-full h-full">
                    <span>{rest.children}</span>
                    {count > 0 && (
                      <div className="absolute bottom-1 flex gap-0.5 items-center justify-center">
                        {Array.from({ length: Math.min(count, 3) }).map(
                          (_, i) => (
                            <div
                              key={i}
                              className="w-1 h-1 rounded-full bg-brand"
                            />
                          ),
                        )}
                        {count > 3 && (
                          <span className="text-[8px] leading-none text-brand">
                            +
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CalendarDayButton>
              )
            },
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
