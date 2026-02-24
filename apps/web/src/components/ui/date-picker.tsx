import * as React from 'react'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '../../lib/utils'

type Props = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
}

export function DatePicker({ value, onChange, className, disabled }: Props) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    onChange(value)
  }, [value])

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        ref={ref}
        onClick={() => setOpen(true)}
        className={cn('flex items-center justify-between', className)}
        disabled={disabled}
      >
        <span>{value ? value.toLocaleDateString() : 'Select date'}</span>
        <ChevronDownIcon className="text-[#0000001A]" />
      </PopoverTrigger>
      <PopoverContent
        style={{
          width: ref.current?.clientWidth,
        }}
        className="w-auto overflow-hidden p-0 flex justify-center"
        align="center"
      >
        <Calendar
          mode="single"
          selected={value}
          className="w-full"
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function DatePickerDialog({
  value,
  onChange,
  className,
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    onChange(value)
  }, [value])

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        className={cn('flex items-center justify-between', className)}
        disabled={disabled}
      >
        <span>{value ? value.toLocaleDateString() : 'Select date'}</span>
        <ChevronDownIcon className="text-[#0000001A]" />
      </DialogTrigger>
      <DialogContent
        className="w-auto p-0 flex justify-center border-none shadow-none bg-transparent"
        showCloseButton={false}
      >
        <div className="bg-white rounded-xl shadow-lg border p-2 scale-[1.1] sm:scale-125 md:scale-[1.35] lg:scale-[1.5] transition-transform origin-center">
          <Calendar
            mode="single"
            selected={value}
            className="w-full"
            captionLayout="dropdown"
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
